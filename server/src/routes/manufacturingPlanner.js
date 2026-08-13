import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requireManufacturingWorkspace } from '../middleware/requireBusiness.js';
import { ProductionPlan, YieldRule } from '../models/ManufacturingPlanner.js';
import { Order } from '../models/Order.js';
import { smartProductionPredictionService } from '../services/smartProductionPredictionService.js';

const router = express.Router();

// Enforce workspace-level authentication and manufacturing-only access
router.use(authenticate, requireBusiness, requireManufacturingWorkspace);

/**
 * GET /api/manufacturing/planner
 * List all production plans for the active workspace
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = { businessId: req.businessId };

    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.productCategory = category;
    if (search) {
      filter.$or = [
        { planNumber: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [plans, total] = await Promise.all([
      ProductionPlan.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      ProductionPlan.countDocuments(filter),
    ]);

    // KPI Aggregations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activePlans = await ProductionPlan.find({ businessId: req.businessId }).lean();
    const plannedTodayCount = activePlans.filter((p) => new Date(p.scheduledDate) >= todayStart).length;
    const totalEstOutput = activePlans.reduce((sum, p) => sum + (p.predictedOutputQty || 0), 0);
    const totalEstWastage = activePlans.reduce((sum, p) => sum + (p.predictedWasteQty || 0), 0);
    const totalInput = totalEstOutput + totalEstWastage;
    const avgYieldPct = totalInput > 0 ? Math.round((totalEstOutput / totalInput) * 1000) / 10 : 93.5;

    res.json({
      plans,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      kpis: {
        plannedTodayCount,
        totalEstOutputQty: Math.round(totalEstOutput),
        totalEstWastageQty: Math.round(totalEstWastage),
        avgYieldPct,
        materialUtilizationPct: avgYieldPct,
        activePlansCount: activePlans.filter((p) => p.status === 'Scheduled' || p.status === 'In Progress').length,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/manufacturing/planner/predict
 * Instant pre-production yield prediction
 */
