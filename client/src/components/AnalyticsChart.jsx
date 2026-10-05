import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnalyticsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h2 className="card-header">Impact Analytics</h2>
        <div className="chart-container">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No data available. Awaiting input.
          </p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.disaster_type),
    datasets: [{
      data: data.map(item => item.total_victims),
      backgroundColor: ['#00F0FF', '#8B5CF6', '#FBBF24', '#F43F5E', '#10B981', '#3B82F6'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20, color: '#F8FAFC' } }
    },
    cutout: '75%',
    layout: { padding: 10 }
  };

  return (
    <div className="card">
      <h2 className="card-header">Impact Analytics</h2>
      <div className="chart-container">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}