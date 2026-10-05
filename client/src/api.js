const API_BASE = "http://localhost:3000";

export const api = {
  getAnalytics: () => fetch(`${API_BASE}/analytics/piechart`).then(r => r.json()),
  getDisasters: () => fetch(`${API_BASE}/disasters`).then(r => r.json()),
  createDisaster: (data) => fetch(`${API_BASE}/disasters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(async r => {
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || "Failed to add disaster");
    return res;
  }),
  getVictims: () => fetch(`${API_BASE}/victims`).then(r => r.json()),
  createVictim: (data) => fetch(`${API_BASE}/victims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(async r => {
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || "Failed to add victim");
    return res;
  }),
  getShelters: () => fetch(`${API_BASE}/shelters`).then(r => r.json()),
  getAssignments: () => fetch(`${API_BASE}/assignments`).then(r => r.json()),
  assignVictim: (data) => fetch(`${API_BASE}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(async r => {
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || "Failed to assign");
    return res;
  })
};