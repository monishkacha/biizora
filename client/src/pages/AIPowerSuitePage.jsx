import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  FileCheck,
  Bot,
  Copy,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIPowerSuitePage() {
  const { metrics, invoices, customers, expenses, company, showToast } = useBusiness();

  const [activeModule, setActiveModule] = useState('advisor');
  const [language, setLanguage] = useState('en'); // 'en' | 'gu'
  const [copiedText, setCopiedText] = useState('');

  // Reminder Generator State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices.find(i => i.status !== 'paid')?.id || invoices[0]?.id);
  const [reminderChannel, setReminderChannel] = useState('whatsapp');
  const [reminderTone, setReminderTone] = useState('polite');
  const [reminderLang, setReminderLang] = useState('en'); // 'en' | 'gu'

  const selectedInv = invoices.find(i => i.id === selectedInvoiceId) || invoices[0];

  const generateReminderText = () => {
    if (!selectedInv) return '';

    const useGu = reminderLang === 'gu' || language === 'gu';

    if (useGu) {
      if (reminderChannel === 'whatsapp') {
        return `નમસ્તે ${selectedInv.customerName}, ${company.name} તરફથી નમ્ર યાદી કે ઇનવોઇસ ${selectedInv.invoiceNumber} રકમ ₹${selectedInv.grandTotal.toLocaleString('en-IN')} ની ચૂકવણીની તારીખ ${selectedInv.dueDate} હતી. આપ UPI: ${company.bankDetails.upiId} દ્વારા સરળતાથી ચુકવણી કરી શકો છો. આભાર!`;
      } else if (reminderChannel === 'email') {
        return `વિષય: ચુકવણીની નમ્ર યાદી - ઇનવોઇસ ${selectedInv.invoiceNumber} (${company.name})\n\nઆદરણીય ${selectedInv.customerName},\n\nઆશા છે આપ કુશળ હશો. ${company.name} તરફથી જણાવવાનું કે ઇનવોઇસ ${selectedInv.invoiceNumber} (રકમ ₹${selectedInv.grandTotal.toLocaleString('en-IN')}) ની ચુકવણીની નિયત તારીખ ${selectedInv.dueDate} હતી.\n\nકૃપા કરીને આ રકમ NEFT અથવા UPI (${company.bankDetails.upiId}) દ્વારા સત્વરે જમા કરાવવા નમ્ર વિનંતી.\n\nઆભાર,\n${company.name}`;
      } else {
        return `અમેક્ષોરા એલર્ટ: ઇનવોઇસ ${selectedInv.invoiceNumber} રકમ ₹${selectedInv.grandTotal} ની ચુકવણી બાકી છે. આપના UPI ID: ${company.bankDetails.upiId} દ્વારા ચૂકવણી કરો.`;
      }
    }

    if (reminderChannel === 'whatsapp') {
      return `Hi ${selectedInv.customerName}, gentle reminder from ${company.name} regarding Invoice ${selectedInv.invoiceNumber} for ₹${selectedInv.grandTotal.toLocaleString('en-IN')}, due on ${selectedInv.dueDate}. Pay easily via UPI: ${company.bankDetails.upiId}. Thank you!`;
    } else if (reminderChannel === 'email') {
      return `Subject: Payment Reminder - Invoice ${selectedInv.invoiceNumber} (${company.name})\n\nDear ${selectedInv.customerName},\n\nWe hope this email finds you well. This is a reminder that Invoice ${selectedInv.invoiceNumber} for ₹${selectedInv.grandTotal.toLocaleString('en-IN')} was due on ${selectedInv.dueDate}.\n\nPlease arrange for payment via NEFT/UPI at your earliest convenience.\n\nWarm regards,\n${company.name}`;
    } else {
      return `AMEXORA ALERT: Invoice ${selectedInv.invoiceNumber} of ₹${selectedInv.grandTotal} is due. Pay via UPI ID: ${company.bankDetails.upiId}`;
    }
  };

  const handleCopyReminder = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(language === 'gu' ? 'રીમાઇન્ડર ક્લિપબોર્ડમાં કોપી થઈ ગયું!' : 'Reminder copied to clipboard!');
    setTimeout(() => setCopiedText(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Enterprise Financial AI Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {language === 'gu' ? 'અમેક્ષોરા ફાયનાન્સિયલ AI સૂટ' : 'Amexora Financial AI Suite'}
          </h1>
          <p className="text-xs text-slate-300">
            {language === 'gu'
              ? 'ગુજરાતી અને ઈંગ્લીશમાં ઓટોમેટેડ બિઝનેસ હિસાબ, કેશ ફ્લો અને ચૂકવણી યાદી.'
              : 'Continuous business diagnostics, cash flow projections, and automated reminders in English & Gujarati.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Language Toggle Switch */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl shadow-md">
            <button
              onClick={() => { setLanguage('en'); setReminderLang('en'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                language === 'en' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => { setLanguage('gu'); setReminderLang('gu'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                language === 'gu' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ગુજરાતી (Gujarati)
            </button>
          </div>

          <div className="px-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-center shadow-md">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              {language === 'gu' ? 'હેલ્થ સ્કોર' : 'FINANCIAL HEALTH SCORE'}
            </span>
            <span className="text-xl font-extrabold text-emerald-400">{metrics.healthScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Module Selector Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 no-print">
        {[
          { id: 'advisor', labelEn: 'AI Advisor', labelGu: 'AI સલાહકાર', icon: Sparkles },
          { id: 'cashflow', labelEn: 'Cash Flow AI', labelGu: 'કેશ ફ્લો AI', icon: TrendingUp },
          { id: 'expense', labelEn: 'Expense Analyzer', labelGu: 'ખર્ચ પૃથક્કરણ', icon: DollarSign },
          { id: 'reminders', labelEn: 'Reminder Generator', labelGu: 'ચુકવણી યાદી', icon: MessageSquare },
          { id: 'health', labelEn: 'Health Score (0-100)', labelGu: 'હેલ્થ સ્કોર', icon: ShieldCheck },
          { id: 'report', labelEn: 'Monthly Summary', labelGu: 'માસિક અહેવાલ', icon: FileCheck },
        ].map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;

          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{language === 'gu' ? mod.labelGu : mod.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Module Display Area */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        
        {/* Module 1: AI Business Advisor */}
        {activeModule === 'advisor' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  {language === 'gu' ? 'AI બિઝનેસ સલાહકાર પૃથક્કરણ' : 'AI Business Advisor Diagnostic'}
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'gu' ? 'ધંધાકીય સુધારણા માટે સ્વચાલિત સલાહ અને લાઈવ AI ચેટ.' : 'Automated performance suggestions & live freeform conversational advisor.'}
                </p>
              </div>
              <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full">
                {language === 'gu' ? 'લાઇવ AI એન્જિન સક્રિય' : 'Live AI Engine Ready'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> {language === 'gu' ? 'વેચાણ અને ભાવ સુધારણા' : 'Revenue & Pricing Optimization'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'gu'
                    ? 'તમારું મુખ્ય સોફ્ટવેર સબ્સ્ક્રિપ્શન કુલ વેચાણના ૬૨% હિસ્સો ધરાવે છે. ૧ વર્ષના સોફ્ટવેર સપોર્ટ સાથે POS ટર્મિનલ હાર્ડવેરનું ₹૧૫,૦૦૦ નું પેકેજ ઓફર કરવાથી આવક વધી શકે છે.'
                    : 'Your top product (SaaS Annual Subscription) generates 62% of revenue. Consider bundling 1 year of software support with POS terminal hardware for a ₹15,000 upsell package.'}
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> {language === 'gu' ? 'વર્કિંગ કેપિટલ અને બાકી લેણાં' : 'Working Capital & Receivables'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'gu'
                    ? 'નોવા રીટેલ પાસે ₹૯૪,૯૦૦ ની ચુકવણી બાકી છે. ૭ દિવસમાં ચુકવણી કરવા પર ૨% ની છૂટ (ગ્રાહકના ₹૧,૮૯૮ ની બચત) આપવાથી કેશ બેલેન્સ ઝડપથી જમા થશે.'
                    : 'Nova Retail has ₹94,900 overdue. Offering a 2% early settlement discount (saves client ₹1,898) will unlock liquid cash 15 days faster.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-blue-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'gu' ? 'ધંધા વિશે કોઈ ચોક્કસ પ્રશ્ન છે?' : 'Have a specific question about your business?'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'gu'
                      ? 'સ્ક્રીનના નીચે જમણી બાજુએ આપેલ "Ask Amexora AI" બટન દબાવીને ગુજરાતી કે ઈંગ્લીશમાં ચેટ કરો!'
                      : 'Use the floating **Ask Amexora AI** button at the bottom-right of your screen to chat in English or Gujarati anytime!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => showToast(language === 'gu' ? 'ચેટ શરૂ કરવા નીચે જમણી બાજુ "Ask Amexora AI" પર ક્લિક કરો!' : 'Click the bottom-right "Ask Amexora AI" button to launch instant chat!')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700"
              >
                {language === 'gu' ? 'ચેટબોટ ખોલો' : 'Launch Chatbot'}
              </button>
            </div>
          </div>
        )}

        {/* Module 2: AI Cash Flow Predictor */}
        {activeModule === 'cashflow' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {language === 'gu' ? 'AI કેશ ફ્લો અનુમાન (૭, ૩૦ અને ૯૦ દિવસ)' : 'AI Cash Flow Predictor (7, 30 & 90 Days)'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'gu' ? 'ગ્રાહક કરાર અને ઇનવોઇસ તારીખોના આધારે ભવિષ્યનું કેશ બેલેન્સ અનુમાન.' : 'Predictive liquidity forecasting based on recurring retainers & invoice due dates.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'gu' ? '૭-દિવસનું અંદાજ' : '7-DAY PROJECTION'}
                </span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{(metrics.cashBalance + 45000).toLocaleString('en-IN')}</p>
                <p className="text-xs text-emerald-500 font-semibold">
                  {language === 'gu' ? 'અપેક્ષિત આવક: ₹૪૫,૦૦૦' : 'Expected Inflow: ₹45,000'}
                </p>
                <span className="text-[10px] text-slate-400 block">{language === 'gu' ? 'AI સ્કોર: ૯૮%' : 'Confidence Score: 98%'}</span>
              </div>

              <div className="p-5 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {language === 'gu' ? '૩૦-દિવસનું અંદાજ' : '30-DAY PROJECTION'}
                </span>
                <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">₹{(metrics.cashBalance + 135000).toLocaleString('en-IN')}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                  {language === 'gu' ? 'અપેક્ષિત આવક: ₹૧,૮૫,૦૦૦' : 'Expected Inflow: ₹1,85,000'}
                </p>
                <span className="text-[10px] text-slate-400 block">{language === 'gu' ? 'AI સ્કોર: ૯૪%' : 'Confidence Score: 94%'}</span>
              </div>

              <div className="p-5 bg-teal-50 dark:bg-teal-950/60 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {language === 'gu' ? '૯૦-દિવસનું અંદાજ' : '90-DAY PROJECTION'}
                </span>
                <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">₹{(metrics.cashBalance + 380000).toLocaleString('en-IN')}</p>
                <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold">
                  {language === 'gu' ? 'અપેક્ષિત આવક: ₹૪,૫૦,૦૦૦' : 'Expected Inflow: ₹4,50,000'}
                </p>
                <span className="text-[10px] text-slate-400 block">{language === 'gu' ? 'AI સ્કોર: ૮૮%' : 'Confidence Score: 88%'}</span>
              </div>

            </div>
          </div>
        )}

        {/* Module 3: AI Expense Analyzer */}
        {activeModule === 'expense' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                {language === 'gu' ? 'AI ખર્ચ પૃથક્કરણ અને બચત સલાહ' : 'AI Expense Analyzer & Cost Savings'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'gu' ? 'વધારાના ખર્ચાઓ અને ટેક્સ બચાવવાની તકો દર્શાવે છે.' : 'Identifies wasteful spending, redundant software tools & cost cutting targets.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'gu' ? 'AWS ક્લાઉડ અને ગૂગલ વર્કસ્પેસનું વાર્ષિક બિલિંગ સ્વીકારો' : 'Convert AWS Cloud & Google Workspace to Annual Billing'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'gu' ? 'માસિક કાર્ડ પેમેન્ટના બદલે વાર્ષિક પેકેજ લેવાથી વર્ષે ₹૧૮,૪૦૦ ની બચત થાય છે.' : 'Switching monthly card payments to upfront annual subscriptions saves ₹18,400 per year.'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-xs font-extrabold rounded-lg">
                  {language === 'gu' ? 'બચત ₹૧૮.૪ હજાર/વર્ષ' : 'Save ₹18.4k/yr'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'gu' ? 'ઓફિસ ભાડા પર પૂરું GST Input Tax Credit (ITC) ક્લેમ કરો' : 'Claim Maximum Input Tax Credit (ITC) on Office Rent'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'gu' ? 'ઓફિસ લીઝ પર ચૂકવેલ ₹૯,૯૧૫ GST પૂરેપૂરો ટેક્સ ક્રેડિટ તરીકે સેટ-ઓફ કરી શકાય છે.' : '₹9,915 GST paid on office lease is 100% claimable against output tax.'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-600 text-xs font-extrabold rounded-lg">
                  {language === 'gu' ? '₹૯.૯ હજાર ટેક્સ બચત' : '₹9.9k Tax Saved'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Module 4: AI Invoice Reminder Generator */}
        {activeModule === 'reminders' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                {language === 'gu' ? 'AI ઇનવોઇસ ચુકવણી યાદી નિર્માતા' : 'AI Invoice Payment Reminder Generator'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'gu' ? 'વોટ્સએપ, ઇમેઇલ અને SMS માટે ગુજરાતી અને ઈંગ્લીશમાં મેસેજ બનાવો.' : 'Generate customized WhatsApp, SMS, and Email payment reminders in English & Gujarati.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">{language === 'gu' ? 'ઇનવોઇસ પસંદ કરો' : 'Select Invoice'}</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
                >
                  {invoices.map(i => (
                    <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.customerName} (₹{i.grandTotal})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{language === 'gu' ? 'માધ્યમ (Channel)' : 'Channel'}</label>
                <select
                  value={reminderChannel}
                  onChange={(e) => setReminderChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
                >
                  <option value="whatsapp">WhatsApp Direct Message</option>
                  <option value="email">Professional Email</option>
                  <option value="sms">SMS Text Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{language === 'gu' ? 'ટોન (Tone)' : 'Tone'}</label>
                <select
                  value={reminderTone}
                  onChange={(e) => setReminderTone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
                >
                  <option value="polite">{language === 'gu' ? 'નમ્ર અને મિત્રતાપૂર્ણ' : 'Polite & Friendly'}</option>
                  <option value="firm">{language === 'gu' ? 'કડક અને તાત્કાલિક' : 'Firm & Urgent'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">{language === 'gu' ? 'મેસેજ ભાષા' : 'Message Language'}</label>
                <select
                  value={reminderLang}
                  onChange={(e) => setReminderLang(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-teal-500 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400"
                >
                  <option value="en">English</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
              </div>
            </div>

            {/* Preview & Action Box */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'gu' ? 'AI દ્રારા ડ્રાફ્ટ કરેલ મેસેજ પ્રિવ્યુ' : 'AI DRAFTED REMINDER PREVIEW'}
                </span>
                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded">
                  {reminderLang === 'gu' ? 'ગુજરાતી મોડ' : 'English Mode'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {generateReminderText()}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleCopyReminder(generateReminderText())}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {language === 'gu' ? 'ડ્રાફ્ટ કોપી કરો' : 'Copy Draft'}
                </button>
                {reminderChannel === 'whatsapp' && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(generateReminderText())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> {language === 'gu' ? 'વોટ્સએપમાં ખોલો' : 'Open in WhatsApp'}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Module 5: AI Financial Health Score */}
        {activeModule === 'health' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-500" />
                  {language === 'gu' ? 'AI નાણાકીય હેલ્થ સ્કોર વિશ્લેષણ' : 'AI Financial Health Score Breakdown'}
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'gu' ? 'રોકડ પ્રવાહ અને ઓપરેટિંગ જોખમોનું મૂલ્યાંકન.' : 'Multi-pillar assessment of liquidity, solvency, and operational risk.'}
                </p>
              </div>
              <span className="text-3xl font-extrabold text-blue-600">{metrics.healthScore} / 100</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 space-y-1">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                  {language === 'gu' ? 'મજબૂત પાસાઓ (Strengths)' : 'Strengths'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  • {language === 'gu' ? 'ચોખ્ખો નફો ૪૦% થી વધુ છે.' : 'Net profit margin above 40%.'}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  • {language === 'gu' ? 'કેશ બેલેન્સ ₹૫ લાખથી વધારે છે.' : 'Strong cash balance position exceeding ₹5 Lakhs.'}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 space-y-1">
                <h4 className="font-bold text-amber-800 dark:text-amber-300">
                  {language === 'gu' ? 'જોખમ અને સુધારણા (Risks)' : 'Risks & Weaknesses'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  • {language === 'gu' ? 'નોવા રીટેલ પાસે ₹૯૪,૯૦૦ ની ચુકવણી બાકી છે.' : '₹94,900 in overdue receivables from Nova Retail.'}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  • {language === 'gu' ? 'થર્મલ પ્રિન્ટર પેપરનો સ્ટોક ઓછો છે.' : 'Inventory stock for Thermal Receipt Rolls is low.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Module 6: AI Monthly Executive Summary */}
        {activeModule === 'report' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                {language === 'gu' ? 'AI માસિક એક્ઝિક્યુટિવ સારાંશ' : 'AI Monthly Executive Summary'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'gu' ? 'જુલાઈ ૨૦૨૬ ના બિઝનેસ પર્ફોર્મન્સનો અહેવાલ.' : 'Structured narrative breakdown of business performance for July 2026.'}
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-3 font-mono">
              <p className="font-bold text-blue-600 dark:text-blue-400">
                EXECUTIVE NARRATIVE REPORT ({language === 'gu' ? 'ગુજરાતી આવૃત્તિ' : 'English Edition'}) - {company.name}
              </p>
              {language === 'gu' ? (
                <>
                  <p>જુલાઈ ૨૦૨૬ માં, કંપનીએ ₹{metrics.totalExpenses.toLocaleString('en-IN')} ના કુલ ખર્ચ સામે ₹{metrics.totalRevenue.toLocaleString('en-IN')} ની કુલ આવક નોંધાવીને ₹{metrics.netProfit.toLocaleString('en-IN')} નો ચોખ્ખો નફો પ્રાપ્ત કર્યો છે.</p>
                  <p>સૌથી વધુ આવક આપનાર ગ્રાહક એપેક્સ ગ્લોબલ સોલ્યુશન્સ (₹૧.૧૨ લાખ) રહ્યું. ઓગસ્ટ ૨૦૨૬ માં આવકમાં +૧૫% ની વૃદ્ધિની સંભાવના સાથે કેશ ફ્લો ઉત્તમ સ્થિતિમાં છે.</p>
                </>
              ) : (
                <>
                  <p>In July 2026, the company recorded total paid revenue of ₹{metrics.totalRevenue.toLocaleString('en-IN')} against operating expenses of ₹{metrics.totalExpenses.toLocaleString('en-IN')}, achieving a net profit of ₹{metrics.netProfit.toLocaleString('en-IN')}.</p>
                  <p>Top client revenue contributor was Apex Global Solutions (₹1.12L). Overall cash flow trajectory remains positive with predicted August revenue growth of +15%.</p>
                </>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

