import apiClient from "../client";

export const categoryService = {
  /**
   * Get all categories by level (defaults to 2)
   * @param {number} [level=2] - Categories level
   * @returns {Promise} Axios response promise
   */
  getCategories: async (level = 2) => {
    return apiClient.get(`auth/open/categories/${level}`);
  },

  /**
   * Get category details by ID
   * @param {number|string} id - Category ID
   * @returns {Promise} Axios response promise
   */
  getCategoryById: async (id) => {
    return apiClient.get(`categories/${id}`);
  },

  /**
   * Get category details by Name
   * @param {string} name - Category Name
   * @returns {Promise} Axios response promise
   */
  getCategoryByName: async (name) => {
    return apiClient.get(`categories/name/${name}`);
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category payload
   * @returns {Promise} Axios response promise
   */
  createCategory: async (categoryData) => {
    return apiClient.post("categories", categoryData);
  },

  /**
   * Update an existing category
   * @param {Object} categoryData - Category payload (must include id)
   * @returns {Promise} Axios response promise
   */
  updateCategory: async (categoryData) => {
    return apiClient.put("categories", categoryData);
  },

  /**
   * Delete a category by ID
   * @param {number|string} id - Category ID
   * @returns {Promise} Axios response promise
   */
  deleteCategory: async (id) => {
    return apiClient.delete(`categories/${id}`);
  },

  /**
   * Upload / Update category image
   * @param {number|string} id - Category ID
   * @param {File} file - Image file to upload
   * @returns {Promise} Axios response promise
   */
  uploadCategoryImage: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`categories/image/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Get products by subcategory
   * @param {number|string} subcategoryId - Subcategory ID
   * @param {number} [warehouseId=1] - Warehouse ID
   * @returns {Promise} Axios response promise
   */
  getSubcategoryProducts: async (subcategoryId, warehouseId = 1) => {
    return apiClient.get(`auth/open/products/subcategory/${subcategoryId}`, {
      params: { warehouseId },
    });
  },
};

export default categoryService;
