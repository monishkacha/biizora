import React, { useState } from 'react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Factory,
  Boxes,
  Cpu,
  ShieldCheck,
  Wrench,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Layers,
  ArrowRight
} from 'lucide-react';

export function ManufacturingProductionOrdersPage() {
  const [orders, setOrders] = useState([
    { id: 'PO-2026-081', product: 'Finished Gear Assembly (X1)', quantity: 250, targetDate: '2026-08-18', progress: 78, status: 'In Production', priority: 'High', line: 'Assembly Line 2' },
    { id: 'PO-2026-082', product: 'Precision Steel Axle (Heavy)', quantity: 500, targetDate: '2026-08-20', progress: 45, status: 'In Production', priority: 'Medium', line: 'Assembly Line 1' },
    { id: 'PO-2026-083', product: 'Copper Wire Harness 2mm', quantity: 1200, targetDate: '2026-08-22', progress: 100, status: 'Completed', priority: 'Normal', line: 'Wiring Workshop' },
    { id: 'PO-2026-084', product: 'Hydraulic Cylinder Pump', quantity: 150, targetDate: '2026-08-25', progress: 15, status: 'Scheduled', priority: 'Urgent', line: 'Assembly Line 3' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Manufacturing Engine</span>
          <h1 className="text-2xl font-display font-semibold text-charcoal">Production Orders</h1>
          <p className="text-xs text-warm-gray mt-0.5">Track live shopfloor manufacturing runs and assembly line targets</p>
        </div>
        <Button variant="accent" onClick={() => alert('New Production Order modal opened')}>
          <Plus className="w-4 h-4" /> Create Production Run
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-gray font-medium">Daily Production Target</p>
            <p className="text-2xl font-bold text-charcoal mt-1">2,100 Units</p>
            <span className="text-[11px] text-green-bottle font-semibold">88.5% Efficiency</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-bottle flex items-center justify-center">
            <Factory className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-gray font-medium">Active Production Runs</p>
            <p className="text-2xl font-bold text-charcoal mt-1">4 Active</p>
            <span className="text-[11px] text-warm-gray">3 Lines Running</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-gray font-medium">Raw Material Alerts</p>
            <p className="text-2xl font-bold text-charcoal mt-1">2 Low Stock</p>
            <span className="text-[11px] text-amber-600 font-semibold">Steel Sheet & Copper</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-gray font-medium">QC Pass Rate</p>
            <p className="text-2xl font-bold text-charcoal mt-1">99.2%</p>
            <span className="text-[11px] text-green-bottle font-semibold">Zero Critical Defects</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
            <input
              type="text"
              placeholder="Search production runs..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-green-bottle"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Filter className="w-3.5 h-3.5" /> Filter Status
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5" /> Export Excel
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/70 border-b border-stone-200 text-warm-gray uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Production Line</th>
                <th className="py-3 px-4">Target Qty</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-green-bottle">{o.id}</td>
                  <td className="py-3 px-4 font-semibold text-charcoal">{o.product}</td>
                  <td className="py-3 px-4 text-warm-gray">{o.line}</td>
                  <td className="py-3 px-4 font-semibold text-charcoal">{o.quantity} units</td>
                  <td className="py-3 px-4 w-40">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>{o.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${o.progress === 100 ? 'bg-emerald-500' : 'bg-green-bottle'}`}
                          style={{ width: `${o.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-warm-gray">{o.targetDate}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold ${
                      o.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      o.status === 'In Production' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-stone-100 text-warm-gray border border-stone-200'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function BillOfMaterialsPage() {
  const [boms] = useState([
    {
      id: 'BOM-GEAR-01',
      finishedProduct: 'Finished Gear Assembly',
      version: 'v2.4',
      totalCost: 15400,
      componentsCount: 6,
      items: [
        { name: 'Steel Alloy Bar 50mm', qty: '4.5 kg', cost: 4500 },
        { name: 'Hardened Steel Bearings', qty: '2 units', cost: 3200 },
        { name: 'Synthetic Lubricant Oil', qty: '0.8 L', cost: 1200 },
        { name: 'Fastener Screws M8', qty: '12 pcs', cost: 450 },
      ]
    },
    {
      id: 'BOM-COPPER-02',
      finishedProduct: 'Copper Wire Harness 2mm',
      version: 'v1.1',
      totalCost: 6200,
      componentsCount: 4,
      items: [
        { name: 'Raw Electrolytic Copper', qty: '10 kg', cost: 5200 },
        { name: 'PVC Insulation Sleeving', qty: '25 m', cost: 700 },
        { name: 'Brass Connector Terminals', qty: '50 pcs', cost: 300 },
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Manufacturing Engine</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">Bill of Materials (BOM)</h1>
        <p className="text-xs text-warm-gray mt-0.5">Manage raw material recipes, unit assembly costs, and component breakdown</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {boms.map((bom) => (
          <Card key={bom.id} className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-green-bottle bg-green-50 px-2 py-0.5 rounded">{bom.id}</span>
                <h3 className="text-base font-bold text-charcoal mt-1">{bom.finishedProduct}</h3>
                <span className="text-xs text-warm-gray">Version {bom.version} · {bom.componentsCount} components</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-warm-gray">Unit Build Cost</p>
                <p className="text-lg font-bold text-charcoal">₹{bom.totalCost.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-warm-gray">Component Breakdown</p>
              <div className="space-y-1.5">
                {bom.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-stone-50 rounded-xl">
                    <span className="font-medium text-charcoal">{item.name}</span>
                    <div className="flex items-center gap-4 text-warm-gray">
                      <span>{item.qty}</span>
                      <span className="font-bold text-charcoal">₹{item.cost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MachinesStatusPage() {
  const machines = [
    { name: 'CNC Lathe Machine #1', type: 'Precision Cutting', status: 'Optimal', uptime: '99.4%', lastMaint: '2026-08-01', operator: 'Vikram S.' },
    { name: 'Automated Hydraulic Press #3', type: 'Heavy Stamping', status: 'Optimal', uptime: '97.8%', lastMaint: '2026-07-28', operator: 'Rajesh K.' },
    { name: 'Robotic Welding Arm B', type: 'Assembly & Joining', status: 'Maintenance Due', uptime: '91.2%', lastMaint: '2026-07-10', operator: 'System Auto' },
    { name: 'Copper Extrusion Line #2', type: 'Extrusion', status: 'Optimal', uptime: '98.5%', lastMaint: '2026-08-05', operator: 'Anil M.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Manufacturing Engine</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">Machines & Maintenance</h1>
        <p className="text-xs text-warm-gray mt-0.5">Real-time telemetry, maintenance scheduling, and machine efficiency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {machines.map((m, i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-charcoal flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold ${
                m.status === 'Optimal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {m.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-charcoal">{m.name}</h3>
              <p className="text-xs text-warm-gray">{m.type}</p>
            </div>

            <div className="border-t border-stone-200 pt-2 text-xs space-y-1 text-warm-gray">
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="font-bold text-charcoal">{m.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span>Operator</span>
                <span className="font-bold text-charcoal">{m.operator}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Serviced</span>
                <span>{m.lastMaint}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RawMaterialsPage() {
  const materials = [
    { name: 'Steel Sheet Grade A (2mm)', category: 'Metals', stock: 120, unit: 'ton', reorderLevel: 150, vendor: 'Jindal Steel', status: 'Low Stock Alert' },
    { name: 'Electrolytic Copper Wire', category: 'Metals', stock: 8, unit: 'roll', reorderLevel: 10, vendor: 'Sterlite Copper', status: 'Low Stock Alert' },
    { name: 'Synthetic Lubricant Oil', category: 'Chemicals', stock: 450, unit: 'liters', reorderLevel: 100, vendor: 'Lubricio Corp', status: 'Optimal' },
    { name: 'Polymer Compound Pellets', category: 'Plastics', stock: 1800, unit: 'kg', reorderLevel: 500, vendor: 'Reliance Polymers', status: 'Optimal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Warehouse Management</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">Raw Materials Inventory</h1>
        <p className="text-xs text-warm-gray mt-0.5">Track raw material stock, reorder thresholds, and vendor purchase requisitions</p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/70 border-b border-stone-200 text-warm-gray uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Primary Vendor</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {materials.map((m, idx) => (
                <tr key={idx} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-charcoal">{m.name}</td>
                  <td className="py-3 px-4 text-warm-gray">{m.category}</td>
                  <td className="py-3 px-4 font-mono font-bold text-charcoal">{m.stock} {m.unit}</td>
                  <td className="py-3 px-4 text-warm-gray">{m.reorderLevel} {m.unit}</td>
                  <td className="py-3 px-4 font-medium text-charcoal">{m.vendor}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'Optimal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function QualityControlPage() {
  const tests = [
    { batchId: 'BATCH-2026-081', product: 'Finished Gear Assembly', testedQty: 50, passedQty: 50, failedQty: 0, inspector: 'Rahul V.', status: 'PASSED 100%' },
    { batchId: 'BATCH-2026-082', product: 'Precision Steel Axle', testedQty: 100, passedQty: 99, failedQty: 1, inspector: 'Priya K.', status: 'PASSED 99%' },
    { batchId: 'BATCH-2026-083', product: 'Copper Wire Harness 2mm', testedQty: 200, passedQty: 200, failedQty: 0, inspector: 'Rahul V.', status: 'PASSED 100%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Quality Assurance</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">Quality Control (QC) Reports</h1>
        <p className="text-xs text-warm-gray mt-0.5">Inspection logs, tolerance tests, and batch clearance certificates</p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/70 border-b border-stone-200 text-warm-gray uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Tested Units</th>
                <th className="py-3 px-4">Passed</th>
                <th className="py-3 px-4">Failed</th>
                <th className="py-3 px-4">QC Inspector</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {tests.map((t, idx) => (
                <tr key={idx} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-green-bottle">{t.batchId}</td>
                  <td className="py-3 px-4 font-bold text-charcoal">{t.product}</td>
                  <td className="py-3 px-4 font-semibold text-charcoal">{t.testedQty}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">{t.passedQty}</td>
                  <td className="py-3 px-4 text-red-600 font-bold">{t.failedQty}</td>
                  <td className="py-3 px-4 text-warm-gray">{t.inspector}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
