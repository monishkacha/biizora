import { ProductionPlan, YieldRule, PredictionHistory } from '../models/ManufacturingPlanner.js';

/**
 * Dedicated Smart Production Prediction Engine.
 * 
 * IMPORTANT: Completely isolated from Bizz AI Assistant.
 * Does not share prompt context, conversation history, embeddings, or websockets.
 */
class SmartProductionPredictionService {
  constructor() {
    this.modelVersion = process.env.SMART_PLANNER_MODEL || 'yield-predictor-v1';
    this.isAIEnabled = process.env.SMART_PLANNER_AI_ENABLED !== 'false';
  }

  /**
   * Layer 1: Rule-Based Yield Engine
   * Applies configurable workspace yield rules or industry default standard factors.
   */
  async calculateRuleBasedYield(businessId, productCategory, totalInputQty, machineId = '') {
    let rule = await YieldRule.findOne({ businessId, productCategory });

    if (!rule) {
      // Default fallback rule set
      rule = {
        standardYieldRate: 0.94, // 94%
        startupLossRate: 0.02,   // 2%
        changeoverLossRate: 0.015, // 1.5%
        shrinkageFactor: 0.01,    // 1%
      };
    }

    const netYieldRate = Math.max(
      0.5,
      rule.standardYieldRate - rule.startupLossRate - rule.changeoverLossRate - rule.shrinkageFactor
    );

    const expectedOutputQty = Math.round(totalInputQty * netYieldRate * 100) / 100;
    const expectedWasteQty = Math.round((totalInputQty - expectedOutputQty) * 100) / 100;
    const expectedYieldPct = Math.round(netYieldRate * 1000) / 10;
    const expectedWastePct = Math.round((100 - expectedYieldPct) * 10) / 10;

    return {
      ruleUsed: rule,
      expectedOutputQty,
      expectedWasteQty,
      expectedYieldPct,
      expectedWastePct,
    };
  }

  /**
   * Layer 2: Historical Batch Analytics Engine
   * Evaluates historical production plans for the same business, product category, and machine.
   */
  async calculateHistoricalYield(businessId, productCategory, machineId) {
    const filter = { businessId, status: { $in: ['Completed', 'Converted to Order'] } };
    if (productCategory) filter.productCategory = productCategory;

    const historicalPlans = await ProductionPlan.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (!historicalPlans.length) {
      return {
        sampleSize: 0,
        historicalAvgYieldPct: null,
        historicalStdDev: 0,
        bestBatchYieldPct: null,
        worstBatchYieldPct: null,
      };
    }

    const yields = historicalPlans.map((p) => p.predictedYieldPct || 92);
    const sum = yields.reduce((acc, val) => acc + val, 0);
    const avgYield = sum / yields.length;
    const bestYield = Math.max(...yields);
    const worstYield = Math.min(...yields);

    // Standard deviation
    const variance = yields.reduce((acc, val) => acc + Math.pow(val - avgYield, 2), 0) / yields.length;
    const stdDev = Math.sqrt(variance);

    return {
      sampleSize: historicalPlans.length,
      historicalAvgYieldPct: Math.round(avgYield * 10) / 10,
      historicalStdDev: Math.round(stdDev * 10) / 10,
      bestBatchYieldPct: Math.round(bestYield * 10) / 10,
      worstBatchYieldPct: Math.round(worstYield * 10) / 10,
    };
  }

  /**
   * Layer 3: Isolated AI Statistical & Quality Regression Predictor
   * Adjusts yield based on material grade, custom specs complexity, and shift parameters.
   */
  calculateAIPredictionAdjustment(materials = [], productSpecs = {}) {
    let adjustmentPct = 0;
    const riskIndicators = [];

    // 1. Grade Impact
    const grades = materials.map((m) => (m.grade || 'Standard').toLowerCase());
    if (grades.some((g) => g.includes('recycled') || g.includes('scrap') || g.includes('grade b') || g.includes('regrind'))) {
      adjustmentPct -= 3.5;
      riskIndicators.push({
        riskLevel: 'high',
        title: 'Low Material Quality Risk',
        description: 'Recycled/regrind material grade detected. Process loss risk increased by ~3.5%.',
      });
    } else if (grades.every((g) => g.includes('virgin') || g.includes('premium') || g.includes('grade a'))) {
      adjustmentPct += 1.8;
    }

    // 2. Spec Complexity (Thickness/Density)
    const thickness = parseFloat(productSpecs?.thickness || 0);
    if (thickness > 0 && thickness < 1.0) {
      adjustmentPct -= 2.0;
      riskIndicators.push({
        riskLevel: 'medium',
        title: 'High Changeover / Thin Gauge Loss Risk',
        description: 'Sub-1mm wall thickness increases startup tearing risk and cooling shrinkage.',
      });
    }

    // 3. Batch Size Efficiency
    const batchSize = Number(productSpecs?.batchSize || 1000);
    if (batchSize < 200) {
      adjustmentPct -= 2.5;
      riskIndicators.push({
        riskLevel: 'medium',
        title: 'Small Batch Setup Penalty',
        description: 'Small production run (< 200 units). Fixed purge/startup waste dominates yield.',
      });
    } else if (batchSize > 5000) {
      adjustmentPct += 1.2;
    }

    return {
      adjustmentPct: Math.round(adjustmentPct * 10) / 10,
      riskIndicators,
    };
  }

