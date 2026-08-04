import apiClient from "../client";

export const subcategoryService = {
  /**
   * Get subcategories belonging to a parent category
   * @param {number|string} categoryId - Category ID
   * @returns {Promise} Axios response promise
   */
  getSubcategoriesByCategory: async (categoryId) => {
    return apiClient.get(`subcategories/${categoryId}`);
  },

  /**
   * Get all active subcategories
   * @returns {Promise} Axios response promise
   */
  getActiveSubcategories: async () => {
    return apiClient.get("subcategories/active");
  },

  /**
   * Get subcategory details by ID
   * @param {number|string} id - Subcategory ID
   * @returns {Promise} Axios response promise
   */
  getSubcategoryById: async (id) => {
    return apiClient.get(`subcategories/${id}`);
  },

  /**
   * Create a new subcategory
   * @param {Object} subcategoryData - Subcategory payload
   * @returns {Promise} Axios response promise
   */
  createSubcategory: async (subcategoryData) => {
    return apiClient.post("subcategories", subcategoryData);
  },

  /**
   * Update an existing subcategory
   * @param {Object} subcategoryData - Subcategory payload (must include id)
   * @returns {Promise} Axios response promise
   */
  updateSubcategory: async (subcategoryData) => {
    return apiClient.put("subcategories", subcategoryData);
  },

  /**
   * Delete a subcategory by ID
   * @param {number|string} id - Subcategory ID
   * @returns {Promise} Axios response promise
   */
  deleteSubcategory: async (id) => {
    return apiClient.delete(`subcategories/${id}`);
  },

  /**
   * Upload / Update subcategory image
   * @param {number|string} id - Subcategory ID
   * @param {File} file - Image file to upload
   * @returns {Promise} Axios response promise
   */
  uploadSubcategoryImage: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`subcategories/image/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default subcategoryService;
