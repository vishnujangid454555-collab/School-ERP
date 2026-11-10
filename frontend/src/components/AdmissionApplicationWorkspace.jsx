import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient.js';
import ActionMenu from './ActionMenu.jsx';

const documentOptions = [
  'Birth certificate',
  'Previous report card',
  'Transfer certificate',
  'Passport photo',
];

const applicationStatuses = ['submitted', 'under-review', 'verified', 'admitted', 'waitlisted', 'rejected'];

const emptyApplication = {
  name: '',
  parentName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  className: '',
  previousSchool: '',
  address: '',
  source: 'application-form',
  applicationStatus: 'submitted',
  documentsReceived: [],
};

function applicationFormFor(application) {
  return {
    ...emptyApplication,
    ...application,
    applicationStatus: application?.applicationStatus || 'submitted',
    documentsReceived: Array.isArray(application?.documentsReceived) ? application.documentsReceived : [],
  };
}

function displayStatus(status) {
  return (status || 'submitted').replaceAll('-', ' ');
}

function processFormFor(application) {
  return {
    applicationStatus: application?.applicationStatus || 'under-review',
    admissionNumber: application?.admissionNumber || '',
    admissionDate: application?.admissionDate || '',
    verificationNotes: application?.verificationNotes || '',
  };
}

