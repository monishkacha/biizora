import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  customersApi,
  productsApi,
  invoicesApi,
  expensesApi,
  businessApi,
  restaurantApi,
  stationeryApi,
  setActiveBusinessId,
} from '../api/client';
import { useAuth } from './AuthContext';
import { defaultAIInsights } from '../data/initialData';
import { isStationeryWorkspace } from '../config/workspaceFeatures';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const { user, activeBusinessId, businesses, refreshBusinesses, activeWorkspace } = useAuth();
  const [company, setCompany] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Restaurant State
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [offers, setOffers] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);

  // Stationery State
  const [stationeryCombos, setStationeryCombos] = useState([]);
  const [stationerySchoolOrders, setStationerySchoolOrders] = useState([]);
  const [stationeryVendors, setStationeryVendors] = useState([]);
  const [stationeryVendorPurchases, setStationeryVendorPurchases] = useState([]);
  const [stationeryStockLogs, setStationeryStockLogs] = useState([]);
  const [stationeryMetrics, setStationeryMetrics] = useState(null);
  const [stationerySettings, setStationerySettings] = useState(null);

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
      setTables([]);
      setReservations([]);
      setMenuItems([]);
      setOrders([]);
      setInventoryItems([]);
      setOffers([]);
      setStationeryCombos([]);
      setStationerySchoolOrders([]);
      setStationeryVendors([]);
      setStationeryVendorPurchases([]);
      setStationeryStockLogs([]);
      setStationeryMetrics(null);
      setStationerySettings(null);
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

      const currentWorkspace = bizRes.business || activeWorkspace;
      const bizType = (currentWorkspace?.businessType || '').toLowerCase();

      // If restaurant business type, load restaurant entities
      if (bizType === 'restaurant') {
        const [tblRes, resRes, menuRes, ordRes, invtRes, offRes, metRes] = await Promise.all([
          restaurantApi.getTables().catch(() => ({ tables: [] })),
          restaurantApi.getReservations().catch(() => ({ reservations: [] })),
          restaurantApi.getMenuItems().catch(() => ({ menuItems: [] })),
          restaurantApi.getOrders().catch(() => ({ orders: [] })),
          restaurantApi.getInventory().catch(() => ({ inventory: [], movements: [] })),
          restaurantApi.getOffers().catch(() => ({ offers: [] })),
          restaurantApi.getDashboardMetrics().catch(() => ({ metrics: null })),
        ]);

        setTables(tblRes.tables || []);
        setReservations(resRes.reservations || []);
        setMenuItems(menuRes.menuItems || []);
        setOrders(ordRes.orders || []);
        setInventoryItems(invtRes.inventory || []);
        setStockMovements(invtRes.movements || []);
        setOffers(offRes.offers || []);
        setDashboardMetrics(metRes.metrics || null);
      }

      // If stationery workspace, load stationery entities
      if (isStationeryWorkspace(currentWorkspace)) {
        if ((prodRes.products || []).length === 0) {
          await stationeryApi.seed().catch(() => {});
          const refreshedProducts = await productsApi.list().catch(() => ({ products: [] }));
          setProducts(refreshedProducts.products || []);
        }

        const [stMetrics, stCombos, stSchool, stVendors, stStock, stSettings] = await Promise.all([
          stationeryApi.getDashboardMetrics().catch(() => ({ metrics: null })),
          stationeryApi.getCombos().catch(() => ({ combos: [] })),
          stationeryApi.getSchoolOrders().catch(() => ({ orders: [] })),
          stationeryApi.getVendors().catch(() => ({ vendors: [], purchases: [] })),
          stationeryApi.getInventoryLogs().catch(() => ({ logs: [] })),
          stationeryApi.getSettings().catch(() => ({ settings: null })),
        ]);

        setStationeryMetrics(stMetrics.metrics || null);
        setStationeryCombos(stCombos.combos || []);
        setStationerySchoolOrders(stSchool.orders || []);
        setStationeryVendors(stVendors.vendors || []);
        setStationeryVendorPurchases(stVendors.purchases || []);
        setStationeryStockLogs(stStock.logs || []);
        setStationerySettings(stSettings.settings || null);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to load business data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, activeBusinessId, activeWorkspace]);

  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

  // Restaurant Helper Functions
  const updateTableStatus = async (id, data) => {
    const res = await restaurantApi.updateTableStatus(id, data);
    setTables((prev) => prev.map((t) => (t.id === id ? res.table : t)));
    await loadBusinessData();
    return res.table;
  };

  const createTable = async (data) => {
    const res = await restaurantApi.createOrUpdateTable(data);
    setTables((prev) => [...prev, res.table]);
    showToast(`Table ${res.table.name} created!`);
    return res.table;
  };

  const createReservation = async (data) => {
    const res = await restaurantApi.createReservation(data);
    setReservations((prev) => [res.reservation, ...prev]);
    showToast(`Reservation confirmed for ${res.reservation.customerName}!`);
    await loadBusinessData();
    return res.reservation;
  };

  const updateReservationStatus = async (id, data) => {
    const res = await restaurantApi.updateReservationStatus(id, data);
    setReservations((prev) => prev.map((r) => (r.id === id ? res.reservation : r)));
    await loadBusinessData();
    return res.reservation;
  };

  const createOrUpdateMenuItem = async (data) => {
    const res = await restaurantApi.createOrUpdateMenuItem(data);
    setMenuItems((prev) => {
      const idx = prev.findIndex((m) => m.id === res.menuItem.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = res.menuItem;
        return next;
      }
      return [res.menuItem, ...prev];
    });
    showToast(`Menu item "${res.menuItem.name}" saved!`);
    return res.menuItem;
  };

  const deleteMenuItem = async (id) => {
    await restaurantApi.deleteMenuItem(id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    showToast('Menu item removed.', 'warning');
  };

  const createOrder = async (data) => {
    const res = await restaurantApi.createOrder(data);
    setOrders((prev) => [res.order, ...prev]);
    showToast(`Order ${res.order.orderNumber} sent to kitchen!`);
    await loadBusinessData();
    return res.order;
  };

  const updateKitchenStatus = async (id, data) => {
    const res = await restaurantApi.updateKitchenStatus(id, data);
    setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
    await loadBusinessData();
    return res.order;
  };

  const processOrderPayment = async (id, data) => {
    const res = await restaurantApi.processOrderPayment(id, data);
    setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
    showToast(`Order ${res.order.orderNumber} payment completed!`);
    await loadBusinessData();
    return res.order;
  };

  const createOrUpdateInventoryItem = async (data) => {
    const res = await restaurantApi.createOrUpdateInventoryItem(data);
    setInventoryItems((prev) => {
      const idx = prev.findIndex((i) => i.id === res.inventoryItem.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = res.inventoryItem;
        return next;
      }
      return [...prev, res.inventoryItem];
    });
    showToast(`Ingredient "${res.inventoryItem.name}" saved!`);
    return res.inventoryItem;
  };

  const recordWaste = async (data) => {
    const res = await restaurantApi.recordWaste(data);
    setInventoryItems((prev) => prev.map((i) => (i.id === res.item.id ? res.item : i)));
    setStockMovements((prev) => [res.movement, ...prev]);
    showToast(`Recorded waste for ${res.item.name}`, 'warning');
    await loadBusinessData();
  };

  // Stationery Helper Functions
  const createPosBill = async (billData) => {
    const res = await stationeryApi.createPosBill(billData);
    setInvoices((prev) => [res.invoice, ...prev]);
    await loadBusinessData();
    showToast(`Bill ${res.invoice.invoiceNumber} created!`);
    return res.invoice;
  };

  const adjustStationeryStock = async (data) => {
    const res = await stationeryApi.adjustStock(data);
    await loadBusinessData();
    showToast(`Stock updated for ${res.product?.name || 'item'}`);
    return res.product;
  };

  const createSchoolOrder = async (data) => {
    const res = await stationeryApi.createSchoolOrder(data);
    setStationerySchoolOrders((prev) => [res.order, ...prev]);
    showToast(`School order ${res.order.orderNumber} created!`);
    await loadBusinessData();
    return res.order;
  };

  const updateSchoolOrder = async (id, data) => {
    const res = await stationeryApi.updateSchoolOrder(id, data);
    setStationerySchoolOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
    showToast(`School order updated!`);
    await loadBusinessData();
    return res.order;
  };

  const convertSchoolOrderToInvoice = async (id) => {
    const res = await stationeryApi.convertSchoolOrderToInvoice(id);
    await loadBusinessData();
    showToast(`School order converted to Invoice ${res.invoice.invoiceNumber}!`);
    return res;
  };

  const createVendor = async (data) => {
    const res = await stationeryApi.createVendor(data);
    setStationeryVendors((prev) => [...prev, res.vendor]);
    showToast(`Vendor ${res.vendor.name} added!`);
    return res.vendor;
  };

  const recordVendorPurchase = async (data) => {
    const res = await stationeryApi.recordVendorPurchase(data);
    await loadBusinessData();
    showToast(`Recorded purchase from ${res.purchase.vendorName}!`);
    return res.purchase;
  };

  const updateStationerySettings = async (data) => {
    const res = await stationeryApi.updateSettings(data);
    setStationerySettings(res.settings);
    showToast('Stationery settings updated!');
    await loadBusinessData();
    return res.settings;
  };

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
        // Restaurant Exposes
        tables,
        reservations,
        menuItems,
        orders,
        inventoryItems,
        stockMovements,
        offers,
        dashboardMetrics,
        updateTableStatus,
        createTable,
        createReservation,
        updateReservationStatus,
        createOrUpdateMenuItem,
        deleteMenuItem,
        createOrder,
        updateKitchenStatus,
        processOrderPayment,
        createOrUpdateInventoryItem,
        recordWaste,
        // Stationery Exposes
        stationeryCombos,
        stationerySchoolOrders,
        stationeryVendors,
        stationeryVendorPurchases,
        stationeryStockLogs,
        stationeryMetrics,
        stationerySettings,
        createPosBill,
        adjustStationeryStock,
        createSchoolOrder,
        updateSchoolOrder,
        convertSchoolOrderToInvoice,
        createVendor,
        recordVendorPurchase,
        updateStationerySettings,
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

