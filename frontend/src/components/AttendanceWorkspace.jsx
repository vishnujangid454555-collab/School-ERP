import { useCallback, useEffect, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient.js';

const statuses = ['present', 'absent', 'late', 'excused'];

export default function AttendanceWorkspace() {
  const [filters, setFilters] = useState({ date: new Date().toISOString().slice(0, 10), className: '', sectionName: '' });
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const initialLoad = useRef(true);

  const load = useCallback(async (event) => {
    event?.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const [{ data: studentResponse }, { data: attendanceResponse }] = await Promise.all([
        axiosClient.get('/students', { params: { limit: 100, page: 1 } }),
        axiosClient.get('/attendance/students', { params: filters }),
      ]);
      const filteredStudents = studentResponse.data.records.filter((student) => (!filters.className || student.className === filters.className) && (!filters.sectionName || student.sectionName === filters.sectionName));
      setStudents(filteredStudents);
      setMarks(Object.fromEntries(attendanceResponse.data.map((record) => [record.studentId, record.status])));
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load attendance'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    if (!initialLoad.current) return undefined;
    initialLoad.current = false;
    const request = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(request);
  }, [load]);

  const save = async () => {
    setSaving(true); setError(''); setMessage('');
    try {
      await axiosClient.post('/attendance/students', { ...filters, entries: students.map((student) => ({ studentId: student.id, status: marks[student.id] || 'present' })) });
      setMessage('Attendance saved successfully.');
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save attendance'); }
    finally { setSaving(false); }
  };

  const markAll = (status) => setMarks(Object.fromEntries(students.map((student) => [student.id, status])));
  const statusCounts = statuses.map((status) => [status, students.filter((student) => (marks[student.id] || 'present') === status).length]);

  return <div className="attendance-workspace">
    <section className="resource-form-panel">
      <div className="panel-heading"><div><span className="eyebrow">Daily register</span><h2>Student Attendance</h2></div><button className="primary-button" type="button" disabled={saving || !students.length} onClick={save}>{saving ? 'Saving...' : 'Save attendance'}</button></div>
      {error && <div className="form-error" role="alert">{error}</div>}{message && <div className="form-success" role="status">{message}</div>}
      <form className="attendance-filters" onSubmit={load}><label className="form-field">Date<input type="date" required value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} /></label><label className="form-field">Class<input required placeholder="Class name" value={filters.className} onChange={(event) => setFilters({ ...filters, className: event.target.value })} /></label><label className="form-field">Section<input required placeholder="Section name" value={filters.sectionName} onChange={(event) => setFilters({ ...filters, sectionName: event.target.value })} /></label><button className="secondary-button" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Load students'}</button></form>
    </section>
    <section className="resource-list-panel">{students.length === 0 ? <div className="state-message">Load a class and section to begin attendance.</div> : <><div className="attendance-quick-actions"><span>{students.length} students in this register</span><button className="secondary-button" type="button" onClick={() => markAll('present')}>Mark all present</button><button className="secondary-button" type="button" onClick={() => markAll('absent')}>Mark all absent</button></div><div className="attendance-summary" aria-live="polite">{statusCounts.map(([status, count]) => <span key={status} className={`status-badge is-${status}`}>{status}<strong>{count}</strong></span>)}</div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Code</th><th>Attendance status</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.name}</td><td>{student.code || '-'}</td><td><select className="attendance-select" value={marks[student.id] || 'present'} onChange={(event) => setMarks({ ...marks, [student.id]: event.target.value })}>{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div></>}</section>
  </div>;
}
