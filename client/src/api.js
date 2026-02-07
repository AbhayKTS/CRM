const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

export const login = (email, password) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const fetchLeads = (token) =>
  request("/api/leads", {
    token,
  });

export const fetchSummary = (token) =>
  request("/api/leads/summary", {
    token,
  });

export const updateLead = (id, payload, token) =>
  request(`/api/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });

export const createLead = (payload) =>
  request("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
