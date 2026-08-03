import apiClient from "../client";

export const authService = {
  /**
   * Login as Admin
   * @param {Object} credentials - Email and password
   * @returns {Promise} Axios response promise
   */
  loginAdmin: async ({ email, password }) => {
    return apiClient.post("auth/open/admin/login", { email, password });
  },

  /**
   * Fetch System Settings / App Configuration
   * GET auth/open/settings
   * @returns {Promise} Axios response promise
   */
  getSettings: async () => {
    return apiClient.get("auth/open/settings");
  },
};

export default authService;
