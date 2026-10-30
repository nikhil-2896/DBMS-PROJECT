import { useState } from 'react';
import './AllocationPanel.css';

const ALLOC_STATUSES = ['Pending', 'Distributed'];

const ALLOC_STATUS_CLASS = {
  Pending: 'st-treatment',
  Distributed: 'st-rescued'
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const labelStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  fontWeight: 500,
  marginBottom: '0.6rem',
  display: 'block',
  letterSpacing: '1px'
};

export default function ResourcePanel({
  disasters,
  resources,
  allocations,
  costs,
  onAllocate,
  onUpdateStatus
}) {
  const [disasterId, setDisasterId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [qty, setQty] = useState('');

  const grandTotal = costs.reduce((sum, c) => sum + Number(c.total_cost), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!disasterId || !resourceId || !qty) {
      return alert('All fields are required.');
    }
    try {
      await onAllocate({
        disaster_id: Number(disasterId),
        resource_id: Number(resourceId),
        qty: Number(qty)
      });
      setDisasterId('');
      setResourceId('');
      setQty('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (allocId, status) => {
    try {
      await onUpdateStatus(allocId, status);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card wide">
      <h2 className="card-header">Relief Resource Management</h2>
      <div className="split-layout">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <form className="form-wrapper" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="res-disaster">Disaster Event</label>
              <select id="res-disaster" value={disasterId} onChange={(e) => setDisasterId(e.target.value)}>
                <option value="">-- Select Event --</option>
                {disasters.map(d => (
                  <option key={d.disaster_id} value={d.disaster_id}>
                    {d.type} [ID: {d.disaster_id}]
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="res-resource">Resource</label>
              <select id="res-resource" value={resourceId} onChange={(e) => setResourceId(e.target.value)}>
                <option value="">-- Select Resource --</option>
                {resources.map(r => (
                  <option key={r.resource_id} value={r.resource_id}>
                    {r.name} [{formatINR(r.unit_cost)}/unit]
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="res-qty">Quantity</label>
              <input
                id="res-qty"
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-secondary">Allocate Resource</button>
          </form>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={labelStyle}>
              Total Relief Cost by Event · {formatINR(grandTotal)}
            </label>
            <div className="list-container" style={{ marginTop: 0, height: '200px' }}>
              {costs.map(c => (
                <div key={c.disaster_id} className="item">
                  <div className="item-details">
                    <strong>{c.disaster_type}</strong>
                    <small>ID: {c.disaster_id}</small>
                  </div>
                  <span className="status-badge badge-blue">{formatINR(c.total_cost)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-list">
          <label style={labelStyle}>Resource Allocation Log</label>
          <div className="list-container">
            {allocations.map(a => (
              <div key={a.alloc_id} className="item">
                <div className="item-details">
                  <strong>{a.qty} × {a.resource_name}</strong>
                  <small>{a.disaster_type} · {formatINR(a.total_cost)}</small>
                </div>
                <div className="item-actions">
                  <select
                    className={`status-select ${ALLOC_STATUS_CLASS[a.status] || 'st-treatment'}`}
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.alloc_id, e.target.value)}
                  >
                    {ALLOC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}