import { useState } from 'react';

export default function RegisterDisaster({ disasters, onDisasterAdded }) {
  const [id, setId] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('High');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !type) return alert('Fill required fields');
    try {
      await onDisasterAdded({ disaster_id: Number(id), type, severity });
      setId('');
      setType('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <h2 className="card-header">Register Event</h2>
      <form className="form-wrapper" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="did">Event ID</label>
          <input id="did" type="number" placeholder="e.g., 5" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="dtype">Classification</label>
          <input id="dtype" type="text" placeholder="e.g., Flood, Landslide" value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="dseverity">Threat Level</label>
          <select id="dseverity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <button type="submit">Log Event</button>
      </form>
      <div className="list-container">
        {disasters.map(d => (
          <div key={d.disaster_id} className="item">
            <div className="item-details">
              <strong>{d.type}</strong>
              <small>ID: {d.disaster_id}</small>
            </div>
            <span className="status-badge badge-orange">{d.severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}