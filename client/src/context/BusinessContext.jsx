import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  defaultCompany,
  defaultCustomers,
  defaultProducts,
  defaultInvoices,
  defaultExpenses,
  defaultAIInsights
} from '../data/initialData';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem('amexora_company');
    return saved ? JSON.parse(saved) : defaultCompany;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('amexora_customers');
    return saved ? JSON.parse(saved) : defaultCustomers;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('amexora_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('amexora_invoices');
    return saved ? JSON.parse(saved) : defaultInvoices;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('amexora_expenses');
    return saved ? JSON.parse(saved) : defaultExpenses;
  });

  const [aiInsights, setAiInsights] = useState(() => {
    const saved = localStorage.getItem('amexora_insights');
    return saved ? JSON.parse(saved) : defaultAIInsights;
  });

  const [toast, setToast] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('amexora_company', JSON.stringify(company));
    localStorage.setItem('amexora_customers', JSON.stringify(customers));
    localStorage.setItem('amexora_products', JSON.stringify(products));
    localStorage.setItem('amexora_invoices', JSON.stringify(invoices));
    localStorage.setItem('amexora_expenses', JSON.stringify(expenses));
    localStorage.setItem('amexora_insights', JSON.stringify(aiInsights));
  }, [company, customers, products, invoices, expenses, aiInsights]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Company management
  const updateCompany = (newDetails) => {
    setCompany(prev => ({ ...prev, ...newDetails }));
    showToast('Company profile & bank details updated!');
  };

  // Customer CRUD
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...customerData,
      outstandingBalance: 0,
      totalSpent: 0,
      status: 'active'
    };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`Customer "${newCustomer.name}" added successfully.`);
    return newCustomer;
  };

  const updateCustomer = (id, updatedFields) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    showToast('Customer record updated!');
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast('Customer deleted.', 'warning');
  };

  // Product CRUD
  const addProduct = (productData) => {
    const newProd = {
      id: `prod-${Date.now()}`,
      ...productData
    };
    setProducts(prev => [newProd, ...prev]);
    showToast(`Product/Service "${newProd.name}" added.`);
    return newProd;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    showToast('Inventory item updated!');
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Item removed from inventory.', 'warning');
  };

  // Invoice Operations
  const generateInvoiceNumber = () => {
    const nextNum = invoices.length + 101;
    return `${company.invoicePrefix}${String(nextNum).padStart(3, '0')}`;
  };

  const createInvoice = (invoiceData) => {
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceData.invoiceNumber || generateInvoiceNumber(),
      paidAmount: invoiceData.status === 'paid' ? invoiceData.grandTotal : 0,
      paymentMethod: invoiceData.status === 'paid' ? 'UPI / Online' : 'Pending',
      ...invoiceData
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Update customer outstanding balance & spent totals
    if (newInvoice.customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === newInvoice.customerId) {
          const isPaid = newInvoice.status === 'paid';
          return {
            ...c,
            totalSpent: c.totalSpent + newInvoice.grandTotal,
            outstandingBalance: isPaid ? c.outstandingBalance : c.outstandingBalance + newInvoice.grandTotal
          };
        }
        return c;
      }));
    }

    showToast(`Invoice ${newInvoice.invoiceNumber} created successfully!`);
    return newInvoice;
  };

  const updateInvoiceStatus = (id, newStatus, paymentMethod = 'UPI / Online') => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const isPaid = newStatus === 'paid';
        const updatedPaidAmount = isPaid ? inv.grandTotal : inv.paidAmount;

        // Adjust customer outstanding balance if marked paid
        if (inv.customerId) {
          setCustomers(cList => cList.map(c => {
            if (c.id === inv.customerId && inv.status !== 'paid' && isPaid) {
              return {
                ...c,
                outstandingBalance: Math.max(0, c.outstandingBalance - inv.grandTotal)
              };
            }
            return c;
          }));
        }

        return {
          ...inv,
          status: newStatus,
          paidAmount: updatedPaidAmount,
          paymentMethod: isPaid ? paymentMethod : inv.paymentMethod
        };
      }
      return inv;
    }));
    showToast(`Invoice status updated to "${newStatus.toUpperCase()}".`);
  };

  const deleteInvoice = (id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    showToast('Invoice deleted.', 'warning');
  };

  // Expense Operations
  const addExpense = (expenseData) => {
    const newExp = {
      id: `exp-${Date.now()}`,
      status: 'paid',
      receiptUrl: expenseData.receiptUrl || '',
      ...expenseData
    };
    setExpenses(prev => [newExp, ...prev]);
    showToast(`Expense ₹${newExp.amount.toLocaleString('en-IN')} recorded!`);
    return newExp;
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Expense removed.', 'warning');
  };

  // Financial Metrics Calculation
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.grandTotal : 0), 0);
  const pendingRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'pending' || inv.status === 'overdue' ? inv.grandTotal : 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const cashBalance = 350000 + netProfit; // Starting cash + net

  // Financial Health Score algorithm (0 - 100)
  const calculateHealthScore = () => {
    let score = 70; // Base score
    if (totalRevenue > totalExpenses) score += 15;
    if (pendingRevenue < totalRevenue * 0.4) score += 10;
    if (expenses.length > 0) score += 5;
    return Math.min(98, Math.max(45, score));
  };

  return (
    <BusinessContext.Provider value={{
      company,
      updateCompany,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      invoices,
      generateInvoiceNumber,
      createInvoice,
      updateInvoiceStatus,
      deleteInvoice,
      expenses,
      addExpense,
      deleteExpense,
      aiInsights,
      toast,
      showToast,
      metrics: {
        totalRevenue,
        pendingRevenue,
        totalExpenses,
        netProfit,
        cashBalance,
        healthScore: calculateHealthScore(),
        totalCustomers: customers.length,
        totalProducts: products.length,
        pendingInvoicesCount: invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length,
        paidInvoicesCount: invoices.filter(i => i.status === 'paid').length
      }
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);
