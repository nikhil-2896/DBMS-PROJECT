import { useEffect, useState } from 'react';
import AnalyticsChart from './components/AnalyticsChart';
import RegisterDisaster from './components/RegisterDisaster';
import RegisterVictim from './components/RegisterVictim';
import ShelterDashboard from './components/ShelterDashboard';
import AllocationPanel from './components/AllocationPanel';
import ResourcePanel from './components/ResourcePanel';
import ResponderList from './components/ResponderList';
import { api } from './api';

export default function App() {
  const [analytics, setAnalytics] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [victims, setVictims] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [costs, setCosts] = useState([]);
  const [responders, setResponders] = useState([]);

  const refreshAll = async () => {
    try {
      const [
        analyticsData,
        disastersData,
        victimsData,
        sheltersData,
        assignmentsData,
        resourcesData,
        allocationsData,
        costsData,
        respondersData
      ] = await Promise.all([
        api.getAnalytics(),
        api.getDisasters(),
        api.getVictims(),
        api.getShelters(),
        api.getAssignments(),
        api.getResources(),
        api.getResourceAllocations(),
        api.getResourceCosts(),
        api.getResponders()
      ]);

      setAnalytics(analyticsData);
      setDisasters(disastersData);
      setVictims(victimsData);
      setShelters(sheltersData);
      setAssignments(assignmentsData);
      setResources(resourcesData);
      setAllocations(allocationsData);
      setCosts(costsData);
      setResponders(respondersData);
    } catch (err) {
      console.error('Data sync failed:', err);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <>
      <nav className="navbar">
        <h1>Disaster Management Command Center</h1>
        <span className="badge">● System Online</span>
      </nav>

      <main className="container">
        <AnalyticsChart data={analytics} />
        <RegisterDisaster
          disasters={disasters}
          onDisasterAdded={async (data) => { await api.createDisaster(data); refreshAll(); }}
        />
        <RegisterVictim
          victims={victims}
          onVictimAdded={async (data) => { await api.createVictim(data); refreshAll(); }}
        />
        <ShelterDashboard shelters={shelters} />
        <AllocationPanel
          victims={victims}
          disasters={disasters}
          shelters={shelters}
          assignments={assignments}
          onAssign={async (data) => { await api.assignVictim(data); refreshAll(); }}
          onUpdateStatus={async (id, status) => { await api.updateAssignmentStatus(id, status); refreshAll(); }}
          onUnassign={async (id) => { await api.deleteAssignment(id); refreshAll(); }}
        />
        <ResourcePanel
          disasters={disasters}
          resources={resources}
          allocations={allocations}
          costs={costs}
          onAllocate={async (data) => { await api.createResourceAllocation(data); refreshAll(); }}
          onUpdateStatus={async (id, status) => { await api.updateResourceAllocationStatus(id, status); refreshAll(); }}
        />
        <ResponderList responders={responders} />
      </main>
    </>
  );
}