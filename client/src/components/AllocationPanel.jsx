import { useState } from 'react';

export default function AllocationPanel({ victims, disasters, shelters, assignments, onAssign }) {
  const [victimId, setVictimId] = useState('');
  const [disasterId, setDisasterId] = useState('');
  const [shelterId, setShelterId] = useState('');

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
          <div className="form-group">
            <label>3. Destination Facility</label>
            <select value={shelterId} onChange={(e) => setShelterId(e.target.value)}>
              <option value="">-- Select Facility --</option>
              {shelters.map(s => (
                <option key={s.shelter_id} value={s.shelter_id}>
                  {s.name} [Space: {s.capacity - s.occupancy}]
                </option>
              ))}
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
                <span className="status-badge badge-green">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}