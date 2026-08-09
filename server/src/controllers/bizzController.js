import { asyncHandler } from '../utils/asyncHandler.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { Expense } from '../models/Expense.js';
import { Customer } from '../models/Customer.js';

export const getBriefing = asyncHandler(async (req, res) => {
  const businessId = req.businessId;
  const business = req.business;

  // Fetch all business records
  const [products, invoices, expenses, customers] = await Promise.all([
    Product.find({ businessId }),
    Invoice.find({ businessId }),
    Expense.find({ businessId }),
    Customer.find({ businessId })
  ]);

  // Calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const paidRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const pendingRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'pending' ? inv.grandTotal : 0), 0);
  const overdueRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'overdue' ? inv.grandTotal : 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const lowStockProducts = products.filter(p => p.stock <= p.minStockLevel);
  const lowStockCount = lowStockProducts.length;

  const topCustomer = [...customers].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0];

  // Calculate Health Score
  let healthScore = 95;
  const breakdown = [];

  if (lowStockCount > 0) {
    const penalty = Math.min(20, lowStockCount * 5);
    healthScore -= penalty;
    breakdown.push({
      metric: 'Inventory Status',
      score: 100 - penalty,
      status: 'warning',
      message: `${lowStockCount} item(s) are below safety stock levels.`
    });
  } else {
    breakdown.push({
      metric: 'Inventory Status',
      score: 100,
      status: 'healthy',
      message: 'All fast-moving products are fully stocked.'
    });
  }

  const overdueInvoicesCount = invoices.filter(i => i.status === 'overdue').length;
  if (overdueInvoicesCount > 0) {
    const penalty = Math.min(20, overdueInvoicesCount * 5);
    healthScore -= penalty;
    breakdown.push({
      metric: 'Receivables Control',
      score: 100 - penalty,
      status: 'warning',
      message: `₹${overdueRevenue.toLocaleString()} is locked in ${overdueInvoicesCount} overdue invoice(s).`
    });
  } else {
    breakdown.push({
      metric: 'Receivables Control',
      score: 100,
      status: 'healthy',
      message: 'Excellent payment collection, zero overdue invoices.'
    });
  }

  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
  if (expenseRatio > 70) {
    healthScore -= 15;
    breakdown.push({
      metric: 'Expense Control',
      score: 60,
      status: 'danger',
      message: `High operating expenses (₹${totalExpenses.toLocaleString()}) relative to revenue.`
    });
  } else {
    breakdown.push({
      metric: 'Expense Control',
      score: 95,
      status: 'healthy',
      message: `Healthy operating margins. Expense ratio is ${expenseRatio.toFixed(1)}%.`
    });
  }

  if (customers.length < 3) {
    healthScore -= 10;
    breakdown.push({
      metric: 'Customer Base',
      score: 75,
      status: 'warning',
      message: 'Focus on expanding active client acquisitions.'
    });
  } else {
    breakdown.push({
      metric: 'Customer Base',
      score: 100,
      status: 'healthy',
      message: `${customers.length} active customer profiles registered.`
    });
  }

  healthScore = Math.max(10, Math.min(100, Math.round(healthScore)));

  // Custom AI Natural Language Briefing based on Business Type
  const type = business.businessType || 'retail';
  let briefingMessage = '';
  let keyInsight = '';

  if (type === 'salon') {
    briefingMessage = `Welcome to your Glow Salon briefing! Today, focus on staff utilization. Stylist commissions make up a major portion of expenses. Offer premium services like 'Premium Hair Coloring' or styling packages to clients looking to upgrade.`;
    keyInsight = `Loyalty programs are active. ${customers.length} key clients can be engaged with personalized styling notifications.`;
  } else if (type === 'restaurant') {
    briefingMessage = `Welcome to your Restaurant briefing! Focus on dinner peak-hour preparation. Monitor inventory levels for raw materials. Promote high-margin dishes like 'Truffle Mushroom Risotto' or chef specials to walk-ins.`;
    keyInsight = `Weekend booking trends show higher beverage attachments. Push drink combos to elevate order values.`;
  } else if (type === 'manufacturing') {
    briefingMessage = `Production dashboard status is normal. Keep close supervision on your production runs. Ensure vendor shipments for raw materials are tracked to avoid inventory bottlenecks.`;
    keyInsight = `Top supplier Century Paper accounts for major raw material expenses. Negotiate bulk pricing.`;
  } else if (type === 'stationery') {
    briefingMessage = `School bulk order operations are active. Monitor high-velocity products like notebooks and pens. Ensure credit control is maintained with bulk business accounts.`;
    keyInsight = `Pending corporate invoices need active follow-ups to maintain working capital.`;
  } else {
    // Retail & general
    briefingMessage = `Operations are steady at your retail outlet. Pay attention to low-stock safety levels. Highlight products with active promotions to clear seasonal stocks.`;
    keyInsight = `${topCustomer ? `${topCustomer.name} is your highest contributing account this month.` : 'Monitor customer retention to boost repeat sales.'}`;
  }

  res.json({
    briefing: {
      message: briefingMessage,
      keyInsight,
      highlights: {
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        overdueRevenue,
        totalExpenses,
        lowStockCount,
      }
    },
    healthScore,
    breakdown,
  });
});

