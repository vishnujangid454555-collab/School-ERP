import { sendSuccess } from '../utils/ApiResponse.js';
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '../services/resource.service.js';

export async function list(req, res) { return sendSuccess(res, await listRecords(req.resource.collection, req.query)); }
export async function get(req, res) { return sendSuccess(res, await getRecord(req.resource.collection, req.params.id)); }
export async function create(req, res) { return sendSuccess(res, await createRecord(req.resource.collection, req.body, req.auth.sub), 'Record created', 201); }
export async function update(req, res) { return sendSuccess(res, await updateRecord(req.resource.collection, req.params.id, req.body, req.auth.sub), 'Record updated'); }
export async function remove(req, res) { await deleteRecord(req.resource.collection, req.params.id); return sendSuccess(res, null, 'Record deleted'); }
