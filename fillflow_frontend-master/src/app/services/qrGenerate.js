import { qrAxiosInstance } from "../utils/assets";

import { BASE_URL } from "../utils/assets";

export const QrCodeServices = {
  generateQr: async (data) => {
    try {
      const token = localStorage.getItem("x-access-token");
      if (token) {
        qrAxiosInstance.defaults.headers.common["x-access-token"] = token;
        const response = await qrAxiosInstance.post(
          `${BASE_URL}/generateQr`,
          data
        );
        return response.data;
      } else {
        throw new Error("Token not available");
      }
    } catch (error) {
      throw { message: error.response.data };
    }
  },
};