export const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const businessId = req.businessId;
  const business = req.business;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message content required' });
  }

  // Fetch contextual database data
  const [products, invoices, expenses, customers] = await Promise.all([
    Product.find({ businessId }),
    Invoice.find({ businessId }),
    Expense.find({ businessId }),
    Customer.find({ businessId })
  ]);

  const query = message.toLowerCase();
  let reply = '';

  // Basic NLP Routing based on local database query parsing
  if (query.includes('stock') || query.includes('inventory') || query.includes('product')) {
    const lowStock = products.filter(p => p.stock <= p.minStockLevel);
    if (query.includes('low') || query.includes('alert') || query.includes('reorder')) {
      if (lowStock.length === 0) {
        reply = "Great news! All products are well stocked above their reorder levels.";
      } else {
        reply = `The following products are running low:\n` + 
          lowStock.map(p => `• ${p.name}: ${p.stock} remaining (Reorder point: ${p.minStockLevel})`).join('\n') +
          `\n\nI recommend creating purchase requests for these items.`;
      }
    } else {
      reply = `You have ${products.length} registered products. Current top items by stock include:\n` +
        products.slice(0, 5).map(p => `• ${p.name}: ${p.stock} ${p.unit || 'units'}`).join('\n');
    }
  } else if (query.includes('revenue') || query.includes('invoice') || query.includes('sales') || query.includes('earning')) {
    const totalRev = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const pending = invoices.filter(i => i.status === 'pending');
    const overdue = invoices.filter(i => i.status === 'overdue');
    const totalPending = pending.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalOverdue = overdue.reduce((sum, i) => sum + i.grandTotal, 0);

    if (query.includes('pending') || query.includes('unpaid') || query.includes('overdue')) {
      reply = `You have:\n` +
        `• Pending Invoices: ${pending.length} (Total: ₹${totalPending.toLocaleString()})\n` +
        `• Overdue Invoices: ${overdue.length} (Total: ₹${totalOverdue.toLocaleString()})\n\n` +
        `I recommend sending automated reminders to the pending clients.`;
    } else {
      reply = `Your business has generated a lifetime revenue of ₹${totalRev.toLocaleString()} across ${invoices.length} invoices. Paid collection is ₹${invoices.reduce((s, i) => s + (i.paidAmount || 0), 0).toLocaleString()}.`;
    }
  } else if (query.includes('expense') || query.includes('spend') || query.includes('cost')) {
    const totalExp = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    reply = `Your total registered expenses amount to ₹${totalExp.toLocaleString()}.\n` +
      `Here are your major expense entries:\n` +
      expenses.slice(0, 4).map(e => `• ${e.title} (${e.category}): ₹${e.amount.toLocaleString()} on ${e.date}`).join('\n');
  } else if (query.includes('customer') || query.includes('client')) {
    const topSpent = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
    reply = `You have ${customers.length} registered customers.\n` +
      `Your top clients by spending are:\n` +
      topSpent.slice(0, 3).map(c => `• ${c.name} (${c.category}): ₹${c.totalSpent.toLocaleString()} spent`).join('\n');
  } else {
    // Default fallback AI assistant personality
    const type = business.businessType || 'retail';
    reply = `Hi, I'm Bizz, your AI Assistant for your ${type} business. I can help you monitor stock levels, summarize pending payments, analyze expenses, or inspect customer metrics. Try asking me:\n` +
      `• "What products are low on stock?"\n` +
      `• "How much revenue have I generated?"\n` +
      `• "List my major expenses."`;
  }

  res.json({ reply });
});
