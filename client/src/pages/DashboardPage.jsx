import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchLeads,
  fetchSummary,
  createLead,
  updateLead,
  deleteLead,
} from "../api";
import LeadCard from "../components/LeadCard";
import AddLeadModal from "../components/AddLeadModal";

const statusOptions = ["", "new", "contacted", "converted"];

export default function DashboardPage({ onSelectLead }) {
  const { token, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    contacted: 0,
    converted: 0,
    conversionRate: 0,
    bySource: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const sources = useMemo(() => {
    return [...new Set(leads.map((l) => l.source))];
  }, [leads]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      const [leadData, summaryData] = await Promise.all([
        fetchLeads(token, params),
        fetchSummary(token),
      ]);
      setLeads(leadData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, sourceFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleAddLead = async (data) => {
    await createLead(data, token);
    setShowModal(false);
    loadData();
  };

  const handleStatusChange = async (id, status) => {
    await updateLead(id, { status }, token);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    await deleteLead(id, token);
    loadData();
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Lead Dashboard</h1>
          <p className="muted">Track and convert incoming client leads.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowModal(true)}>+ Add Lead</button>
          <button className="ghost" onClick={logout}>
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
        <div className="summary-card">
          <span>Conversion Rate</span>
          <strong>{summary.conversionRate}%</strong>
        </div>
      </section>

      {Object.keys(summary.bySource || {}).length > 0 && (
        <section className="source-stats">
          <h4>Leads by Source</h4>
          <div className="badge-row">
            {Object.entries(summary.bySource).map(([src, count]) => (
              <span key={src} className="badge">
                {src}: {count}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="search"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statusOptions.slice(1).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="leads">
        {loading && <p className="muted">Loading...</p>}
        {!loading && leads.length === 0 && (
          <p className="muted">No leads found. Add your first lead!</p>
        )}
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onView={() => onSelectLead(lead.id)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
      </section>

      {showModal && (
        <AddLeadModal onClose={() => setShowModal(false)} onSubmit={handleAddLead} />
      )}
    </div>
  );
}
