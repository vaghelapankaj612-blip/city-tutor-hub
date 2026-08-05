import API_BASE from "./api";
const ADMIN_API = `${API_BASE}/api`;

function getAdminToken() {
  return localStorage.getItem("adminToken");
}

async function request(path, options = {}) {
  const token = getAdminToken();

  try {
    const res = await fetch(`${ADMIN_API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    let data = {};
    let rawText = "";

    try {
      rawText = await res.text();
      data = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      data = {};
    }

    if (!res.ok) {
      throw new Error(
        data.message ||
          rawText ||
          `Request failed (${res.status} ${res.statusText})`
      );
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

export const adminApi = {
  login: (email, password) =>
    request("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  stats: () =>
    request("/admin/stats", {
      method: "GET",
    }),

  users: () =>
    request("/admin/users", {
      method: "GET",
    }),

  tutors: () =>
    request("/admin/tutors", {
      method: "GET",
    }),

  addTutor: (payload) =>
    request("/admin/tutors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTutor: (id, payload) =>
    request(`/admin/tutors/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTutor: (id) =>
    request(`/admin/tutors/${id}`, {
      method: "DELETE",
    }),

  bookings: () =>
    request("/admin/bookings", {
      method: "GET",
    }),

  appointments: () =>
    request("/admin/bookings", {
      method: "GET",
    }),

  updateBooking: (id, payload) =>
    request(`/admin/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteBooking: (id) =>
    request(`/admin/bookings/${id}`, {
      method: "DELETE",
    }),

  inquiries: () =>
    request("/admin/inquiries", {
      method: "GET",
    }),

  deleteInquiry: (id) =>
    request(`/admin/inquiries/${id}`, {
      method: "DELETE",
    }),
      newsletterSubscribers: () =>
    request("/admin/newsletter", {
      method: "GET",
    }),

  deleteSubscriber: (id) =>
    request(`/admin/newsletter/${id}`, {
      method: "DELETE",
    }),
};