import { API_BASE_URL } from "../../config";
const API_URL = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const registerShop = async (data) => {
  const headers = getAuthHeaders();
  const isFormData = data instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
  }
  const response = await fetch(`${API_URL}/shops/register`, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
};

export const addSellerProduct = async (data) => {
  const headers = getAuthHeaders();
  const isFormData = data instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
  }
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
};

export const getSellerProducts = async () => {
  const response = await fetch(`${API_URL}/seller/products`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const updateSellerProduct = async (id, data) => {
  const headers = getAuthHeaders();
  const isFormData = data instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
  }
  const method = isFormData ? "POST" : "PUT";

  const response = await fetch(`${API_URL}/seller/products/${id}`, {
    method,
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
};

export const deleteSellerProduct = async (id) => {
  const response = await fetch(`${API_URL}/seller/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const getSellerOrders = async () => {
  const response = await fetch(`${API_URL}/seller/orders`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const updateSellerOrder = async (id, status) => {
  const response = await fetch(`${API_URL}/seller/orders/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return response.json();
};

export const getSellerDashboardRevenue = async (startDate = "", endDate = "") => {
  let url = `${API_URL}/seller/dashboard/revenue`;
  const params = [];
  if (startDate) params.push(`start_date=${startDate}`);
  if (endDate) params.push(`end_date=${endDate}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return response.json();
};
