import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  customersApi,
  productsApi,
  invoicesApi,
  expensesApi,
  businessApi,
  setActiveBusinessId,
} from '../api/client';
import { useAuth } from './AuthContext';
import { defaultAIInsights } from '../data/initialData';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const { user, activeBusinessId, businesses, refreshBusinesses } = useAuth();
  const [company, setCompany] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [aiInsights] = useState(defaultAIInsights);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const loadBusinessData = useCallback(async () => {
    if (!user || !activeBusinessId) {
      setCompany(null);
      setCustomers([]);
      setProducts([]);
      setInvoices([]);
      setExpenses([]);
      return;
    }

    setActiveBusinessId(activeBusinessId);
    setLoading(true);
    try {
      const [bizRes, custRes, prodRes, invRes, expRes] = await Promise.all([
        businessApi.get(activeBusinessId),
        customersApi.list(),
        productsApi.list(),
        invoicesApi.list(),
        expensesApi.list(),
      ]);

      setCompany(bizRes.business);
      setRole(bizRes.role);
      setPermissions(bizRes.permissions);
      setCustomers(custRes.customers || []);
      setProducts(prodRes.products || []);
      setInvoices(invRes.invoices || []);
      setExpenses(expRes.expenses || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load business data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, activeBusinessId]);

  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

  const updateCompany = async (newDetails) => {
    const data = await businessApi.update(activeBusinessId, newDetails);
    setCompany(data.business);
    showToast('Company profile & bank details updated!');
    await refreshBusinesses?.();
    return data.business;
  };

  const addCustomer = async (customerData) => {
    const data = await customersApi.create(customerData);
    setCustomers((prev) => [data.customer, ...prev]);
    showToast(`Customer "${data.customer.name}" added successfully.`);
    return data.customer;
  };

  const updateCustomer = async (id, updatedFields) => {
    const data = await customersApi.update(id, updatedFields);
    setCustomers((prev) => prev.map((c) => (c.id === id ? data.customer : c)));
    showToast('Customer record updated!');
  };

  const deleteCustomer = async (id) => {
    await customersApi.remove(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('Customer deleted.', 'warning');
  };

  const addProduct = async (productData) => {
    const data = await productsApi.create(productData);
    setProducts((prev) => [data.product, ...prev]);
    showToast(`Product/Service "${data.product.name}" added.`);
    return data.product;
  };

  const updateProduct = async (id, updatedFields) => {
    const data = await productsApi.update(id, updatedFields);
    setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
    showToast('Inventory item updated!');
  };

  const deleteProduct = async (id) => {
    await productsApi.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Item removed from inventory.', 'warning');
  };

  const generateInvoiceNumber = () => {
    const prefix = company?.invoicePrefix || 'INV-';
    const nextNum = invoices.length + 101;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  };

  const createInvoice = async (invoiceData) => {
    const data = await invoicesApi.create(invoiceData);
    setInvoices((prev) => [data.invoice, ...prev]);
    await loadBusinessData();
    showToast(`Invoice ${data.invoice.invoiceNumber} created successfully!`);
    return data.invoice;
  };

  const updateInvoiceStatus = async (id, newStatus, paymentMethod = 'UPI / Online') => {
    const data = await invoicesApi.updateStatus(id, { status: newStatus, paymentMethod });
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? data.invoice : inv)));
    await loadBusinessData();
    showToast(`Invoice status updated to "${newStatus.toUpperCase()}".`);
  };

  const deleteInvoice = async (id) => {
    await invoicesApi.remove(id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    showToast('Invoice deleted.', 'warning');
  };

  const addExpense = async (expenseData) => {
    const data = await expensesApi.create(expenseData);
    setExpenses((prev) => [data.expense, ...prev]);
    showToast(`Expense ₹${Number(data.expense.amount).toLocaleString('en-IN')} recorded!`);
    return data.expense;
  };

  const deleteExpense = async (id) => {
    await expensesApi.remove(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense removed.', 'warning');
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.grandTotal : 0), 0);
  const pendingRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.status === 'pending' || inv.status === 'overdue' ? inv.grandTotal : 0),
    0
  );
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const cashBalance = 350000 + netProfit;

  const calculateHealthScore = () => {
    let score = 70;
    if (totalRevenue > totalExpenses) score += 15;
    if (pendingRevenue < totalRevenue * 0.4) score += 10;
    if (expenses.length > 0) score += 5;
    return Math.min(98, Math.max(45, score));
  };

  return (
    <BusinessContext.Provider
      value={{
        company: company || {
          name: '',
          currencySymbol: '₹',
          invoicePrefix: 'INV-',
          defaultTaxRate: 18,
        },
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
        loading,
        role,
        permissions,
        reload: loadBusinessData,
        businesses,
        metrics: {
          totalRevenue,
          pendingRevenue,
          totalExpenses,
          netProfit,
          cashBalance,
          healthScore: calculateHealthScore(),
          totalCustomers: customers.length,
          totalProducts: products.length,
          pendingInvoicesCount: invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length,
          paidInvoicesCount: invoices.filter((i) => i.status === 'paid').length,
        },
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);
