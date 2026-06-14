const API_URL = "http://127.0.0.1:8000/api/v1";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

//PROFILE API

export const getProfile = async () => {
  const response = await fetch(
    `${API_URL}/profile`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return response.json();
};

export const updateProfile = async (data) => {
  const response = await fetch(
    `${API_URL}/profile`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

// Change Password API

export const changePassword = async (data) => {
  const response = await fetch(
    `${API_URL}/profile/password`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

// ADDRESS API

export const getAddresses = async () => {
  const response = await fetch(
    `${API_URL}/addresses`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return response.json();
};

export const createAddress = async (data) => {
  const response = await fetch(
    `${API_URL}/addresses/add`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

export const updateAddress = async (
  id,
  data
) => {
  const response = await fetch(
    `${API_URL}/addresses/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

export const deleteAddress = async (id) => {
  const response = await fetch(
    `${API_URL}/addresses/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  return response.json();
};