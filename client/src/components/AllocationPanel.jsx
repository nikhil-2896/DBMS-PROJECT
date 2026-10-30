import { useEffect, useState } from 'react';
import { api } from '../api';
import './AllocationPanel.css';

const STATUSES = ['Assigned', 'Rescued', 'Under Treatment', 'Relocated'];

const STATUS_CLASS = {
  'Assigned': 'st-assigned',
  'Rescued': 'st-rescued',
  'Under Treatment': 'st-treatment',
  'Relocated': 'st-relocated'
};

export default function AllocationPanel({
  victims,
  disasters,
  shelters,
  assignments,
  onAssign,
  onUpdateStatus,
  onUnassign
}) {
  const [victimId, setVictimId] = useState('');
  const [disasterId, setDisasterId] = useState('');
  const [shelterId, setShelterId] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (!disasterId) return;

    let cancelled = false;
    api
      .getShelterSuggestion(disasterId)
      .then((data) => {
        if (!cancelled) setSuggestion({ disasterId, data });
      })
      .catch(() => {
        if (!cancelled) setSuggestion({ disasterId, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [disasterId, shelters]);

  const shownSuggestion =
    disasterId && suggestion && suggestion.disasterId === disasterId ? suggestion.data : null;

  const handleAssign = async () => {
    if (!victimId || !disasterId || !shelterId) {
      return alert('All fields are required.');
    }
    try {
      await onAssign({ victim_id: victimId, disaster_id: disasterId, shelter_id: shelterId });
      setVictimId('');
      setDisasterId('');
      setShelterId('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (assistanceId, status) => {
    try {
      await onUpdateStatus(assistanceId, status);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnassign = async (assignment) => {
    const ok = window.confirm(
      `Unassign ${assignment.victim_name} from ${assignment.shelter_name}?`
    );
    if (!ok) return;
    try {
      await onUnassign(assignment.assistance_id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card wide">
      <h2 className="card-header">Resource & Shelter Allocation Protocol</h2>
      <div className="split-layout">
        <div className="form-wrapper">
          <div className="form-group">
            <label>1. Target Victim</label>
            <select value={victimId} onChange={(e) => setVictimId(e.target.value)}>
              <option value="">-- Select Target --</option>
              {victims.map(v => <option key={v.victim_id} value={v.victim_id}>{v.name} [ID: {v.victim_id}]</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>2. Assigned Event</label>
            <select value={disasterId} onChange={(e) => setDisasterId(e.target.value)}>
              <option value="">-- Select Event --</option>
              {disasters.map(d => <option key={d.disaster_id} value={d.disaster_id}>{d.type} [ID: {d.disaster_id}]</option>)}
            </select>
          </div>

          {shownSuggestion && (
            <div
              className="item"
              style={{ marginBottom: '1.2rem', cursor: 'pointer' }}
              onClick={() => setShelterId(String(shownSuggestion.shelter_id))}
            >
              <div className="item-details">
                <strong>Recommended: {shownSuggestion.name}</strong>
                <small>
                  {shownSuggestion.free_beds} free beds ·{' '}
                  {shownSuggestion.in_affected_area ? 'in affected area' : 'outside affected area'} · click to select
                </small>
              </div>
              <span className="status-badge badge-green">Best match</span>
            </div>
          )}

          <div className="form-group">
            <label>3. Destination Facility</label>
            <select value={shelterId} onChange={(e) => setShelterId(e.target.value)}>
              <option value="">-- Select Facility --</option>
              {shelters.map(s => {
                const free = s.capacity - s.occupancy;
                const isFull = free <= 0;
                return (
                  <option key={s.shelter_id} value={s.shelter_id} disabled={isFull}>
                    {s.name} {isFull ? '[FULL]' : `[Space: ${free}]`}
                  </option>
                );
              })}
            </select>
          </div>
          <button type="button" onClick={handleAssign}>Execute Allocation</button>
        </div>

        <div className="flex-list">
          <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 500, marginBottom: '0.6rem', display: 'block', letterSpacing: '1px' }}>
            Live Dispatch Log
          </label>
          <div className="list-container">
            {assignments.map(a => (
              <div key={a.assistance_id} className="item">
                <div className="item-details">
                  <strong>{a.victim_name} ➔ {a.shelter_name}</strong>
                  <small>Cause: {a.disaster_type}</small>
                </div>
                <div className="item-actions">
                  <select
                    className={`status-select ${STATUS_CLASS[a.status] || 'st-assigned'}`}
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.assistance_id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    type="button"
                    className="btn-remove"
                    title="Unassign victim"
                    onClick={() => handleUnassign(a)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}