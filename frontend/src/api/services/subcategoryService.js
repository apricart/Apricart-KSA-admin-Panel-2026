import apiClient from "../client";

export const subcategoryService = {
  /**
   * Get subcategories belonging to a parent category
   * @param {number|string} categoryId - Category ID
   * @returns {Promise} Axios response promise
   */
  getSubcategoriesByCategory: async (categoryId) => {
    try {
      return await apiClient.get(`auth/open/subcategories/${categoryId}`);
    } catch {
      try {
        return await apiClient.get(`auth/open/subcategories/category/${categoryId}`);
      } catch {
        return await apiClient.get(`subcategories/${categoryId}`);
      }
    }
  },

  /**
   * Get all active subcategories
   * @returns {Promise} Axios response promise
   */
  getActiveSubcategories: async () => {
    try {
      return await apiClient.get("auth/open/subcategories/active");
    } catch {
      return await apiClient.get("subcategories/active");
    }
  },

  /**
   * Get subcategory details by ID
   * @param {number|string} id - Subcategory ID
   * @returns {Promise} Axios response promise
   */
  getSubcategoryById: async (id) => {
    try {
      return await apiClient.get(`auth/open/subcategories/id/${id}`);
    } catch {
      return await apiClient.get(`subcategories/${id}`);
    }
  },

  /**
   * Create a new subcategory
   * @param {Object} subcategoryData - Subcategory payload
   * @returns {Promise} Axios response promise
   */
  createSubcategory: async (subcategoryData) => {
    try {
      return await apiClient.post("auth/open/subcategories", subcategoryData);
    } catch {
      return await apiClient.post("subcategories", subcategoryData);
    }
  },

  /**
   * Update an existing subcategory
   * @param {Object} subcategoryData - Subcategory payload (must include id)
   * @returns {Promise} Axios response promise
   */
  updateSubcategory: async (subcategoryData) => {
    try {
      return await apiClient.put("auth/open/subcategories", subcategoryData);
    } catch {
      return await apiClient.put("subcategories", subcategoryData);
    }
  },

  /**
   * Delete a subcategory by ID
   * @param {number|string} id - Subcategory ID
   * @returns {Promise} Axios response promise
   */
  deleteSubcategory: async (id) => {
    try {
      return await apiClient.delete(`auth/open/subcategories/${id}`);
    } catch {
      return await apiClient.delete(`subcategories/${id}`);
    }
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
    formData.append("image", file);
    try {
      return await apiClient.post(`auth/open/subcategories/image/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch {
      return await apiClient.post(`subcategories/image/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  },
};

export default subcategoryService;
