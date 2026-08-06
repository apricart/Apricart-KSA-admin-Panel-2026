import apiClient from "../client";

export const productService = {
  /**
   * Create a new product
   * POST {{baseUrl}}/v1/products
   */
  createProduct: async (productData) => {
    return apiClient.post("products", productData);
  },

  /**
   * Upload / Update product image
   * POST {{baseUrl}}/v1/products/image/update/{{product_id}}
   */
  uploadProductImage: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("image", file);
    try {
      return await apiClient.post(`products/image/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch {
      return await apiClient.post(`auth/open/products/image/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  },

  /**
   * Get product image by ID
   * GET {{baseUrl}}/v1/products/image/{{product_id}}
   */
  getProductImage: async (id) => {
    return apiClient.get(`products/image/${id}`);
  },

  /**
   * Get all products paginated
   * GET {{baseUrl}}/v1/products?pageNo=0&pageSize=10
   */
  getProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products", { params });
  },

  /**
   * Get product details by ID
   * GET {{baseUrl}}/v1/products/{{product_id}}
   */
  getProductById: async (id) => {
    return apiClient.get(`products/${id}`);
  },

  /**
   * Get product details by SKU
   * GET {{baseUrl}}/v1/products/sku/{{sku}}
   */
  getProductBySku: async (sku) => {
    return apiClient.get(`products/sku/${sku}`);
  },

  /**
   * Get products belonging to a Category paginated
   * GET {{baseUrl}}/v1/products/category/{{category_id}}?pageNo=0&pageSize=10
   */
  getProductsByCategory: async (categoryId, params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get(`products/category/${categoryId}`, { params });
  },

  /**
   * Get products belonging to a Subcategory
   * GET {{baseUrl}}/v1/auth/open/products/subcategory/{{subcategory_id}}?warehouseId=1
   */
  getProductsBySubcategory: async (subcategoryId, warehouseId = 1, params = { pageNo: 0, pageSize: 10 }) => {
    try {
      return await apiClient.get(`auth/open/products/subcategory/${subcategoryId}`, {
        params: { warehouseId: warehouseId || 1, ...params },
      });
    } catch {
      return await apiClient.get(`products/subcategory/${subcategoryId}`, { params });
    }
  },

  /**
   * Get products belonging to a Brand paginated
   * GET {{baseUrl}}/v1/products/brands/{{brand_id}}?pageNo=0&pageSize=10
   */
  getProductsByBrand: async (brandId, params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get(`products/brands/${brandId}`, { params });
  },

  /**
   * Get featured products paginated
   * GET {{baseUrl}}/v1/products/featured?pageNo=0&pageSize=10
   */
  getFeaturedProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/featured", { params });
  },

  /**
   * Get trending products paginated
   * GET {{baseUrl}}/v1/products/trending?pageNo=0&pageSize=10
   */
  getTrendingProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/trending", { params });
  },

  /**
   * Get discounted products paginated
   * GET {{baseUrl}}/v1/products/discounted?pageNo=0&pageSize=10
   */
  getDiscountedProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/discounted", { params });
  },

  /**
   * Get new arrivals products paginated
   * GET {{baseUrl}}/v1/products/newarrivals?pageNo=0&pageSize=10
   */
  getNewArrivalsProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/newarrivals", { params });
  },

  /**
   * Get ordered products paginated
   * GET {{baseUrl}}/v1/products/ordered?pageNo=0&pageSize=10
   */
  getOrderedProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/ordered", { params });
  },

  /**
   * Update an existing product
   * PUT {{baseUrl}}/v1/products
   */
  updateProduct: async (productData) => {
    return apiClient.put("products", productData);
  },

  /**
   * Update product list order position
   * PUT {{baseUrl}}/v1/products/{{product_id}}/1
   */
  updateProductPosition: async (id, position = 1) => {
    return apiClient.put(`products/${id}/${position}`);
  },

  /**
   * Update product active status
   * PUT {{baseUrl}}/v1/products/status/{{product_id}}/true
   */
  updateProductStatus: async (id, isActive = true) => {
    return apiClient.put(`products/status/${id}/${isActive}`);
  },

  /**
   * Delete a product by ID
   * DELETE {{baseUrl}}/v1/products/{{product_id}}
   */
  deleteProduct: async (id) => {
    return apiClient.delete(`products/${id}`);
  },
};

export default productService;
