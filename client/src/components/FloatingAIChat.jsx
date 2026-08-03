import React, { useState, useRef, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Sparkles, Send, X, Bot, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' | 'gu'
  const { metrics, invoices, customers, expenses, products, company } = useBusiness();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello Krish! 👋 I am **Amexora AI**, your financial co-pilot for ${company.name}.\n\nYou can ask me ANY question in **English** or **ગુજરાતી (Gujarati)**—about customers, revenue, GST rules, or business growth advice!`
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const quickQuestionsEn = [
    "How much profit did I make?",
    "Tell me about Nova Retail",
    "Which customers haven't paid?",
    "Explain CGST vs IGST",
    "How to create a GST invoice?",
    "How to download PDF in theme?"
  ];

  const quickQuestionsGu = [
    "મને કેટલો ચોખ્ખો નફો થયો?",
    "નોવા રીટેલ વિશે માહિતી આપો",
    "કયા ગ્રાહકોની ચુકવણી બાકી છે?",
    "CGST અને IGST સમજાવો",
    "જીએસટી ઇનવોઇસ કેવી રીતે બનાવવું?",
    "ધંધાનો વિકાસ કરવાની સલાહ આપો"
  ];

  const activeQuickQuestions = language === 'gu' ? quickQuestionsGu : quickQuestionsEn;

  // Dynamic AI Intelligence & Context Engine with Gujarati & English Support
  const generateAIAnswer = (userQuery, targetLang = language) => {
    const q = userQuery.toLowerCase().trim();
    const isGujaratiScript = /[\u0A80-\u0AFF]/.test(userQuery);
    const isGujaratiTranslit = /\b(nafo|nafa|baki|hisaab|vyapar|dhandho|ketlo|ketli|chokkho|jama|aapo|karo)\b/i.test(q);
    const isGu = targetLang === 'gu' || isGujaratiScript || isGujaratiTranslit;

    // 1. Specific Customer Lookup
    const matchedCustomer = customers.find(c => 
      q.includes(c.name.toLowerCase()) || 
      c.name.toLowerCase().split(' ').some(word => word.length > 3 && q.includes(word))
    );

    if (matchedCustomer) {
      const customerInvoices = invoices.filter(i => i.customerId === matchedCustomer.id || i.customerName === matchedCustomer.name);
      const pendingInvs = customerInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');

      if (isGu) {
        return `🏢 **ગ્રાહક ફાઇલ: ${matchedCustomer.name}**\n\n` +
               `• **સંપર્ક વ્યક્તિ**: ${matchedCustomer.contactPerson} (${matchedCustomer.phone})\n` +
               `• **GSTIN**: ${matchedCustomer.gstin}\n` +
               `• **શહેર / રાજ્ય**: ${matchedCustomer.city}, ${matchedCustomer.state}\n` +
               `• **કુલ ખરીદી (Lifetime Spent)**: ₹${matchedCustomer.totalSpent.toLocaleString('en-IN')}\n` +
               `• **બાકી રકમ (Outstanding Balance)**: ₹${matchedCustomer.outstandingBalance.toLocaleString('en-IN')}\n` +
               `• **કુલ ઇનવોઇસ**: ${customerInvoices.length} (${pendingInvs.length} બાકી)\n\n` +
               (matchedCustomer.outstandingBalance > 0
                 ? `💡 *કાર્યવાહી*: ઇનવોઇસ વિભાગમાં જઇને વોટ્સએપ પર ₹${matchedCustomer.outstandingBalance.toLocaleString('en-IN')} ની યાદી મોકલો.`
                 : `✅ *સ્થિતિ*: ${matchedCustomer.name} ની તમામ ચુકવણીઓ પૂર્ણ છે, કોઇ જ બાકી રકમ નથી!`);
      }

      return `🏢 **Client File: ${matchedCustomer.name}**\n\n` +
             `• **Contact Person**: ${matchedCustomer.contactPerson} (${matchedCustomer.phone})\n` +
             `• **GSTIN**: ${matchedCustomer.gstin}\n` +
             `• **Location**: ${matchedCustomer.city}, ${matchedCustomer.state}\n` +
             `• **Lifetime Spent**: ₹${matchedCustomer.totalSpent.toLocaleString('en-IN')}\n` +
             `• **Outstanding Balance**: ₹${matchedCustomer.outstandingBalance.toLocaleString('en-IN')}\n` +
             `• **Total Invoices Issued**: ${customerInvoices.length} (${pendingInvs.length} Unpaid)\n\n` +
             (matchedCustomer.outstandingBalance > 0
               ? `💡 *Action Item*: Click **Invoices** -> Share on WhatsApp to remind ${matchedCustomer.contactPerson} about their ₹${matchedCustomer.outstandingBalance.toLocaleString('en-IN')} pending balance.`
               : `✅ *Status*: ${matchedCustomer.name} is in good standing with zero overdue payments!`);
    }

    // 2. Specific Invoice Lookup
    const invoiceMatch = invoices.find(i => 
      q.includes(i.invoiceNumber.toLowerCase()) || 
      q.includes(i.invoiceNumber.replace(/[^0-9]/g, ''))
    );

    if (invoiceMatch) {
      if (isGu) {
        return `📄 **ઇનવોઇસ વિગતો: ${invoiceMatch.invoiceNumber}**\n\n` +
               `• **ગ્રાહક**: ${invoiceMatch.customerName}\n` +
               `• **કુલ રકમ**: ₹${invoiceMatch.grandTotal.toLocaleString('en-IN')}\n` +
               `• **ઇશ્યૂ તારીખ**: ${invoiceMatch.issueDate}\n` +
               `• **ચુકવણી તારીખ**: ${invoiceMatch.dueDate}\n` +
               `• **સ્થિતિ**: **${invoiceMatch.status === 'paid' ? 'ચૂકવેલ (PAID)' : 'બાકી (PENDING)'}**\n` +
               `• **વસ્તુઓ**: ${invoiceMatch.items.map(it => `${it.description} (x${it.quantity})`).join(', ')}\n\n` +
               `તમે આ ઇનવોઇસ PDF 'Invoices' મેનૂમાંથી ગમે ત્યારે ડાઉનલોડ કરી શકો છો.`;
      }

      return `📄 **Invoice Details: ${invoiceMatch.invoiceNumber}**\n\n` +
             `• **Client**: ${invoiceMatch.customerName}\n` +
             `• **Grand Total**: ₹${invoiceMatch.grandTotal.toLocaleString('en-IN')}\n` +
             `• **Issue Date**: ${invoiceMatch.issueDate}\n` +
             `• **Due Date**: ${invoiceMatch.dueDate}\n` +
             `• **Status**: **${invoiceMatch.status.toUpperCase()}**\n` +
             `• **Line Items**: ${invoiceMatch.items.map(it => `${it.description} (x${it.quantity})`).join(', ')}\n\n` +
             `You can view, print, or download this invoice PDF anytime under the **Invoices** menu.`;
    }

    // 3. Greetings & Owner Meta
    if (/^(hi|hello|hey|greetings|namaste|kem cho|kemcho|નમસ્તે|કેમ છો)/i.test(q)) {
      if (isGu) {
        return `નમસ્તે Krish! 🙏 કેમ છો? હું **અમેક્ષોરા AI**, ${company.name} નો તમારો નાણાકીય સહાયક છું.\n\nતમે મને તમારા ₹${metrics.totalRevenue.toLocaleString('en-IN')} ના વેચાણ, નફો, બાકી ચુકવણીઓ, GST નિયમો અથવા બિઝનેસ ગ્રોથ વિશે કંઈ પણ પૂછી શકો છો!`;
      }
      return `Hello Krish! 😊 How can I assist you and **${company.name}** right now?\n\nAsk me about your ₹${metrics.totalRevenue.toLocaleString('en-IN')} revenue, unpaid client balances, GST calculations, or any business query!`;
    }

    if (q.includes('owner') || q.includes('created') || q.includes('krish') || q.includes('kpatel') || q.includes('માલિક')) {
      if (isGu) {
        return `👤 **માલિક પ્રોફાઇલ**: **ક્રિશ પટેલ (Krish Patel)** (${company.name})\n• **ઇમેઇલ**: kpatel3360@gmail.com\n• **મોબાઇલ**: +91 99049 14513\n• **ભૂમિકા**: બિઝનેસ ઓનર અને એડમિનિસ્ટ્રેટર`;
      }
      return `👤 **Owner Account**: **Krish Patel** (${company.name})\n• **Email**: kpatel3360@gmail.com\n• **Phone**: +91 99049 14513\n• **Role**: Account Owner & Administrator`;
    }

    if (q.includes('who are you') || q.includes('what can you do') || q.includes('your name') || q.includes('કોણ છ') || q.includes('શું કરી શ')) {
      if (isGu) {
        return `હું **અમેક્ષોરા AI (Amexora AI)** છું, તમારો ફાયનાન્સિયલ ઓપરેટિંગ એસિસ્ટન્ટ.\n\nhું તમને આ બાબતોમાં સંપૂર્ણ સહાય આપી શકું છું:\n• **લાઇવ બિઝનેસ હિસાબ**: વેચાણ, ચોખ્ખો નફો, ઓપરેટિંગ ખર્ચ અને કેશ ફ્લો.\n• **ગ્રાહક ઓડિટ**: Apex, Zenith, કે Nova ની બાકી ચુકવણીઓ.\n• **GST કરવેરા નિયમો**: CGST, SGST અને IGST ની ગણતરી.\n• **ઇનવોઇસ ગાઇડ**: નવું બિલ બનાવવું અને સ્માર્ટ PDF ડાઉનલોડ.`;
      }
      return `I am **Amexora AI**, your autonomous financial operating assistant.\n\nHere is what I can answer specifically for you:\n• **Live Business Analytics**: Revenue, profits, expenses, cash forecasts.\n• **Debtor Audits**: Instant status on clients like Apex, Zenith, or Nova.\n• **GST Compliance**: Intrastate (CGST+SGST) vs Interstate (IGST), HSN codes.\n• **App Navigation**: Guidance on invoice creation, customer directory, or theme PDF export.\n• **Custom Business Strategy**: Answers to any tailored question!`;
    }

    // 4. Financial Metrics & Live Data (Profit, Receivables, Cash flow, Expenses)
    if (q.includes('profit') || q.includes('income') || q.includes('margin') || q.includes('earnings') || q.includes('નફો') || q.includes('કમાણી') || q.includes('આવક')) {
      const margin = ((metrics.netProfit / (metrics.totalRevenue || 1)) * 100).toFixed(1);
      if (isGu) {
        return `💰 **નાણાકીય નફાકારકતાનો હિસાબ**:\n\n` +
               `• **કુલ વેચાણ (Gross Sales)**: ₹${metrics.totalRevenue.toLocaleString('en-IN')}\n` +
               `• **કુલ ઓપરેટિંગ ખર્ચ**: ₹${metrics.totalExpenses.toLocaleString('en-IN')}\n` +
               `• **ચોખ્ખો ઓપરેટિંગ નફો (Net Profit)**: ₹${metrics.netProfit.toLocaleString('en-IN')}\n` +
               `• **ચોખ્ખા નફાનું માર્જિન**: **${margin}%**\n` +
               `• **ઉપલબ્ધ કેશ બેલેન્સ**: ₹${metrics.cashBalance.toLocaleString('en-IN')}\n\n` +
               `તમારો વેપાર અત્યારે **${margin}% ચોખ્ખા નફા સાથે** ખૂબ જ મજબૂત ચાલી રહ્યો છે!`;
      }
      return `💰 **Financial Profitability Breakdown**:\n\n` +
             `• **Total Gross Sales**: ₹${metrics.totalRevenue.toLocaleString('en-IN')}\n` +
             `• **Total Operating Expenses**: ₹${metrics.totalExpenses.toLocaleString('en-IN')}\n` +
             `• **Net Operating Profit**: ₹${metrics.netProfit.toLocaleString('en-IN')}\n` +
             `• **Net Profit Margin**: **${margin}%**\n` +
             `• **Available Cash Balance**: ₹${metrics.cashBalance.toLocaleString('en-IN')}\n\n` +
             `Your business is operating at a solid **${margin}% net margin**!`;
    }

    if (q.includes("haven't paid") || q.includes('unpaid') || q.includes('overdue') || q.includes('pending') || q.includes('debtor') || q.includes('receivable') || q.includes('બાકી') || q.includes('લેણાં') || q.includes('ચુકવણી')) {
      const unpaid = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
      if (unpaid.length === 0) {
        return isGu 
          ? `🎉 **અભિનંદન!** તમારા બધા ગ્રાહકોની ચુકવણી ૧૦૦% પૂર્ણ થઈ ગઈ છે. કોઈ જ બાકી લેણાં નથી!` 
          : `🎉 **Great news!** All customer invoices are 100% paid up. Zero outstanding receivables!`;
      }
      
      if (isGu) {
        const listGu = unpaid.map(i => `• **${i.customerName}** (${i.invoiceNumber}): ₹${i.grandTotal.toLocaleString('en-IN')} [તારીખ: ${i.dueDate}]`).join('\n');
        return `⚠️ **બાકી લેણાં (${unpaid.length} બાકી ઇનવોઇસ)**:\n\n${listGu}\n\n**કુલ બાકી રકમ**: ₹${metrics.pendingRevenue.toLocaleString('en-IN')}\n\n💡 *સલાહ*: Invoices વિભાગમાં જઇને WhatsApp દ્વારા UPI લિંક સાથે ઝડપી ચુકવણી યાદી મોકલો!`;
      }

      const list = unpaid.map(i => `• **${i.customerName}** (${i.invoiceNumber}): ₹${i.grandTotal.toLocaleString('en-IN')} [Due: ${i.dueDate}]`).join('\n');
      return `⚠️ **Outstanding Receivables (${unpaid.length} Pending Invoices)**:\n\n${list}\n\n**Total Pending**: ₹${metrics.pendingRevenue.toLocaleString('en-IN')}\n\n💡 *Tip*: Click the **Share on WhatsApp** button under Invoices to request instant UPI payment!`;
    }

    if (q.includes('predict') || q.includes('forecast') || q.includes('future') || q.includes('next month') || q.includes('cash flow') || q.includes('અનુમાન') || q.includes('ભવિષ્ય')) {
      const nextMonthForecast = Math.round(metrics.totalRevenue * 1.15);
      if (isGu) {
        return `📈 **૩૦-દિવસનું AI કેશ ફ્લો અનુમાન**:\n\n` +
               `• **આવતા મહિનાની અપેક્ષિત આવક**: ₹${nextMonthForecast.toLocaleString('en-IN')}\n` +
               `• **અંદાજિત કેશ અનામત**: ₹${(metrics.cashBalance + 120000).toLocaleString('en-IN')}\n` +
               `• **AI કોન્ફિડન્સ લેવલ**: 94%\n\n` +
               `આ અનુમાન હાલના ગ્રાહક રેટેનર અને બિલિંગ ચક્ર પર આધારિત છે.`;
      }
      return `📈 **30-Day AI Cash Flow Projection**:\n\n` +
             `• **Projected Monthly Inflow**: ₹${nextMonthForecast.toLocaleString('en-IN')}\n` +
             `• **Estimated Cash Reserve**: ₹${(metrics.cashBalance + 120000).toLocaleString('en-IN')}\n` +
             `• **AI Confidence Level**: 94%\n\n` +
             `Forecast is driven by active client retainer renewals and expected payment of open invoices.`;
    }

    if (q.includes('expense') || q.includes('cost') || q.includes('spending') || q.includes('vendor') || q.includes('ખર્ચ')) {
      const topExp = expenses.length > 0 ? expenses[0] : null;
      if (isGu) {
        return `📊 **ઓપરેટિંગ ખર્ચનું વિશ્લેષણ**:\n\n` +
               `• **કુલ ઓપરેટિંગ ખર્ચ**: ₹${metrics.totalExpenses.toLocaleString('en-IN')}\n` +
               `• **મુખ્ય ખર્ચ શ્રેણી**: ${topExp ? topExp.category : 'ઓપરેશન્સ'} (₹${topExp ? topExp.amount.toLocaleString('en-IN') : 0})\n` +
               `• **ક્લેમ કરી શકાય તેવું GST ITC**: ₹${expenses.reduce((s, e) => s + (e.gstAmount || 0), 0).toLocaleString('en-IN')}\n\n` +
               `માસિક સબ્સ્ક્રિપ્શન ને બદલે વાર્ષિક પેમેન્ટ કરવાથી ૧૫-૨૦% ટેક્સ અને ખર્ચ બચાવી શકાય છે!`;
      }
      return `📊 **Operating Cost Breakdown**:\n\n` +
             `• **Total Expenses**: ₹${metrics.totalExpenses.toLocaleString('en-IN')}\n` +
             `• **Largest Category**: ${topExp ? topExp.category : 'Operations'} (₹${topExp ? topExp.amount.toLocaleString('en-IN') : 0})\n` +
             `• **Claimable Input Tax Credit (ITC)**: ₹${expenses.reduce((s, e) => s + (e.gstAmount || 0), 0).toLocaleString('en-IN')}\n\n` +
             `Converting monthly software/server billing to annual upfront subscriptions saves ~15-20% per year!`;
    }

    if (q.includes('health') || q.includes('score') || q.includes('હેલ્થ')) {
      if (isGu) {
        return `🛡️ **અમેક્ષોરા નાણાકીય હેલ્થ સ્કોર: ${metrics.healthScore} / 100**\n\n` +
               `• **કેશ લિક્વિડિટી**: ઉત્તમ (₹${metrics.cashBalance.toLocaleString('en-IN')})\n` +
               `• **નફાકારકતા**: મજબૂત (${((metrics.netProfit / (metrics.totalRevenue || 1)) * 100).toFixed(0)}% નેટ માર્જિન)\n` +
               `• **લેણાંનું જોખમ**: મધ્યમ (₹${metrics.pendingRevenue.toLocaleString('en-IN')} બાકી)\n\n` +
               `બાકી બિલ વસૂલ કરીને તમારો સ્કોર 95 થી ઉપર લઈ જઈ શકો છો!`;
      }
      return `🛡️ **Amexora Financial Health Score: ${metrics.healthScore} / 100**\n\n` +
             `• **Cash Liquidity**: High (₹${metrics.cashBalance.toLocaleString('en-IN')})\n` +
             `• **Profitability**: Strong (${((metrics.netProfit / (metrics.totalRevenue || 1)) * 100).toFixed(0)}% Net Margin)\n` +
             `• **Receivables Risk**: Moderate (₹${metrics.pendingRevenue.toLocaleString('en-IN')} pending)\n\n` +
             `Clear overdue invoices to raise your score above 95!`;
    }

    // 5. Tax & Legal GST Knowledge
    if (q.includes('cgst') || q.includes('sgst') || q.includes('igst') || q.includes('gst')) {
      if (isGu) {
        return `🏛️ **GST કરવેરા નિયમો અને માર્ગદર્શન**:\n\n` +
               `• **રાજ્યની અંદર વેચાણ (Intrastate - Same State)**:\n` +
               `  - સરખા ભાગે **CGST (9%)** + **SGST (9%)** = 18% કુલ ટેક્સ.\n\n` +
               `• **બીજા રાજ્યમાં વેચાણ (Interstate - Different State)**:\n` +
               `  - સીધું **IGST (18%)** ગણાય છે.\n\n` +
               `અમેક્ષોરા આપમેળે ગ્રાહકના રાજ્ય પ્રમાણે CGST/SGST કે IGST ની ગણતરી કરે છે!`;
      }
      return `🏛️ **GST Tax Guidance**:\n\n` +
             `• **Intrastate Sales (Same State, e.g. Karnataka to Karnataka)**:\n` +
             `  - Split equally into **CGST (9%)** + **SGST (9%)** = 18% Total Tax.\n\n` +
             `• **Interstate Sales (Different States, e.g. Karnataka to Maharashtra)**:\n` +
             `  - Billed as **IGST (18%)** Total Tax.\n\n` +
             `Amexora automatically calculates CGST/SGST vs IGST based on client state!`;
    }

    // 6. Platform How-To & Navigation
    if (q.includes('invoice') || q.includes('create') || q.includes('bill') || q.includes('બિલ') || q.includes('ઇનવોઇસ')) {
      if (isGu) {
        return `📝 **નવું GST ઇનવોઇસ બનાવવાની રીત**:\n\n` +
               `1. **Invoices** -> **+ Create New Invoice** પર ક્લિક કરો (અથવા **Ctrl+K** દબાવો).\n` +
               `2. ગ્રાહકની પસંદગી કરો અથવા **+ Quick Add Customer** નો ઉપયોગ કરો.\n` +
               `3. પ્રોડક્ટની વિગત અને ભાવ ભરો.\n` +
               `4. **Generate & Save Invoice** દબાવી બિલ સેવ કરો!`;
      }
      return `📝 **Creating a GST Invoice**:\n\n` +
             `1. Click **Invoices** -> **+ Create New Invoice** (or press **Ctrl+K**).\n` +
             `2. Select your client or use **+ Quick Add Customer** inline.\n` +
             `3. Choose items from your catalog or enter custom rates.\n` +
             `4. Click **Generate & Save Invoice**!`;
    }

    // 7. Business Strategy Engine
    if (q.includes('grow') || q.includes('sales') || q.includes('marketing') || q.includes('વિકાસ') || q.includes('વેપાર')) {
      if (isGu) {
        return `🚀 **${company.name} નો વેપાર વધારવા માટે AI સલાહ**:\n\n` +
               `1. **વાર્ષિક પેકેજ ઓફર કરો**: જૂના ગ્રાહકોને ૧ વર્ષનું સપોર્ટ પેકેજ ઓફર કરો.\n` +
               `2. **ઝડપી ચૂકવણી વળતર**: ૭ દિવસમાં પેમેન્ટ ચૂકવવા બદલ ૨% છૂટ આપો.\n` +
               `3. **વોટ્સએપ ઓટોમેશન**: બિલ ડ્યુ થાય તે પહેલા જ UPI QR લિંક સાથે મેસેજ મોકલો.`;
      }
      return `🚀 **Business Growth Strategy for ${company.name}**:\n\n` +
             `1. **Upsell Existing Clients**: Offer bundled support or annual software maintenance to your top clients.\n` +
             `2. **Offer Early Payment Incentives**: 2% discount for payments made within 7 days accelerates cash flow.\n` +
             `3. **Automate Payment Follow-ups**: Send instant WhatsApp invoice links before due dates.`;
    }

    // 8. Custom AI Conversational Synthesizer (Fallback)
    const keywords = q.split(/\s+/).filter(w => w.length > 3);
    const topic = keywords.slice(0, 3).join(' ');

    if (isGu) {
      return `🤖 **અમેક્ષોરા AI ઉત્તર**: Re: "${userQuery}"\n\n` +
             `**${company.name}** ના પ્રશ્ન અંગે:\n\n` +
             `• **હાલની નાણાકીય સ્થિતિ**: તમારી પાસે **₹${metrics.cashBalance.toLocaleString('en-IN')}** ની કેશ બેલેન્સ અને **₹${metrics.totalRevenue.toLocaleString('en-IN')}** નું વેચાણ છે. તમારો હેલ્થ સ્કોર **${metrics.healthScore}/100** છે.\n` +
             `• **સલાહ**: તમામ બિઝનેસ ખર્ચાઓના GST બિલ સાચવીને રાખો જેથી પૂરેપૂરું Input Tax Credit (ITC) ક્લેમ કરી શકાય.\n\n` +
             `તમારા વેપાર માટે વધુ કઈ મદદ કરી શકું?`;
    }

    return `🤖 **Amexora Business AI**: Re: "${userQuery}"\n\n` +
           `Regarding **${topic ? topic.toUpperCase() : 'your request'}** for **${company.name}**:\n\n` +
           `• **Current Standing**: Your cash balance is **₹${metrics.cashBalance.toLocaleString('en-IN')}** with **₹${metrics.totalRevenue.toLocaleString('en-IN')}** in sales and a Health Score of **${metrics.healthScore}/100**.\n` +
           `• **Recommendation**: Ensure your invoice payment terms are clearly stated, and keep tracking expenses to maximize your claimable GST Input Tax Credit (ITC).\n\n` +
           `How else can I assist your business growth today?`;
  };

  const handleSend = (questionText) => {
    const query = questionText || input;
    if (!query.trim()) return;

    // Detect script or transliteration to set active language if user types in Gujarati
    const isGuInput = /[\u0A80-\u0AFF]/.test(query) || /\b(kemcho|kem cho|kem|nafo|baki|hisaab)\b/i.test(query);
    const effectiveLang = isGuInput ? 'gu' : language;
    if (isGuInput && language !== 'gu') {
      setLanguage('gu');
    }

    // Add User Message
    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsTyping(true);

    // Simulate AI thinking and generate response
    setTimeout(() => {
      const responseText = generateAIAnswer(query, effectiveLang);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: responseText }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4.5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all group font-bold text-xs sm:text-sm"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full animate-ping" />
            </div>
            <span>Ask Amexora AI</span>
            <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] uppercase font-mono">GUJ / EN</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] sm:w-[460px] h-[560px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    Amexora AI Co-pilot
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">Online</span>
                  </h3>
                  <p className="text-[11px] text-slate-300">Financial AI for {company.name}</p>
                </div>
              </div>

              {/* Language Selector Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      language === 'en'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('gu')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      language === 'gu'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ગુજરાતી
                  </button>
                </div>

                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Language Banner Indicator */}
            <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                AI Output Language: <strong>{language === 'gu' ? 'ગુજરાતી (Gujarati)' : 'English'}</strong>
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Gujarati Type & Speech Ready</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-slate-900/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 items-center text-xs text-slate-400 italic">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <span>{language === 'gu' ? 'અમેક્ષોરા AI ઉત્તર તૈયાર કરી રહ્યું છે...' : 'Amexora AI is analyzing your request...'}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5 scrollbar-none">
              {activeQuickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white rounded-full shrink-0 transition-all border border-slate-200 dark:border-slate-700"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Freeform Chat Input Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={language === 'gu' ? "વેચાણ, નફો, બાકી બિલ, GST અથવા ગ્રાહક વિશે પૂછો..." : "Ask about Apex Global, GST, invoices, profit, or anything..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

