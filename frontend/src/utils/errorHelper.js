export const extractErrorMessage = (err, fallback = "An error occurred.") => {
  if (!err) return fallback;

  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data.message && typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
    if (data.error && typeof data.error === "string" && data.error.trim()) {
      return data.error.trim();
    }
    if (typeof data === "object") {
      try {
        return JSON.stringify(data);
      } catch {
        // ignore
      }
    }
  }

  if (err?.message && typeof err.message === "string") {
    return err.message;
  }

  return fallback;
};
