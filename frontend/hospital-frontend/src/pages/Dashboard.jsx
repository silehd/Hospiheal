import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Stethoscope, Calendar, Package } from 'lucide-react';
import Card from '../components/Common/Card';
import RevenueChart from '../components/Charts/RevenueChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats/');
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setError('Unable to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;
  if (!stats) return null;

  const statCards = [
    { title: 'Total Patients', value: stats.total_patients, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Doctors', value: stats.total_doctors, icon: Stethoscope, color: 'bg-green-500' },
    { title: "Today's Appointments", value: stats.total_appointments_today, icon: Calendar, color: 'bg-purple-500' },
    { title: 'Low Stock Items', value: stats.low_stock_items, icon: Package, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of hospital operations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Overview">
          <RevenueChart />
        </Card>
        <Card title="Quick Actions">
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span>Pending Prescriptions</span>
              <span className="font-bold">{stats.pending_prescriptions}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Pending Lab Tests</span>
              <span className="font-bold">{stats.pending_lab_tests}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Overdue Bills</span>
              <span className="font-bold text-red-600">{stats.overdue_bills}</span>
            </div>
            <div className="flex justify-between">
              <span>Today's Revenue</span>
              <span className="font-bold text-green-600">${stats.revenue_today}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;