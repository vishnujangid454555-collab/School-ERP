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

  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return <div className="dashboard-workspace">
    <section className="dashboard-intro">
      <div><h2>Your school at a glance</h2><p>{today} · A quick view of your campus records.</p></div>
      <button className="secondary-button" type="button" onClick={() => onNavigate('/attendance/student-attendance')}>Take attendance</button>
    </section>
    <p className="dashboard-section-label">School directory</p>
    <div className="dashboard-cards">{cards.map(([key, label, path], index) => <button className="dashboard-card" style={{ animationDelay: `${index * 55}ms` }} type="button" key={key} onClick={() => onNavigate(path)} aria-label={`Open ${label}: ${summary[key]} records`}><span>{label}</span><strong>{summary[key] ?? 0}</strong><span className="dashboard-card-link">View records <span aria-hidden="true">→</span></span></button>)}</div>
  </div>;
}
