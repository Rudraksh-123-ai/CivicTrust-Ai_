import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dataStore } from './dataStore.js';
import { auditLogger } from '../shared/services/auditLogger.js';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
const databaseFile = path.join(backendDirectory, 'data', 'civictrust.json');
const port = Number(process.env.API_PORT || 3001);
const frontendPort = Number(process.env.FRONTEND_PORT || 3000);
const allowedOrigins = new Set([
  `http://127.0.0.1:${frontendPort}`,
  `http://localhost:${frontendPort}`
]);
const maximumBodySize = 2 * 1024 * 1024;
let saveQueue = Promise.resolve();

function getState() {
  return {
    complaints: dataStore.getAllComplaints(),
    auditEvents: auditLogger.getAllEvents()
  };
}

async function saveState() {
  const save = saveQueue.then(async () => {
    await fs.mkdir(path.dirname(databaseFile), { recursive: true });
    const temporaryFile = `${databaseFile}.${process.pid}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(getState(), null, 2));
    await fs.rename(temporaryFile, databaseFile);
  });
  saveQueue = save.catch(() => {});
  await save;
}

async function loadState() {
  await dataStore.init();
  try {
    const stored = JSON.parse(await fs.readFile(databaseFile, 'utf8'));
    if (!Array.isArray(stored.complaints) || !Array.isArray(stored.auditEvents)) {
      throw new Error('Backend database must contain complaints and auditEvents arrays.');
    }
    dataStore.complaints = stored.complaints;
    auditLogger.loadEvents(stored.auditEvents);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await saveState();
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > maximumBodySize) {
      const error = new Error('Request body exceeds the 2MB limit.');
      error.statusCode = 413;
      throw error;
    }
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

function requireFields(body, fields) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      const error = new Error(`Missing required field: ${field}`);
      error.statusCode = 400;
      throw error;
    }
  }
}

async function handleApi(request, response) {
  const origin = request.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    return sendJson(response, 403, { error: 'Origin is not allowed.' });
  }
  if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    return response.end();
  }

  const url = new URL(request.url, 'http://127.0.0.1');
  const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (segments[0] !== 'api') return sendJson(response, 404, { error: 'Route not found.' });
  const route = segments.slice(1);

  if (request.method === 'GET' && route.join('/') === 'health') {
    return sendJson(response, 200, { status: 'ok' });
  }
  if (request.method === 'GET' && route.join('/') === 'state') {
    return sendJson(response, 200, { state: getState() });
  }
  if (request.method === 'GET' && route.join('/') === 'complaints') {
    return sendJson(response, 200, { complaints: dataStore.getAllComplaints() });
  }
  if (request.method === 'GET' && route.join('/') === 'audit') {
    return sendJson(response, 200, { auditEvents: auditLogger.getAllEvents() });
  }
  if (request.method === 'GET' && route[0] === 'complaints' && route.length === 2) {
    const complaint = dataStore.getComplaintById(route[1]);
    return complaint
      ? sendJson(response, 200, { complaint })
      : sendJson(response, 404, { error: 'Complaint not found.' });
  }

  if (request.method !== 'POST') return sendJson(response, 404, { error: 'Route not found.' });
  const body = await readJson(request);
  let result;

  if (route.join('/') === 'complaints') {
    requireFields(body, ['categoryId', 'description']);
    result = await dataStore.createComplaint(body);
  } else if (route[0] === 'complaints' && route.length === 3 && route[2] === 'assign') {
    requireFields(body, ['departmentId', 'officerName']);
    result = await dataStore.assignOfficer(route[1], body.departmentId, body.officerName, body.actor);
  } else if (route[0] === 'complaints' && route.length === 3 && route[2] === 'status') {
    requireFields(body, ['status']);
    result = await dataStore.updateStatus(route[1], body.status, body.actor, body.notes);
  } else if (route[0] === 'complaints' && route.length === 3 && route[2] === 'resolution') {
    requireFields(body, ['notes', 'verificationResult']);
    result = await dataStore.submitResolution(route[1], body);
  } else if (route[0] === 'complaints' && route.length === 3 && route[2] === 'reopen') {
    requireFields(body, ['reason']);
    result = await dataStore.reopenComplaint(route[1], body.reason, body.citizenPhone);
  } else if (route[0] === 'complaints' && route.length === 3 && route[2] === 'escalate') {
    result = await dataStore.escalateComplaint(route[1], body.reason, body.actor);
  } else if (route.join('/') === 'duplicates/resolve') {
    requireFields(body, ['candidateId', 'originalId']);
    result = await dataStore.resolveDuplicate(
      body.candidateId,
      body.originalId,
      body.action,
      body.reviewer
    );
  } else if (route.join('/') === 'reset') {
    await dataStore.resetToSeed();
    result = { success: true };
  } else {
    return sendJson(response, 404, { error: 'Route not found.' });
  }

  await saveState();
  return sendJson(response, 200, { result, state: getState() });
}

await loadState();
const server = http.createServer((request, response) => {
  handleApi(request, response).catch(error => {
    const statusCode = error.statusCode || (error.message.includes('not found') ? 404 : 500);
    if (statusCode === 500) console.error('Backend request failed:', error);
    if (!response.headersSent) sendJson(response, statusCode, { error: error.message });
    else response.destroy(error);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`CivicTrust API running at http://127.0.0.1:${port}/api`);
});