  /**
   * Main Yield Prediction Entrypoint
   * Combines Layer 1 (Rules) + Layer 2 (History) + Layer 3 (Isolated AI Regression)
   */
  async predictYield(businessId, payload) {
    const {
      productCategory = 'General',
      materials = [],
      productSpecs = {},
      machineId = '',
      shift = 'Shift 1',
    } = payload;

    const totalInputQty = materials.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
    const safeInput = totalInputQty > 0 ? totalInputQty : 100;

    // Layer 1: Rule-Based Base
    const layer1 = await this.calculateRuleBasedYield(businessId, productCategory, safeInput, machineId);

    // Layer 2: Historical Batch Analytics
    const layer2 = await this.calculateHistoricalYield(businessId, productCategory, machineId);

    // Layer 3: Isolated AI Regression
    const layer3 = this.calculateAIPredictionAdjustment(materials, productSpecs);

    // Weighted Combined Yield
    let finalYieldPct = layer1.expectedYieldPct;

    if (layer2.sampleSize >= 5 && layer2.historicalAvgYieldPct !== null) {
      // Blend 60% historical + 40% rule base
      finalYieldPct = layer2.historicalAvgYieldPct * 0.6 + layer1.expectedYieldPct * 0.4;
    }

    // Apply AI adjustment
    finalYieldPct = Math.min(99.5, Math.max(50, finalYieldPct + layer3.adjustmentPct));
    finalYieldPct = Math.round(finalYieldPct * 10) / 10;

    const expectedOutputQty = Math.round((safeInput * (finalYieldPct / 100)) * 100) / 100;
    const expectedWasteQty = Math.round((safeInput - expectedOutputQty) * 100) / 100;
    const expectedWastePct = Math.round((100 - finalYieldPct) * 10) / 10;
    const materialEfficiencyPct = finalYieldPct;

    // Confidence Score Calculation
    let confidenceScore = 82;
    if (layer2.sampleSize >= 15) confidenceScore += 10;
    else if (layer2.sampleSize >= 5) confidenceScore += 5;

    if (layer3.riskIndicators.length === 0) confidenceScore += 5;
    else confidenceScore -= layer3.riskIndicators.length * 3;

    confidenceScore = Math.min(98, Math.max(65, confidenceScore));

    // Estimated Production Duration (60kg per hour baseline)
    const kgPerHour = 65;
    const durationHours = safeInput / kgPerHour;
    const durationMinutes = Math.round(durationHours * 60);

    const forecastResult = {
      totalInputQty: safeInput,
      expectedOutputQty,
      expectedWasteQty,
      expectedWastePct,
      expectedYieldPct: finalYieldPct,
      materialEfficiencyPct,
      estimatedDurationMinutes: durationMinutes,
      confidenceScore,
      riskIndicators: layer3.riskIndicators,
      historicalContext: {
        sampleSize: layer2.sampleSize,
        historicalAvgYieldPct: layer2.historicalAvgYieldPct,
        bestBatchYieldPct: layer2.bestBatchYieldPct,
        worstBatchYieldPct: layer2.worstBatchYieldPct,
      },
      modelVersion: this.modelVersion,
    };

    // Audit prediction history
    try {
      await PredictionHistory.create({
        businessId,
        inputSnapshot: { productCategory, totalInputQty, materials, productSpecs, machineId, shift },
        predictionSnapshot: forecastResult,
        modelVersion: this.modelVersion,
      });
    } catch (err) {
      console.error('Failed to log prediction history:', err.message);
    }

    return forecastResult;
  }

  /**
   * Reverse Material Requirement Calculator
   * User enters desired finished output quantity -> System calculates required raw material + safety stock.
   */
  async calculateReverseMaterials(businessId, payload) {
    const { desiredOutputQty = 1000, productCategory = 'General', scrapTolerancePct = 5, materials = [] } = payload;

    const baseYield = await this.calculateRuleBasedYield(businessId, productCategory, desiredOutputQty);
    const yieldRate = baseYield.expectedYieldPct / 100;

    const requiredInputQty = Math.round((desiredOutputQty / yieldRate) * 100) / 100;
    const expectedWasteQty = Math.round((requiredInputQty - desiredOutputQty) * 100) / 100;

    const safetyStockPct = Math.max(2, scrapTolerancePct);
    const recommendedProcurementQty = Math.round((requiredInputQty * (1 + safetyStockPct / 100)) * 100) / 100;

    // Breakdown per material if multiple materials submitted
    const materialBreakdown = (materials.length ? materials : [{ materialName: 'Primary Raw Material', ratio: 1 }]).map((m) => {
      const ratio = m.ratio || 1;
      const allocatedQty = Math.round((requiredInputQty * ratio) * 100) / 100;
      const procurementQty = Math.round((recommendedProcurementQty * ratio) * 100) / 100;
      return {
        materialName: m.materialName || 'Raw Material',
        unit: m.unit || 'kg',
        requiredQty: allocatedQty,
        recommendedProcurementQty: procurementQty,
      };
    });

    return {
      desiredOutputQty,
      requiredRawMaterialQty: requiredInputQty,
      expectedWasteQty,
      expectedYieldPct: baseYield.expectedYieldPct,
      safetyStockPct,
      recommendedProcurementQty,
      materialBreakdown,
    };
  }
}

export const smartProductionPredictionService = new SmartProductionPredictionService();
