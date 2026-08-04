import apiClient from "../client";

export const productService = {
  /**
   * Create a new product
   * @param {Object} productData - Product payload
   * @returns {Promise} Axios response promise
   */
  createProduct: async (productData) => {
    return apiClient.post("products", productData);
  },

  /**
   * Upload / Update product image
   * @param {number|string} id - Product ID
   * @param {File} file - Image file to upload
   * @returns {Promise} Axios response promise
   */
  uploadProductImage: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`products/image/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Get all products paginated
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products", { params });
  },

  /**
   * Get product details by ID
   * @param {number|string} id - Product ID
   * @returns {Promise} Axios response promise
   */
  getProductById: async (id) => {
    return apiClient.get(`products/${id}`);
  },

  /**
   * Get product details by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise} Axios response promise
   */
  getProductBySku: async (sku) => {
    return apiClient.get(`products/sku/${sku}`);
  },

  /**
   * Get products belonging to a Category paginated
   * @param {number|string} categoryId - Category ID
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getProductsByCategory: async (categoryId, params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get(`products/category/${categoryId}`, { params });
  },

  /**
   * Get products belonging to a Subcategory paginated
   * @param {number|string} subcategoryId - Subcategory ID
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getProductsBySubcategory: async (subcategoryId, params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get(`products/subcategory/${subcategoryId}`, { params });
  },

  /**
   * Get products belonging to a Brand paginated
   * @param {number|string} brandId - Brand ID
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getProductsByBrand: async (brandId, params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get(`products/brands/${brandId}`, { params });
  },

  /**
   * Get featured products paginated
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getFeaturedProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/featured", { params });
  },

  /**
   * Get trending products paginated
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getTrendingProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/trending", { params });
  },

  /**
   * Get discounted products paginated
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getDiscountedProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/discounted", { params });
  },

  /**
   * Get new arrivals products paginated
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getNewArrivalsProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/newarrivals", { params });
  },

  /**
   * Get ordered products paginated
   * @param {Object} params - Query params (pageNo, pageSize)
   * @returns {Promise} Axios response promise
   */
  getOrderedProducts: async (params = { pageNo: 0, pageSize: 10 }) => {
    return apiClient.get("products/ordered", { params });
  },

  /**
   * Update an existing product
   * @param {Object} productData - Product payload (must include id)
   * @returns {Promise} Axios response promise
   */
  updateProduct: async (productData) => {
    return apiClient.put("products", productData);
  },

  /**
   * Update product list order position
   * @param {number|string} id - Product ID
   * @param {number} position - Position value
   * @returns {Promise} Axios response promise
   */
  updateProductPosition: async (id, position) => {
    return apiClient.put(`products/${id}/${position}`);
  },

  /**
   * Update product active status
   * @param {number|string} id - Product ID
   * @param {boolean} isActive - Active status value (true/false)
   * @returns {Promise} Axios response promise
   */
  updateProductStatus: async (id, isActive) => {
    return apiClient.put(`products/status/${id}/${isActive}`);
  },

  /**
   * Delete a product by ID
   * @param {number|string} id - Product ID
   * @returns {Promise} Axios response promise
   */
  deleteProduct: async (id) => {
    return apiClient.delete(`products/${id}`);
  },
};

export default productService;
