import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 2100 },
  { name: 'Wed', revenue: 800 },
  { name: 'Thu', revenue: 1600 },
  { name: 'Fri', revenue: 2400 },
  { name: 'Sat', revenue: 1800 },
  { name: 'Sun', revenue: 900 },
];

const RevenueChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export default RevenueChart;