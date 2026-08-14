import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BadgeCheck,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Printer,
  Eye,
  Trash2,
  Edit2,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_QC_INSPECTIONS, INITIAL_PRODUCTION_ORDERS } from './mockManufacturingData';
import { useBusiness } from '../../context/BusinessContext';

export default function QCPage() {
  const { t } = useTranslation();
  const { showToast } = useBusiness();
  const [inspections, setInspections] = useState(INITIAL_QC_INSPECTIONS);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState(null);

  const [formData, setFormData] = useState({
    batchNo: 'BATCH-8801',
    productionOrder: 'PO-2026-089',
    productName: 'Heavy Duty Valve Body Assembly',
    inspector: 'Jayesh Parmar',
    inspectionDate: new Date().toISOString().slice(0, 10),
    inspectionType: 'Final Inspection',
    parameter: 'Dimensional Accuracy & Hydrostatic Test',
    expectedValue: '50 Bar / Zero Leakage',
    actualValue: '50 Bar / Passed',
    tolerance: '+/- 0.01mm',
    result: 'Pass',
    status: 'Passed',
    remarks: 'Quality standards met.',
    defectCategory: 'None'
  });

  // KPI Calculations
  const totalCount = inspections.length;
  const passedCount = inspections.filter((q) => q.result === 'Pass').length;
  const failedCount = inspections.filter((q) => q.result === 'Fail' && q.status === 'Failed').length;
  const reworkCount = inspections.filter((q) => q.status === 'Rework Required').length;

  const filteredInspections = inspections.filter((q) => {
    const s = search.toLowerCase();
    const matchesSearch =
      q.id.toLowerCase().includes(s) ||
      q.batchNo.toLowerCase().includes(s) ||
      q.productName.toLowerCase().includes(s) ||
      q.inspector.toLowerCase().includes(s) ||
      q.parameter.toLowerCase().includes(s);

    if (!matchesSearch) return false;
    if (resultFilter === 'Pass' && q.result !== 'Pass') return false;
    if (resultFilter === 'Fail' && q.result !== 'Fail') return false;
    if (resultFilter === 'Rework' && q.status !== 'Rework Required') return false;
    return true;
  });

  const handleOpenAddModal = () => {
    setFormData({
      batchNo: 'BATCH-8805',
      productionOrder: 'PO-2026-092',
      productName: 'Custom Conveyor Roller Assembly',
      inspector: 'Shraddha Bhatt',
      inspectionDate: new Date().toISOString().slice(0, 10),
      inspectionType: 'Final Inspection',
      parameter: 'Concentricity & Hardness',
      expectedValue: 'HRC 45',
      actualValue: 'HRC 46',
      tolerance: '+/- 2 HRC',
      result: 'Pass',
      status: 'Passed',
      remarks: 'All parameters within specification limits.',
      defectCategory: 'None'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.batchNo) {
      showToast('Product name and batch number are required', 'error');
      return;
    }

    const newQC = {
      ...formData,
      id: `QC-2026-${String(inspections.length + 109).padStart(3, '0')}`,
      status: formData.result === 'Pass' ? 'Passed' : formData.status || 'Failed'
    };

    setInspections([newQC, ...inspections]);
    showToast('QC Inspection report recorded');
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete QC inspection record?')) {
      setInspections(inspections.filter((q) => q.id !== id));
      showToast('QC record deleted');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-stone shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-forest uppercase tracking-wider mb-1">
            <span>Manufacturing ERP</span>
            <span>•</span>
            <span>Quality Assurance</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <BadgeCheck className="w-7 h-7 text-green-bottle" /> {t('mfgPages.qcTitle', 'Quality Control & Inspections')}
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            {t('mfgPages.qcSubtitle', 'Batch quality audits, dimensional tolerances, lab spectro test certificates, and rework disposition logs.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Monthly QC Audit Summary exported')}
            className="px-3.5 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> {t('mfgPages.exportSchedule', 'Export Audit Log')}
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold hover:bg-green-forest text-xs flex items-center gap-2 shadow-subtle transition-all"
          >
            <Plus className="w-4 h-4" /> {t('mfgPages.createPo', '+ Log Inspection')}
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">Total Audits Recorded</p>
          <h3 className="text-2xl font-bold font-display text-charcoal mt-1">{totalCount} Inspections</h3>
          <p className="text-[11px] text-green-forest mt-0.5">ISO 9001 quality system</p>
        </div>
        <div className="bg-white border border-emerald-200 bg-emerald-50/30 p-4 rounded-[18px] shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-semibold">{t('mfgPages.passRate', 'Passed Batches')}</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold font-display text-emerald-700 mt-1">{passedCount} Passed</h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Approved for dispatch</p>
        </div>
        <div className="bg-white border border-amber-200 bg-amber-50/30 p-4 rounded-[18px] shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-900 font-semibold">{t('mfgPages.pendingInspection', 'Rework Required')}</p>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold font-display text-amber-800 mt-1">{reworkCount} Sent Back</h3>
          <p className="text-[11px] text-amber-700 mt-0.5">Re-machining in progress</p>
        </div>
        <div className="bg-white border border-red-200 bg-red-50/30 p-4 rounded-[18px] shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-800 font-semibold">{t('mfgPages.rejectedBatches', 'Rejected / Failed')}</p>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold font-display text-red-700 mt-1">{failedCount} Rejected</h3>
          <p className="text-[11px] text-red-600 mt-0.5">Scrapped or vendor return</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search QC#, batch#, product, parameter or inspector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/50 border border-stone rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-bottle/30 text-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Pass', 'Rework', 'Fail'].map((res) => (
            <button
              key={res}
              onClick={() => setResultFilter(res)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                resultFilter === res
                  ? 'bg-green-bottle text-white shadow-xs'
                  : 'bg-cream text-warm-gray hover:text-charcoal'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Inspection Table */}
      <div className="bg-white rounded-[20px] border border-stone shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone bg-cream/40 text-warm-gray font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Inspection ID & Date</th>
                <th className="py-3.5 px-4">Batch & Product</th>
                <th className="py-3.5 px-4">Inspector</th>
                <th className="py-3.5 px-4">Parameter & Type</th>
                <th className="py-3.5 px-4">Expected vs Actual</th>
                <th className="py-3.5 px-4 text-center">Result</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone text-charcoal font-medium">
              {filteredInspections.map((qc) => {
                const isPass = qc.result === 'Pass';
                return (
                  <tr key={qc.id} className="hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-green-bottle">{qc.id}</p>
                      <p className="text-[11px] text-warm-gray">{qc.inspectionDate}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-charcoal">{qc.productName}</p>
                      <p className="text-[11px] font-mono text-warm-gray">{qc.batchNo}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">{qc.inspector}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-charcoal">{qc.parameter}</p>
                      <p className="text-[11px] text-warm-gray">{qc.inspectionType}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <p className="text-warm-gray">Exp: {qc.expectedValue}</p>
                      <p className="font-bold text-charcoal">Act: {qc.actualValue}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {qc.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          qc.status === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : qc.status === 'Rework Required'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {qc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedQC(qc);
                          setIsCertModalOpen(true);
                        }}
                        className="p-1.5 text-warm-gray hover:text-green-bottle rounded hover:bg-cream"
                        title="View QC Certificate"
                      >
                        <FileCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(qc.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add QC Inspection Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h3 className="text-lg font-bold text-charcoal">+ Log Quality Inspection Report</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="BATCH-8805"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Heavy Duty Valve Body"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Inspector Name</label>
                  <input
                    type="text"
                    value={formData.inspector}
                    onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                    placeholder="Jayesh Parmar"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Inspection Type</label>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    <option value="Final Inspection">Final Inspection</option>
                    <option value="In-Process QC">In-Process QC</option>
                    <option value="Receiving Inspection">Receiving Inspection</option>
                    <option value="Lab Spectro Test">Lab Spectro Test</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Parameter Checked</label>
                  <input
                    type="text"
                    value={formData.parameter}
                    onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
                    placeholder="e.g. Hydrostatic Pressure Test"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Result</label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value, status: e.target.value === 'Pass' ? 'Passed' : 'Rework Required' })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-bold text-charcoal"
                  >
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Remarks & Observations</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Tested per ASME / ISO standard."
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-bottle text-white font-semibold"
                >
                  Record Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QC Test Certificate Modal */}
      {isCertModalOpen && selectedQC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-bottle" />
                <div>
                  <h3 className="text-base font-bold text-charcoal">QC Test Inspection Certificate</h3>
                  <p className="text-xs text-warm-gray">Certificate Ref: {selectedQC.id}</p>
                </div>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-cream/40 rounded-2xl border border-stone space-y-3 text-xs">
              <div className="flex justify-between items-start border-b border-stone/60 pb-2">
                <div>
                  <p className="font-bold text-charcoal text-sm">{selectedQC.productName}</p>
                  <p className="text-warm-gray font-mono">Batch: {selectedQC.batchNo} | PO: {selectedQC.productionOrder}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    selectedQC.result === 'Pass' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {selectedQC.result} STAMPED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <p>Inspector: <strong className="text-charcoal">{selectedQC.inspector}</strong></p>
                <p>Date: <strong className="text-charcoal">{selectedQC.inspectionDate}</strong></p>
                <p>Test Type: <strong className="text-charcoal">{selectedQC.inspectionType}</strong></p>
                <p>Tolerance: <strong className="text-charcoal">{selectedQC.tolerance}</strong></p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-stone space-y-1">
                <p className="font-semibold text-charcoal">Tested Parameter & Output:</p>
                <p className="text-warm-gray">{selectedQC.parameter}</p>
                <p className="text-emerald-800 font-bold">Actual Result: {selectedQC.actualValue}</p>
              </div>

              <div className="text-[11px] text-warm-gray italic">
                Remarks: "{selectedQC.remarks}"
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => showToast('Printing QC Test Certificate...')}
                className="px-4 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </button>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
