const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);

  let body = null;
  try {
    body = await res.json();
  } catch {
    // response had no JSON body
  }

  if (!res.ok) {
    throw new Error((body && body.error) || `Request failed (${res.status})`);
  }
  return body;
}

const send = (method, path, data) =>
  request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

export const api = {
  getAnalytics: () => request('/analytics/piechart'),
  getResourceCosts: () => request('/analytics/costs'),
  getDisasters: () => request('/disasters'),
  createDisaster: (data) => send('POST', '/disasters', data),
  getVictims: () => request('/victims'),
  createVictim: (data) => send('POST', '/victims', data),
  getShelters: () => request('/shelters'),
  getShelterSuggestion: (disasterId) =>
    request(`/shelters/suggestion?disaster_id=${encodeURIComponent(disasterId)}`),
  getAssignments: () => request('/assignments'),
  assignVictim: (data) => send('POST', '/assign', data),
  updateAssignmentStatus: (id, status) => send('PATCH', `/assignments/${id}`, { status }),
  deleteAssignment: (id) => request(`/assignments/${id}`, { method: 'DELETE' }),
  getResources: () => request('/resources'),
  getResourceAllocations: () => request('/resource-allocations'),
  createResourceAllocation: (data) => send('POST', '/resource-allocations', data),
  updateResourceAllocationStatus: (id, status) =>
    send('PATCH', `/resource-allocations/${id}`, { status }),
  getResponders: () => request('/responders')
};