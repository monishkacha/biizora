import { Product } from '../models/Product.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ businessId: req.businessId }).sort({ createdAt: -1 });
  res.json({ products: products.map((p) => p.toPublicJSON()) });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ businessId: req.businessId, ...req.body });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'product.created',
    entityType: 'Product',
    entityId: product._id,
    details: `Created product ${product.name}`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, product: product.toPublicJSON() });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  Object.assign(product, req.body);
  await product.save();

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'product.updated',
    entityType: 'Product',
    entityId: product._id,
    details: `Updated product ${product.name}`,
    ip: req.ip,
  });

  res.json({ success: true, product: product.toPublicJSON() });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'product.deleted',
    entityType: 'Product',
    entityId: product._id,
    details: `Deleted product ${product.name}`,
    ip: req.ip,
  });

  res.json({ success: true });
});
