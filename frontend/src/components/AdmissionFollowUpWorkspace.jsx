import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient.js';

const followStatuses = ['new', 'contacted', 'interested', 'follow-up-required', 'converted', 'lost'];
const pipelineFilters = [
  { key: 'all', label: 'All leads', matches: () => true },
  { key: 'open', label: 'Open', matches: (status) => !['converted', 'lost'].includes(status) },
  { key: 'follow-up-required', label: 'Follow-up required', matches: (status) => status === 'follow-up-required' },
  { key: 'converted', label: 'Converted', matches: (status) => status === 'converted' },
  { key: 'lost', label: 'Lost', matches: (status) => status === 'lost' },
];

export default function AdmissionFollowUpWorkspace() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const visibleLeads = leads.filter((lead) => pipelineFilters.find((filter) => filter.key === pipelineFilter).matches(lead.followStatus || 'new'));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/admission-enquiries', { params: { search, page: 1, limit: 100 } });
      setLeads(data.data.records);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load admission enquiries');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const request = window.setTimeout(load, 0);
    return () => window.clearTimeout(request);
  }, [load]);

  const updateLead = async (lead, changes) => {
    setSavingId(lead.id);
    setError('');
    setMessage('');
    try {
      const { data } = await axiosClient.patch(`/admission-enquiries/${lead.id}`, changes);
      setLeads((currentLeads) => currentLeads.map((currentLead) => currentLead.id === lead.id ? data.data : currentLead));
      setMessage('Follow-up details saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save follow-up details');
    } finally {
      setSavingId(null);
    }
  };

  return <div className="follow-up-workspace">
    <section className="resource-list-panel">
      <div className="panel-heading"><div><span className="eyebrow">Lead pipeline</span><h2>Admission Enquiry Follow-up</h2></div><form className="search-form" onSubmit={(event) => { event.preventDefault(); load(); }}><input placeholder="Search leads" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="secondary-button" type="submit">Search</button></form></div>
      <div className="filter-toolbar" aria-label="Filter admission leads">{pipelineFilters.map((filter) => <button type="button" key={filter.key} className={`filter-chip${pipelineFilter === filter.key ? ' is-active' : ''}`} aria-pressed={pipelineFilter === filter.key} onClick={() => setPipelineFilter(filter.key)}>{filter.label}<span className="filter-count">{leads.filter((lead) => filter.matches(lead.followStatus || 'new')).length}</span></button>)}<span className="record-count">{visibleLeads.length} leads</span></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {message && <div className="form-success" role="status">{message}</div>}
      {loading ? <div className="state-message">Loading admission enquiries...</div> : visibleLeads.length === 0 ? <div className="state-message">{leads.length ? 'No leads match this pipeline filter.' : 'No admission enquiries found.'}</div> : <div className="table-wrap"><table className="follow-up-table"><thead><tr><th>Name</th><th>Parent Name</th><th>Phone</th><th>Email</th><th>Class Name</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleLeads.map((lead) => <tr key={lead.id}>
        <td>{lead.name || '-'}</td>
        <td>{lead.parentName || '-'}</td>
        <td>{lead.phone || '-'}</td>
        <td>{lead.email || '-'}</td>
        <td>{lead.className || '-'}</td>
        <td>{lead.source || '-'}</td>
        <td><select className={`follow-up-status-select status-badge is-${lead.followStatus || 'new'}`} value={lead.followStatus || 'new'} onChange={(event) => updateLead(lead, { followStatus: event.target.value })}>{followStatuses.map((status) => <option value={status} key={status}>{status.replaceAll('-', ' ')}</option>)}</select></td>
        <td><div className="follow-up-actions"><label>Next follow-up<input type="date" value={lead.nextFollowUpDate || ''} onChange={(event) => updateLead(lead, { nextFollowUpDate: event.target.value })} /></label><label>Notes<textarea defaultValue={lead.followUpNotes || ''} placeholder="Add a note" onBlur={(event) => { if (event.target.value !== (lead.followUpNotes || '')) updateLead(lead, { followUpNotes: event.target.value }); }} /></label>{savingId === lead.id && <span className="follow-up-saving">Saving...</span>}</div></td>
      </tr>)}</tbody></table></div>}
    </section>
  </div>;
}
