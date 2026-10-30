const getLevel = (pct) => {
  if (pct >= 90) return { key: 'full', label: pct >= 100 ? 'Full' : 'Critical' };
  if (pct >= 70) return { key: 'warn', label: 'Filling Up' };
  return { key: 'ok', label: 'Available' };
};

const BADGE_CLASS = { ok: 'badge-green', warn: 'badge-orange', full: 'badge-red' };

export default function ShelterDashboard({ shelters }) {
  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.occupancy, 0);
  const totalFree = Math.max(totalCapacity - totalOccupancy, 0);
  const utilization = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="card wide">
      <h2 className="card-header">Shelter Capacity Monitor</h2>

      <div className="summary-grid">
        <div className="stat-tile">
          <span className="stat-label">Total Capacity</span>
          <span className="stat-value">{totalCapacity}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Occupied</span>
          <span className="stat-value">{totalOccupancy}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Free Beds</span>
          <span className="stat-value">{totalFree}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Utilization</span>
          <span className="stat-value">{utilization}%</span>
        </div>
      </div>

      {shelters.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No shelters available.</p>
      ) : (
        <div className="shelter-grid">
          {shelters.map((s) => {
            const pct =
              s.capacity > 0 ? Math.min(Math.round((s.occupancy / s.capacity) * 100), 100) : 100;
            const free = Math.max(s.capacity - s.occupancy, 0);
            const level = getLevel(pct);

            return (
              <div key={s.shelter_id} className="shelter-tile">
                <div className="shelter-tile-top">
                  <strong>{s.name}</strong>
                  <span className={`status-badge ${BADGE_CLASS[level.key]}`}>{level.label}</span>
                </div>

                <div className="progress-track">
                  <div className={`progress-fill fill-${level.key}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="shelter-tile-bottom">
                  <span>
                    {s.occupancy} / {s.capacity} occupied
                  </span>
                  <span>{free} free</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}