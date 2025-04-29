import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductByIdService,
  deleteProductByIdService,
} from '@/services/product';
import { ApiResponse } from '@/utils/ApiResponse';
import { runInTransaction } from '@/utils/transaction-helper';
import type { Context } from 'hono';

/**
 * GET /entities/products
 * Fetches all active (non-archived) products.
 */
export const getAllProducts = async (c: Context) => {
  const products = await getAllProductsService();
  return c.json(new ApiResponse(200, products, 'Products fetched successfully.'));
};

/**
 * GET /entities/products/:id
 * Fetch a single product by its ID.
 */
export const getProductById = async (c: Context) => {
  const { id } = c.req.param();
  const product = await getProductByIdService(id);
  if (!product) {
    return c.json(new ApiResponse(404, null, `Product with ID ${id} not found.`), 404);
  }
  return c.json(new ApiResponse(200, product, 'Product fetched successfully.'));
};

/**
 * POST /entities/products
 * Creates a new product.
 */
export const createProduct = async (c: Context) => {
  const data = await c.req.json();
  const newProduct = await runInTransaction(async (session) => {
    return createProductService(data, session);
  });
  return c.json(new ApiResponse(201, newProduct, 'Product created successfully.'), 201);
};

/**
 * PATCH /entities/products/:id
 * Updates an existing product by ID.
 */
export const updateProduct = async (c: Context) => {
  const { id } = c.req.param();
  const updateData = await c.req.json();
  const updatedProduct = await runInTransaction(async (session) => {
    return updateProductByIdService(id, updateData, session);
  });
  if (!updatedProduct) {
    return c.json(new ApiResponse(404, null, `Product with ID ${id} not found or is archived.`), 404);
  }
  return c.json(new ApiResponse(200, updatedProduct, 'Product updated successfully.'));
};

/**
 * DELETE /entities/products/:id
 * Soft-deletes a product by ID.
 */
export const deleteProduct = async (c: Context) => {
  const { id } = c.req.param();
  const deletedProduct = await runInTransaction(async (session) => {
    return deleteProductByIdService(id, session);
  });
  if (!deletedProduct) {
    return c.json(new ApiResponse(404, null, `Product with ID ${id} not found or is archived.`), 404);
  }
  return c.json(new ApiResponse(200, deletedProduct, 'Product deleted (archived) successfully.'));
};
