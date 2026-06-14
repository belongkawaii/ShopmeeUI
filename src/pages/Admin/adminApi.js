const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export const AdminAPI = {
  users: "/admin/users",
  shops: "/admin/shops",
  products: "/admin/products",
  orders: "/admin/orders",
  revenue: "/admin/revenue",
};

export function getAdminUser() {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    return null;
  }
}

function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}

function buildUrl(path, params = {}) {
  const url = new URL(
    `${API_BASE_URL}${path}`
  );

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(key, value);
      }
    }
  );

  return url.toString();
}

export async function adminRequest(
  path,
  options = {}
) {
  const token = getAccessToken();

  const headers = {
    Accept: "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  if (options.body) {
    headers["Content-Type"] =
      "application/json";
  }

  const response = await fetch(
    buildUrl(path, options.params),
    {
      method: options.method || "GET",
      headers,
      body: options.body
        ? JSON.stringify(options.body)
        : undefined,
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (
    !response.ok ||
    result.success === false
  ) {
    throw new Error(
      result.message ||
        "Không thể tải dữ liệu quản trị."
    );
  }

  return result;
}

export function getTotalPages(meta) {
  const perPage = Number(
    meta?.per_page || 15
  );

  const total = Number(
    meta?.total || 0
  );

  return Math.max(
    1,
    Math.ceil(total / perPage)
  );
}

export function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(
    value.replace(" ", "T")
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function shortId(id) {
  if (!id) return "N/A";

  return `${id.slice(0, 8)}...`;
}

export function getRoleLabel(role) {
  const roles = {
    admin: "Quản trị viên",
    seller: "Người bán",
    buyer: "Người mua",
  };

  return roles[role] || role;
}

export function getStatusLabel(status) {
  const labels = {
    active: "Hoạt động",
    pending: "Chờ duyệt",
    rejected: "Từ chối",
    blocked: "Bị khóa",
    closed: "Đã đóng",

    hidden: "Đã ẩn",

    completed: "Hoàn tất",

    cancelled: "Đã hủy",
    canceled: "Đã hủy",

    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",

    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
  };

  return labels[status] || status || "N/A";
}

export function getStatusClass(status) {
  return `status-${String(
    status || "unknown"
  )
    .toLowerCase()
    .replaceAll("_", "-")}`;
}