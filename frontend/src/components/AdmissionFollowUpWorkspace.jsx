import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient.js';
import ActionMenu from './ActionMenu.jsx';

const followStatuses = ['new', 'contacted', 'interested', 'follow-up-required', 'converted', 'lost'];

function statusLabel(status) {
  return status.replaceAll('-', ' ');
}

function followUpDraftFor(lead) {
  return {
    followStatus: lead.followStatus || 'new',
    nextFollowUpDate: lead.nextFollowUpDate || '',
    followUpNotes: lead.followUpNotes || '',
  };
}

export default function AdmissionFollowUpWorkspace() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [followUpDraft, setFollowUpDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    if (!selectedLeadId) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedLeadId(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedLeadId]);

  const visibleLeads = useMemo(
    () => statusFilter === 'all' ? leads : leads.filter((lead) => (lead.followStatus || 'new') === statusFilter),
    [leads, statusFilter],
  );
  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId),
    [leads, selectedLeadId],
  );

  const openFollowUp = (lead) => {
    setError('');
    setMessage('');
    setFollowUpDraft(followUpDraftFor(lead));
    setSelectedLeadId(lead.id);
  };

  const updateFollowUpStatus = async (status) => {
    if (!selectedLead) return;
    setSavingId(selectedLead.id);
    setError('');
    setMessage('');
    try {
      const changes = status === 'converted'
        ? { followStatus: status, applicationStatus: 'submitted' }
        : { followStatus: status };
      const { data } = await axiosClient.patch(`/admission-enquiries/${selectedLead.id}`, changes);
      setLeads((currentLeads) => currentLeads.map((lead) => lead.id === selectedLead.id ? data.data : lead));
      setFollowUpDraft((currentDraft) => ({ ...currentDraft, followStatus: data.data.followStatus || status }));
      setMessage('Follow-up status updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update follow-up status');
    } finally {
      setSavingId(null);
    }
  };

  const saveFollowUp = async (event) => {
    event.preventDefault();
    if (!selectedLead || !followUpDraft) return;
    setSavingId(selectedLead.id);
    setError('');
    setMessage('');
    try {
      const { data } = await axiosClient.patch(`/admission-enquiries/${selectedLead.id}`, followUpDraft);
      setLeads((currentLeads) => currentLeads.map((lead) => lead.id === selectedLead.id ? data.data : lead));
      setFollowUpDraft(followUpDraftFor(data.data));
      setMessage('Follow-up details saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save follow-up details');
    } finally {
      setSavingId(null);
    }
  };

  return <div className="follow-up-workspace">
    <section className="resource-list-panel follow-up-panel">
      <div className="panel-heading follow-up-heading">
        <div>
          <span className="eyebrow">Lead pipeline</span>
          <h2>Admission Enquiry Follow-up</h2>
          <p>Review enquiries and mark the next follow-up.</p>
        </div>
        <form className="search-form" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <input aria-label="Search leads" placeholder="Search leads" value={search} onChange={(event) => setSearch(event.target.value)} />
          <button className="secondary-button" type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        </form>
      </div>

      <div className="follow-up-toolbar">
        <div className="follow-up-status-filters" aria-label="Filter enquiries by follow-up status">
          <button className={statusFilter === 'all' ? 'is-active' : ''} type="button" onClick={() => setStatusFilter('all')}>All enquiries <span>{leads.length}</span></button>
          {followStatuses.map((status) => {
            const count = leads.filter((lead) => (lead.followStatus || 'new') === status).length;
            return <button className={statusFilter === status ? 'is-active' : ''} type="button" key={status} onClick={() => setStatusFilter(status)}>{statusLabel(status)} <span>{count}</span></button>;
          })}
        </div>
        <span className="follow-up-result-count">{visibleLeads.length} {visibleLeads.length === 1 ? 'enquiry' : 'enquiries'}</span>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}
      {message && <div className="form-success" role="status">{message}</div>}
      {loading ? <div className="state-message">Loading admission enquiries...</div> : leads.length === 0 ? <div className="state-message">No admission enquiries found.</div> : visibleLeads.length === 0 ? <div className="state-message">No enquiries match this status.</div> : <div className="table-wrap follow-up-table-wrap">
        <table className="follow-up-table">
          <thead><tr><th>#</th><th>Applicant / parent</th><th>Contact</th><th>Class</th><th>Source</th><th>Follow-up status</th><th>Next follow-up</th><th>Action</th></tr></thead>
          <tbody>{visibleLeads.map((lead, index) => {
            const status = lead.followStatus || 'new';
            return <tr key={lead.id}>
              <td className="follow-up-row-number">{String(index + 1).padStart(2, '0')}</td>
              <td><div className="follow-up-table-applicant"><span className="lead-avatar" aria-hidden="true">{(lead.name || '?').trim().charAt(0).toUpperCase()}</span><div><strong>{lead.name || 'Unnamed enquiry'}</strong><span>{lead.parentName || 'Parent / guardian not listed'}</span></div></div></td>
              <td><div className="follow-up-table-contact"><strong>{lead.phone || '-'}</strong><span>{lead.email || '-'}</span></div></td>
              <td>{lead.className || '-'}</td>
              <td>{lead.source || '-'}</td>
              <td><span className={`follow-up-status-badge status-${status}`}>{statusLabel(status)}</span></td>
              <td>{lead.nextFollowUpDate || <span className="follow-up-unscheduled">Not scheduled</span>}</td>
              <td><ActionMenu label={lead.name || 'enquiry'} actions={[{ label: 'Mark follow-up', icon: 'followup', onSelect: () => openFollowUp(lead) }]} /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
    </section>

    {selectedLead && followUpDraft && <>
      <button className="follow-up-drawer-backdrop" type="button" aria-label="Close follow-up panel" onClick={() => setSelectedLeadId(null)} />
      <aside className="follow-up-drawer" role="dialog" aria-modal="true" aria-labelledby="follow-up-drawer-title">
        <div className="follow-up-drawer-header">
          <div><span className="eyebrow">Admission follow-up</span><h2 id="follow-up-drawer-title">Mark follow-up</h2></div>
          <button className="follow-up-drawer-close" type="button" aria-label="Close" onClick={() => setSelectedLeadId(null)}>×</button>
        </div>
        <div className="follow-up-drawer-content">
          {error && <div className="form-error" role="alert">{error}</div>}
          {message && <div className="form-success" role="status">{message}</div>}
          <section className="follow-up-profile">
            <div className="follow-up-profile-heading"><span className="lead-avatar" aria-hidden="true">{(selectedLead.name || '?').trim().charAt(0).toUpperCase()}</span><div><h3>{selectedLead.name || 'Unnamed enquiry'}</h3><span>{selectedLead.className || 'Class not specified'}</span></div></div>
            <dl className="follow-up-profile-details">
              <div><dt>Parent / guardian</dt><dd>{selectedLead.parentName || '-'}</dd></div>
              <div><dt>Phone</dt><dd>{selectedLead.phone || '-'}</dd></div>
              <div><dt>Email</dt><dd>{selectedLead.email || '-'}</dd></div>
              <div><dt>Enquiry source</dt><dd>{selectedLead.source || '-'}</dd></div>
            </dl>
          </section>
          <form id="follow-up-mark-form" className="follow-up-mark-form" onSubmit={saveFollowUp}>
            <fieldset className="follow-up-stage-fieldset">
              <legend>Follow-up status</legend>
              <div className="follow-up-stage-list">{followStatuses.map((status) => <button className={followUpDraft.followStatus === status ? 'is-active' : ''} type="button" key={status} aria-pressed={followUpDraft.followStatus === status} disabled={savingId === selectedLead.id} onClick={() => updateFollowUpStatus(status)}>{statusLabel(status)}</button>)}</div>
            </fieldset>
            <label className="follow-up-drawer-field">Next follow-up date<input type="date" value={followUpDraft.nextFollowUpDate} onChange={(event) => setFollowUpDraft({ ...followUpDraft, nextFollowUpDate: event.target.value })} /></label>
            <label className="follow-up-drawer-field">Follow-up notes<textarea rows="5" placeholder="Add a note about this conversation" value={followUpDraft.followUpNotes} onChange={(event) => setFollowUpDraft({ ...followUpDraft, followUpNotes: event.target.value })} /></label>
          </form>
        </div>
        <div className="follow-up-drawer-footer">
          <button className="secondary-button" type="button" onClick={() => setSelectedLeadId(null)}>Close</button>
          <button className="primary-button" type="submit" form="follow-up-mark-form" disabled={savingId === selectedLead.id}>{savingId === selectedLead.id ? 'Saving...' : 'Save follow-up'}</button>
        </div>
      </aside>
    </>}
  </div>;
}
