import { useEffect, useMemo, useState } from "react";
import {
  createLead,
  fetchLeads,
  fetchSummary,
  login,
  updateLead,
} from "./api.js";

const statusOptions = ["new", "contacted", "converted"];

const formatDate = (value) => new Date(value).toLocaleString();

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("crm_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({ total: 0, contacted: 0, converted: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [noteDrafts, setNoteDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});

  const filteredLeads = useMemo(() => {
    const term = search.toLowerCase();
    return leads.filter((lead) =>
      [lead.name, lead.email, lead.source, lead.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [leads, search]);

  const refreshData = async (authToken) => {
    const [leadData, summaryData] = await Promise.all([
      fetchLeads(authToken),
      fetchSummary(authToken),
    ]);
    setLeads(leadData);
    setSummary(summaryData);
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    setLoading(true);
    refreshData(token)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      setToken(result.token);
      localStorage.setItem("crm_token", result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("crm_token");
  };

  const handleUpdate = async (leadId) => {
    const payload = {
      status: statusDrafts[leadId],
      note: noteDrafts[leadId],
    };
    setLoading(true);
    try {
      const updated = await updateLead(leadId, payload, token);
      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? updated : lead)));
      setNoteDrafts((prev) => ({ ...prev, [leadId]: "" }));
      setStatusDrafts((prev) => ({ ...prev, [leadId]: updated.status }));
      const summaryData = await fetchSummary(token);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSample = async () => {
    setLoading(true);
    setError("");
    try {
      await createLead({
        name: "Sample Lead",
        email: `lead${Date.now()}@example.com`,
        source: "demo",
        note: "Requested a demo.",
      });
      await refreshData(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="page">
        <div className="card">
          <h1>Mini CRM Admin</h1>
          <p>Sign in to manage your leads.</p>
          <form onSubmit={handleLogin} className="form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="hint">Default: admin@example.com / admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Lead Dashboard</h1>
          <p>Track and convert incoming client leads.</p>
        </div>
        <div className="header-actions">
          <button className="ghost" onClick={handleCreateSample}>
            Add Sample Lead
          </button>
          <button className="ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="summary">
        <div className="summary-card">
          <span>Total Leads</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Contacted</span>
          <strong>{summary.contacted}</strong>
        </div>
        <div className="summary-card">
          <span>Converted</span>
          <strong>{summary.converted}</strong>
        </div>
      </section>

      <section className="toolbar">
        <input
          type="search"
          placeholder="Search by name, email, status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {error && <p className="error">{error}</p>}
      </section>

      <section className="leads">
        {loading && <p className="muted">Loading...</p>}
        {!loading && filteredLeads.length === 0 && (
          <p className="muted">No leads yet. Add a sample lead to start.</p>
        )}
        {filteredLeads.map((lead) => (
          <article key={lead.id} className="lead-card">
            <div className="lead-header">
              <div>
                <h3>{lead.name}</h3>
                <p>{lead.email}</p>
              </div>
              <span className={`status ${lead.status}`}>{lead.status}</span>
            </div>
            <p className="meta">
              Source: {lead.source} · Created: {formatDate(lead.createdAt)}
            </p>
            <div className="notes">
              <h4>Notes</h4>
              {lead.notes.length === 0 ? (
                <p className="muted">No notes yet.</p>
              ) : (
                <ul>
                  {lead.notes.map((note, index) => (
                    <li key={`${lead.id}-${index}`}>
                      <span>{note.text}</span>
                      <small>{formatDate(note.createdAt)}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="actions">
              <select
                value={statusDrafts[lead.id] || lead.status}
                onChange={(event) =>
                  setStatusDrafts((prev) => ({
                    ...prev,
                    [lead.id]: event.target.value,
                  }))
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Add a follow-up note"
                value={noteDrafts[lead.id] || ""}
                onChange={(event) =>
                  setNoteDrafts((prev) => ({
                    ...prev,
                    [lead.id]: event.target.value,
                  }))
                }
              />
              <button onClick={() => handleUpdate(lead.id)} disabled={loading}>
                Save
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
