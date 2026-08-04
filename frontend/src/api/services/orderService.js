import apiClient from "../client";

export const orderService = {
  /**
   * Fetch paginated list of orders
   * @param {Object} params - Query parameters
   * @param {number} [params.pageNo=0] - Page index (0-based)
   * @param {number} [params.pageSize=10] - Number of orders per page
   * @returns {Promise} Axios response promise
   */
  getOrders: async ({ pageNo = 0, pageSize = 10 } = {}) => {
    return apiClient.get("orders", {
      params: { pageNo, pageSize },
    });
  },

  /**
   * Fetch detailed information for a single order by ID
   * @param {string|number} id - Order ID
   * @returns {Promise} Axios response promise
   */
  getOrderDetail: async (id) => {
    return apiClient.get("orders/detail", {
      params: { id },
    });
  },

  /**
   * Fetch orders filtered by order type (PENDING, DELIVERED, CANCELLED)
   * @param {string} type - Order type
   * @returns {Promise} Axios response promise
   */
  getOrdersByType: async (type) => {
    return apiClient.get(`orders/type/${type}`);
  },

  /**
   * Fetch orders filtered by payment status (UNPAID, PAID)
   * @param {string} status - Payment status
   * @returns {Promise} Axios response promise
   */
  getOrdersByStatus: async (status) => {
    return apiClient.get(`orders/status/${status}`);
  },
};

export default orderService;
