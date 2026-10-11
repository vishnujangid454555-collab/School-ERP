import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient.js';

const CORE_RESOURCES = new Set(['admission-enquiries', 'students', 'classes', 'sections', 'subjects', 'staff']);
const resourceFields = {
  'admission-enquiries': ['name', 'parentName', 'phone', 'email', 'className', 'source', 'status'],
  students: ['name', 'code', 'email', 'className', 'sectionName', 'status'],
  staff: ['name', 'code', 'email', 'staffType', 'department', 'status'],
  classes: ['name', 'code', 'description', 'status'],
  sections: ['name', 'code', 'className', 'status'],
  subjects: ['name', 'code', 'subjectGroup', 'status'],
};

function emptyForm(resource) {
  return Object.fromEntries((resourceFields[resource] || ['name', 'code', 'description', 'status']).map((field) => [field, field === 'status' ? 'active' : '']));
}

export default function ResourceWorkspace({ group, item }) {
  const resource = group.key === 'admission' && item.slug === 'admission-enquiry' ? 'admission-enquiries' : group.key === 'student-master' && ['student-master'].includes(item.slug) ? 'students' : group.key === 'staff-master' && ['teachers', 'staff'].includes(item.slug) ? 'staff' : group.key === 'settings' && item.slug === 'classes' ? 'classes' : group.key === 'settings' && item.slug === 'sections' ? 'sections' : group.key === 'academic-master' && item.slug === 'subjects' ? 'subjects' : null;
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(() => emptyForm(resource));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(Boolean(resource));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const visibleRecords = records.filter((record) => statusFilter === 'all' || record.status === statusFilter);

  useEffect(() => {
    if (resource !== 'admission-enquiries') return undefined;
    let active = true;
    axiosClient.get('/classes', { params: { page: 1, limit: 100 } })
      .then(({ data }) => { if (active) setClassOptions(data.data.records); })
      .catch(() => { if (active) setClassOptions([]); });
    return () => { active = false; };
  }, [resource]);

  const load = useCallback(async (page = 1) => {
    if (!resource) return;
    setLoading(true); setError('');
    try {
      const { data } = await axiosClient.get(`/${resource}`, { params: { search, page, limit: 10 } });
      setRecords(data.data.records); setMeta(data.data);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load records'); }
    finally { setLoading(false); }
  }, [resource, search]);

  useEffect(() => {
    const request = window.setTimeout(load, 0);
    return () => window.clearTimeout(request);
  }, [load]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = editingId
        ? await axiosClient.patch(`/${resource}/${editingId}`, form)
        : await axiosClient.post(`/${resource}`, form);
      const savedRecord = response.data.data;
      const matchesSearch = !search || JSON.stringify(savedRecord).toLowerCase().includes(search.trim().toLowerCase());

      if (editingId) {
        setRecords((currentRecords) => currentRecords.map((record) => record.id === editingId ? savedRecord : record));
      } else if (meta.page === 1 && matchesSearch) {
        setRecords((currentRecords) => [savedRecord, ...currentRecords].slice(0, meta.limit));
        setMeta((currentMeta) => ({ ...currentMeta, total: currentMeta.total + 1, totalPages: Math.ceil((currentMeta.total + 1) / currentMeta.limit) }));
      }

      setForm(emptyForm(resource)); setEditingId(null);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save record'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this record? This action cannot be undone.')) return;
    try { await axiosClient.delete(`/${resource}/${id}`); await load(meta.page); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete record'); }
  };

  if (!resource) return <section className="workspace-empty"><div className="empty-mark">{group.icon.slice(0, 1).toUpperCase()}</div><h2>{item.label}</h2><p>This menu is mapped and ready. Its domain workflow is queued for implementation against the same API and Firestore architecture.</p></section>;

  return (
    <div className="resource-workspace">
      {error && <div className="form-error" role="alert">{error}</div>}
      <section className="resource-form-panel">
        <div className="panel-heading"><div>{editingId && <span className="eyebrow">Edit enquiry</span>}<h2>{editingId ? `Edit ${item.label}` : `Add ${item.label}`}</h2></div>{editingId && <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm(resource)); }}>Cancel</button>}</div>
        <form className="resource-form" onSubmit={submit}>
          {(resourceFields[resource] || []).map((field) => <label className="form-field" key={field}>{field.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase())}{resource === 'admission-enquiries' && field === 'className' ? <select required value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })}><option value="">Select class</option>{classOptions.map((classRecord) => <option value={classRecord.name} key={classRecord.id}>{classRecord.name}</option>)}</select> : <input required={field === 'name'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />}</label>)}
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update record' : 'Save record'}</button>
        </form>
      </section>
      <section className="resource-list-panel">
        <div className="panel-heading"><div><span className="eyebrow">Records</span><h2>{item.label}</h2></div><form className="search-form" onSubmit={(event) => { event.preventDefault(); load(1); }}><input placeholder="Search records" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="secondary-button" type="submit">Search</button></form></div>
        <div className="filter-toolbar" aria-label="Filter records by status"><span className="filter-toolbar-label">Status</span>{['all', 'active', 'inactive'].map((status) => <button type="button" key={status} className={`filter-chip${statusFilter === status ? ' is-active' : ''}`} aria-pressed={statusFilter === status} onClick={() => setStatusFilter(status)}>{status === 'all' ? 'All records' : status[0].toUpperCase() + status.slice(1)}</button>)}<span className="record-count">Showing {visibleRecords.length} of {records.length} on this page</span></div>
        {loading ? <div className="state-message">Loading records...</div> : visibleRecords.length === 0 ? <div className="state-message">{records.length ? 'No records match this status.' : 'No records found.'}</div> : <div className="table-wrap"><table><thead><tr>{(resourceFields[resource] || []).map((field) => <th key={field}>{field}</th>)}<th>Actions</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}>{(resourceFields[resource] || []).map((field) => <td key={field}>{field === 'status' ? <span className={`status-badge is-${String(record[field] || '').toLowerCase()}`}>{record[field] || '-'}</span> : record[field] || '-'}</td>)}<td><div className="row-actions"><button type="button" onClick={() => { setEditingId(record.id); setForm(Object.fromEntries((resourceFields[resource] || []).map((field) => [field, record[field] || '']))); }}>Edit</button><button type="button" onClick={() => remove(record.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}
        <div className="pagination"><button type="button" disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}>Previous</button><span>Page {meta.page} of {meta.totalPages || 1} ({meta.total})</span><button type="button" disabled={meta.page >= meta.totalPages} onClick={() => load(meta.page + 1)}>Next</button></div>
      </section>
    </div>
  );
}

export { CORE_RESOURCES };
