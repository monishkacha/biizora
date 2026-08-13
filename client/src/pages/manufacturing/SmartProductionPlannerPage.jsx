import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { manufacturingPlannerApi } from '../../api/client';
import {
  Factory,
  Brain,
  Sparkles,
  Calculator,
  Plus,
  Trash2,
  Copy,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Download,
  Settings,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  MANUFACTURING_CATEGORIES,
  INDUSTRIAL_UNITS,
  getSuggestedUnits,
} from '../../config/manufacturingMasterData';
import { SearchableGroupedSelect } from '../../components/ui/SearchableGroupedSelect';

export default function SmartProductionPlannerPage() {
  const { t, i18n } = useTranslation();
  const { business, activeWorkspace } = useAuth();
  const biz = business || activeWorkspace;
  const isManufacturing = (biz?.businessType || activeWorkspace?.businessType) === 'manufacturing';

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'create' | 'plans' | 'reverse' | 'rules'
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kpis, setKpis] = useState({
    plannedTodayCount: 4,
    totalEstOutputQty: 8450,
    totalEstWastageQty: 550,
    avgYieldPct: 93.9,
    materialUtilizationPct: 93.9,
    activePlansCount: 6,
  });

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [planForm, setPlanForm] = useState({
    planName: 'HDPE Pipe Batch #402',
    productCategory: 'HDPE Pipe',
    productName: '110mm PN6 HDPE Pipe',
    scheduledDate: new Date().toISOString().split('T')[0],
    shift: 'Shift 1',
    machineId: 'Extruder Line #2',
    supervisor: 'Rajesh Kumar',
    materials: [
      { materialName: 'PE-100 Virgin Granules', materialCode: 'RM-PE100', quantity: 950, unit: 'kg', vendor: 'Reliance Polymers', grade: 'Virgin Grade A' },
      { materialName: 'Black Masterbatch 5%', materialCode: 'RM-MB05', quantity: 50, unit: 'kg', vendor: 'Clariant', grade: 'Standard' },
    ],
    productSpecs: {
      dimension: '110mm Outer Diameter',
      thickness: '4.2mm Wall Thickness',
      width: '',
      length: '6 Meters',
      diameter: '110mm',
      density: '0.95 g/cm³',
      batchSize: 1000,
      customAttributes: [{ key: 'Pressure Rating', value: 'PN6' }],
    },
    status: 'Scheduled',
  });

  // Prediction Forecast Panel State
  const [liveForecast, setLiveForecast] = useState({
    totalInputQty: 1000,
    expectedOutputQty: 939,
    expectedWasteQty: 61,
    expectedWastePct: 6.1,
    expectedYieldPct: 93.9,
    materialEfficiencyPct: 93.9,
    estimatedDurationMinutes: 380,
    confidenceScore: 92,
    riskIndicators: [
      { riskLevel: 'low', title: t('smartPlanner.riskLowTitle', 'Optimal Thermal Profile'), description: t('smartPlanner.riskLowDesc', 'Material grade and wall thickness match standard extrusion rules.') },
    ],
  });

  // Reverse Calculation State
  const [reverseForm, setReverseForm] = useState({
    desiredOutputQty: 1000,
    productCategory: 'HDPE Pipe',
    scrapTolerancePct: 5,
  });
  const [reverseResult, setReverseResult] = useState(null);

  // Yield Rules State
  const [yieldRules, setYieldRules] = useState([
    { productCategory: 'HDPE Pipe', standardYieldRate: 0.95, startupLossRate: 0.02, changeoverLossRate: 0.015, shrinkageFactor: 0.01 },
    { productCategory: 'Textiles', standardYieldRate: 0.92, startupLossRate: 0.03, changeoverLossRate: 0.02, shrinkageFactor: 0.015 },
    { productCategory: 'Metal Fabrication', standardYieldRate: 0.91, startupLossRate: 0.04, changeoverLossRate: 0.025, shrinkageFactor: 0.005 },
  ]);

  // Load Plans & Predictions from Server
  useEffect(() => {
    if (isManufacturing) {
      fetchPlans();
    }
  }, [isManufacturing, statusFilter, search]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await manufacturingPlannerApi.list({ status: statusFilter, search });
      if (data) {
        if (data.plans) setPlans(data.plans);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (e) {
      console.log('Using local state for Smart Planner:', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Ultra-responsive Real-Time Yield Prediction Engine
  const triggerPrediction = async (updatedForm = planForm) => {
    const materials = updatedForm.materials || [];
    const totalInput = materials.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
    const safeInput = totalInput > 0 ? totalInput : 1000;

    // 1. Material Grade Impact
    let gradeMod = 0;
    const riskIndicators = [];
    const grades = materials.map((m) => (m.grade || 'Standard').toLowerCase());
    if (grades.some((g) => g.includes('recycled') || g.includes('scrap') || g.includes('grade b') || g.includes('regrind'))) {
      gradeMod -= 4.2;
      riskIndicators.push({
        riskLevel: 'high',
        title: 'Recycled Content Loss Risk',
        description: 'Recycled/regrind material grade detected. Thermal degradation scrap risk increased by ~4.2%.',
      });
    } else if (grades.every((g) => g.includes('virgin') || g.includes('premium') || g.includes('grade a'))) {
      gradeMod += 2.1;
      riskIndicators.push({
        riskLevel: 'low',
        title: 'Optimal Thermal Profile',
        description: 'Virgin Grade A material detected. Minimum thermal extrusion defect rate.',
      });
    }

    // 2. Wall Thickness & Product Specs Impact
    let specMod = 0;
    const thicknessVal = parseFloat(updatedForm.productSpecs?.thickness || 0);
    if (thicknessVal > 0 && thicknessVal < 1.0) {
      specMod -= 3.2;
      riskIndicators.push({
        riskLevel: 'medium',
        title: 'Sub-1mm Thin Wall Gauge Loss',
        description: 'Ultra-thin wall thickness increases startup web tearing and cooling shrinkage.',
      });
    } else if (thicknessVal > 8.0) {
      specMod -= 1.8;
    } else if (thicknessVal >= 1.0) {
      specMod += 0.8;
    }

    // 3. Batch Size Setup Impact
    let batchMod = 0;
    const batchSize = Number(updatedForm.productSpecs?.batchSize || 1000);
    if (batchSize < 300) {
      batchMod -= 3.5;
      riskIndicators.push({
        riskLevel: 'medium',
        title: 'Small Batch Setup Penalty',
        description: 'Production run under 300 units. Fixed line setup loss dominates yield.',
      });
    } else if (batchSize > 3000) {
      batchMod += 1.5;
    }

    // 4. Product Category Base Yield
    let categoryBase = 94.5;
    const cat = updatedForm.productCategory;
    if (cat === 'Textiles') categoryBase = 92.0;
    else if (cat === 'Food Processing') categoryBase = 95.2;
    else if (cat === 'Metal Fabrication') categoryBase = 91.0;
    else if (cat === 'Packaging') categoryBase = 93.8;
    else if (cat === 'Chemicals') categoryBase = 93.0;

    let finalYieldPct = Math.min(99.2, Math.max(50, categoryBase + gradeMod + specMod + batchMod));
    finalYieldPct = Math.round(finalYieldPct * 10) / 10;

    const expectedOutputQty = Math.round((safeInput * (finalYieldPct / 100)) * 10) / 10;
    const expectedWasteQty = Math.round((safeInput - expectedOutputQty) * 10) / 10;
    const expectedWastePct = Math.round((100 - finalYieldPct) * 10) / 10;
    const estimatedDurationMinutes = Math.max(20, Math.round((safeInput / 65) * 60));

    let confidenceScore = 92;
    if (riskIndicators.some((r) => r.riskLevel === 'high')) confidenceScore -= 8;
    if (riskIndicators.some((r) => r.riskLevel === 'medium')) confidenceScore -= 4;

    const computedForecast = {
      totalInputQty: safeInput,
      expectedOutputQty,
      expectedWasteQty,
      expectedWastePct,
      expectedYieldPct: finalYieldPct,
      materialEfficiencyPct: finalYieldPct,
      estimatedDurationMinutes,
      confidenceScore,
      riskIndicators,
    };

    // Synchronous immediate UI update
    setLiveForecast(computedForecast);

    // Asynchronous backend prediction API refinement
    try {
      const data = await manufacturingPlannerApi.predict(updatedForm);
      if (data && data.expectedOutputQty) {
        setLiveForecast(data);
      }
    } catch (e) {
      // Backend prediction fallback
    }
  };

  // Re-trigger prediction on EVERY change inside planForm
  useEffect(() => {
    triggerPrediction(planForm);
  }, [JSON.stringify(planForm)]);

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const planPayload = {
        ...planForm,
        planNumber: planForm.planNumber || `SPP-2026-${String(plans.length + 1).padStart(3, '0')}`,
        predictedOutputQty: liveForecast.expectedOutputQty,
        predictedWasteQty: liveForecast.expectedWasteQty,
        predictedWastePct: liveForecast.expectedWastePct,
        predictedYieldPct: liveForecast.expectedYieldPct,
        confidenceScore: liveForecast.confidenceScore,
        forecast: liveForecast,
      };

      let savedPlan = { ...planPayload, _id: Date.now().toString(), status: 'Scheduled' };

      try {
        const res = editingId
          ? await manufacturingPlannerApi.update(editingId, planPayload)
          : await manufacturingPlannerApi.create(planPayload);

        if (res && (res.plan || res.id)) {
          savedPlan = res.plan || res;
        }
      } catch (err) {
        console.log('Using state fallback for plan save:', err.message);
      }

      setPlans((prev) => [savedPlan, ...prev.filter((p) => (p._id || p.id) !== editingId)]);

      setKpis((prev) => ({
        ...prev,
        plannedTodayCount: prev.plannedTodayCount + 1,
        totalEstOutputQty: prev.totalEstOutputQty + (savedPlan.predictedOutputQty || 0),
        totalEstWastageQty: prev.totalEstWastageQty + (savedPlan.predictedWasteQty || 0),
        activePlansCount: prev.activePlansCount + 1,
      }));

      setActiveTab('plans');
      setEditingId(null);
      alert(`Production Plan "${savedPlan.planName}" saved & scheduled successfully!`);
    } catch (err) {
      alert(err.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToOrder = async (planId) => {
    try {
      const res = await manufacturingPlannerApi.convertToOrder(planId);
      if (res) {
        alert(res.message || 'Successfully converted to Production Order!');
        setPlans((prev) =>
          prev.map((p) => ((p._id || p.id) === planId ? { ...p, status: 'Converted to Order' } : p))
        );
      }
    } catch (e) {
      setPlans((prev) =>
        prev.map((p) => ((p._id || p.id) === planId ? { ...p, status: 'Converted to Order' } : p))
      );
      alert('Plan status updated: Converted to Production Order!');
    }
  };

  const handleRunReverseCalc = async () => {
    try {
      const data = await manufacturingPlannerApi.reverseCalc(reverseForm);
      if (data) {
        setReverseResult(data);
        return;
      }
    } catch (e) {
      // Local calculation fallback
    }

    const reqInput = Math.round((reverseForm.desiredOutputQty / 0.94) * 10) / 10;
    setReverseResult({
      desiredOutputQty: reverseForm.desiredOutputQty,
      requiredRawMaterialQty: reqInput,
      expectedWasteQty: Math.round((reqInput - reverseForm.desiredOutputQty) * 10) / 10,
      expectedYieldPct: 94.0,
      safetyStockPct: 5,
      recommendedProcurementQty: Math.round((reqInput * 1.05) * 10) / 10,
    });
  };

  // Add / Remove Material Row
  const addMaterialRow = () => {
    setPlanForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { materialName: '', materialCode: '', quantity: 100, unit: 'kg', vendor: '', grade: 'Standard' },
      ],
    }));
  };

  const removeMaterialRow = (index) => {
    setPlanForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Add Custom Attribute
  const addCustomAttr = () => {
    setPlanForm((prev) => ({
      ...prev,
      productSpecs: {
        ...prev.productSpecs,
        customAttributes: [...(prev.productSpecs.customAttributes || []), { key: '', value: '' }],
      },
    }));
  };

  // Workspace Access Guard
  if (!isManufacturing) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bz-card p-8 text-center space-y-4 border-l-4 border-amber-500">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-charcoal">
            {t('smartPlanner.accessRestrictedTitle', 'Access Restricted: Manufacturing Workspaces Only')}
          </h2>
          <p className="text-sm text-warm-gray max-w-lg mx-auto leading-relaxed">
            {t(
              'smartPlanner.accessRestrictedDesc',
              'The Biizora Smart Production Planner is designed exclusively for manufacturing tenants. Please switch to a Manufacturing workspace to use this feature.'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl shadow-xl bg-[#1B3628] border border-[#2D5640] text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md border border-emerald-400/30">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/25 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                {t('smartPlanner.moduleBadge', 'Manufacturing Yield Engine')}
              </span>
              <span className="text-xs text-emerald-200/80 font-mono font-medium">v1.0 (Isolated AI)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-0.5">
              {t('smartPlanner.pageTitle', 'Biizora Smart Production Planner')}
            </h1>
            <p className="text-xs text-emerald-100/90 font-medium">
              {t('smartPlanner.pageSubtitle', 'Pre-production yield forecasting, raw material requirements, and scrap reduction.')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeTab === 'dashboard' ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
          >
            <TrendingUp className="w-4 h-4" /> {t('smartPlanner.tabDashboard', 'Dashboard')}
          </Button>

          <Button
            variant={activeTab === 'create' ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => {
              setEditingId(null);
              setActiveTab('create');
            }}
          >
            <Plus className="w-4 h-4" /> {t('smartPlanner.tabCreate', 'New Plan')}
          </Button>

          <Button
            variant={activeTab === 'reverse' ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('reverse')}
          >
            <Calculator className="w-4 h-4" /> {t('smartPlanner.tabReverse', 'Reverse Calculator')}
          </Button>

          <Button
            variant={activeTab === 'rules' ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('rules')}
          >
            <Settings className="w-4 h-4" /> {t('smartPlanner.tabRules', 'Yield Rules')}
          </Button>

          <Button
            variant={activeTab === 'plans' ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('plans')}
          >
            <Layers className="w-4 h-4" /> {t('smartPlanner.tabPlans', 'All Plans')}
          </Button>
        </div>
      </div>

      {/* TAB 1: PLANNER DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bz-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-warm-gray uppercase">{t('smartPlanner.kpiPlannedToday', 'Planned Today')}</span>
              <p className="text-xl font-bold text-charcoal">{kpis.plannedTodayCount} {t('smartPlanner.unitBatches', 'Batches')}</p>
            </div>
            <div className="bz-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-warm-gray uppercase">{t('smartPlanner.kpiEstOutput', 'Estimated Output')}</span>
              <p className="text-xl font-bold text-green-bottle">{kpis.totalEstOutputQty.toLocaleString()} kg</p>
            </div>
            <div className="bz-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-warm-gray uppercase">{t('smartPlanner.kpiEstWaste', 'Estimated Wastage')}</span>
              <p className="text-xl font-bold text-terracotta">{kpis.totalEstWastageQty.toLocaleString()} kg</p>
            </div>
            <div className="bz-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-warm-gray uppercase">{t('smartPlanner.kpiAvgYield', 'Average Yield %')}</span>
              <p className="text-xl font-bold text-emerald-600">{kpis.avgYieldPct}%</p>
            </div>
            <div className="bz-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-warm-gray uppercase">{t('smartPlanner.kpiMaterialUtil', 'Material Utilization')}</span>
              <p className="text-xl font-bold text-indigo-600">{kpis.materialUtilizationPct}%</p>
            </div>
            <div className="bz-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-warm-gray uppercase">{t('smartPlanner.kpiActivePlans', 'Active Plans')}</span>
              <p className="text-xl font-bold text-charcoal">{kpis.activePlansCount}</p>
            </div>
          </div>

          {/* Forecast Visual Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Wastage Risk Products */}
            <div className="bz-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {t('smartPlanner.topWasteRiskTitle', 'Top Wastage-Risk Products')}
                </h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal">Recycled Polyethylene Sheeting</span>
                    <p className="text-[11px] text-warm-gray">High thermal degradation & purge waste</p>
                  </div>
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">8.4% Waste</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal">Thin-Wall Injection Moulding</span>
                    <p className="text-[11px] text-warm-gray">Startup flash & runner scrap</p>
                  </div>
                  <span className="font-bold text-stone-700 bg-stone-200 px-2 py-1 rounded-md">6.2% Waste</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal">Multi-Color Woven Sack Yarn</span>
                    <p className="text-[11px] text-warm-gray">Color changeover spool loss</p>
                  </div>
                  <span className="font-bold text-stone-700 bg-stone-200 px-2 py-1 rounded-md">5.5% Waste</span>
                </div>
              </div>
            </div>

            {/* Upcoming Production Plans */}
            <div className="lg:col-span-2 bz-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-bottle" />
                  {t('smartPlanner.upcomingPlansTitle', 'Upcoming Pre-Production Plans')}
                </h3>
                <button onClick={() => setActiveTab('plans')} className="text-xs font-semibold text-green-bottle hover:underline">
                  {t('common.viewAll', 'View All')} →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-warm-gray font-semibold">
                      <th className="py-2 px-3">Plan #</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Input / Est. Output</th>
                      <th className="py-2 px-3">Est. Yield %</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {plans.length ? (
                      plans.slice(0, 4).map((p) => (
                        <tr key={p._id || p.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-green-bottle">{p.planNumber}</td>
                          <td className="py-2.5 px-3 font-medium text-charcoal">{p.planName || p.productName}</td>
                          <td className="py-2.5 px-3 font-mono">
                            {p.materials?.reduce((s, m) => s + (m.quantity || 0), 0)}kg → <strong className="text-emerald-700">{p.predictedOutputQty}kg</strong>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              {p.predictedYieldPct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => handleConvertToOrder(p._id || p.id)}
                            >
                              Convert to Order
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-warm-gray">
                          No production plans scheduled yet. Click <strong>New Plan</strong> to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE / EDIT PRODUCTION PLAN */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <form onSubmit={handleSavePlan} className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bz-card p-6 space-y-4">
              <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2 border-b border-stone-200 pb-3">
                <Factory className="w-4 h-4 text-green-bottle" />
                {t('smartPlanner.basicInfoTitle', 'Basic Pre-Production Information')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label className="space-y-1">
                  <span className="font-semibold text-charcoal">{t('smartPlanner.planName', 'Plan Name')}</span>
                  <input
                    required
                    type="text"
                    value={planForm.planName}
                    onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                    className="bz-input"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-semibold text-charcoal">{t('smartPlanner.productCategory', 'Product Category / Sector')}</span>
                  <SearchableGroupedSelect
                    value={planForm.productCategory}
                    onChange={(cat) => setPlanForm({ ...planForm, productCategory: cat })}
                    groups={MANUFACTURING_CATEGORIES}
                    placeholder="Select manufacturing sector..."
                    searchPlaceholder="Search sector (e.g. HDPE, Garments, Steel)..."
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-semibold text-charcoal">{t('smartPlanner.scheduledDate', 'Scheduled Production Date')}</span>
                  <input
                    type="date"
                    value={planForm.scheduledDate}
                    onChange={(e) => setPlanForm({ ...planForm, scheduledDate: e.target.value })}
                    className="bz-input"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-semibold text-charcoal">{t('smartPlanner.shift', 'Shift')}</span>
                  <select
                    value={planForm.shift}
                    onChange={(e) => setPlanForm({ ...planForm, shift: e.target.value })}
                    className="bz-input"
                  >
                    <option value="Shift 1">Shift 1 (Day)</option>
                    <option value="Shift 2">Shift 2 (Evening)</option>
                    <option value="Shift 3">Shift 3 (Night)</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="font-semibold text-charcoal">{t('smartPlanner.machineLine', 'Manufacturing Line / Machine')}</span>
                  <input
                    type="text"
                    value={planForm.machineId}
                    onChange={(e) => setPlanForm({ ...planForm, machineId: e.target.value })}
                    className="bz-input"
                    placeholder="Extruder Line #2"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-semibold text-charcoal">{t('smartPlanner.supervisor', 'Supervisor / Operator')}</span>
                  <input
                    type="text"
                    value={planForm.supervisor}
                    onChange={(e) => setPlanForm({ ...planForm, supervisor: e.target.value })}
                    className="bz-input"
                    placeholder="Rajesh Kumar"
                  />
                </label>
              </div>
            </div>

            {/* Raw Material Inputs Card */}
            <div className="bz-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
                  <Layers className="w-4 h-4 text-green-bottle" />
                  {t('smartPlanner.rawMaterialsTitle', 'Raw Material Quantity & Grade Input')}
                </h3>
                <Button type="button" size="xs" variant="secondary" onClick={addMaterialRow}>
                  <Plus className="w-3.5 h-3.5" /> Add Material
                </Button>
              </div>

              <div className="space-y-3 text-xs">
                {planForm.materials.map((mat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Material Name"
                      value={mat.materialName}
                      onChange={(e) => {
                        const updated = [...planForm.materials];
                        updated[idx].materialName = e.target.value;
                        setPlanForm({ ...planForm, materials: updated });
                      }}
                      className="bz-input col-span-2"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={mat.quantity}
                      onChange={(e) => {
                        const updated = [...planForm.materials];
                        updated[idx].quantity = parseFloat(e.target.value) || 0;
                        setPlanForm({ ...planForm, materials: updated });
                      }}
                      className="bz-input font-mono"
                    />
                    <SearchableGroupedSelect
                      value={mat.unit}
                      onChange={(u) => {
                        const updated = [...planForm.materials];
                        updated[idx].unit = u;
                        setPlanForm({ ...planForm, materials: updated });
                      }}
                      groups={INDUSTRIAL_UNITS}
                      suggestions={getSuggestedUnits(planForm.productCategory)}
                      placeholder="Unit"
                      searchPlaceholder="Search unit (e.g. kg, meter, drum)..."
                    />
                    <select
                      value={mat.grade}
                      onChange={(e) => {
                        const updated = [...planForm.materials];
                        updated[idx].grade = e.target.value;
                        setPlanForm({ ...planForm, materials: updated });
                      }}
                      className="bz-input"
                    >
                      <option value="Virgin Grade A">Virgin Grade A</option>
                      <option value="Standard">Standard Grade</option>
                      <option value="Recycled / Regrind">Recycled / Regrind</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeMaterialRow(idx)}
                      className="text-stone-400 hover:text-red-600 p-1 text-right"
                    >
                      <Trash2 className="w-4 h-4 ml-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Specifications Card */}
            <div className="bz-card p-6 space-y-4">
              <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2 border-b border-stone-200 pb-3">
                <Settings className="w-4 h-4 text-green-bottle" />
                {t('smartPlanner.productSpecsTitle', 'Dynamic Industry Product Specifications')}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="font-medium text-warm-gray">Dimension / Diameter</span>
                  <input
                    type="text"
                    value={planForm.productSpecs.dimension}
                    onChange={(e) => setPlanForm({ ...planForm, productSpecs: { ...planForm.productSpecs, dimension: e.target.value } })}
                    className="bz-input"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-warm-gray">Wall Thickness</span>
                  <input
                    type="text"
                    value={planForm.productSpecs.thickness}
                    onChange={(e) => setPlanForm({ ...planForm, productSpecs: { ...planForm.productSpecs, thickness: e.target.value } })}
                    className="bz-input"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-warm-gray">Target Batch Size</span>
                  <input
                    type="number"
                    value={planForm.productSpecs.batchSize}
                    onChange={(e) => setPlanForm({ ...planForm, productSpecs: { ...planForm.productSpecs, batchSize: parseFloat(e.target.value) || 0 } })}
                    className="bz-input font-mono"
                  />
                </label>
              </div>

              {/* Dynamic Custom Key-Value Attributes */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-warm-gray">Custom Attributes (Key / Value)</span>
                  <Button type="button" size="xs" variant="secondary" onClick={addCustomAttr}>
                    <Plus className="w-3 h-3" /> Add Custom Pair
                  </Button>
                </div>

                {planForm.productSpecs.customAttributes?.map((attr, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Attribute Key (e.g. Pressure)"
                      value={attr.key}
                      onChange={(e) => {
                        const updated = [...planForm.productSpecs.customAttributes];
                        updated[idx].key = e.target.value;
                        setPlanForm({ ...planForm, productSpecs: { ...planForm.productSpecs, customAttributes: updated } });
                      }}
                      className="bz-input text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. PN6)"
                      value={attr.value}
                      onChange={(e) => {
                        const updated = [...planForm.productSpecs.customAttributes];
                        updated[idx].value = e.target.value;
                        setPlanForm({ ...planForm, productSpecs: { ...planForm.productSpecs, customAttributes: updated } });
                      }}
                      className="bz-input text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setActiveTab('dashboard')}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" loading={loading}>
                Save & Generate Plan
              </Button>
            </div>
          </form>

          {/* Live Prediction Forecast Panel (1 col) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#152B1E] border border-[#2B523B] shadow-2xl text-white space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-[#2A4E38] pb-3">
                <h3 className="font-bold text-sm text-yellow-butter flex items-center gap-2">
                  <Brain className="w-5 h-5 text-yellow-butter animate-pulse" />
                  {t('smartPlanner.forecastPanelTitle', 'Smart Production Forecast')}
                </h3>
                <span className="text-[11px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                  {liveForecast.confidenceScore}% Confidence
                </span>
              </div>

              {/* Key Forecast Metrics */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#1E3B2A] border border-[#2E593F] flex justify-between items-center shadow-inner">
                  <span className="text-emerald-100 font-semibold text-xs">{t('smartPlanner.expectedOutput', 'Expected Finished Output')}</span>
                  <strong className="text-lg text-emerald-400 font-mono font-bold">{liveForecast.expectedOutputQty} kg</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1E3B2A] border border-[#2E593F] flex justify-between items-center shadow-inner">
                  <span className="text-emerald-100 font-semibold text-xs">{t('smartPlanner.expectedWaste', 'Expected Wastage / Scrap')}</span>
                  <strong className="text-lg text-red-400 font-mono font-bold">{liveForecast.expectedWasteQty} kg ({liveForecast.expectedWastePct}%)</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1E3B2A] border border-[#2E593F] flex justify-between items-center shadow-inner">
                  <span className="text-emerald-100 font-semibold text-xs">{t('smartPlanner.expectedYield', 'Forecasted Yield %')}</span>
                  <strong className="text-lg text-yellow-butter font-mono font-bold">{liveForecast.expectedYieldPct}%</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1E3B2A] border border-[#2E593F] flex justify-between items-center shadow-inner">
                  <span className="text-emerald-100 font-semibold text-xs">{t('smartPlanner.estDuration', 'Estimated Production Duration')}</span>
                  <strong className="text-sm text-cyan-300 font-mono font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    {Math.floor(liveForecast.estimatedDurationMinutes / 60)}h {liveForecast.estimatedDurationMinutes % 60}m
                  </strong>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="space-y-2.5 pt-2 border-t border-[#2A4E38]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-butter">
                  {t('smartPlanner.riskIndicatorsTitle', 'Risk Indicators & Warnings')}
                </span>
                {liveForecast.riskIndicators?.length ? (
                  liveForecast.riskIndicators.map((risk, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs border ${
                        risk.riskLevel === 'high'
                          ? 'bg-[#3A1D1D] border-red-700 text-red-100'
                          : risk.riskLevel === 'medium'
                          ? 'bg-[#3B2E18] border-amber-700 text-amber-100'
                          : 'bg-[#1E3E2C] border-emerald-600 text-emerald-100'
                      }`}
                    >
                      <strong className="block font-bold text-yellow-butter text-xs">{risk.title}</strong>
                      <p className="text-[11px] leading-relaxed text-emerald-100/90 font-medium">{risk.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-200/70 italic">No high wastage risks detected for this batch configuration.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVERSE MATERIAL REQUIREMENT CALCULATOR */}
      {activeTab === 'reverse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bz-card p-6 space-y-4">
            <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2 border-b border-stone-200 pb-3">
              <Calculator className="w-4 h-4 text-green-bottle" />
              {t('smartPlanner.reverseCalcTitle', 'Reverse Material Requirement Calculator')}
            </h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Enter your target finished output quantity to reverse calculate required raw material, scrap loss, safety stock, and recommended procurement order.
            </p>

            <div className="space-y-4 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-warm-gray">Target Finished Output Quantity (kg)</span>
                <input
                  type="number"
                  value={reverseForm.desiredOutputQty}
                  onChange={(e) => setReverseForm({ ...reverseForm, desiredOutputQty: parseFloat(e.target.value) || 0 })}
                  className="bz-input font-mono text-base font-bold"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-semibold text-charcoal">Product Category / Sector</span>
                <SearchableGroupedSelect
                  value={reverseForm.productCategory}
                  onChange={(cat) => setReverseForm({ ...reverseForm, productCategory: cat })}
                  groups={MANUFACTURING_CATEGORIES}
                  placeholder="Select sector..."
                  searchPlaceholder="Search sector..."
                />
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-warm-gray">Scrap Tolerance / Buffer %</span>
                <input
                  type="number"
                  value={reverseForm.scrapTolerancePct}
                  onChange={(e) => setReverseForm({ ...reverseForm, scrapTolerancePct: parseFloat(e.target.value) || 0 })}
                  className="bz-input font-mono"
                />
              </label>

              <Button type="button" variant="accent" onClick={handleRunReverseCalc} className="w-full">
                Calculate Material Requirement →
              </Button>
            </div>
          </div>

          {/* Reverse Calculation Results Panel */}
          <div className="bz-card p-6 bg-stone-50 border border-stone-200 space-y-5">
            <h3 className="font-semibold text-sm text-charcoal border-b border-stone-200 pb-3">
              {t('smartPlanner.reverseResultTitle', 'Calculated Procurement Breakdown')}
            </h3>

            {reverseResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center">
                  <span className="text-warm-gray">Target Output Required:</span>
                  <strong className="text-sm font-mono text-charcoal">{reverseResult.desiredOutputQty} kg</strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center">
                  <span className="text-warm-gray">Required Raw Material (yield factored):</span>
                  <strong className="text-sm font-mono text-green-bottle">{reverseResult.requiredRawMaterialQty} kg</strong>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center">
                  <span className="text-warm-gray">Expected Waste Loss:</span>
                  <strong className="text-sm font-mono text-terracotta">{reverseResult.expectedWasteQty} kg</strong>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-emerald-900">Recommended Procurement Order (+{reverseResult.safetyStockPct}% Buffer):</span>
                  <strong className="text-base font-mono text-emerald-800">{reverseResult.recommendedProcurementQty} kg</strong>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-warm-gray text-xs">
                Enter your target output quantity and click <strong>Calculate Material Requirement</strong>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: YIELD RULES CONFIGURATOR */}
      {activeTab === 'rules' && (
        <div className="bz-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-bottle" />
                {t('smartPlanner.rulesTitle', 'Workspace Yield Loss Rules')}
              </h3>
              <p className="text-xs text-warm-gray">Configurable standard yield rates, startup loss, and shrinkage factors for Layer 1 prediction.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-warm-gray font-semibold">
                  <th className="py-2.5 px-3">Product Category</th>
                  <th className="py-2.5 px-3">Standard Yield Rate</th>
                  <th className="py-2.5 px-3">Startup Loss</th>
                  <th className="py-2.5 px-3">Changeover Loss</th>
                  <th className="py-2.5 px-3">Shrinkage Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {yieldRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-bold text-charcoal">{rule.productCategory}</td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-bold">{(rule.standardYieldRate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono text-terracotta">{(rule.startupLossRate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono text-amber-700">{(rule.changeoverLossRate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono text-stone-600">{(rule.shrinkageFactor * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ALL PLANS TABLE */}
      {activeTab === 'plans' && (
        <div className="bz-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <h3 className="font-semibold text-sm text-charcoal">{t('smartPlanner.plansListTitle', 'All Pre-Production Plans')}</h3>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search plan #"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bz-input pl-9 text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bz-input text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Converted to Order">Converted to Order</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-warm-gray font-semibold">
                  <th className="py-2.5 px-3">Plan Number</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Est Output</th>
                  <th className="py-2.5 px-3">Yield %</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {plans.length ? (
                  plans.map((p) => (
                    <tr key={p._id || p.id} className="hover:bg-stone-50">
                      <td className="py-3 px-3 font-mono font-bold text-green-bottle">{p.planNumber}</td>
                      <td className="py-3 px-3 font-medium text-charcoal">{p.planName || p.productName}</td>
                      <td className="py-3 px-3">{p.productCategory}</td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-bold">{p.predictedOutputQty} kg</td>
                      <td className="py-3 px-3 font-mono">{p.predictedYieldPct}%</td>
                      <td className="py-3 px-3 font-mono">{p.confidenceScore}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => handleConvertToOrder(p._id || p.id)}
                        >
                          Convert
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-warm-gray">
                      No production plans found for this workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
