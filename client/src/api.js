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

// Leads CRUD
export const fetchLeads = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/leads${query ? `?${query}` : ""}`, { token });
};

export const fetchLead = (id, token) => request(`/api/leads/${id}`, { token });

export const createLead = (payload, token) =>
  request("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });

export const updateLead = (id, payload, token) =>
  request(`/api/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });

export const deleteLead = (id, token) =>
  request(`/api/leads/${id}`, {
    method: "DELETE",
    token,
  });

// Notes
export const addNote = (leadId, text, token) =>
  request(`/api/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ text }),
    token,
  });

export const fetchNotes = (leadId, token) =>
  request(`/api/leads/${leadId}/notes`, { token });

// Summary / Analytics
export const fetchSummary = (token) => request("/api/leads/summary", { token });
