import { axiosInstance } from "../utils/assets";

import { BASE_URL } from "../utils/assets";

export const batchServices = {
  getAllBatches: async (raw_material_id) => {
    try {
      const token = localStorage.getItem("x-access-token");
      if (token) {
        axiosInstance.defaults.headers.common["x-access-token"] = token;

        const response = await axiosInstance.get(
          `${BASE_URL}/getRawMaterialPoBatchById/${raw_material_id}`
        );
        console.log(
          "response from getAllCategories service=====",
          response.data
        );
        return response.data;
      } else {
        throw new Error("Token not available");
      }
    } catch (error) {
      throw { message: error.response.data };
    }
  },
  getBatchTransformedData: async (raw_material_id) => {
    try {
      const token = localStorage.getItem("x-access-token");
      if (token) {
        axiosInstance.defaults.headers.common["x-access-token"] = token;

        const response = await axiosInstance.get(
          `${BASE_URL}/getBatchInfoByRawMatertialId/${raw_material_id}`
        );
        console.log(
          "response from getAllCategories service=====",
          response.data
        );
        return response.data;
      } else {
        throw new Error("Token not available");
      }
    } catch (error) {
      throw { message: error.response.data };
    }
  },
  
  getBatchNumberByPoId: async (po_id) => {
    try {
      const token = localStorage.getItem("x-access-token");
      if (token) {
        axiosInstance.defaults.headers.common["x-access-token"] = token;
        const response = await axiosInstance.get(
          `${BASE_URL}/getBatchNumberByPoId/${po_id}`
        );
        return response.data;
      } else {
        throw new Error("Token not available");
      }
    } catch (error) {
      throw { message: error.response.data };
    }
  }
};
