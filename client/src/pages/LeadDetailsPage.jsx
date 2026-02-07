import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchLead, updateLead, addNote } from "../api";

const statusOptions = ["new", "contacted", "converted"];

const formatDate = (d) => new Date(d).toLocaleString();

export default function LeadDetailsPage({ leadId, onBack }) {
  const { token } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const loadLead = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchLead(leadId, token);
      setLead(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const handleStatusUpdate = async (status) => {
    setSaving(true);
    try {
      const updated = await updateLead(leadId, { status }, token);
      setLead(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const updated = await addNote(leadId, noteText, token);
      setLead(updated);
      setNoteText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="muted page">Loading lead...</p>;
  if (error) return <p className="error page">{error}</p>;
  if (!lead) return <p className="muted page">Lead not found.</p>;

  return (
    <div className="page">
      <button className="ghost back-btn" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="lead-detail-card">
        <div className="lead-detail-header">
          <div>
            <h2>{lead.name}</h2>
            <p className="muted">{lead.email}</p>
            {lead.phone && <p className="muted">{lead.phone}</p>}
          </div>
          <span className={`status ${lead.status}`}>{lead.status}</span>
        </div>

        <p className="meta">
          Source: <strong>{lead.source}</strong> &middot; Created:{" "}
          {formatDate(lead.createdAt)}
        </p>

        <div className="status-actions">
          <span>Update status:</span>
          {statusOptions.map((s) => (
            <button
              key={s}
              className={lead.status === s ? "active" : "ghost"}
              disabled={saving || lead.status === s}
              onClick={() => handleStatusUpdate(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <section className="notes-section">
          <h3>Follow-up Notes</h3>
          {lead.notes.length === 0 ? (
            <p className="muted">No notes yet.</p>
          ) : (
            <ul className="notes-list">
              {lead.notes.map((n) => (
                <li key={n.id}>
                  <span>{n.text}</span>
                  <small className="muted">{formatDate(n.createdAt)}</small>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleAddNote} className="add-note-form">
            <input
              type="text"
              placeholder="Add a follow-up note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button type="submit" disabled={saving || !noteText.trim()}>
              Add
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
