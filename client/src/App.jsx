import { useEffect, useState } from 'react';
import AnalyticsChart from './components/AnalyticsChart';
import RegisterDisaster from './components/RegisterDisaster';
import RegisterVictim from './components/RegisterVictim';
import AllocationPanel from './components/AllocationPanel';
import { api } from './api';

export default function App() {
  const [analytics, setAnalytics] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [victims, setVictims] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const refreshAll = async () => {
    try {
      const [analyticsData, disastersData, victimsData, sheltersData, assignmentsData] =
        await Promise.all([
          api.getAnalytics(),
          api.getDisasters(),
          api.getVictims(),
          api.getShelters(),
          api.getAssignments()
        ]);

      setAnalytics(analyticsData);
      setDisasters(disastersData);
      setVictims(victimsData);
      setShelters(sheltersData);
      setAssignments(assignmentsData);
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
        <AllocationPanel
          victims={victims}
          disasters={disasters}
          shelters={shelters}
          assignments={assignments}
          onAssign={async (data) => { await api.assignVictim(data); refreshAll(); }}
        />
      </main>
    </>
  );
}