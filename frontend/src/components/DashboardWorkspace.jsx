import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient.js';

const cards = [
  ['students', 'Students', '/student-master/student-master'],
  ['staff', 'Staff', '/staff-master/staff'],
  ['classes', 'Classes', '/settings/classes'],
  ['sections', 'Sections', '/settings/sections'],
  ['subjects', 'Subjects', '/academic-master/subjects'],
];

export default function DashboardWorkspace({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get('/dashboard/summary').then(({ data }) => setSummary(data.data)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load dashboard'));
  }, []);

  if (error) return <div className="form-error" role="alert">{error}</div>;
  if (!summary) return <div className="state-message">Loading dashboard...</div>;

  return <div className="dashboard-cards">{cards.map(([key, label, path]) => <button className="dashboard-card" type="button" key={key} onClick={() => onNavigate(path)}><span>{label}</span><strong>{summary[key]}</strong></button>)}</div>;
}
