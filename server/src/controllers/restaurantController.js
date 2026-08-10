import { Table } from '../models/Table.js';
import { Reservation } from '../models/Reservation.js';
import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { StockMovement } from '../models/StockMovement.js';
import { Supplier } from '../models/Supplier.js';
import { Offer } from '../models/Offer.js';
import { Customer } from '../models/Customer.js';
import { Business } from '../models/Business.js';
import { Invoice } from '../models/Invoice.js';

/**
 * Get all tables for a business
 */
export async function getTables(req, res, next) {
  try {
    const businessId = req.businessId;
    let tables = await Table.find({ businessId }).sort({ tableNumber: 1 });
    res.json({ tables: tables.map((t) => t.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
}

/**
 * Create or update table layout
 */
export async function createOrUpdateTable(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id, tableNumber, name, capacity, section, shape } = req.body;

    let table;
    if (id) {
      table = await Table.findOne({ _id: id, businessId });
      if (!table) return res.status(404).json({ error: 'Table not found' });
      if (tableNumber) table.tableNumber = tableNumber;
      if (name) table.name = name;
      if (capacity) table.capacity = capacity;
      if (section) table.section = section;
      if (shape) table.shape = shape;
      await table.save();
    } else {
      table = await Table.create({
        businessId,
        tableNumber: tableNumber || 1,
        name: name || `Table ${tableNumber || 1}`,
        capacity: capacity || 4,
        section: section || 'Indoor',
        shape: shape || 'square',
      });
    }
    res.json({ table: table.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Table status (Seat, Clear, Transfer, Merge)
 */
export async function updateTableStatus(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id } = req.params;
    const { status, currentGuests, serverName, currentOrderId, action, targetTableId } = req.body;

    const table = await Table.findOne({ _id: id, businessId });
    if (!table) return res.status(404).json({ error: 'Table not found' });

    if (action === 'seat') {
      table.status = 'occupied';
      table.currentGuests = currentGuests || 2;
      table.serverName = serverName || 'Staff';
      table.timeSeated = new Date();
    } else if (action === 'close' || action === 'clear') {
      table.status = 'available';
      table.currentGuests = 0;
      table.currentOrderId = null;
      table.serverName = '';
      table.timeSeated = null;
    } else if (action === 'transfer' && targetTableId) {
      const targetTable = await Table.findOne({ _id: targetTableId, businessId });
      if (targetTable) {
        targetTable.status = 'occupied';
        targetTable.currentGuests = table.currentGuests;
        targetTable.currentOrderId = table.currentOrderId;
        targetTable.serverName = table.serverName;
        targetTable.timeSeated = table.timeSeated;
        await targetTable.save();

        if (table.currentOrderId) {
          await Order.updateOne({ _id: table.currentOrderId }, { tableId: targetTable._id, tableName: targetTable.name });
        }

        table.status = 'available';
        table.currentGuests = 0;
        table.currentOrderId = null;
        table.serverName = '';
        table.timeSeated = null;
      }
    } else {
      if (status) table.status = status;
      if (currentGuests !== undefined) table.currentGuests = currentGuests;
      if (serverName) table.serverName = serverName;
      if (currentOrderId !== undefined) table.currentOrderId = currentOrderId;
    }

    await table.save();
    res.json({ table: table.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Reservations
 */
export async function getReservations(req, res, next) {
  try {
    const businessId = req.businessId;
    const { date } = req.query;
    const filter = { businessId };
    if (date) filter.date = date;

    const reservations = await Reservation.find(filter).sort({ date: 1, time: 1 });
    res.json({ reservations: reservations.map((r) => r.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Reservation with Double Booking Guard
 */
export async function createReservation(req, res, next) {
  try {
    const businessId = req.businessId;
    const { customerName, phone, email, date, time, guests, tableId, specialRequests, bookingSource } = req.body;

    if (!customerName || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'Please provide customer name, phone, date, time, and guest count.' });
    }

    // Check table conflict if tableId assigned
    if (tableId) {
      const existingConflict = await Reservation.findOne({
        businessId,
        tableId,
        date,
        time,
        status: { $in: ['confirmed', 'seated', 'pending'] },
      });
      if (existingConflict) {
        return res.status(400).json({ error: 'This table is already reserved at the selected time.' });
      }
    }

    let tableName = '';
    if (tableId) {
      const tbl = await Table.findById(tableId);
      if (tbl) tableName = tbl.name;
    }

    const reservation = await Reservation.create({
      businessId,
      customerName,
      phone,
      email: email || '',
      date,
      time,
      guests: Number(guests),
      tableId: tableId || null,
      tableName,
      status: 'confirmed',
      specialRequests: specialRequests || '',
      bookingSource: bookingSource || 'Reservation',
    });

    // Auto update customer record
    let customer = await Customer.findOne({ businessId, phone });
    if (!customer) {
      await Customer.create({
        businessId,
        name: customerName,
        phone,
        email: email || '',
        category: 'Regular',
        notes: `Reservation on ${date} ${time}`,
      });
    }

    res.json({ reservation: reservation.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Public Online Booking endpoint (No authentication required if business ID provided)
 */
export async function publicCreateReservation(req, res, next) {
  try {
    const { businessId, customerName, phone, email, date, time, guests, specialRequests } = req.body;

    let targetBizId = businessId;
    if (!targetBizId) {
      const defaultBiz = await Business.findOne({ businessType: 'restaurant' });
      if (defaultBiz) targetBizId = defaultBiz._id;
    }

    if (!targetBizId) {
      return res.status(400).json({ error: 'Restaurant workspace not found.' });
    }

    if (!customerName || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'Missing required booking details.' });
    }

    // Check capacity / existing bookings for date and time slot
    const existingCount = await Reservation.countDocuments({
      businessId: targetBizId,
      date,
      time,
      status: { $in: ['confirmed', 'seated', 'pending'] },
    });

    const totalTables = await Table.countDocuments({ businessId: targetBizId });
    if (totalTables > 0 && existingCount >= totalTables) {
      return res.status(400).json({ error: 'This time slot is fully booked. Please select another time.' });
    }

    // Find first available table for guests
    const tables = await Table.find({ businessId: targetBizId, capacity: { $gte: Number(guests) } }).sort({ capacity: 1 });
    let assignedTable = null;
    for (const t of tables) {
      const conf = await Reservation.findOne({ businessId: targetBizId, tableId: t._id, date, time, status: { $in: ['confirmed', 'seated'] } });
      if (!conf) {
        assignedTable = t;
        break;
      }
    }

    const reservation = await Reservation.create({
      businessId: targetBizId,
      customerName,
      phone,
      email: email || '',
      date,
      time,
      guests: Number(guests),
      tableId: assignedTable ? assignedTable._id : null,
      tableName: assignedTable ? assignedTable.name : '',
      status: 'confirmed',
      specialRequests: specialRequests || '',
      bookingSource: 'Online',
    });

    // Save/update customer
    let customer = await Customer.findOne({ businessId: targetBizId, phone });
    if (!customer) {
      await Customer.create({
        businessId: targetBizId,
        name: customerName,
        phone,
        email: email || '',
        category: 'Online Booking',
      });
    }

    res.json({ success: true, reservation: reservation.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Reservation status (Confirm, Seat, Cancel, Complete)
 */
export async function updateReservationStatus(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id } = req.params;
    const { status, tableId } = req.body;

    const reservation = await Reservation.findOne({ _id: id, businessId });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    if (status) reservation.status = status;
    if (tableId) {
      reservation.tableId = tableId;
      const tbl = await Table.findById(tableId);
      if (tbl) reservation.tableName = tbl.name;
    }

    // If seated, update table status
    if (status === 'seated' && reservation.tableId) {
      await Table.updateOne(
        { _id: reservation.tableId },
        {
          status: 'occupied',
          currentGuests: reservation.guests,
          timeSeated: new Date(),
        }
      );
    }

    await reservation.save();
    res.json({ reservation: reservation.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Menu catalog endpoints
 */
export async function getMenuItems(req, res, next) {
  try {
    const businessId = req.businessId;
    const menuItems = await MenuItem.find({ businessId }).sort({ category: 1, name: 1 });
    res.json({ menuItems: menuItems.map((m) => m.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
}

export async function createOrUpdateMenuItem(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id, name, description, category, price, costPrice, foodType, preparationTime, kitchenStation, availability, image, gstRate, modifiers, recipe } = req.body;

    let item;
    if (id) {
      item = await MenuItem.findOne({ _id: id, businessId });
      if (!item) return res.status(404).json({ error: 'Menu item not found' });
      if (name) item.name = name;
      if (description !== undefined) item.description = description;
      if (category) item.category = category;
      if (price !== undefined) item.price = price;
      if (costPrice !== undefined) item.costPrice = costPrice;
      if (foodType) item.foodType = foodType;
      if (preparationTime !== undefined) item.preparationTime = preparationTime;
      if (kitchenStation) item.kitchenStation = kitchenStation;
      if (availability) item.availability = availability;
      if (image !== undefined) item.image = image;
      if (gstRate !== undefined) item.gstRate = gstRate;
      if (modifiers) item.modifiers = modifiers;
      if (recipe) item.recipe = recipe;
      await item.save();
    } else {
      item = await MenuItem.create({
        businessId,
        name,
        description: description || '',
        category: category || 'Main Course',
        price: price || 0,
        costPrice: costPrice || 0,
        foodType: foodType || 'veg',
        preparationTime: preparationTime || 15,
        kitchenStation: kitchenStation || 'Kitchen',
        availability: availability || 'available',
        image: image || '',
        gstRate: gstRate || 5,
        modifiers: modifiers || [],
        recipe: recipe || [],
      });
    }
    res.json({ menuItem: item.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

export async function deleteMenuItem(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id } = req.params;
    await MenuItem.deleteOne({ _id: id, businessId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Orders
 */
export async function getOrders(req, res, next) {
  try {
    const businessId = req.businessId;
    const { status, kitchenStatus, orderType, date } = req.query;

    const filter = { businessId };
    if (status) filter.orderStatus = status;
    if (kitchenStatus) filter.kitchenStatus = kitchenStatus;
    if (orderType) filter.orderType = orderType;

    if (date === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: todayStart };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders: orders.map((o) => o.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Order (POS / Admin)
 */
export async function createOrder(req, res, next) {
  try {
    const businessId = req.businessId;
    const {
      orderType,
      tableId,
      customerId,
      customerName,
      phone,
      deliveryAddress,
      items,
      discountAmount,
      discountCode,
      serviceChargeAmount,
      tipAmount,
      notes,
      serverName,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    // Next order #
    const count = await Order.countDocuments({ businessId });
    const orderNumber = `#${1001 + count}`;

    let tableName = '';
    if (tableId) {
      const tbl = await Table.findById(tableId);
      if (tbl) tableName = tbl.name;
    }

    // Calculate subtotal & tax
    let subtotal = 0;
    let totalTax = 0;

    const formattedItems = items.map((it) => {
      const itemPrice = Number(it.price || 0);
      const modTotal = (it.modifiers || []).reduce((s, m) => s + Number(m.price || 0), 0);
      const unitTotal = itemPrice + modTotal;
      const itemSubtotal = unitTotal * Number(it.quantity || 1);
      subtotal += itemSubtotal;

      const gst = Number(it.gstRate || 5);
      totalTax += (itemSubtotal * gst) / 100;

      return {
        menuItemId: it.menuItemId || null,
        name: it.name,
        price: unitTotal,
        quantity: Number(it.quantity || 1),
        foodType: it.foodType || 'veg',
        kitchenStation: it.kitchenStation || 'Kitchen',
        modifiers: it.modifiers || [],
        notes: it.notes || '',
        kitchenStatus: 'pending',
      };
    });

    const disc = Number(discountAmount || 0);
    const svc = Number(serviceChargeAmount || 0);
    const tip = Number(tipAmount || 0);
    const grandTotal = Math.round(subtotal - disc + totalTax + svc + tip);

    const order = await Order.create({
      businessId,
      orderNumber,
      orderType: orderType || 'dine_in',
      tableId: tableId || null,
      tableName,
      customerId: customerId || null,
      customerName: customerName || 'Walk-in Guest',
      phone: phone || '',
      deliveryAddress: deliveryAddress || '',
      items: formattedItems,
      kitchenStatus: 'new',
      orderStatus: 'active',
      paymentStatus: 'unpaid',
      subtotal,
      discountAmount: disc,
      discountCode: discountCode || '',
      taxAmount: totalTax,
      serviceChargeAmount: svc,
      tipAmount: tip,
      grandTotal,
      paidAmount: 0,
      serverName: serverName || 'Staff',
      notes: notes || '',
    });

    // Update table status if dine-in
    if (tableId) {
      await Table.updateOne(
        { _id: tableId },
        {
          status: 'occupied',
          currentOrderId: order._id,
          timeSeated: new Date(),
        }
      );
    }

    // Customer update/creation
    if (phone && customerName) {
      let cust = await Customer.findOne({ businessId, phone });
      if (!cust) {
        await Customer.create({
          businessId,
          name: customerName,
          phone,
          category: 'Regular',
        });
      }
    }

    res.json({ order: order.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Kitchen Status
 */
export async function updateKitchenStatus(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id } = req.params;
    const { kitchenStatus, itemId, itemKitchenStatus } = req.body;

    const order = await Order.findOne({ _id: id, businessId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (itemId && itemKitchenStatus) {
      const item = order.items.id(itemId);
      if (item) item.kitchenStatus = itemKitchenStatus;
    }

    if (kitchenStatus) {
      order.kitchenStatus = kitchenStatus;
      // sync item status if overall status changed
      if (kitchenStatus === 'preparing' || kitchenStatus === 'ready' || kitchenStatus === 'served') {
        order.items.forEach((it) => {
          if (it.kitchenStatus !== 'cancelled') it.kitchenStatus = kitchenStatus;
        });
      }
    }

    // Update Table status if order ready
    if (kitchenStatus === 'ready' && order.tableId) {
      await Table.updateOne({ _id: order.tableId }, { status: 'order_ready' });
    }

    await order.save();
    res.json({ order: order.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Complete Payment & Deduct Inventory Recipes
 */
export async function processOrderPayment(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id } = req.params;
    const { paidAmount, paymentMethod, discountAmount, serviceChargeAmount, tipAmount } = req.body;

    const order = await Order.findOne({ _id: id, businessId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'This bill has already been paid.' });
    }

    const recPaid = Number(paidAmount !== undefined ? paidAmount : order.grandTotal);
    order.paidAmount = recPaid;
    order.paymentMethod = paymentMethod || 'UPI';

    if (discountAmount !== undefined) order.discountAmount = Number(discountAmount);
    if (serviceChargeAmount !== undefined) order.serviceChargeAmount = Number(serviceChargeAmount);
    if (tipAmount !== undefined) order.tipAmount = Number(tipAmount);

    order.grandTotal = Math.round(order.subtotal - order.discountAmount + order.taxAmount + order.serviceChargeAmount + order.tipAmount);

    if (order.paidAmount >= order.grandTotal) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'completed';
      order.kitchenStatus = 'completed';
    } else if (order.paidAmount > 0) {
      order.paymentStatus = 'partially_paid';
    }

    // Free table if paid
    if (order.paymentStatus === 'paid' && order.tableId) {
      await Table.updateOne(
        { _id: order.tableId },
        {
          status: 'available',
          currentGuests: 0,
          currentOrderId: null,
          serverName: '',
          timeSeated: null,
        }
      );
    }

    // Deduct ingredient recipes if completed
    if (order.paymentStatus === 'paid') {
      for (const item of order.items) {
        if (item.menuItemId) {
          const menuItem = await MenuItem.findById(item.menuItemId);
          if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
            for (const rec of menuItem.recipe) {
              const qtyToDeduct = rec.quantity * item.quantity;
              const ing = await InventoryItem.findById(rec.ingredientId);
              if (ing) {
                ing.currentStock = Math.max(0, ing.currentStock - qtyToDeduct);
                await ing.save();

                await StockMovement.create({
                  businessId,
                  inventoryItemId: ing._id,
                  ingredientName: ing.name,
                  changeQuantity: -qtyToDeduct,
                  type: 'consumption',
                  reason: `Recipe deduction for ${order.orderNumber} (${item.name})`,
                  staffName: order.serverName || 'System',
                });
              }
            }
          }
        }
      }

      // Update customer total spent
      if (order.phone || order.customerId) {
        let cust = order.customerId
          ? await Customer.findById(order.customerId)
          : await Customer.findOne({ businessId, phone: order.phone });

        if (cust) {
          cust.totalSpent = (cust.totalSpent || 0) + order.grandTotal;
          await cust.save();
        }
      }
    }

    await order.save();
    res.json({ order: order.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Public Online Order Endpoint (at /order)
 */
export async function publicCreateOrder(req, res, next) {
  try {
    const { businessId, orderType, tableNumber, customerName, phone, deliveryAddress, items, paymentMethod } = req.body;

    let targetBizId = businessId;
    if (!targetBizId) {
      const defaultBiz = await Business.findOne({ businessType: 'restaurant' });
      if (defaultBiz) targetBizId = defaultBiz._id;
    }

    if (!targetBizId) return res.status(400).json({ error: 'Restaurant workspace not found.' });

    if (!customerName || !phone || !items || !items.length) {
      return res.status(400).json({ error: 'Please provide customer name, phone, and at least one item.' });
    }

    let tableId = null;
    let tableName = '';
    if (tableNumber) {
      const tbl = await Table.findOne({ businessId: targetBizId, tableNumber: Number(tableNumber) });
      if (tbl) {
        tableId = tbl._id;
        tableName = tbl.name;
      }
    }

    const count = await Order.countDocuments({ businessId: targetBizId });
    const orderNumber = `#${1001 + count}`;

    let subtotal = 0;
    let totalTax = 0;

    const formattedItems = items.map((it) => {
      const price = Number(it.price || 0);
      const qty = Number(it.quantity || 1);
      const lineSub = price * qty;
      subtotal += lineSub;
      totalTax += lineSub * 0.05;

      return {
        menuItemId: it.id || it.menuItemId || null,
        name: it.name,
        price,
        quantity: qty,
        foodType: it.foodType || 'veg',
        kitchenStation: it.kitchenStation || 'Kitchen',
        modifiers: it.modifiers || [],
        notes: it.notes || '',
        kitchenStatus: 'pending',
      };
    });

    const grandTotal = Math.round(subtotal + totalTax);

    const order = await Order.create({
      businessId: targetBizId,
      orderNumber,
      orderType: orderType || (tableNumber ? 'qr' : 'takeaway'),
      tableId,
      tableName,
      customerName,
      phone,
      deliveryAddress: deliveryAddress || '',
      items: formattedItems,
      kitchenStatus: 'new',
      orderStatus: 'active',
      paymentStatus: 'unpaid',
      subtotal,
      taxAmount: totalTax,
      grandTotal,
      paymentMethod: paymentMethod || 'Online QR',
      serverName: 'Online Order',
    });

    if (tableId) {
      await Table.updateOne({ _id: tableId }, { status: 'occupied', currentOrderId: order._id });
    }

    res.json({ success: true, order: order.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Inventory & Waste Endpoints
 */
export async function getInventory(req, res, next) {
  try {
    const businessId = req.businessId;
    const items = await InventoryItem.find({ businessId }).sort({ name: 1 });
    const movements = await StockMovement.find({ businessId }).sort({ createdAt: -1 }).limit(50);
    const suppliers = await Supplier.find({ businessId }).sort({ name: 1 });

    res.json({
      inventory: items.map((i) => i.toPublicJSON()),
      movements: movements.map((m) => m.toPublicJSON()),
      suppliers: suppliers.map((s) => s.toPublicJSON()),
    });
  } catch (err) {
    next(err);
  }
}

export async function createOrUpdateInventoryItem(req, res, next) {
  try {
    const businessId = req.businessId;
    const { id, name, category, unit, currentStock, minimumStock, costPerUnit, supplierName } = req.body;

    let item;
    if (id) {
      item = await InventoryItem.findOne({ _id: id, businessId });
      if (!item) return res.status(404).json({ error: 'Inventory item not found' });
      if (name) item.name = name;
      if (category) item.category = category;
      if (unit) item.unit = unit;
      if (currentStock !== undefined) item.currentStock = currentStock;
      if (minimumStock !== undefined) item.minimumStock = minimumStock;
      if (costPerUnit !== undefined) item.costPerUnit = costPerUnit;
      if (supplierName !== undefined) item.supplierName = supplierName;
      await item.save();
    } else {
      item = await InventoryItem.create({
        businessId,
        name,
        category: category || 'General',
        unit: unit || 'kg',
        currentStock: currentStock || 0,
        minimumStock: minimumStock || 10,
        costPerUnit: costPerUnit || 0,
        supplierName: supplierName || '',
      });
    }
    res.json({ inventoryItem: item.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

export async function recordWaste(req, res, next) {
  try {
    const businessId = req.businessId;
    const { inventoryItemId, quantity, reason, staffName } = req.body;

    const item = await InventoryItem.findOne({ _id: inventoryItemId, businessId });
    if (!item) return res.status(404).json({ error: 'Ingredient not found' });

    const qty = Number(quantity);
    item.currentStock = Math.max(0, item.currentStock - qty);
    await item.save();

    const movement = await StockMovement.create({
      businessId,
      inventoryItemId: item._id,
      ingredientName: item.name,
      changeQuantity: -qty,
      type: 'waste',
      reason: reason || 'Spoilage',
      staffName: staffName || 'Staff',
    });

    res.json({ item: item.toPublicJSON(), movement: movement.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Offers & Discounts
 */
export async function getOffers(req, res, next) {
  try {
    const businessId = req.businessId;
    const offers = await Offer.find({ businessId }).sort({ code: 1 });
    res.json({ offers: offers.map((o) => o.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
}

export async function validateOffer(req, res, next) {
  try {
    const businessId = req.businessId;
    const { code, subtotal } = req.body;

    const offer = await Offer.findOne({ businessId, code: String(code).toUpperCase(), isActive: true });
    if (!offer) return res.status(404).json({ error: 'Invalid coupon code.' });

    const sub = Number(subtotal || 0);
    if (offer.minOrderAmount && sub < offer.minOrderAmount) {
      return res.status(400).json({ error: `Minimum order amount for this coupon is ₹${offer.minOrderAmount}.` });
    }

    let discount = 0;
    if (offer.type === 'percentage') {
      discount = (sub * offer.value) / 100;
      if (offer.maxDiscount && discount > offer.maxDiscount) discount = offer.maxDiscount;
    } else {
      discount = offer.value;
    }

    res.json({ valid: true, discountAmount: Math.round(discount), offer: offer.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/**
 * Real-Time Computed Restaurant Dashboard KPIs
 */
export async function getDashboardMetrics(req, res, next) {
  try {
    const businessId = req.businessId;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayStart);

    // Today's paid orders & revenue
    const todayOrders = await Order.find({
      businessId,
      createdAt: { $gte: todayStart },
      orderStatus: { $ne: 'cancelled' },
    });

    const todayPaidOrders = todayOrders.filter((o) => o.paymentStatus === 'paid');
    const todayRevenue = todayPaidOrders.reduce((s, o) => s + o.grandTotal, 0);

    // Yesterday's paid orders & revenue
    const yesterdayPaidOrders = await Order.find({
      businessId,
      createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
      paymentStatus: 'paid',
      orderStatus: { $ne: 'cancelled' },
    });
    const yesterdayRevenue = yesterdayPaidOrders.reduce((s, o) => s + o.grandTotal, 0);

    // Table occupancy
    const totalTables = await Table.countDocuments({ businessId });
    const occupiedTables = await Table.countDocuments({ businessId, status: 'occupied' });

    // Average Order Value
    const avgOrderValue = todayPaidOrders.length > 0 ? Math.round(todayRevenue / todayPaidOrders.length) : 0;

    // Kitchen pending orders
    const pendingKitchenOrders = await Order.countDocuments({
      businessId,
      orderStatus: 'active',
      kitchenStatus: { $in: ['new', 'preparing', 'ready'] },
    });

    // Reservations today
    const dateStr = todayStart.toISOString().split('T')[0];
    const reservationsToday = await Reservation.countDocuments({
      businessId,
      date: dateStr,
      status: { $ne: 'cancelled' },
    });

    const walkInsToday = await Reservation.countDocuments({
      businessId,
      date: dateStr,
      bookingSource: 'Walk-in',
    });

    const cancelledToday = await Order.countDocuments({
      businessId,
      createdAt: { $gte: todayStart },
      orderStatus: 'cancelled',
    });

    // Top Selling Items calculated from order items
    const allCompletedOrders = await Order.find({ businessId, paymentStatus: 'paid' });
    const itemMap = {};
    const categoryMap = {};

    allCompletedOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        itemMap[it.name] = (itemMap[it.name] || 0) + it.quantity;
      });
    });

    const topItems = Object.entries(itemMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Low stock count
    const inventoryItems = await InventoryItem.find({ businessId });
    const lowStockCount = inventoryItems.filter((i) => i.currentStock <= i.minimumStock).length;

    res.json({
      metrics: {
        todayRevenue,
        yesterdayRevenue,
        revenueChangePercent:
          yesterdayRevenue > 0
            ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1)
            : 'N/A',
        todayOrdersCount: todayOrders.length,
        occupiedTables,
        totalTables,
        avgOrderValue,
        pendingKitchenOrders,
        reservationsToday,
        walkInsToday,
        cancelledToday,
        lowStockCount,
        topItems,
      },
    });
  } catch (err) {
    next(err);
  }
}
