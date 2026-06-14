const API_URL = "http://127.0.0.1:8000/api/v1";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const registerShop = async (data) => {
  const response = await fetch(`${API_URL}/shops/register`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const addSellerProduct = async (data) => {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
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
  const response = await fetch(`${API_URL}/seller/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
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

export const updateSellerOrder = async (id, status) => {
  const response = await fetch(`${API_URL}/seller/orders/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return response.json();
};

export const getSellerDashboardRevenue = async () => {
  const response = await fetch(`${API_URL}/seller/dashboard/revenue`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return response.json();
};
