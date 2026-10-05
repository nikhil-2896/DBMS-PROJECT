import { useState } from 'react';

export default function RegisterVictim({ victims, onVictimAdded }) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !name) return alert('Fill all fields');
    try {
      await onVictimAdded({ victim_id: Number(id), name });
      setId('');
      setName('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <h2 className="card-header">Register Victim</h2>
      <form className="form-wrapper" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="vid">Unique ID</label>
          <input id="vid" type="number" placeholder="e.g., 206" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="vname">Full Name</label>
          <input id="vname" type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button type="submit" className="btn-secondary">Add Record</button>
      </form>
      <div className="list-container">
        {victims.map(v => (
          <div key={v.victim_id} className="item">
            <div className="item-details">
              <strong>{v.name}</strong>
              <small>ID: {v.victim_id}</small>
            </div>
            <span className="status-badge badge-blue">Registered</span>
          </div>
        ))}
      </div>
    </div>
  );
}