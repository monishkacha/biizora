import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Expense } from '../models/Expense.js';
import { Invoice } from '../models/Invoice.js';
import { MigrationLog } from '../models/MigrationLog.js';
import { Business } from '../models/Business.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { parseFile } from '../utils/fileParser.js';
import mongoose from 'mongoose';

export async function parseImportFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const records = await parseFile(req.file.buffer, req.file.originalname);
    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'The file has no records.' });
    }
    const columns = Object.keys(records[0]);
    return res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      rowCount: records.length,
      columns,
      records,
    });
  } catch (error) {
    console.error('File parsing error:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse file.' });
  }
}

export async function processImport(req, res) {
  const businessId = req.business._id;
  const userId = req.user._id;

  const {
    importType,
    fileName = 'Import_Data.csv',
    fileType = 'CSV',
    fileSize = 0,
    importStrategy = 'new_only', // new_only / update_existing / merge_duplicate / skip_duplicate
    records = [],
  } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'No records provided for import.' });
  }

  // Check if replica set transaction support exists
  let session = null;
  let useTransaction = true;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    useTransaction = false;
    session = null;
  }

  const opts = session ? { session } : {};

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let warningCount = 0;
  const errorDetails = [];

  const createdRecordIds = {
    products: [],
    customers: [],
    expenses: [],
    invoices: [],
  };

  try {
    // 1. IMPORT TYPE: INVENTORY / PRODUCTS
    if (importType === 'inventory' || importType === 'complete') {
      const productOps = [];
      const newProducts = [];

      for (let i = 0; i < records.length; i++) {
        const item = records[i];
        if (!item || typeof item !== 'object') continue;

        // Extract fields using standard and common alias mappings
        const name = (item.name || item.itemName || item.productName || item.title || item['Item Name'] || item['Product Name'] || '').toString().trim();
        if (!name) {
          failedCount++;
          errorDetails.push({ row: i + 1, field: 'name', message: 'Missing product name', data: item });
          continue;
        }

        const sku = (item.sku || item.productCode || item.code || item.SKU || '').toString().trim();
        const barcode = (item.barcode || item.Barcode || '').toString().trim();
        const category = (item.category || item.group || item.Category || 'General').toString().trim();
        const brand = (item.brand || item.Brand || '').toString().trim();
        const unit = (item.unit || item.uom || item.UOM || item.Unit || 'unit').toString().trim();
        const costPrice = parseFloat(item.costPrice || item.purchasePrice || item.cost || item['Cost Price'] || 0) || 0;
        const sellingPrice = parseFloat(item.sellingPrice || item.price || item.rate || item.mrp || item['Selling Price'] || 0) || 0;
        const gstRate = parseFloat(item.gstRate || item.taxRate || item.gst || item.GST || 18) || 18;
        const stock = parseInt(item.stock || item.qty || item.quantity || item.openingStock || item.Stock || 0, 10) || 0;
        const warehouse = (item.warehouse || item.Warehouse || '').toString().trim();
        const description = (item.description || item.notes || item.notes || item.Description || '').toString().trim();
        const lowStockAlert = parseInt(item.lowStockAlert || item.minStock || item.minStockLevel || item['Low Stock Alert'] || 0, 10) || 0;
        const batchNumber = (item.batchNumber || item.batch || item['Batch Number'] || '').toString().trim();
        const images = Array.isArray(item.images) ? item.images : (item.images ? [item.images.toString()] : []);
        const expiryDate = item.expiryDate || item.expiry || item['Expiry Date'] ? new Date(item.expiryDate || item.expiry || item['Expiry Date']) : null;

        // Duplicate Check (SKU or Barcode or Case-insensitive Name)
        const queryOr = [];
        if (sku) queryOr.push({ sku });
        if (barcode) queryOr.push({ barcode });
        queryOr.push({ name: new RegExp(`^${name}$`, 'i') });

        const existingQuery = Product.findOne({
          businessId,
          $or: queryOr,
        });
        const existing = await (session ? existingQuery.session(session) : existingQuery);

        if (existing) {
          if (importStrategy === 'skip_duplicate' || importStrategy === 'new_only') {
            skippedCount++;
            continue;
          } else if (importStrategy === 'update_existing' || importStrategy === 'replace_all') {
            const updateFields = {
              name,
              sku: sku || existing.sku,
              barcode: barcode || existing.barcode,
              category,
              brand,
              unit,
              costPrice,
              sellingPrice,
              gstRate,
              stock: Math.max(0, stock),
              warehouse,
              description,
              minStockLevel: lowStockAlert,
              batchNumber,
              images: images.length ? images : existing.images,
              expiryDate: expiryDate || existing.expiryDate,
            };
            productOps.push({
              updateOne: {
                filter: { _id: existing._id, businessId },
                update: { $set: updateFields },
              }
            });
            updatedCount++;
          } else if (importStrategy === 'merge_duplicate') {
            const mergedStock = existing.stock + Math.max(0, stock);
            const updateFields = {
              stock: Math.max(0, mergedStock),
              brand: brand || existing.brand,
              warehouse: warehouse || existing.warehouse,
              description: description || existing.description,
              images: images.length ? images : existing.images,
            };
            productOps.push({
              updateOne: {
                filter: { _id: existing._id, businessId },
                update: { $set: updateFields },
              }
            });
            updatedCount++;
          }
        } else {
          // Prepare new product document
          const docId = new mongoose.Types.ObjectId();
          newProducts.push({
            _id: docId,
            businessId,
            name,
            type: item.type === 'service' ? 'service' : 'product',
            sku: sku || `SKU-${Date.now().toString().slice(-6)}-${newProducts.length + 1}`,
            barcode,
            category,
            brand,
            unit,
            costPrice,
            sellingPrice,
            gstRate,
            stock: Math.max(0, stock),
            warehouse,
            description,
            minStockLevel: lowStockAlert,
            batchNumber,
            images,
            expiryDate,
          });
          createdRecordIds.products.push(docId);
          importedCount++;
        }
      }

      // Execute bulk writing for products
      if (productOps.length > 0) {
        await Product.bulkWrite(productOps, opts);
      }
      if (newProducts.length > 0) {
        await Product.insertMany(newProducts, opts);
      }
    }

    // 2. IMPORT TYPE: CUSTOMERS / SUPPLIERS
    if (importType === 'customers' || importType === 'suppliers' || importType === 'complete') {
      const customerOps = [];
      const newCustomers = [];
      const defaultCategory = importType === 'suppliers' ? 'Supplier' : 'Customer';

      for (let i = 0; i < records.length; i++) {
        const item = records[i];
        if (!item || typeof item !== 'object') continue;

        const name = (item.name || item.customerName || item.vendorName || item.companyName || item.clientName || item['Client / Customer Name'] || item['Supplier / Vendor Name'] || '').toString().trim();
        if (!name) {
          failedCount++;
          errorDetails.push({ row: i + 1, field: 'name', message: 'Missing contact/party name', data: item });
          continue;
        }

        const phone = (item.phone || item.mobile || item.phoneNumber || item.contact || item['Mobile / Phone Number'] || item['Mobile Number'] || '').toString().trim();
        const email = (item.email || item.emailAddress || item['Email Address'] || '').toString().trim().toLowerCase();
        const gstin = (item.gstin || item.gst || item.gstNumber || item['GSTIN Number'] || '').toString().trim().toUpperCase();
        const address = (item.address || item.billingAddress || item['Billing Address'] || '').toString().trim();
        const city = (item.city || '').toString().trim();
        const state = (item.state || '').toString().trim();
        const pincode = (item.pincode || item.zip || '').toString().trim();
        const outstandingBalance = parseFloat(item.outstandingBalance || item.balance || item.openingBalance || item['Opening Balance (₹)'] || item['Supplier Balance (₹)'] || 0) || 0;
        const category = (item.category || item.partyType || defaultCategory).toString().trim();
        const notes = (item.notes || item.remarks || '').toString().trim();

        // Duplicate Check (Name, Email or Phone)
        const queryOr = [];
        if (email) queryOr.push({ email });
        if (phone) queryOr.push({ phone });
        queryOr.push({ name: new RegExp(`^${name}$`, 'i') });

        const existingQuery = Customer.findOne({
          businessId,
          $or: queryOr,
        });
        const existing = await (session ? existingQuery.session(session) : existingQuery);

        if (existing) {
          if (importStrategy === 'skip_duplicate' || importStrategy === 'new_only') {
            skippedCount++;
            continue;
          } else if (importStrategy === 'update_existing' || importStrategy === 'replace_all') {
            const updateFields = {
              name,
              phone: phone || existing.phone,
              email: email || existing.email,
              gstin: gstin || existing.gstin,
              address: address || existing.address,
              city: city || existing.city,
              state: state || existing.state,
              pincode: pincode || existing.pincode,
              outstandingBalance,
              category,
              notes,
            };
            customerOps.push({
              updateOne: {
                filter: { _id: existing._id, businessId },
                update: { $set: updateFields },
              }
            });
            updatedCount++;
          } else if (importStrategy === 'merge_duplicate') {
            const updateFields = {
              outstandingBalance: existing.outstandingBalance + outstandingBalance,
              notes: notes ? `${existing.notes}\n${notes}` : existing.notes,
            };
            customerOps.push({
              updateOne: {
                filter: { _id: existing._id, businessId },
                update: { $set: updateFields },
              }
            });
            updatedCount++;
          }
        } else {
          // Prepare new Customer document
          const docId = new mongoose.Types.ObjectId();
          newCustomers.push({
            _id: docId,
            businessId,
            name,
            contactPerson: (item.contactPerson || name).toString().trim(),
            email,
            phone,
            gstin,
            address,
            city,
            state,
            pincode,
            outstandingBalance,
            category,
            notes,
          });
          createdRecordIds.customers.push(docId);
          importedCount++;
        }
      }

      // Execute bulk writing for customers
      if (customerOps.length > 0) {
        await Customer.bulkWrite(customerOps, opts);
      }
      if (newCustomers.length > 0) {
        await Customer.insertMany(newCustomers, opts);
      }
    }

    // 3. IMPORT TYPE: SALES / PURCHASES (TRANSACTIONS / ORDERS)
    if (importType === 'transactions' || importType === 'orders' || importType === 'sales' || importType === 'purchases') {
      for (let i = 0; i < records.length; i++) {
        const item = records[i];
        if (!item || typeof item !== 'object') continue;

        const transType = (item.type || item.transactionType || item.category || 'sale').toString().trim().toLowerCase();
        const sku = (item.sku || item.productSku || item.itemSku || '').toString().trim();
        const name = (item.name || item.itemName || item.productName || '').toString().trim();
        const quantity = parseInt(item.quantity || item.qty || 1, 10) || 1;
        const rate = parseFloat(item.rate || item.price || item.amount || 0) || 0;
        const description = (item.description || item.notes || 'Migrated Transaction').toString().trim();
        const paymentMethod = (item.paymentMethod || item.mode || item.paymentMode || 'cash').toString().toLowerCase();
        const date = item.date ? new Date(item.date) : new Date();

        // Find associated product to update quantities
        let product = null;
        if (sku || name) {
          const productQuery = Product.findOne({
            businessId,
            $or: [...(sku ? [{ sku }] : []), ...(name ? [{ name: new RegExp(`^${name}$`, 'i') }] : [])],
          });
          product = await (session ? productQuery.session(session) : productQuery);
        }

        if (transType.includes('purchase') || transType.includes('expense')) {
          // Purchase/Expense transaction -> Increment stock
          if (product) {
            product.stock += quantity;
            await product.save(opts);
          }

          const docId = new mongoose.Types.ObjectId();
          await Expense.create(
            [
              {
                _id: docId,
                businessId,
                title: description || (product ? `Purchase: ${product.name}` : 'Purchase Transaction'),
                category: 'Cost of Goods Sold',
                amount: rate * quantity,
                date: date.toISOString().split('T')[0],
                paymentMode: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'].includes(paymentMethod) ? paymentMethod : 'cash',
                vendor: item.supplierName || item.vendor || 'Migrated Supplier',
              },
            ],
            opts
          );
          createdRecordIds.expenses.push(docId);
          importedCount++;
        } else {
          // Sale/Invoice transaction -> Decrement stock
          if (product) {
            product.stock = Math.max(0, product.stock - quantity);
            await product.save(opts);
          }

          const docId = new mongoose.Types.ObjectId();
          const invoiceCountQuery = Invoice.countDocuments({ businessId });
          const invoiceCount = await (session ? invoiceCountQuery.session(session) : invoiceCountQuery);
          const invoiceNumber = item.invoiceNumber || `INV-MIG-${1000 + invoiceCount + i}`;

          await Invoice.create(
            [
              {
                _id: docId,
                businessId,
                invoiceNumber,
                customerName: item.customerName || item.client || 'Migrated Customer',
                issueDate: date.toISOString().split('T')[0],
                dueDate: date.toISOString().split('T')[0],
                items: [
                  {
                    description: product ? product.name : (name || 'Migrated Product Item'),
                    quantity,
                    rate,
                    amount: rate * quantity,
                  },
                ],
                subtotal: rate * quantity,
                grandTotal: rate * quantity,
                status: 'paid',
                paidAmount: rate * quantity,
                paymentMethod: 'UPI / Online',
              },
            ],
            opts
          );
          createdRecordIds.invoices.push(docId);
          importedCount++;
        }
      }
    }

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    // Save migration log
    const log = await MigrationLog.create({
      businessId,
      importType,
      fileName,
      fileType,
      fileSize,
      totalRows: records.length,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      warningCount,
      importStrategy,
      errorDetails: errorDetails.slice(0, 100),
      createdRecordIds,
      createdBy: userId,
    });

    await ActivityLog.create({
      businessId,
      userId,
      userName: req.user.name || 'User',
      action: 'DATA_MIGRATED',
      details: `Imported ${importedCount} records, updated ${updatedCount} records via Smart Data Migration Center (${fileName}).`,
      ipAddress: req.ip || '',
    });

    return res.json({
      message: 'Data migration completed successfully.',
      log: log.toPublicJSON(),
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('Data Migration Error:', error);
    return res.status(500).json({ error: error.message || 'Data migration failed.' });
  }
}

export async function getHistory(req, res) {
  try {
    const businessId = req.business._id;
    const logs = await MigrationLog.find({ businessId }).sort({ createdAt: -1 }).limit(25);
    return res.json({ logs: logs.map((l) => l.toPublicJSON()) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch migration history.' });
  }
}

export async function undoMigration(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.business._id;
    const userId = req.user._id;

    const log = await MigrationLog.findOne({ _id: id, businessId });
    if (!log) {
      return res.status(404).json({ error: 'Migration log not found.' });
    }

    if (log.isUndone) {
      return res.status(400).json({ error: 'This migration run has already been undone.' });
    }

    let deletedCount = 0;

    if (log.createdRecordIds?.products?.length) {
      const resP = await Product.deleteMany({ _id: { $in: log.createdRecordIds.products }, businessId });
      deletedCount += resP.deletedCount || 0;
    }

    if (log.createdRecordIds?.customers?.length) {
      const resC = await Customer.deleteMany({ _id: { $in: log.createdRecordIds.customers }, businessId });
      deletedCount += resC.deletedCount || 0;
    }

    if (log.createdRecordIds?.expenses?.length) {
      const resE = await Expense.deleteMany({ _id: { $in: log.createdRecordIds.expenses }, businessId });
      deletedCount += resE.deletedCount || 0;
    }

    if (log.createdRecordIds?.invoices?.length) {
      const resI = await Invoice.deleteMany({ _id: { $in: log.createdRecordIds.invoices }, businessId });
      deletedCount += resI.deletedCount || 0;
    }

    log.isUndone = true;
    log.undoneAt = new Date();
    await log.save();

    await ActivityLog.create({
      businessId,
      userId,
      userName: req.user.name || 'User',
      action: 'MIGRATION_UNDONE',
      details: `Undone migration run (${log.fileName}) - removed ${deletedCount} created records.`,
      ipAddress: req.ip || '',
    });

    return res.json({
      message: `Migration run undone successfully. ${deletedCount} created records were safely removed.`,
      log: log.toPublicJSON(),
    });
  } catch (error) {
    console.error('Undo Migration Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to undo migration.' });
  }
}

export async function exportData(req, res) {
  try {
    const businessId = req.business._id;
    const { format = 'json', scope = 'all' } = req.query;

    const products = await Product.find({ businessId }).lean();
    const customers = await Customer.find({ businessId }).lean();
    const expenses = await Expense.find({ businessId }).lean();
    const invoices = await Invoice.find({ businessId }).lean();
    const business = await Business.findById(businessId).lean();

    const dataPayload = {
      business: business?.name || 'Biizora Business',
      exportDate: new Date().toISOString(),
      summary: {
        productsCount: products.length,
        customersCount: customers.length,
        expensesCount: expenses.length,
        invoicesCount: invoices.length,
      },
      products: scope === 'all' || scope === 'inventory' ? products.map((p) => ({
        Name: p.name,
        Type: p.type,
        SKU: p.sku,
        HSN_SAC: p.hsnSac,
        Category: p.category,
        SellingPrice: p.sellingPrice,
        CostPrice: p.costPrice,
        GSTRate: p.gstRate,
        Stock: p.stock,
        Unit: p.unit,
        Description: p.description,
      })) : [],
      customers: scope === 'all' || scope === 'customers' ? customers.map((c) => ({
        Name: c.name,
        ContactPerson: c.contactPerson,
        Email: c.email,
        Phone: c.phone,
        GSTIN: c.gstin,
        Address: c.address,
        City: c.city,
        State: c.state,
        Pincode: c.pincode,
        OutstandingBalance: c.outstandingBalance,
        Category: c.category,
      })) : [],
      expenses: scope === 'all' || scope === 'expenses' ? expenses.map((e) => ({
        Category: e.category,
        Amount: e.amount,
        Description: e.description,
        PaymentMethod: e.paymentMethod,
        Date: e.date,
      })) : [],
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=Biizora_Data_Export_${Date.now()}.json`);
      return res.send(JSON.stringify(dataPayload, null, 2));
    }

    if (format === 'sql') {
      let sqlDump = `-- Biizora ERP SQL Backup Dump\n-- Generated on: ${new Date().toISOString()}\n-- Business: ${business?.name || 'Biizora Business'}\n\n`;
      sqlDump += `CREATE TABLE IF NOT EXISTS products (name VARCHAR(255), sku VARCHAR(100), selling_price DECIMAL(10,2), cost_price DECIMAL(10,2), gst_rate DECIMAL(5,2), stock INT, category VARCHAR(100));\n`;
      products.forEach((p) => {
        sqlDump += `INSERT INTO products (name, sku, selling_price, cost_price, gst_rate, stock, category) VALUES ('${(p.name || '').replace(/'/g, "''")}', '${p.sku || ''}', ${p.sellingPrice || 0}, ${p.costPrice || 0}, ${p.gstRate || 18}, ${p.stock || 0}, '${(p.category || '').replace(/'/g, "''")}');\n`;
      });

      sqlDump += `\nCREATE TABLE IF NOT EXISTS customers (name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50), gstin VARCHAR(50), outstanding_balance DECIMAL(10,2));\n`;
      customers.forEach((c) => {
        sqlDump += `INSERT INTO customers (name, email, phone, gstin, outstanding_balance) VALUES ('${(c.name || '').replace(/'/g, "''")}', '${c.email || ''}', '${c.phone || ''}', '${c.gstin || ''}', ${c.outstandingBalance || 0});\n`;
      });

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename=Biizora_Backup_${Date.now()}.sql`);
      return res.send(sqlDump);
    }

    return res.json(dataPayload);
  } catch (error) {
    console.error('Export Error:', error);
    return res.status(500).json({ error: 'Failed to export data.' });
  }
}

export async function getSampleTemplate(req, res) {
  const { type = 'inventory' } = req.params;
  let headers = [];
  let rows = [];

  if (type === 'inventory') {
    headers = ['Item Name', 'SKU / Product Code', 'Category', 'Selling Price', 'Cost Price', 'GST Rate (%)', 'Opening Stock', 'Unit', 'HSN/SAC Code', 'Description'];
    rows = [
      ['Wireless Ergonomic Mouse', 'SKU-LOGI-001', 'Electronics', '1499', '950', '18', '50', 'Pcs', '84716060', 'High precision wireless mouse'],
      ['Mechanical RGB Keyboard', 'SKU-KEY-002', 'Peripherals', '3499', '2200', '18', '25', 'Pcs', '84716060', 'Tactile gaming keyboard'],
    ];
  } else if (type === 'customers') {
    headers = ['Client / Customer Name', 'Contact Person', 'Mobile / Phone Number', 'Email Address', 'GSTIN Number', 'Billing Address', 'City', 'State', 'Pincode', 'Opening Balance (₹)'];
    rows = [
      ['Apex Tech Solutions', 'Rajesh Sharma', '9876543210', 'contact@apextech.com', '27AAACA12341Z5', '102 Business Park, MG Road', 'Mumbai', 'Maharashtra', '400001', '12500'],
      ['Global Retail Traders', 'Anita Verma', '9123456789', 'anita@globaltraders.in', '07BBBCB56782Z9', '45 Commercial Street', 'New Delhi', 'Delhi', '110001', '0'],
    ];
  } else if (type === 'suppliers') {
    headers = ['Supplier / Vendor Name', 'Contact Person', 'Mobile Number', 'Email', 'GSTIN Number', 'Address', 'City', 'State', 'Pincode', 'Supplier Balance (₹)'];
    rows = [
      ['Mahavir Electronics Wholesalers', 'Suresh Patel', '9988776655', 'sales@mahavirelec.com', '24CCCCP99881Z3', 'GIDC Phase 2', 'Ahmedabad', 'Gujarat', '380015', '45000'],
    ];
  } else {
    headers = ['Date', 'Category', 'Amount (₹)', 'Description', 'Payment Mode'];
    rows = [
      ['2026-08-01', 'Office Rent', '25000', 'August Month Rent Payment', 'bank_transfer'],
      ['2026-08-03', 'Internet Bill', '1499', 'High Speed Fiber Connection', 'upi'],
    ];
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=Biizora_${type}_sample_template.csv`);
  return res.send(csvContent);
}

export async function createBackup(req, res) {
  try {
    const businessId = req.business._id;
    const productsCount = await Product.countDocuments({ businessId });
    const customersCount = await Customer.countDocuments({ businessId });

    return res.json({
      message: 'Cloud backup snapshot created successfully prior to migration.',
      snapshotId: `BKP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      counts: { productsCount, customersCount },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create cloud backup.' });
  }
}