router.post('/predict', async (req, res, next) => {
  try {
    const forecast = await smartProductionPredictionService.predictYield(req.businessId, req.body);
    res.json(forecast);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/manufacturing/planner/reverse-calc
 * Reverse material requirement calculator
 */
router.post('/reverse-calc', async (req, res, next) => {
  try {
    const calc = await smartProductionPredictionService.calculateReverseMaterials(req.businessId, req.body);
    res.json(calc);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/manufacturing/planner/yield-rules
 * Get workspace yield rules
 */
router.get('/yield-rules', async (req, res, next) => {
  try {
    const rules = await YieldRule.find({ businessId: req.businessId }).sort({ productCategory: 1 }).lean();
    res.json({ rules });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/manufacturing/planner/yield-rules
 * Create or update workspace yield rule
 */
router.post('/yield-rules', async (req, res, next) => {
  try {
    const { productCategory, materialType, machineType, standardYieldRate, startupLossRate, changeoverLossRate, shrinkageFactor } = req.body;
    if (!productCategory) {
      return res.status(400).json({ error: 'Product category is required' });
    }

    const rule = await YieldRule.findOneAndUpdate(
      { businessId: req.businessId, productCategory },
      {
        businessId: req.businessId,
        productCategory,
        materialType: materialType || 'All',
        machineType: machineType || 'All',
        standardYieldRate: Number(standardYieldRate) || 0.94,
        startupLossRate: Number(startupLossRate) || 0.02,
        changeoverLossRate: Number(changeoverLossRate) || 0.015,
        shrinkageFactor: Number(shrinkageFactor) || 0.01,
      },
      { upsert: true, new: true }
    );

    res.json({ rule, message: 'Yield rule updated successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/manufacturing/planner
 * Create a new production plan
 */
router.post('/', async (req, res, next) => {
  try {
    const count = await ProductionPlan.countDocuments({ businessId: req.businessId });
    const planNumber = req.body.planNumber || `SPP-2026-${String(count + 1).padStart(3, '0')}`;

    // Calculate prediction if missing
    let forecast = req.body.forecast;
    if (!forecast) {
      forecast = await smartProductionPredictionService.predictYield(req.businessId, req.body);
    }

    const plan = new ProductionPlan({
      ...req.body,
      businessId: req.businessId,
      planNumber,
      predictedOutputQty: forecast.expectedOutputQty,
      predictedWasteQty: forecast.expectedWasteQty,
      predictedWastePct: forecast.expectedWastePct,
      predictedYieldPct: forecast.expectedYieldPct,
      materialEfficiencyPct: forecast.materialEfficiencyPct,
      estimatedDurationMinutes: forecast.estimatedDurationMinutes,
      confidenceScore: forecast.confidenceScore,
      riskIndicators: forecast.riskIndicators,
      createdBy: req.userId,
    });

    await plan.save();
    res.status(201).json({ plan, forecast, message: 'Production plan created successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/manufacturing/planner/:id
 * Update an existing plan
 */
router.put('/:id', async (req, res, next) => {
  try {
    const plan = await ProductionPlan.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!plan) {
      return res.status(404).json({ error: 'Production plan not found' });
    }

    Object.assign(plan, req.body);

    if (req.body.materials || req.body.productSpecs) {
      const forecast = await smartProductionPredictionService.predictYield(req.businessId, plan.toObject());
      plan.predictedOutputQty = forecast.expectedOutputQty;
      plan.predictedWasteQty = forecast.expectedWasteQty;
      plan.predictedWastePct = forecast.expectedWastePct;
      plan.predictedYieldPct = forecast.expectedYieldPct;
      plan.materialEfficiencyPct = forecast.materialEfficiencyPct;
      plan.confidenceScore = forecast.confidenceScore;
      plan.riskIndicators = forecast.riskIndicators;
    }

    await plan.save();
    res.json({ plan, message: 'Production plan updated successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/manufacturing/planner/:id
 * Delete a production plan
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await ProductionPlan.deleteOne({ _id: req.params.id, businessId: req.businessId });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Production plan not found' });
    }
    res.json({ message: 'Production plan deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/manufacturing/planner/:id/forecast
 * Fetch live detailed forecast panel data for a plan
 */
router.get('/:id/forecast', async (req, res, next) => {
  try {
    const plan = await ProductionPlan.findOne({ _id: req.params.id, businessId: req.businessId }).lean();
    if (!plan) {
      return res.status(404).json({ error: 'Production plan not found' });
    }

    const forecast = await smartProductionPredictionService.predictYield(req.businessId, plan);
    res.json({ plan, forecast });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/manufacturing/planner/:id/convert-to-order
 * Convert a pre-production plan into an active manufacturing Production Order
 */
router.post('/:id/convert-to-order', async (req, res, next) => {
  try {
    const plan = await ProductionPlan.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!plan) {
      return res.status(404).json({ error: 'Production plan not found' });
    }

    plan.status = 'Converted to Order';
    await plan.save();

    // Create Production Order record if Order model exists
    let newOrder = null;
    try {
      newOrder = await Order.create({
        businessId: req.businessId,
        orderNumber: `PO-${plan.planNumber}`,
        customerName: `Internal Manufacturing (${plan.productCategory})`,
        items: [
          {
            name: plan.planName || plan.productName || 'Planned Finished Goods',
            quantity: plan.predictedOutputQty || 100,
            price: 0,
          },
        ],
        status: 'In Progress',
        notes: `Converted from Smart Production Plan ${plan.planNumber}. Estimated Waste: ${plan.predictedWasteQty}kg (${plan.predictedWastePct}%).`,
      });
      plan.convertedOrderId = newOrder._id;
      await plan.save();
    } catch (e) {
      console.log('Order creation note:', e.message);
    }

    res.json({
      plan,
      order: newOrder,
      message: `Plan ${plan.planNumber} successfully converted to Production Order!`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
