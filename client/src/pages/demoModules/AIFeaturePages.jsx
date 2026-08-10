import React, { useState } from 'react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  Scissors,
  TrendingUp,
  Calendar,
  Layers,
  Zap,
  CheckCircle2,
  Brain,
  FileText,
  Globe,
  RefreshCw
} from 'lucide-react';

export function AIHairRecommendationPage() {
  const [faceShape, setFaceShape] = useState('Oval');
  const [hairType, setHairType] = useState('Straight');

  const recommendations = {
    Oval: [
      { style: 'Textured Layered Cut', fit: '98% Match', desc: 'Adds subtle volume without overpowering natural symmetry.' },
      { style: 'Classic Side Sweep', fit: '95% Match', desc: 'Framing layers highlight cheekbones and jawline.' }
    ],
    Round: [
      { style: 'Long Bob (Lob)', fit: '97% Match', desc: 'Elongates facial structure with sharp vertical angles.' },
      { style: 'High Volume Pixie', fit: '92% Match', desc: 'Creates height at the crown to balance roundness.' }
    ],
    Square: [
      { style: 'Soft Waves with Curtain Bangs', fit: '96% Match', desc: 'Softens strong jawline contours beautifully.' }
    ]
  };

  const activeRecs = recommendations[faceShape] || recommendations.Oval;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Bizz AI Salon Suite</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">AI Face Shape & Hair Style Matcher</h1>
        <p className="text-xs text-warm-gray mt-0.5">Automated AI recommendations based on client face structure and hair texture</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-bottle" /> Client Facial Inputs
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-warm-gray font-medium mb-1">Face Shape</label>
              <select
                value={faceShape}
                onChange={(e) => setFaceShape(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
              >
                <option value="Oval">Oval</option>
                <option value="Round">Round</option>
                <option value="Square">Square</option>
              </select>
            </div>

            <div>
              <label className="block text-warm-gray font-medium mb-1">Hair Texture</label>
              <select
                value={hairType}
                onChange={(e) => setHairType(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
              >
                <option value="Straight">Straight</option>
                <option value="Wavy">Wavy</option>
                <option value="Curly">Curly</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <Brain className="w-4 h-4 text-green-bottle" /> AI Recommended Styles ({faceShape} Face)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeRecs.map((rec, idx) => (
              <Card key={idx} className="p-5 space-y-2 border-l-4 border-l-green-bottle">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-charcoal">{rec.style}</h4>
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{rec.fit}</span>
                </div>
                <p className="text-xs text-warm-gray leading-relaxed">{rec.desc}</p>
                <Button size="sm" variant="secondary" className="w-full mt-2" onClick={() => alert(`Saved style: ${rec.style} to client profile!`)}>
                  Apply to Client Booking
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIForecastingPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Bizz AI Predictive Engine</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">AI Cash Flow & Demand Forecasting</h1>
        <p className="text-xs text-warm-gray mt-0.5">Machine-learning projections for 30-day cash positions, inventory demand, and seasonal spikes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2 bg-gradient-to-br from-green-bottle to-emerald-900 text-white">
          <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold">Predicted Next Month Revenue</span>
          <p className="text-2xl font-bold">₹5,42,000</p>
          <p className="text-xs text-emerald-200">+11.8% Projected Growth based on current order pipelines.</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-warm-gray font-bold">Recommended Inventory Reorder</span>
          <p className="text-2xl font-bold text-charcoal">3 Items</p>
          <p className="text-xs text-warm-gray">Reorder thermal rolls and steel stock before 18th Aug.</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-warm-gray font-bold">Peak Hour Demand Spike</span>
          <p className="text-2xl font-bold text-charcoal">Fridays 7-10 PM</p>
          <p className="text-xs text-warm-gray">Increase active floor staff by 25% during peak hours.</p>
        </Card>
      </div>
    </div>
  );
}

export function TableReservationAIPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Restaurant Intelligence</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">AI Table Reservation & Seating Optimizer</h1>
        <p className="text-xs text-warm-gray mt-0.5">Automated table allocation, guest wait-time estimates, and VIP seating preferences</p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal">Smart Table Allocation Engine</h3>
            <p className="text-xs text-warm-gray">Current Table Occupancy: 85% (17 of 20 Tables Active)</p>
          </div>
          <Button variant="accent" size="sm">
            Auto-Assign Guest Queue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-stone-50 rounded-xl space-y-2">
            <span className="font-bold text-charcoal">Upcoming AI Reservations</span>
            <p className="text-warm-gray">• Rahul S. (4 Guests) @ 7:30 PM → Table 3 (Assigned)</p>
            <p className="text-warm-gray">• Ananya R. (2 Guests) @ 8:00 PM → Table 8 (Assigned)</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-2">
            <span className="font-bold text-charcoal">Estimated Wait Times</span>
            <p className="text-warm-gray">• 2-Seater Table: 5 minutes wait</p>
            <p className="text-warm-gray">• 6-Seater Family Table: 15 minutes wait</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-2">
            <span className="font-bold text-charcoal">VIP Guest Intelligence</span>
            <p className="text-warm-gray">• Vikram Seth (VIP) booked for Friday 8 PM. Prefers quiet corner booth.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function GSTBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Tax & Compliance</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">GST Billing & Tax Compliance Engine</h1>
        <p className="text-xs text-warm-gray mt-0.5">Automated CGST, SGST, IGST calculations, HSN/SAC code lookup, and GSTR-1 export</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <span className="text-[11px] font-bold text-warm-gray uppercase">Intrastate GST (CGST + SGST)</span>
          <p className="text-2xl font-bold text-charcoal">₹48,250</p>
          <p className="text-xs text-warm-gray">Collected on sales within Karnataka (Same State)</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[11px] font-bold text-warm-gray uppercase">Interstate GST (IGST)</span>
          <p className="text-2xl font-bold text-charcoal">₹32,400</p>
          <p className="text-xs text-warm-gray">Collected on out-of-state sales (Maharashtra, Gujarat, TN)</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[11px] font-bold text-warm-gray uppercase">Input Tax Credit (ITC Claimable)</span>
          <p className="text-2xl font-bold text-emerald-600">₹18,500</p>
          <p className="text-xs text-warm-gray">Verified GST input tax credit on vendor purchases</p>
        </Card>
      </div>
    </div>
  );
}

export function IntegrationsHubPage() {
  const apps = [
    { name: 'Amazon Catalogue & Order Sync', status: 'Connected', desc: 'Sync inventory stock & order fulfillment with Amazon seller central' },
    { name: 'WhatsApp Business API', status: 'Connected', desc: 'Automated invoice PDFs and payment reminders sent via WhatsApp' },
    { name: 'Razorpay Payment Gateway', status: 'Connected', desc: 'Instant UPI, NetBanking, and credit card payment collections' },
    { name: 'Tally Prime / QuickBooks Export', status: 'Ready', desc: 'Export GSTR-1 XML & accounting ledger entries' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">App Ecosystem</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">Integrations & Plugin Hub</h1>
        <p className="text-xs text-warm-gray mt-0.5">Connect Biizora with e-commerce, payment gateways, and accounting software</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app, idx) => (
          <Card key={idx} className="p-5 space-y-3 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-bottle" />
                <h3 className="text-sm font-bold text-charcoal">{app.name}</h3>
              </div>
              <p className="text-xs text-warm-gray">{app.desc}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
              {app.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
