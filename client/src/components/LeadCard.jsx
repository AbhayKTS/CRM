const statusOptions = ["new", "contacted", "converted"];

const formatDate = (d) => new Date(d).toLocaleString();

export default function LeadCard({ lead, onView, onStatusChange, onDelete }) {
  return (
    <article className="lead-card">
      <div className="lead-header">
        <div>
          <h3 className="clickable" onClick={onView}>
            {lead.name}
          </h3>
          <p className="muted">{lead.email}</p>
          {lead.phone && <p className="muted small">{lead.phone}</p>}
        </div>
        <span className={`status ${lead.status}`}>{lead.status}</span>
      </div>
      <p className="meta">
        Source: {lead.source} &middot; Created: {formatDate(lead.createdAt)}
      </p>
      <div className="card-actions">
        <select
          value={lead.status}
          onChange={(e) => onStatusChange(lead.id, e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="ghost small" onClick={onView}>
          View
        </button>
        <button className="danger small" onClick={() => onDelete(lead.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