function ApplicationForm() {
  const [form, setForm] = useState(emptyApplication);
  const [classes, setClasses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const selectedIdRef = useRef('');
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadApplications = useCallback(async () => {
    setLoadingApplications(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/admission-enquiries', { params: { page: 1, limit: 100 } });
      const records = data.data.records.filter((record) => record.applicationStatus || record.followStatus === 'converted');
      const currentSelection = records.find((record) => record.id === selectedIdRef.current);
      const nextSelection = currentSelection || records.find((record) => record.followStatus === 'converted') || null;
      setApplications(records);
      selectedIdRef.current = nextSelection?.id || '';
      setSelectedId(nextSelection?.id || '');
      setEditingId(nextSelection?.id || null);
      if (nextSelection) setForm(applicationFormFor(nextSelection));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load admission applications');
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    axiosClient.get('/classes', { params: { page: 1, limit: 100 } })
      .then(({ data }) => { if (active) setClasses(data.data.records); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load classes');
      });
    const request = window.setTimeout(loadApplications, 0);
    return () => { active = false; window.clearTimeout(request); };
  }, [loadApplications]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const selectApplication = (application) => {
    selectedIdRef.current = application.id;
    setSelectedId(application.id);
    setEditingId(application.id);
    setForm(applicationFormFor(application));
    setError('');
    setMessage('');
  };

  const startNewApplication = () => {
    selectedIdRef.current = '';
    setSelectedId('');
    setEditingId(null);
    setForm(emptyApplication);
    setError('');
    setMessage('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = editingId
        ? await axiosClient.patch(`/admission-enquiries/${editingId}`, form)
        : await axiosClient.post('/admission-enquiries', form);
      const savedApplication = response.data.data;
      setApplications((records) => {
        const exists = records.some((record) => record.id === savedApplication.id);
        return exists
          ? records.map((record) => record.id === savedApplication.id ? savedApplication : record)
          : [savedApplication, ...records];
      });
      selectedIdRef.current = savedApplication.id;
      setSelectedId(savedApplication.id);
      setEditingId(savedApplication.id);
      setForm(applicationFormFor(savedApplication));
      setMessage(editingId ? 'Admission application updated successfully.' : 'Admission application submitted successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit admission application');
    } finally {
      setSaving(false);
    }
  };

  return <div className="admission-workspace">
    <section className="resource-form-panel">
      <div className="panel-heading admission-application-heading"><div><span className="eyebrow">Admission application</span><h2>{editingId ? 'Complete converted enquiry' : 'Student and guardian details'}</h2><p>{editingId ? 'Enquiry details are prefilled. Complete the remaining application details and save.' : 'Enter the student and guardian details to create a new application.'}</p></div><div className="admission-application-actions">{applications.length > 0 && <label className="admission-application-picker">Select application<select value={selectedId} onChange={(event) => { const selected = applications.find((application) => application.id === event.target.value); if (selected) selectApplication(selected); else startNewApplication(); }}><option value="">New application</option>{applications.map((application) => <option value={application.id} key={application.id}>{application.name} — {application.className || 'Class not set'}</option>)}</select></label>}<button className="secondary-button" type="button" onClick={startNewApplication}>New application</button></div></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {message && <div className="form-success" role="status">{message}</div>}
      <form className="admission-form" onSubmit={submit}>
        <div className="admission-form-section">
          <h3>Student information</h3>
          <div className="admission-form-grid">
            <label className="form-field">Student full name<input required maxLength="160" value={form.name} onChange={(event) => setField('name', event.target.value)} /></label>
            <label className="form-field">Date of birth<input type="date" value={form.dateOfBirth} onChange={(event) => setField('dateOfBirth', event.target.value)} /></label>
            <label className="form-field">Gender<select value={form.gender} onChange={(event) => setField('gender', event.target.value)}><option value="">Select gender</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
            <label className="form-field">Class applying for<select required value={form.className} onChange={(event) => setField('className', event.target.value)}><option value="">Select class</option>{classes.map((classRecord) => <option value={classRecord.name} key={classRecord.id}>{classRecord.name}</option>)}</select></label>
            <label className="form-field">Previous school<input value={form.previousSchool} onChange={(event) => setField('previousSchool', event.target.value)} /></label>
          </div>
        </div>
        <div className="admission-form-section">
          <h3>Parent / guardian details</h3>
          <div className="admission-form-grid">
            <label className="form-field">Parent / guardian name<input required value={form.parentName} onChange={(event) => setField('parentName', event.target.value)} /></label>
            <label className="form-field">Phone number<input required type="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} /></label>
            <label className="form-field">Email address<input type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} /></label>
            <label className="form-field admission-address-field">Address<textarea rows="3" value={form.address} onChange={(event) => setField('address', event.target.value)} /></label>
          </div>
        </div>
        <fieldset className="admission-documents">
          <legend>Documents received</legend>
          <div className="admission-document-options">{documentOptions.map((document) => <label key={document}><input type="checkbox" checked={form.documentsReceived.includes(document)} onChange={(event) => setField('documentsReceived', event.target.checked ? [...form.documentsReceived, document] : form.documentsReceived.filter((entry) => entry !== document))} />{document}</label>)}</div>
        </fieldset>
        <div className="admission-form-footer"><p>Required: student name, class, parent / guardian name and phone number.</p><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save application' : 'Submit application'}</button></div>
      </form>
    </section>
    <section className="resource-list-panel admission-application-list">
      <div className="panel-heading"><div><span className="eyebrow">Admission records</span><h2>Applications</h2><p>Converted enquiries and submitted applications appear here.</p></div><button className="secondary-button" type="button" onClick={loadApplications} disabled={loadingApplications}>{loadingApplications ? 'Refreshing...' : 'Refresh list'}</button></div>
      {loadingApplications ? <div className="state-message">Loading applications...</div> : applications.length === 0 ? <div className="state-message">No applications yet. Mark an enquiry as converted or submit a new application to see it here.</div> : <div className="table-wrap"><table className="admission-application-table"><thead><tr><th>Applicant</th><th>Parent / guardian</th><th>Phone</th><th>Class</th><th>Application status</th><th>Action</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td><strong>{application.name || '-'}</strong></td><td>{application.parentName || '-'}</td><td>{application.phone || '-'}</td><td>{application.className || '-'}</td><td><span className={`follow-up-status-badge status-${application.followStatus || application.applicationStatus || 'submitted'}`}>{displayStatus(application.followStatus === 'converted' ? 'converted' : application.applicationStatus)}</span></td><td><ActionMenu label={application.name || 'application'} actions={[{ label: 'Complete application', icon: 'complete', onSelect: () => { selectApplication(application); document.querySelector('.admission-application-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }]} /></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}

function AdmissionProcessForm() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const selectedIdRef = useRef('');
  const [form, setForm] = useState({ applicationStatus: 'under-review', admissionNumber: '', admissionDate: '', verificationNotes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/admission-enquiries', { params: { page: 1, limit: 100 } });
      const records = data.data.records.filter((record) => record.applicationStatus);
      const currentSelection = records.find((record) => record.id === selectedIdRef.current);
      const nextSelection = currentSelection || records[0];
      setApplications(records);
      selectedIdRef.current = nextSelection?.id || '';
      setSelectedId(nextSelection?.id || '');
      if (nextSelection) setForm(processFormFor(nextSelection));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(load, 0);
    return () => window.clearTimeout(request);
  }, [load]);

  const selectedApplication = useMemo(() => applications.find((record) => record.id === selectedId), [applications, selectedId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedApplication) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await axiosClient.patch(`/admission-enquiries/${selectedApplication.id}`, form);
      setApplications((records) => records.map((record) => record.id === selectedApplication.id ? data.data : record));
      setMessage('Admission process details saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save admission process details');
    } finally {
      setSaving(false);
    }
  };

  return <div className="admission-workspace">
    <section className="resource-form-panel">
      <div className="panel-heading"><div><span className="eyebrow">Application workflow</span><h2>Review and update an application</h2></div></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {message && <div className="form-success" role="status">{message}</div>}
      {loading ? <div className="state-message">Loading applications...</div> : applications.length === 0 ? <div className="state-message">No applications to process yet. Submit an admission application to begin verification.</div> : <form className="admission-process-form" onSubmit={submit}>
        <label className="form-field">Applicant<select required value={selectedId} onChange={(event) => {
          const application = applications.find((record) => record.id === event.target.value);
          selectedIdRef.current = event.target.value;
          setSelectedId(event.target.value);
          setForm(processFormFor(application));
          setMessage('');
        }}>{applications.map((application) => <option value={application.id} key={application.id}>{application.name} — {application.className}</option>)}</select></label>
        <div className="admission-applicant-summary"><strong>{selectedApplication?.parentName || 'Parent / guardian not provided'}</strong><span>{selectedApplication?.phone || 'No phone number'}</span><span>Documents received: {selectedApplication?.documentsReceived?.length || 0}</span></div>
        <div className="admission-form-grid">
          <label className="form-field">Application stage<select required value={form.applicationStatus} onChange={(event) => setForm({ ...form, applicationStatus: event.target.value })}>{applicationStatuses.map((status) => <option value={status} key={status}>{displayStatus(status)}</option>)}</select></label>
          <label className="form-field">Admission number<input value={form.admissionNumber} onChange={(event) => setForm({ ...form, admissionNumber: event.target.value })} /></label>
          <label className="form-field">Admission date<input type="date" value={form.admissionDate} onChange={(event) => setForm({ ...form, admissionDate: event.target.value })} /></label>
          <label className="form-field admission-address-field">Verification / process notes<textarea rows="3" value={form.verificationNotes} onChange={(event) => setForm({ ...form, verificationNotes: event.target.value })} /></label>
        </div>
        <div className="admission-form-footer"><p>Update verification stage, admission details and any missing-document notes.</p><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save process details'}</button></div>
      </form>}
    </section>
    <section className="resource-list-panel">
      <div className="panel-heading"><div><span className="eyebrow">Current pipeline</span><h2>Applications</h2></div><button className="secondary-button" type="button" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button></div>
      {applications.length > 0 && <div className="table-wrap"><table><thead><tr><th>Applicant</th><th>Class</th><th>Parent / guardian</th><th>Phone</th><th>Stage</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td>{application.name}</td><td>{application.className || '-'}</td><td>{application.parentName || '-'}</td><td>{application.phone || '-'}</td><td className="status-capitalize">{displayStatus(application.applicationStatus)}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}

function ApplicationVerificationForm() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const selectedIdRef = useRef('');
  const [form, setForm] = useState({ verificationStatus: 'pending', documentsVerified: [], documentVerificationNotes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/admission-enquiries', { params: { page: 1, limit: 100 } });
      const records = data.data.records.filter((record) => record.applicationStatus);
      const nextSelection = records.find((record) => record.id === selectedIdRef.current) || records[0];
      setApplications(records);
      selectedIdRef.current = nextSelection?.id || '';
      setSelectedId(nextSelection?.id || '');
      if (nextSelection) {
        setForm({
          verificationStatus: nextSelection.verificationStatus || 'pending',
          documentsVerified: nextSelection.documentsVerified || [],
          documentVerificationNotes: nextSelection.documentVerificationNotes || '',
        });
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(load, 0);
    return () => window.clearTimeout(request);
  }, [load]);

  const selectedApplication = useMemo(() => applications.find((record) => record.id === selectedId), [applications, selectedId]);
  const documentsReceived = selectedApplication?.documentsReceived || [];
  const toggleVerifiedDocument = (document, checked) => setForm((current) => ({
    ...current,
    documentsVerified: checked
      ? [...current.documentsVerified, document]
      : current.documentsVerified.filter((entry) => entry !== document),
  }));

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedApplication) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await axiosClient.patch(`/admission-enquiries/${selectedApplication.id}`, form);
      setApplications((records) => records.map((record) => record.id === selectedApplication.id ? data.data : record));
      setMessage('Application verification saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save application verification');
    } finally {
      setSaving(false);
    }
  };

  return <div className="admission-workspace">
    <section className="resource-form-panel">
      <div className="panel-heading"><div><span className="eyebrow">Document review</span><h2>Verify applicant documents</h2></div><button className="secondary-button" type="button" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh applications'}</button></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {message && <div className="form-success" role="status">{message}</div>}
      {loading ? <div className="state-message">Loading applications...</div> : applications.length === 0 ? <div className="state-message">No applications to verify. Submit an admission application to begin document review.</div> : <form className="admission-process-form" onSubmit={submit}>
        <label className="form-field">Applicant<select required value={selectedId} onChange={(event) => {
          const application = applications.find((record) => record.id === event.target.value);
          selectedIdRef.current = event.target.value;
          setSelectedId(event.target.value);
          setForm({
            verificationStatus: application?.verificationStatus || 'pending',
            documentsVerified: application?.documentsVerified || [],
            documentVerificationNotes: application?.documentVerificationNotes || '',
          });
          setMessage('');
        }}>{applications.map((application) => <option value={application.id} key={application.id}>{application.name} — {application.className}</option>)}</select></label>
        <div className="admission-applicant-summary"><strong>{selectedApplication?.parentName || 'Parent / guardian not provided'}</strong><span>{selectedApplication?.phone || 'No phone number'}</span><span>{selectedApplication?.className || 'Class not specified'}</span></div>
        <fieldset className="admission-verification-documents">
          <legend>Required document checklist</legend>
          <div className="admission-verification-list">
            {documentOptions.map((document) => {
              const received = documentsReceived.includes(document);
              return <div className="admission-verification-row" key={document}>
                <span>{document}</span>
                <span className={received ? 'document-received' : 'document-missing'}>{received ? 'Received' : 'Not received'}</span>
                <label><input type="checkbox" disabled={!received} checked={form.documentsVerified.includes(document)} onChange={(event) => toggleVerifiedDocument(document, event.target.checked)} /> Verified</label>
              </div>;
            })}
          </div>
        </fieldset>
        <div className="admission-form-grid">
          <label className="form-field">Verification result<select required value={form.verificationStatus} onChange={(event) => setForm({ ...form, verificationStatus: event.target.value })}><option value="pending">Pending review</option><option value="incomplete">Incomplete — follow-up required</option><option value="verified">Verified</option></select></label>
          <label className="form-field admission-address-field">Verification notes<textarea rows="3" placeholder="Record missing documents or corrections required" value={form.documentVerificationNotes} onChange={(event) => setForm({ ...form, documentVerificationNotes: event.target.value })} /></label>
        </div>
        <div className="admission-form-footer"><p>Only documents marked as received can be checked as verified. Save the review to update this application.</p><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save verification'}</button></div>
      </form>}
    </section>
  </div>;
}

export { ApplicationForm, ApplicationVerificationForm, AdmissionProcessForm };
