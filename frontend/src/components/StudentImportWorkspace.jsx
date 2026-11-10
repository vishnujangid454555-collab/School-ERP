import { useState } from 'react';
import Papa from 'papaparse';
import axiosClient from '../api/axiosClient.js';

const columns = ['name', 'code', 'email', 'className', 'sectionName', 'status'];

export default function StudentImportWorkspace() {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const readFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name); setError(''); setResult(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: ({ data, errors }) => {
        if (errors.length) { setError('The CSV could not be read. Check its headers and formatting.'); return; }
        const parsed = data.map((row) => Object.fromEntries(columns.map((column) => [column, String(row[column] || '').trim()]))).filter((row) => row.name);
        if (!parsed.length) { setError('The CSV must contain at least one row with a name.'); return; }
        setRows(parsed);
      },
      error: () => setError('Unable to read the selected file.'),
    });
  };

  const submit = async () => {
    setSaving(true); setError(''); setResult(null);
    try { const { data } = await axiosClient.post('/students/import', { rows }); setResult(data.data); setRows([]); setFileName(''); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Student import failed'); }
    finally { setSaving(false); }
  };

  return <div className="import-workspace"><section className="resource-form-panel"><div className="panel-heading"><div><span className="eyebrow">Bulk operation</span><h2>Import students</h2></div><button className="primary-button" type="button" disabled={saving || !rows.length} onClick={submit}>{saving ? 'Importing...' : `Import ${rows.length || ''} students`}</button></div><p className="import-help">CSV columns: name, code, email, className, sectionName, status. Existing student codes are rejected instead of overwritten.</p>{error && <div className="form-error" role="alert">{error}</div>}{result && <div className="form-success" role="status">Imported {result.imported} students; skipped {result.skipped}.</div>}<label className="file-picker">Choose CSV file<input type="file" accept=".csv,text/csv" onChange={readFile} /></label>{fileName && <div className="file-name">{fileName}</div>}</section>{rows.length > 0 && <section className="resource-list-panel"><div className="panel-heading"><div><span className="eyebrow">Preview</span><h2>{rows.length} rows ready</h2></div></div><div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.slice(0, 20).map((row, index) => <tr key={`${row.code}-${index}`}>{columns.map((column) => <td key={column}>{row[column] || '-'}</td>)}</tr>)}</tbody></table></div>{rows.length > 20 && <div className="state-message">Showing the first 20 rows in preview.</div>}</section>}</div>;
}
