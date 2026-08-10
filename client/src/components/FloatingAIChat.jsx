import React, { useState, useRef, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, X, Bot, User, Globe, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('bizz_lang') || 'en'); // 'en' | 'gu'
  const { metrics, invoices, customers, expenses, products, company } = useBusiness();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const firstName = user?.name?.split(' ')[0] || 'there';

  const initialGreeting = language === 'gu'
    ? `નમસ્તે ${firstName}! હું **Bizz (બીઝ)** છું — ${company?.name || 'તમારા ધંધા'} નો તમારો સ્માર્ટ AI બિઝનેસ પાઇલટ. 🚀\n\nતમે મને તમારા વેચાણ, ચોખ્ખો નફો, બાકી લેણી રકમ, GST નિયમો અથવા સ્ટોકની માહિતી વિશે કંઈ પણ પૂછી શકો છો!`
    : `Hi ${firstName}! I'm **Bizz**, your intelligent business co-pilot for ${company?.name || 'your business'}. 🚀\n\nAsk me about live revenue, profit margins, pending customer invoices, inventory levels, or GST tax calculations — in English or Gujarati!`;

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: initialGreeting
    }
  ]);

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('bizz_lang', lang);
    const switchMsg = lang === 'gu'
      ? `🌐 **ભાષા બદલાઈ**: Bizz હવે તમને **ગુજરાતી** માં ઉત્તર આપશે. તમને શી મદદ કરી શકું?`
      : `🌐 **Language Switched**: Bizz will now respond in **English**. How can I help your business today?`;
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: switchMsg }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const quickQuestionsEn = [
    "What is my net profit today?",
    "Which customers have overdue payments?",
    "Show low stock inventory alerts",
    "Explain CGST vs IGST rules",
    "How to issue a GST invoice?",
    "Give business growth advice"
  ];

  const quickQuestionsGu = [
    "મને કેટલો ચોખ્ખો નફો થયો?",
    "કયા ગ્રાહકોની ચુકવણી બાકી છે?",
    "ઓછા સ્ટોકની ચેતવણીઓ બતાવો",
    "CGST અને IGST સમજાવો",
    "જીએસટી ઇનવોઇસ કેવી રીતે બનાવવું?",
    "ધંધાનો વિકાસ કરવાની સલાહ આપો"
  ];

  const activeQuickQuestions = language === 'gu' ? quickQuestionsGu : quickQuestionsEn;

  // Dynamic AI Intelligence Engine (English & Gujarati)
  const generateAIAnswer = (userQuery, targetLang = language) => {
    const q = userQuery.toLowerCase().trim();
    const isGujaratiScript = /[\u0A80-\u0AFF]/.test(userQuery);
    const isGujaratiTranslit = /\b(nafo|nafa|baki|hisaab|vyapar|dhandho|ketlo|ketli|chokkho|jama|aapo|karo|batao)\b/i.test(q);
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
        return `🏢 **ગ્રાહક વિગત: ${matchedCustomer.name}**\n\n` +
               `• **સંપર્ક વ્યક્તિ**: ${matchedCustomer.contactPerson || 'N/A'} (${matchedCustomer.phone || ''})\n` +
               `• **GSTIN**: ${matchedCustomer.gstin || 'અનરજિસ્ટર્ડ'}\n` +
               `• **કુલ ખરીદી**: ₹${(matchedCustomer.totalSpent || 0).toLocaleString('en-IN')}\n` +
               `• **બાકી ચુકવણી (Outstanding)**: ₹${(matchedCustomer.outstandingBalance || 0).toLocaleString('en-IN')}\n` +
               `• **ઇનવોઇસ સંખ્યા**: ${customerInvoices.length} (${pendingInvs.length} બાકી)\n\n` +
               ((matchedCustomer.outstandingBalance || 0) > 0
                 ? `💡 *Bizz સલાહ*: ઇનવોઇસ વિભાગમાંથી વોટ્સએપ પર ₹${(matchedCustomer.outstandingBalance).toLocaleString('en-IN')} માટે રિમાઇન્ડર મોકલો.`
                 : `✅ *સ્થિતિ*: ગ્રાહકની તમામ ચુકવણીઓ પૂર્ણ થયેલ છે.`);
      }

      return `🏢 **Customer File: ${matchedCustomer.name}**\n\n` +
             `• **Contact Person**: ${matchedCustomer.contactPerson || 'N/A'} (${matchedCustomer.phone || ''})\n` +
             `• **GSTIN**: ${matchedCustomer.gstin || 'Unregistered'}\n` +
             `• **Lifetime Spent**: ₹${(matchedCustomer.totalSpent || 0).toLocaleString('en-IN')}\n` +
             `• **Outstanding Balance**: ₹${(matchedCustomer.outstandingBalance || 0).toLocaleString('en-IN')}\n` +
             `• **Invoices Issued**: ${customerInvoices.length} (${pendingInvs.length} unpaid)\n\n` +
             ((matchedCustomer.outstandingBalance || 0) > 0
               ? `💡 *Bizz Tip*: Click Invoices -> WhatsApp Share to remind them about ₹${(matchedCustomer.outstandingBalance).toLocaleString('en-IN')} overdue balance.`
               : `✅ *Status*: Account in good standing with zero overdue balance.`);
    }

    // 2. Overdue & Receivables
    if (q.includes('unpaid') || q.includes('overdue') || q.includes('baki') || q.includes('pending') || q.includes('debtor')) {
      const overdueList = customers.filter(c => (c.outstandingBalance || 0) > 0);
      const totalOverdue = overdueList.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

      if (isGu) {
        if (overdueList.length === 0) return `🎉 **ઉત્તમ સમાચાર!** તમારા ધંધામાં હાલમાં કોઈ જ ગ્રાહકની રકમ બાકી નથી. તમામ ચુકવણીઓ પૂર્ણ છે!`;
        return `⚠️ **બાકી લેણી રકમનો અહેવાલ (Total Overdue: ₹${totalOverdue.toLocaleString('en-IN')})**\n\n` +
               overdueList.map(c => `• **${c.name}**: ₹${(c.outstandingBalance || 0).toLocaleString('en-IN')} (${c.phone || 'No phone'})`).join('\n') +
               `\n\n💡 *Bizz ભલામણ*: ઓટોમેટેડ WhatsApp ઇનવોઇસ લિંક મોકલીને આ રકમ ઝડપથી વસૂલ કરો.`;
      }

      if (overdueList.length === 0) return `🎉 **Great news!** You have zero overdue receivables across all clients!`;
      return `⚠️ **Outstanding Receivables (Total Overdue: ₹${totalOverdue.toLocaleString('en-IN')})**\n\n` +
             overdueList.map(c => `• **${c.name}**: ₹${(c.outstandingBalance || 0).toLocaleString('en-IN')} (${c.phone || 'No phone'})`).join('\n') +
             `\n\n💡 *Bizz Recommendation*: Send instant WhatsApp reminders to collect pending payments.`;
    }

    // 3. Profit / Revenue / Cashflow
    if (q.includes('profit') || q.includes('revenue') || q.includes('nafo') || q.includes('sales') || q.includes('income') || q.includes('earning')) {
      const rev = metrics.totalRevenue || 0;
      const netProf = metrics.netProfit || 0;
      const margin = rev > 0 ? ((netProf / rev) * 100).toFixed(1) : '0';

      if (isGu) {
        return `📊 **નાણાકીય ઓવરવ્યૂ (${company?.name || 'તમારો બિઝનેસ'})**\n\n` +
               `• **કુલ વેચાણ (Revenue)**: ₹${rev.toLocaleString('en-IN')}\n` +
               `• **ચોખ્ખો નફો (Net Profit)**: ₹${netProf.toLocaleString('en-IN')} (${margin}% માર્જિન)\n` +
               `• **કુલ ઓપરેટિંગ ખર્ચ**: ₹${(metrics.totalExpenses || 0).toLocaleString('en-IN')}\n` +
               `• **બાકી ચુકવણીઓ**: ₹${(metrics.pendingReceivables || 0).toLocaleString('en-IN')}\n\n` +
               `💡 *Bizz સૂચન*: ઓપરેટિંગ માર્જિન વધારે મજબૂત બનાવવા માટે ઉત્પાદનોના વેચાણ પર ડિસ્કાઉન્ટ ઓછું કરો.`;
      }

      return `📊 **Live Business Performance (${company?.name || 'Your Business'})**\n\n` +
             `• **Total Revenue**: ₹${rev.toLocaleString('en-IN')}\n` +
             `• **Net Profit**: ₹${netProf.toLocaleString('en-IN')} (${margin}% Margin)\n` +
             `• **Operating Expenses**: ₹${(metrics.totalExpenses || 0).toLocaleString('en-IN')}\n` +
             `• **Pending Receivables**: ₹${(metrics.pendingReceivables || 0).toLocaleString('en-IN')}\n\n` +
             `💡 *Bizz Insight*: Your gross profit margin is healthy. Focus on clearing pending receivables to boost cash reserves.`;
    }

    // 4. Low Stock & Inventory
    if (q.includes('stock') || q.includes('inventory') || q.includes('product') || q.includes('mal')) {
      const lowItems = products.filter(p => (p.stock || 0) <= (p.minStockLevel || 10));

      if (isGu) {
        if (lowItems.length === 0) return `✅ **સ્ટોકની સ્થિતિ ઉત્તમ છે!** તમામ સામાન અને પ્રોડક્ટ્સ સુરક્ષિત સ્તર પર છે.`;
        return `📦 **ઓછા સ્ટોકની ચેતવણી (${lowItems.length} પ્રોડક્ટ્સ)**\n\n` +
               lowItems.map(p => `• **${p.name}**: બાકી સ્ટોક ${p.stock || 0} ${p.unit || 'units'} (ન્યૂનતમ સ્તર: ${p.minStockLevel || 10})`).join('\n') +
               `\n\n💡 *Bizz ભલામણ*: સપ્લાયર્સ સાથે સંપર્ક કરી નવો ઓર્ડર પ્લેસ કરો.`;
      }

      if (lowItems.length === 0) return `✅ **Inventory status healthy!** All items are stocked safely above safety thresholds.`;
      return `📦 **Low Stock Alerts (${lowItems.length} Products)**\n\n` +
             lowItems.map(p => `• **${p.name}**: ${p.stock || 0} ${p.unit || 'units'} left (Reorder threshold: ${p.minStockLevel || 10})`).join('\n') +
             `\n\n💡 *Bizz Recommendation*: Create purchase orders for these items to avoid stockout delays.`;
    }

    // 5. GST Rules Explanation
    if (q.includes('gst') || q.includes('cgst') || q.includes('igst') || q.includes('tax')) {
      if (isGu) {
        return `🏛️ **GST કરવેરા માર્ગદર્શિકા (Bizz Tax Engine)**\n\n` +
               `• **CGST + SGST (રાજ્યની અંદરનું વેચાણ)**: જો ગ્રાહક તમારા જ રાજ્યમાં હોય, તો કુક ટેક્સ અડધો CGST અને અડધો SGST તરીકે ગણાય છે (દા.ત. 18% = 9% CGST + 9% SGST).\n` +
               `• **IGST (અન્ય રાજ્યમાં વેચાણ)**: જો ગ્રાહક બીજા રાજ્યમાં હોય, તો પૂરો 18% IGST લાગુ પડે છે.\n\n` +
               `Biizora દરેક ઇનવોઇસ બનાવતી વખતે આ ગણતરી આપોઆપ ઓટો-ડિટેક્ટ કરી લે છે!`;
      }

      return `🏛️ **GST Tax Rules Breakdown (Bizz Tax Engine)**\n\n` +
             `• **CGST + SGST (Intrastate Sales)**: Applied when selling to a client within your same state. Tax is split equally (e.g., 18% = 9% Central GST + 9% State GST).\n` +
             `• **IGST (Interstate Sales)**: Applied when selling across state borders. The full 18% IGST goes directly to Integrated GST.\n\n` +
             `Biizora automatically calculates the exact split based on your business state vs client state!`;
    }

    // Default Bizz Co-Pilot Response
    if (isGu) {
      return `હું **Bizz**, તમારો બિઝનેસ કો-પાઇલટ. 🤖\n\nહું તમને આ બાબતોમાં મદદ કરી શકું છું:\n` +
             `• **લાઇવ વેચાણ અને નફો**: વેચાણ, નફો અને ઓપરેટિંગ ખર્ચ.\n` +
             `• **ગ્રાહક અહેવાલ**: બાકી ચુકવણીઓ અને ઓવરડ્યુ હિસાબ.\n` +
             `• **સ્ટોક અને ઇન્વેન્ટરી**: ઓછા સ્ટોકની ચેતવણીઓ.\n` +
             `• **GST કરવેરા**: CGST, SGST અને IGST ની ગણતરી.\n\n` +
             `કોઈપણ સવાલ હિન્દી, ઈંગ્લીશ કે ગુજરાતીમાં પૂછો!`;
    }

    return `I am **Bizz**, your intelligent business co-pilot. 🤖\n\nI can directly answer:\n` +
           `• **Financial Performance**: Sales, profit margins, and monthly expenses\n` +
           `• **Client Receivables**: Unpaid invoices and debtor payment links\n` +
           `• **Stock Inventory**: Low-stock alerts and purchase request recommendations\n` +
           `• **GST Tax Calculations**: Intrastate (CGST+SGST) vs Interstate (IGST)\n\n` +
           `Feel free to ask me anything about ${company?.name || 'your business'} in English or Gujarati!`;
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponseText = generateAIAnswer(userMsg.text, language);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickQuestion = (questionText) => {
    setInput(questionText);
    const userMsg = { id: Date.now(), sender: 'user', text: questionText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponseText = generateAIAnswer(questionText, language);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-green-bottle text-white shadow-xl hover:bg-emerald-900 transition-all font-medium text-sm"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span>Ask Bizz AI</span>
        </motion.button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md h-[560px] bg-white rounded-2xl shadow-2xl border border-stone/30 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-bottle flex items-center justify-center text-white font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1.5">
                    Bizz AI <span className="text-[10px] bg-emerald-700/80 text-white px-2 py-0.5 rounded-full font-normal">Co-Pilot</span>
                  </h3>
                  <p className="text-[11px] text-stone-400">{company?.name || 'Biizora Business Pilot'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700">
                  <button
                    type="button"
                    onClick={() => toggleLanguage('en')}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      language === 'en' ? 'bg-green-bottle text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLanguage('gu')}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      language === 'gu' ? 'bg-green-bottle text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    ગુજરાતી
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-cream/30 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-green-bottle text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-green-bottle text-white rounded-br-none'
                        : 'bg-white border border-stone/20 text-charcoal rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-stone-200 text-charcoal flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-warm-gray text-xs">
                  <Bot className="w-4 h-4 animate-bounce text-green-bottle" />
                  <span>{language === 'gu' ? 'Bizz AI જવાબ વિચારી રહ્યું છે…' : 'Bizz AI is thinking…'}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Suggestions */}
            <div className="p-2.5 bg-stone-50 border-t border-stone-200/60 overflow-x-auto whitespace-nowrap flex gap-1.5 text-[11px]">
              {activeQuickQuestions.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="px-2.5 py-1 bg-white border border-stone-200 rounded-full text-warm-gray hover:text-green-bottle hover:border-green-bottle transition-colors shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'gu' ? 'Bizz AI ને અહીં પૂછો…' : 'Ask Bizz AI about your business…'}
                className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-green-bottle"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-green-bottle text-white rounded-xl hover:bg-emerald-900 disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
