export default function ResponderList({ responders }) {
  return (
    <div className="card wide">
      <h2 className="card-header">Response Teams</h2>

      {responders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No response teams registered.</p>
      ) : (
        <div className="shelter-grid">
          {responders.map((r) => (
            <div key={r.responder_id} className="shelter-tile">
              <div className="shelter-tile-top">
                <strong>{r.name}</strong>
                <span className="status-badge badge-blue">{r.role || 'N/A'}</span>
              </div>
              <div className="shelter-tile-bottom">
                <span>{r.org || 'Independent'}</span>
                <span>{r.disaster_type || 'Unassigned'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}