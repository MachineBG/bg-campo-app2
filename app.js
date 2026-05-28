// ═══════════════════════════════════════════════════════════════
// BG CAMPO PWA — app.js
// Conecta ao CRM BG Service (Railway) via cookie crm_session
// Offline-first com IndexedDB + sync automático
// ═══════════════════════════════════════════════════════════════

// ── CONFIG ────────────────────────────────────────────────────
const API = 'https://crm.bgservice.com.br'; // domínio customizado (principal)
// fallback: https://bg-crm-prospection-production.up.railway.app
const TRPC = `${API}/api/trpc`;
const ENDPOINTS = {
  login: `${API}/api/crm-auth/login`,
  logout: `${API}/api/crm-auth/logout`,
  me: `${API}/api/crm-auth/me`,
  submitRelatorio: `${API}/api/campo/submit-relatorio`,
  submitRelatorioDireto: `${API}/api/campo/submit-relatorio-direto`,
};

// ── ICONS ─────────────────────────────────────────────────────
const IC = {
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  orders:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 12h6M9 16h6"/></svg>`,
  reports:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  car:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-3M7 17a2 2 0 100 4 2 2 0 000-4zM17 17a2 2 0 100 4 2 2 0 000-4z"/></svg>`,
  user:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  sync:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
  back:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>`,
  plus:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>`,
  camera:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  pin:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  wrench:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  pen:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  check:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle:`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  send:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  nav:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
  flag:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  logout:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  cal:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  timer:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3L2 6M22 6l-3-3"/></svg>`,
  chev:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
  warn:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>`,
};

// ── LABELS ────────────────────────────────────────────────────
const STATUS_BADGE = {agendada:'b-blue',em_andamento:'b-orange',concluida:'b-green',cancelada:'b-gray',pendente_peca:'b-yellow'};
const STATUS_LBL = {agendada:'Agendada',em_andamento:'Em Andamento',concluida:'Concluída',cancelada:'Cancelada',pendente_peca:'Pend. Peça'};
const TIPO_LBL = {corretiva:'Corretiva',preventiva:'Preventiva',inspecao:'Inspeção',checklist_entrada:'Checklist Entrada',checklist_saida:'Checklist Saída',instalacao:'Instalação',garantia:'Garantia'};

// ── STATE ─────────────────────────────────────────────────────
const S = {
  authToken: null,
  user: null,
  tab: 'home',
  // Data cache (atualizado do servidor)
  ordens: [],
  relatorios: [],
  templates: [],
  diaAtual: null,
  historico: [],
  // UI state
  selectedOrdemId: null,
  showNovoRelatorio: false,
  relatorioStep: 1,
  relatorioTemplateId: null,
  activeRelatorioOsId: null,
  // Offline queue
  syncQueue: [],
  isOnline: navigator.onLine,
  isSyncing: false,
  // Form state (relatório)
  relServicos: [{descricao:'', concluido:false}],
  relPecas: [],
  relFotos: [],
  relDados: {},
  relSigCli: '',
  relSigTec: '',
};

// ── INDEXEDDB ─────────────────────────────────────────────────
let db;
const DB_NAME = 'bg-campo-v1';
const DB_VERSION = 1;

async function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache', {keyPath:'key'});
      if (!db.objectStoreNames.contains('queue')) db.createObjectStore('queue', {keyPath:'id', autoIncrement:true});
    };
    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result?.value ?? req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(store, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(store === 'cache' ? {key, value} : {id: key, ...value});
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbPutAuto(store, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(value);
    req.onsuccess = () => resolve(req.result); // returns generated id
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── CACHE HELPERS ─────────────────────────────────────────────
async function saveCache(key, value) {
  await dbPut('cache', key, value);
  // Backup token in localStorage for iOS PWA (IndexedDB resets on reinstall)
  if (key === 'authToken' || key === 'user') {
    try { localStorage.setItem('bgcampo_'+key, JSON.stringify(value)); } catch(e) {}
  }
}
async function loadCache(key) {
  let val = await dbGet('cache', key);
  // Fallback to localStorage if IndexedDB lost data (iOS reinstall)
  if ((val === undefined || val === null) && (key === 'authToken' || key === 'user')) {
    try {
      const ls = localStorage.getItem('bgcampo_'+key);
      if (ls) { val = JSON.parse(ls); await dbPut('cache', key, val); }
    } catch(e) {}
  }
  return val;
}

// ── OFFLINE QUEUE ─────────────────────────────────────────────
async function queueAction(action, payload) {
  const id = await dbPutAuto('queue', { action, payload, ts: Date.now() });
  S.syncQueue.push({ id, action, payload });
  updateOfflineUI();
  return id;
}

async function loadQueue() {
  S.syncQueue = await dbGetAll('queue');
  updateOfflineUI();
}

async function processQueue() {
  if (!S.isOnline || S.isSyncing || S.syncQueue.length === 0) return;
  S.isSyncing = true;
  showSyncBadge(true);

  const items = [...S.syncQueue];
  for (const item of items) {
    try {
      await executeQueuedAction(item);
      await dbDelete('queue', item.id);
      S.syncQueue = S.syncQueue.filter(x => x.id !== item.id);
    } catch (e) {
      console.error('Queue item failed:', e);
    }
  }

  S.isSyncing = false;
  showSyncBadge(false);
  updateOfflineUI();

  // Recarregar dados após sync
  if (S.user) await loadServerData();
  render();
}

async function executeQueuedAction(item) {
  const {action, payload} = item;
  if (action === 'iniciarOrdem') {
    await trpcMutation('campo.mobile.iniciarOrdem', {id: payload.id});
  } else if (action === 'submitRelatorio') {
    await fetch(ENDPOINTS.submitRelatorio, {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    }).then(r => r.json());
  } else if (action === 'submitRelatorioDireto') {
    await fetch(ENDPOINTS.submitRelatorioDireto, {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    }).then(r => r.json());
  } else if (action === 'checkin') {
    await trpcMutation('campo.visitaComercial.checkin', payload);
  } else if (action === 'iniciarDia') {
    await trpcMutation('campo.visitaComercial.iniciarDia', payload);
  } else if (action === 'encerrarDia') {
    await trpcMutation('campo.visitaComercial.encerrarDia', payload);
  }
}

// ── TRPC CLIENT ───────────────────────────────────────────────
async function trpcQuery(procedure, input) {
  const url = `${TRPC}/${procedure}?input=${encodeURIComponent(JSON.stringify({json: input ?? {}}))}`;
  const headers = S.authToken ? {'Authorization': `Bearer ${S.authToken}`} : {};
  const res = await fetch(url, {credentials:'include', headers});
  if (!res.ok) throw new Error(`${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'tRPC error');
  // tRPC v10 returns {result: {data: {json: ...}}} or {result: {data: ...}}
  const data = json.result?.data;
  if (data && typeof data === 'object' && 'json' in data) return data.json;
  return data;
}

async function trpcMutation(procedure, input) {
  const authHeaders = S.authToken ? {'Authorization': `Bearer ${S.authToken}`} : {};
  const res = await fetch(`${TRPC}/${procedure}`, {
    method:'POST', credentials:'include',
    headers:{'Content-Type':'application/json', ...authHeaders},
    body: JSON.stringify({json: input})
  });
  let text = '';
  try { text = await res.text(); } catch(e) { throw new Error('Sem resposta'); }
  let parsed = null;
  try { parsed = JSON.parse(text); } catch(e) { throw new Error('Resposta inválida'); }
  const json = Array.isArray(parsed) ? parsed[0] : parsed;
  // Return result if exists (success path)
  const data = json?.result?.data;
  if(data != null) {
    if(typeof data === 'object' && 'json' in data) return data.json;
    return data;
  }
  // Throw on error
  if(json?.error) {
    let msg = `Erro ${res.status}`;
    try {
      const err = json.error;
      console.error('[tRPC error raw]', JSON.stringify(err));
      // Try to extract Zod field errors
      const zod = err && err.json && err.json.data && err.json.data.zodError;
      if(zod) {
        const fe = zod.fieldErrors || {};
        const fields = Object.entries(fe).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(', '):v}`).join(' | ');
        if(fields) { throw new Error(`Campo inválido — ${fields}`); }
      }
      msg = (err && err.json && err.json.message) || (err && err.message) || msg;
    } catch(inner) {
      if(inner.message && !inner.message.startsWith('Erro ')) throw inner;
    }
    throw new Error(msg);
  }
  if(!res.ok) throw new Error(`Erro ${res.status}`);
  return json;
}
async function loadServerData() {
  if (!S.isOnline || !S.user) return;
  try {
    const [ordens, relatorios, templates, dia, hist] = await Promise.allSettled([
      trpcQuery('campo.mobile.minhasOrdens', {}),
      trpcQuery('campo.mobile.meusRelatorios', {}),
      trpcQuery('campo.templates.list', {}),
      trpcQuery('campo.visitaComercial.diaAtual', {}),
      trpcQuery('campo.visitaComercial.historico', {}),
    ]);

    // Debug — store last results for diagnosis
    S._debug = {
      ordens: ordens.status === 'rejected' ? ordens.reason?.message : ordens.value,
      relatorios: relatorios.status === 'rejected' ? relatorios.reason?.message : relatorios.value,
      templates: templates.status === 'rejected' ? templates.reason?.message : templates.value,
      token: S.authToken ? S.authToken.slice(0,20)+'...' : 'NONE',
    };

    if (ordens.status === 'fulfilled') {
      const ov = ordens.value;
      const oarr = ov?.json?.items ?? ov?.items ?? ov?.json ?? ov;
      S.ordens = Array.isArray(oarr) ? oarr : [];
      await saveCache('ordens', S.ordens);
    }
    if (relatorios.status === 'fulfilled') {
      const rv = relatorios.value;
      const rarr = rv?.json?.items ?? rv?.items ?? rv?.json ?? rv;
      S.relatorios = Array.isArray(rarr) ? rarr : [];
      await saveCache('relatorios', S.relatorios);
    }
    if (templates.status === 'fulfilled') {
      // tRPC v10 wraps in {json: ...}
      const tv = templates.value;
      const arr = tv?.json ?? tv;
      S.templates = Array.isArray(arr) ? arr : [];
      await saveCache('templates', S.templates);
    }
    if (dia.status === 'fulfilled') {
      const dv = dia.value;
      S.diaAtual = dv?.json ?? dv;
      await saveCache('diaAtual', S.diaAtual);
    }
    if (hist.status === 'fulfilled') {
      const hv = hist.value;
      const harr = hv?.json ?? hv;
      S.historico = Array.isArray(harr) ? harr : [];
      await saveCache('historico', S.historico);
    }
  } catch(e) {
    console.error('loadServerData error:', e);
    S._debug = {error: e.message};
  }
}

async function loadCachedData() {
  S.ordens     = (await loadCache('ordens'))   || [];
  S.relatorios = (await loadCache('relatorios'))|| [];
  S.templates  = (await loadCache('templates')) || [];
  S.diaAtual   = (await loadCache('diaAtual'))  || null;
  S.historico  = (await loadCache('historico')) || [];
  S.authToken  = (await loadCache('authToken')) || null;
}

// ── AUTH ──────────────────────────────────────────────────────
async function doLogin(email, senha) {
  const res = await fetch(ENDPOINTS.login, {
    method:'POST', credentials:'include',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email, senha})
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Credenciais inválidas');
  S.user = json;
  if (json._token) {
    S.authToken = json._token;
    await saveCache('authToken', json._token);
  }
  await saveCache('user', S.user);
  return json;
}

async function doLogout() {
  await fetch(ENDPOINTS.logout, {method:'POST', credentials:'include'}).catch(()=>{});
  S.user = null;
  S.authToken = null;
  await saveCache('user', null);
  await saveCache('authToken', null);
  render();
}

async function checkAuth() {
  // Load cached user and token first
  const cached = await loadCache('user');
  const cachedToken = await loadCache('authToken');
  if (cached) S.user = cached;
  if (cachedToken) S.authToken = cachedToken;

  if (!S.isOnline) return;

  // If we have a token, try to verify it
  if (S.authToken) {
    try {
      const authH = {'Authorization': `Bearer ${S.authToken}`};
      const res = await fetch(ENDPOINTS.me, {credentials:'include', headers: authH});
      if (res.ok) {
        const json = await res.json();
        S.user = { id: json.id, nome: json.nome, email: json.email, role: json.role };
        await saveCache('user', S.user);
      } else if (res.status === 401) {
        // Token inválido — limpa tudo e força login
        S.authToken = null; S.user = null;
        await saveCache('authToken', null); await saveCache('user', null);
        try { localStorage.removeItem('bgcampo_authToken'); localStorage.removeItem('bgcampo_user'); } catch(e){}
      }
    } catch (e) { /* offline */ }
  }
  // Se não tem token E não tem usuário em cache, vai para login
  if (!S.authToken && !S.user) {
    S.view = 'login';
  }
}

// ── OFFLINE DETECTION ─────────────────────────────────────────
function updateOfflineUI() {
  const bar = document.getElementById('offline-bar');
  if (bar) bar.classList.toggle('show', !S.isOnline);
  // Queue dot on home nav
  const dot = document.querySelector('.nav-dot');
  if (dot) dot.classList.toggle('show', S.syncQueue.length > 0);
}

function showSyncBadge(show) {
  const b = document.getElementById('sync-badge');
  if (b) b.classList.toggle('show', show);
}

window.addEventListener('online', async () => {
  S.isOnline = true;
  updateOfflineUI();
  await processQueue();
  await loadServerData();
  render();
});
window.addEventListener('offline', () => {
  S.isOnline = false;
  updateOfflineUI();
});

// ── RENDER ENGINE ─────────────────────────────────────────────
const app = document.getElementById('app');

function render() {
  app.innerHTML = '';
  if (!S.user) { app.appendChild(renderLogin()); return; }
  if (S.selectedOrdemId) { app.appendChild(renderOrdemDetail()); return; }
  if (S.showNovoRelatorio) { app.appendChild(renderNovoRelatorio()); return; }

  app.appendChild(mkHeader());
  app.appendChild(mkContent());
  app.appendChild(mkNav());
  updateOfflineUI();
}

function mkHeader() {
  const t = {home:'BG Campo',ordens:'Ordens de Serviço',relatorios:'Relatórios',visitas:'Visitas Comercial',perfil:'Meu Perfil'};
  const el = div('hdr');
  el.innerHTML = `<h1 class="hdr-title">${t[S.tab]||'BG Campo'}</h1>
    <span class="hdr-chip">${S.isOnline?'●&nbsp;ONLINE':'○&nbsp;OFFLINE'}</span>`;
  return el;
}

function mkNav() {
  const showVisitas = ['comercial','vendedor','admin'].includes(S.user?.role);
  const tabs = [
    {id:'home',icon:'home',label:'Início'},
    ...(showVisitas?[{id:'visitas',icon:'car',label:'Visitas'}]:[]),
    {id:'ordens',icon:'orders',label:'OS'},
    {id:'relatorios',icon:'reports',label:'Relatórios'},
    {id:'perfil',icon:'user',label:'Perfil'},
  ];
  const el = div('nav');
  el.innerHTML = tabs.map(t=>`
    <button class="nav-btn ${S.tab===t.id?'on':''}" data-tab="${t.id}">
      <span class="nav-dot" style="position:relative"></span>
      ${IC[t.icon]}<span>${t.label}</span>
    </button>`).join('');
  el.addEventListener('click', e=>{
    const btn = e.target.closest('[data-tab]');
    if(btn) { S.tab=btn.dataset.tab; render(); }
  });
  return el;
}

function mkContent() {
  const el = div('content fi');
  if(S.tab==='home') el.appendChild(renderHome());
  else if(S.tab==='ordens') el.appendChild(renderOrdens());
  else if(S.tab==='relatorios') el.appendChild(renderRelatorios());
  else if(S.tab==='visitas') el.appendChild(renderVisitas());
  else if(S.tab==='perfil') el.appendChild(renderPerfil());
  return el;
}

function div(cls='', tag='div') {
  const el = document.createElement(tag);
  if(cls) el.className = cls;
  return el;
}

function today() { return new Date().toISOString().split('T')[0]; }
function fmtDate(d) { if(!d) return '—'; try{return new Date(d+'T12:00:00').toLocaleDateString('pt-BR')}catch{return d} }
function fmtDT(d) { if(!d) return '—'; try{const dt=new Date(d);return dt.toLocaleDateString('pt-BR')+' '+dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch{return d} }

// ── LOGIN ─────────────────────────────────────────────────────
function renderLogin() {
  const el = div('content full');
  el.style.height = '100%';
  el.innerHTML = `
    <div class="login-page fi">
      <div>
        <div class="brand">BG<span>Campo</span></div>
        <div class="brand-sub">APP DE CAMPO · BG SERVICE</div>
      </div>
      <div style="width:100%;display:flex;flex-direction:column;gap:14px">
        <div class="fg">
          <label class="lbl">E-mail</label>
          <input id="li-email" type="email" class="inp" placeholder="seu@bgservice.com.br" autocomplete="email">
        </div>
        <div class="fg">
          <label class="lbl">Senha</label>
          <input id="li-senha" type="password" class="inp" placeholder="••••••" autocomplete="current-password">
        </div>
        <div id="li-err" class="hidden" style="font-size:13px;color:var(--red);text-align:center;background:var(--red-dim);border-radius:10px;padding:10px;border:1px solid rgba(255,68,85,.25)">
          E-mail ou senha incorretos
        </div>
        <div id="li-offline" class="hidden" style="font-size:13px;color:var(--yellow);text-align:center;background:var(--yellow-dim);border-radius:10px;padding:10px;border:1px solid rgba(255,187,51,.25)">
          ${IC.warn} Sem conexão — login requer internet
        </div>
        <button id="li-btn" class="btn btn-or mt2">Entrar</button>
      </div>
    </div>
  `;
  const btn = el.querySelector('#li-btn');
  btn.addEventListener('click', async () => {
    if (!S.isOnline) { el.querySelector('#li-offline').classList.remove('hidden'); return; }
    const email = el.querySelector('#li-email').value.trim();
    const senha = el.querySelector('#li-senha').value;
    btn.disabled = true; btn.textContent = 'Entrando...';
    try {
      await doLogin(email, senha);
      await loadCachedData();
      await loadServerData();
      render();
    } catch (e) {
      el.querySelector('#li-err').classList.remove('hidden');
      el.querySelector('#li-err').textContent = e.message || 'Credenciais inválidas';
      btn.disabled = false; btn.innerHTML = 'Entrar';
    }
  });
  el.addEventListener('keydown', e => { if(e.key==='Enter') btn.click(); });
  return el;
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome() {
  const el = div('pad sp5');
  const hoje = S.ordens.filter(o=>o.dataAgendada===today());
  const emAnd = S.ordens.filter(o=>o.status==='em_andamento');
  const qLen = S.syncQueue.length;

  el.innerHTML = `
    <div>
      <p class="gr-line">Olá,</p>
      <h2 class="gr-name">${S.user.nome.split(' ')[0]}</h2>
    </div>

    ${qLen>0?`
    <div style="background:var(--yellow-dim);border:1px solid rgba(255,187,51,.25);border-radius:var(--r);padding:12px 16px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--yellow)">
        ${IC.warn} ${qLen} ação(ões) aguardando sincronização
      </div>
      <button class="btn btn-sm" style="width:auto;padding:0 12px;background:var(--yellow);color:#000;height:32px;font-size:12px" onclick="processSyncNow()">Sincronizar</button>
    </div>` : ''}

    <div class="stats-g">
      <div class="stat">
        <div class="stat-ico ico-blue">${IC.cal}</div>
        <div class="stat-n">${hoje.length}</div>
        <div class="stat-l">OS Hoje</div>
      </div>
      <div class="stat">
        <div class="stat-ico ico-orange">${IC.timer}</div>
        <div class="stat-n">${emAnd.length}</div>
        <div class="stat-l">Em Andamento</div>
      </div>
    </div>

    ${hoje.length?`<div>
      <div class="sec-ttl">${IC.cal} Agenda de Hoje</div>
      <div class="sp3">${hoje.map(osCardHTML).join('')}</div>
    </div>`:''}

    ${emAnd.length?`<div>
      <div class="sec-ttl">${IC.timer} Em Andamento</div>
      <div class="sp3">${emAnd.map(osCardHTML).join('')}</div>
    </div>`:''}

    <div>
      <div class="sec-ttl">Ações Rápidas</div>
      <div class="qa-grid">
        <button class="qa-btn" data-tab="ordens">
          ${IC.orders.replace('viewBox','style="width:26px;height:26px;color:var(--blue)" viewBox')}
          <p>Minhas OS</p>
        </button>
        <button class="qa-btn" data-tab="relatorios">
          ${IC.reports.replace('viewBox','style="width:26px;height:26px;color:var(--green)" viewBox')}
          <p>Relatórios</p>
        </button>
      </div>
    </div>
  `;

  el.querySelectorAll('.os-card').forEach(c=>c.addEventListener('click',()=>{S.selectedOrdemId=+c.dataset.id;render();}));
  el.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{S.tab=b.dataset.tab;render();}));
  return el;
}

function osCardHTML(o) {
  return `<button class="os-card p-${o.prioridade||'baixa'}" data-id="${o.id}">
    <div class="os-num">#${o.numero||o.id}</div>
    <div class="os-cli">${o.clienteNome||'—'}</div>
    <div class="os-meta">
      ${o.equipamentoPatrimonio?`<span style="font-family:var(--FM);font-size:11px;color:var(--text-3)">${o.equipamentoPatrimonio}</span>`:''}
      ${o.equipamentoModelo?`<span style="font-size:11px;color:var(--text-3)">${o.equipamentoModelo}</span>`:''}
    </div>
    ${o.endereco?`<div class="os-addr">${IC.pin} ${o.endereco}</div>`:''}
    ${o.horaAgendada?`<div style="font-size:11px;color:var(--text-3);margin-top:4px;display:flex;align-items:center;gap:3px">${IC.clock} ${o.horaAgendada}</div>`:''}
    <div class="os-right">
      <span class="badge ${STATUS_BADGE[o.status]||'b-gray'}">${STATUS_LBL[o.status]||o.status}</span>
      ${o.prioridade==='urgente'?'<span class="badge b-red">URGENTE</span>':''}
    </div>
  </button>`;
}

// ── ORDENS ────────────────────────────────────────────────────
function renderOrdens() {
  const el = div('pad sp4');
  let curFilter = 'todas';

  function rebuild() {
    const list = el.querySelector('#or-list');
    el.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c.dataset.f===curFilter));
    const items = curFilter==='todas'?S.ordens:S.ordens.filter(o=>o.status===curFilter);
    if(!items.length) {
      list.innerHTML=`<div class="empty">${IC.orders}<p>Nenhuma OS encontrada</p></div>`;
    } else {
      list.innerHTML = items.map(osCardHTML).join('');
      list.querySelectorAll('.os-card').forEach(c=>c.addEventListener('click',()=>{S.selectedOrdemId=+c.dataset.id;render();}));
    }
  }

  el.innerHTML = `
    <div class="chips" id="or-chips">
      ${['todas','agendada','em_andamento','concluida'].map(f=>`<button class="chip ${f==='todas'?'on':''}" data-f="${f}">${{todas:'Todas',agendada:'Agendadas',em_andamento:'Em Andamento',concluida:'Concluídas'}[f]}</button>`).join('')}
    </div>
    ${!S.isOnline?`<div style="font-size:12px;color:var(--yellow);text-align:center;padding:8px">${IC.warn} Exibindo dados do cache</div>`:''}
    <div id="or-list" class="sp3"></div>
  `;
  el.addEventListener('click',e=>{const c=e.target.closest('.chip');if(c){curFilter=c.dataset.f;rebuild();}});
  setTimeout(rebuild, 0);
  return el;
}

// ── OS DETAIL ─────────────────────────────────────────────────
function renderOrdemDetail() {
  const ordem = S.ordens.find(o=>o.id===S.selectedOrdemId);
  if(!ordem){S.selectedOrdemId=null;render();return div();}

  const wrap = div();
  wrap.style.cssText='display:flex;flex-direction:column;height:100%;background:var(--bg-base)';

  const hdr = div('hdr');
  hdr.innerHTML=`<button class="hdr-back" id="os-back-btn" style="min-width:44px;min-height:44px">${IC.back}</button><h1 class="hdr-title">OS #${ordem.numero||ordem.id}</h1><span class="badge ${STATUS_BADGE[ordem.status]||'b-gray'}">${STATUS_LBL[ordem.status]||ordem.status}</span>`;
  const osBackBtn = hdr.querySelector('#os-back-btn');
  osBackBtn.addEventListener('touchend', e => { e.preventDefault(); S.selectedOrdemId=null; render(); });
  osBackBtn.addEventListener('click', e => { e.preventDefault(); S.selectedOrdemId=null; render(); });

  const content = div('content full pad sp4 fi');
  content.style.flex='1';

  let actionBtn='';
  if(ordem.status==='agendada') actionBtn=`<button class="btn btn-or" id="btn-iniciar">${IC.wrench} Iniciar Atendimento</button>`;
  else if(ordem.status==='em_andamento') actionBtn=`<button class="btn btn-gr" id="btn-rel">${IC.pen} Preencher Relatório</button>`;
  else if(ordem.status==='concluida') actionBtn=`<div style="background:var(--green-dim);border:1px solid rgba(46,201,124,.2);border-radius:var(--r);padding:20px;text-align:center;color:var(--green)">${IC.checkCircle}<br><br><strong>OS Concluída</strong></div>`;

  content.innerHTML=`
    <div class="st-blk ${ordem.status==='em_andamento'?'st-em':ordem.status==='concluida'?'st-ok':'st-ag'}">
      <div class="flex jb aic">
        <div><p style="font-size:11px;color:var(--text-2)">Tipo</p><p style="font-size:16px;font-weight:700">${TIPO_LBL[ordem.tipo]||ordem.tipo||'—'}</p></div>
        ${ordem.prioridade==='urgente'?'<span class="badge b-red">⚠ URGENTE</span>':''}
      </div>
    </div>
    <div class="det-sec">
      <div class="det-row"><span class="det-k">Cliente</span><span class="det-v">${ordem.clienteNome||'—'}</span></div>
      ${ordem.endereco?`<div class="det-row"><span class="det-k">Endereço</span><span class="det-v">${ordem.endereco}</span></div>`:''}
      ${ordem.equipamentoPatrimonio?`<div class="det-row"><span class="det-k">Patrimônio</span><span class="det-v mono">${ordem.equipamentoPatrimonio}</span></div>`:''}
      ${ordem.equipamentoModelo?`<div class="det-row"><span class="det-k">Modelo</span><span class="det-v">${ordem.equipamentoModelo}</span></div>`:''}
      ${ordem.dataAgendada?`<div class="det-row"><span class="det-k">Data</span><span class="det-v">${fmtDate(ordem.dataAgendada)}${ordem.horaAgendada?' — '+ordem.horaAgendada:''}</span></div>`:''}
    </div>
    ${ordem.descricao?`<div class="card"><div class="card-b"><p style="font-size:11px;color:var(--text-3);margin-bottom:6px;font-weight:600">DESCRIÇÃO</p><p style="font-size:14px;color:var(--text-2);line-height:1.5">${ordem.descricao}</p></div></div>`:''}
    ${ordem.observacoesGestor?`<div style="background:var(--yellow-dim);border:1px solid rgba(255,187,51,.2);border-radius:var(--r);padding:14px 16px"><p style="font-size:11px;color:var(--yellow);margin-bottom:6px;font-weight:700">⚡ GESTOR</p><p style="font-size:14px;color:var(--text-2);line-height:1.5">${ordem.observacoesGestor}</p></div>`:''}
    ${actionBtn}
  `;

  content.querySelector('#btn-iniciar')?.addEventListener('click', async () => {
    try {
      if(S.isOnline) {
        await trpcMutation('campo.mobile.iniciarOrdem', {id:ordem.id});
        await loadServerData();
      } else {
        await queueAction('iniciarOrdem', {id:ordem.id});
        const o = S.ordens.find(x=>x.id===ordem.id);
        if(o) o.status='em_andamento';
        await saveCache('ordens', S.ordens);
      }
      S.selectedOrdemId=null; render();
    } catch(e) { alert('Erro: '+e.message); }
  });

  content.querySelector('#btn-rel')?.addEventListener('click',()=>{
    S.activeRelatorioOsId = ordem.id;
    S.showNovoRelatorio = true;
    S.relatorioStep = 1;
    S.relatorioTemplateId = null;
    resetRelForm();
    render();
  });

  wrap.appendChild(hdr);
  wrap.appendChild(content);
  return wrap;
}

// ── RELATORIOS TAB ────────────────────────────────────────────
function renderRelatorios() {
  const el = div('pad sp3');
  const STATUS_B={rascunho:'b-gray',enviado:'b-blue',aprovado:'b-green',rejeitado:'b-red'};
  el.innerHTML=`
    <button class="btn btn-gr" id="btn-novo-rel">${IC.plus} Novo Relatório</button>
    ${!S.isOnline?`<div style="font-size:12px;color:var(--yellow);text-align:center;padding:8px">${IC.warn} Exibindo cache local</div>`:''}
    ${!S.relatorios.length?`<div class="empty">${IC.reports}<p>Nenhum relatório<br><span style="font-size:11px">Toque em "Novo Relatório"</span></p></div>`:
    S.relatorios.map(r=>`
      <div class="card">
        <div class="card-b">
          <div class="flex jb aic" style="margin-bottom:6px">
            <div>
              <p style="font-size:15px;font-weight:700">Relatório #${r.id}</p>
              <p style="font-size:12px;color:var(--text-2)">${r.clienteNome||'—'}</p>
              <p style="font-size:11px;color:var(--text-3)">${fmtDT(r.createdAt)}</p>
            </div>
            <span class="badge ${STATUS_B[r.status]||'b-gray'}">${r.status}</span>
          </div>
          ${r.observacoes?`<p style="font-size:13px;color:var(--text-2);line-height:1.4">${r.observacoes}</p>`:''}
        </div>
      </div>`).join('')}
  `;
  el.querySelector('#btn-novo-rel').addEventListener('click',()=>{
    S.activeRelatorioOsId=null;
    S.showNovoRelatorio=true;
    S.relatorioStep=1;
    S.relatorioTemplateId=null;
    resetRelForm();
    render();
  });
  return el;
}

// ── NOVO RELATÓRIO ────────────────────────────────────────────
function resetRelForm() {
  S.relServicos=[{descricao:'',concluido:false}];
  S.relPecas=[];
  S.relFotos=[];
  S.relDados={};
  S.relSigCli='';
  S.relSigTec='';
}

function renderNovoRelatorio() {
  const wrap = div();
  wrap.style.cssText='display:flex;flex-direction:column;height:100%;background:var(--bg-base)';

  const ordem = S.activeRelatorioOsId ? S.ordens.find(o=>o.id===S.activeRelatorioOsId) : null;

  const hdr = div('hdr');
  const goBack = () => {
    if(!S.activeRelatorioOsId && S.relatorioStep>1){
      S.relatorioStep=1; S.relatorioTemplateId=null; render();
    } else {
      S.showNovoRelatorio=false; S.activeRelatorioOsId=null; resetRelForm(); render();
    }
  };
  hdr.innerHTML=`<button class="hdr-back" id="rel-back-btn" style="min-width:44px;min-height:44px">${IC.back}</button><h1 class="hdr-title">${ordem?`OS #${ordem.numero||ordem.id}`:'Novo Relatório'}</h1>`;
  const relBackBtn = hdr.querySelector('#rel-back-btn');
  relBackBtn.addEventListener('touchend', e => { e.preventDefault(); goBack(); });
  relBackBtn.addEventListener('click', e => { e.preventDefault(); goBack(); });

  const content = div('content full pad fi');
  content.style.flex='1';

  // Step 1 – escolher template
  if(!ordem && S.relatorioStep===1) {
    if(!S.templates.length) {
      content.innerHTML=`<div class="empty">${IC.orders}<p>Nenhum template disponível<br><span style="font-size:11px">${S.isOnline?'Erro ao carregar':'Sem conexão e sem cache'}</span></p></div>`;
    } else {
      content.innerHTML=`
        <p style="font-size:14px;color:var(--text-2);margin-bottom:16px">Escolha o tipo de relatório:</p>
        <div class="sp3">
          ${S.templates.map(t=>`
            <div class="tmpl-item" data-tid="${t.id}">
              <div class="tmpl-ico">${IC.orders}</div>
              <div class="tmpl-info flex-1"><h4>${t.nome}</h4><p>${TIPO_LBL[t.tipo]||t.tipo} · ${(t.campos||[]).length} campos</p></div>
              ${IC.chev}
            </div>`).join('')}
        </div>`;
      content.querySelectorAll('.tmpl-item').forEach(item=>{
        item.addEventListener('click',()=>{
          S.relatorioTemplateId=+item.dataset.tid;
          S.relDados={};
          S.relatorioStep=2;
          render();
        });
      });
    }
  } else {
    // Step 2 – form
    const tid = ordem ? (S.templates[0]?.id||null) : S.relatorioTemplateId;
    const template = S.templates.find(t=>t.id===tid)||S.templates[0];
    content.appendChild(buildRelForm(template, ordem, goBack));
  }

  wrap.appendChild(hdr);
  wrap.appendChild(content);
  return wrap;
}

function buildRelForm(template, ordem, onBack) {
  const frag = document.createDocumentFragment();

  // OS summary or client input
  if(ordem) {
    const info = div('card mt3');
    info.style.marginBottom='16px';
    info.innerHTML=`<div class="card-b"><p style="font-size:12px;color:var(--text-2)">OS #${ordem.numero||ordem.id} — ${ordem.clienteNome||'—'}</p>${ordem.equipamentoPatrimonio?`<p style="font-family:var(--FM);font-size:12px;color:var(--text-3)">${ordem.equipamentoPatrimonio} ${ordem.equipamentoModelo||''}</p>`:''}</div>`;
    frag.appendChild(info);
  } else {
    const g = div('fg'); g.style.marginBottom='12px';
    g.innerHTML=`<label class="lbl">Cliente / Local *</label><input id="rel-cli" class="inp" placeholder="Nome do cliente ou local">`;
    frag.appendChild(g);
    const g2 = div('fg'); g2.style.marginBottom='18px';
    g2.innerHTML=`<label class="lbl">Tipo de Serviço</label>
      <select id="rel-tipo" class="sel">${Object.entries(TIPO_LBL).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>`;
    frag.appendChild(g2);
  }

  // Template campos
  if(template?.campos?.length) {
    const ttl = div('sec-ttl'); ttl.style.marginBottom='12px';
    ttl.innerHTML=`${IC.orders} ${template.nome||'Checklist'}`;
    frag.appendChild(ttl);

    template.campos.forEach(campo=>{
      const w = div(); w.style.marginBottom='12px';
      if(campo.tipo==='secao') {
        w.innerHTML=`<div style="padding:6px 0 3px;border-bottom:1px solid var(--border);color:var(--orange);font-size:13px;font-weight:700">${campo.label}</div>`;
      } else if(campo.tipo==='checkbox') {
        w.innerHTML=`<div class="sw-row"><span class="sw-lbl">${campo.label}</span><label class="sw"><input type="checkbox" ${S.relDados[campo.id]?'checked':''} data-cid="${campo.id}"><span class="sw-track"></span><span class="sw-thumb"></span></label></div>`;
        w.querySelector('input').addEventListener('change',e=>{S.relDados[campo.id]=e.target.checked;});
      } else if(campo.tipo==='observacao') {
        w.innerHTML=`<div class="fg"><label class="lbl">${campo.label}</label><textarea class="txta" data-cid="${campo.id}" placeholder="${campo.placeholder||''}">${S.relDados[campo.id]||''}</textarea></div>`;
        w.querySelector('textarea').addEventListener('change',e=>{S.relDados[campo.id]=e.target.value;});
      } else if(campo.tipo==='gps') {
        w.innerHTML=`<div class="fg"><label class="lbl">${campo.label}</label>${S.relDados[campo.id]?`<div class="gps-tag">${IC.pin} ${S.relDados[campo.id]}</div>`:`<button class="btn btn-gh btn-sm mt2" data-gps="${campo.id}">${IC.pin} Capturar GPS</button>`}</div>`;
        w.querySelector('[data-gps]')?.addEventListener('click',()=>captureGPS(campo.id));
      } else if (campo.tipo === 'foto') {
        const fid = 'f'+campo.id.replace(/[^a-z0-9]/gi,'');
        w.innerHTML=`<div class="fg"><label class="lbl">${campo.label}</label>
          <label style="display:flex;align-items:center;gap:8px;background:var(--bg-card);border:1px dashed var(--border);border-radius:var(--rs);padding:12px 14px;cursor:pointer">
            ${IC.camera} <span style="font-size:14px;color:var(--text-2)">Tirar foto</span>
            <input type="file" accept="image/*" capture="environment" style="display:none" id="${fid}">
          </label>
          <div id="${fid}p"></div>
        </div>`;
        w.querySelector('input').addEventListener('change',e=>{
          const file=e.target.files[0]; if(!file) return;
          const r=new FileReader(); r.onload=ev=>{
            S.relDados[campo.id]=ev.target.result;
            const p=document.getElementById(fid+'p');
            if(p) p.innerHTML=`<img src="${ev.target.result}" style="width:100%;border-radius:var(--rs);margin-top:6px;max-height:180px;object-fit:cover">`;
          }; r.readAsDataURL(file);
        });
      } else if (campo.tipo === 'select') {
        const opts = campo.opcoes||['RUIM','REGULAR','BOM','NA'];
        const needsDetail = opts.some(o=>['RUIM','REGULAR'].includes(o)); // show detail for quality selects
        const fid2='fs'+campo.id.replace(/[^a-z0-9]/gi,'');
        w.innerHTML=`<div class="fg"><label class="lbl">${campo.label}</label>
          <select class="sel" data-cid="${campo.id}">
            <option value="">Selecione...</option>
            ${opts.map(op=>`<option value="${op}" ${S.relDados[campo.id]===op?'selected':''}>${op}</option>`).join('')}
          </select>
          <div id="${fid2}-extra" style="display:none;flex-direction:column;gap:6px;margin-top:6px">
            <input class="inp" id="${fid2}-desc" placeholder="Descrever problema..." value="${S.relDados[campo.id+'_obs']||''}">
            <label style="display:flex;align-items:center;gap:8px;background:var(--bg-card);border:1px dashed var(--border);border-radius:var(--rs);padding:10px 12px;cursor:pointer;font-size:13px;color:var(--text-2)">
              ${IC.camera} Foto do problema
              <input type="file" accept="image/*" capture="environment" style="display:none" id="${fid2}-foto">
            </label>
            <div id="${fid2}-fprev"></div>
          </div>
        </div>`;
        const sel = w.querySelector('select');
        const extra = w.querySelector('#'+fid2+'-extra');
        const isBomRuim = opts.some(o=>o==='BOM'||o==='RUIM'||o==='REGULAR');
        sel.addEventListener('change',e=>{
          S.relDados[campo.id]=e.target.value;
          if(!extra) return;
          if(isBomRuim) {
            // Show detail only for non-BOM/NA selections
            const bad = e.target.value && e.target.value!=='BOM' && e.target.value!=='NA';
            extra.style.display=bad?'flex':'none';
          } else {
            // For SIM/NÃO and others, always show detail when something is selected
            extra.style.display=e.target.value?'flex':'none';
          }
        });
        w.querySelector('#'+fid2+'-desc')?.addEventListener('input',e=>{S.relDados[campo.id+'_obs']=e.target.value;});
        w.querySelector('#'+fid2+'-foto')?.addEventListener('change',e=>{
          const file=e.target.files[0]; if(!file) return;
          const r=new FileReader(); r.onload=ev=>{
            S.relDados[campo.id+'_foto']=ev.target.result;
            const p=w.querySelector('#'+fid2+'-fprev');
            if(p) p.innerHTML=`<img src="${ev.target.result}" style="width:100%;border-radius:var(--rs);max-height:150px;object-fit:cover">`;
          }; r.readAsDataURL(file);
        });
      } else if (campo.tipo === 'data') {
        w.innerHTML=`<div class="fg"><label class="lbl">${campo.label}</label>
          <input class="inp" type="datetime-local" data-cid="${campo.id}" value="${S.relDados[campo.id]||''}"></div>`;
        w.querySelector('input').addEventListener('change',e=>{S.relDados[campo.id]=e.target.value;});
      } else if (campo.tipo === 'horimetro' || campo.tipo === 'numero') {
        w.innerHTML=`<div class="fg"><label class="lbl">${campo.label}</label>
          <input class="inp" type="number" inputmode="decimal" data-cid="${campo.id}" placeholder="${campo.placeholder||campo.label}" value="${S.relDados[campo.id]||''}"></div>`;
        w.querySelector('input').addEventListener('change',e=>{S.relDados[campo.id]=e.target.value;});
      } else if (campo.tipo === 'assinatura') {
        // Campo de assinatura do template — renderiza pad inline
        const sid = 'sig-tmpl-'+campo.id.replace(/[^a-z0-9]/gi,'');
        w.innerHTML=`<div class="fg">
          <div class="flex jb aic" style="margin-bottom:6px">
            <label class="lbl">${campo.label}</label>
            <button class="btn" style="padding:3px 10px;font-size:12px" data-clrsig="${sid}">Limpar</button>
          </div>
          <canvas id="${sid}" width="600" height="180" style="width:100%;height:180px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--rs);touch-action:none"></canvas>
        </div>`;
        w.querySelector('[data-clrsig]')?.addEventListener('click',()=>{
          const c=document.getElementById(sid); if(!c) return;
          c.getContext('2d').clearRect(0,0,c.width,c.height);
          S.relDados[campo.id]='';
        });
        setTimeout(()=>initSigPad(sid, val=>{ S.relDados[campo.id]=val; }),50);
      } else {
        // Default: text input
        w.innerHTML=`<div class="fg"><label class="lbl">${campo.label}</label>
          <input class="inp" type="text" data-cid="${campo.id}" placeholder="${campo.placeholder||campo.label}" value="${S.relDados[campo.id]||''}"></div>`;
        w.querySelector('input').addEventListener('change',e=>{S.relDados[campo.id]=e.target.value;});
      }
      frag.appendChild(w);
    });
  }

  // Serviços
  const svWrap = div(); svWrap.style.marginTop='18px';
  rebuildSv(svWrap);
  frag.appendChild(svWrap);

  // Peças
  const pcWrap = div(); pcWrap.style.marginTop='18px';
  rebuildPc(pcWrap);
  frag.appendChild(pcWrap);

  // Fotos
  frag.appendChild(buildFotos());

  // Observações
  const obsSec = div('fg'); obsSec.style.marginTop='18px';
  obsSec.innerHTML=`<label class="lbl">Observações Gerais</label><textarea id="rel-obs" class="txta" placeholder="Observações adicionais..."></textarea>`;
  frag.appendChild(obsSec);

  // Assinaturas — só adiciona as fixas se o template NÃO tiver campos de assinatura/horímetro
  const camposTmpl = template?.campos || [];
  const tmplTemAssinatura = camposTmpl.some(c => c?.tipo === 'assinatura');
  if (!tmplTemAssinatura) {
    frag.appendChild(buildAssinaturas());
  }

  // Submit
  const submitBtn = document.createElement('button');
  submitBtn.className='btn btn-gr'; submitBtn.style.marginTop='20px';
  submitBtn.innerHTML=`${IC.send} Enviar Relatório`;
  submitBtn.addEventListener('click',()=>submitRelatorio(template,ordem,onBack));
  frag.appendChild(submitBtn);

  return frag;
}

// ── SERVIÇOS ──────────────────────────────────────────────────
function rebuildSv(wrap) {
  wrap.innerHTML=`
    <div class="flex jb aic" style="margin-bottom:10px">
      <div class="sec-ttl" style="margin-bottom:0">${IC.wrench} Serviços Realizados</div>
      <button class="btn btn-gh btn-sm" style="width:auto;padding:0 12px" id="add-sv">${IC.plus} Add</button>
    </div>
    <div class="sp3" id="sv-list">
      ${S.relServicos.map((s,i)=>`
        <div class="svc-row">
          <label class="sw"><input type="checkbox" ${s.concluido?'checked':''} data-si="${i}"><span class="sw-track"></span><span class="sw-thumb"></span></label>
          <input class="inp" value="${s.descricao}" placeholder="Descreva o serviço..." data-sv="${i}">
          <button class="del-btn" data-del-sv="${i}">${IC.trash}</button>
        </div>`).join('')}
    </div>`;
  wrap.querySelector('#add-sv').addEventListener('click',()=>{S.relServicos.push({descricao:'',concluido:false});rebuildSv(wrap);});
  wrap.querySelectorAll('[data-si]').forEach(el=>el.addEventListener('change',e=>{S.relServicos[+e.target.dataset.si].concluido=e.target.checked;}));
  wrap.querySelectorAll('[data-sv]').forEach(el=>el.addEventListener('input',e=>{S.relServicos[+e.target.dataset.sv].descricao=e.target.value;}));
  wrap.querySelectorAll('[data-del-sv]').forEach(el=>el.addEventListener('click',e=>{const i=+e.currentTarget.dataset.delSv;S.relServicos.splice(i,1);if(!S.relServicos.length)S.relServicos=[{descricao:'',concluido:false}];rebuildSv(wrap);}));
}

// ── PEÇAS ─────────────────────────────────────────────────────
function rebuildPc(wrap) {
  wrap.innerHTML=`
    <div class="flex jb aic" style="margin-bottom:10px">
      <div class="sec-ttl" style="margin-bottom:0">Peças Utilizadas</div>
      <button class="btn btn-gh btn-sm" style="width:auto;padding:0 12px" id="add-pc">${IC.plus} Add</button>
    </div>
    <div class="sp3" id="pc-list">
      ${S.relPecas.map((p,i)=>`
        <div class="peca-row">
          <input class="inp" value="${p.nome}" placeholder="Nome da peça" data-pn="${i}">
          <div class="peca-inps">
            <input class="inp" value="${p.codigo}" placeholder="Código" data-pc="${i}">
            <input class="inp inp-qty" type="number" value="${p.quantidade}" min="1" data-pq="${i}">
            <button class="del-btn" data-del-pc="${i}">${IC.trash}</button>
          </div>
        </div>`).join('')}
    </div>`;
  wrap.querySelector('#add-pc').addEventListener('click',()=>{S.relPecas.push({nome:'',codigo:'',quantidade:1});rebuildPc(wrap);});
  wrap.querySelectorAll('[data-pn]').forEach(el=>el.addEventListener('input',e=>{S.relPecas[+e.target.dataset.pn].nome=e.target.value;}));
  wrap.querySelectorAll('[data-pc]').forEach(el=>el.addEventListener('input',e=>{S.relPecas[+e.target.dataset.pc].codigo=e.target.value;}));
  wrap.querySelectorAll('[data-pq]').forEach(el=>el.addEventListener('input',e=>{S.relPecas[+e.target.dataset.pq].quantidade=+e.target.value||1;}));
  wrap.querySelectorAll('[data-del-pc]').forEach(el=>el.addEventListener('click',e=>{const i=+e.currentTarget.dataset.delPc;S.relPecas.splice(i,1);rebuildPc(wrap);}));
}

// ── FOTOS ─────────────────────────────────────────────────────
function buildFotos() {
  const wrap = div(); wrap.style.marginTop='18px';
  const rebuildGrid=()=>{
    const grid=wrap.querySelector('#pg');
    if(!grid) return;
    const addBtn=grid.lastElementChild;
    grid.innerHTML='';
    S.relFotos.forEach((f,i)=>{
      const t=div('photo-t');
      t.innerHTML=`<img src="${f}"><button class="photo-del" data-di="${i}">${IC.trash}</button>`;
      t.querySelector('[data-di]').addEventListener('click',e=>{const idx=+e.currentTarget.dataset.di;S.relFotos.splice(idx,1);rebuildGrid();});
      grid.appendChild(t);
    });
    grid.appendChild(addBtn);
  };
  wrap.innerHTML=`
    <div class="sec-ttl" style="margin-bottom:10px">${IC.camera} Fotos</div>
    <div class="photos-g" id="pg">
      <label class="photo-add">${IC.camera}<span>Adicionar</span><input type="file" accept="image/*" capture="environment" multiple class="hidden"></label>
    </div>`;
  wrap.querySelector('input[type=file]').addEventListener('change',e=>{
    Array.from(e.target.files||[]).forEach(f=>{
      const r=new FileReader();
      r.onload=ev=>{S.relFotos.push(ev.target.result);rebuildGrid();};
      r.readAsDataURL(f);
    });
    e.target.value='';
  });
  return wrap;
}

// ── ASSINATURAS ───────────────────────────────────────────────
function buildAssinaturas() {
  const wrap = div(); wrap.style.marginTop='18px';
  wrap.innerHTML=`
    <div class="sec-ttl" style="margin-bottom:12px">${IC.pen} Assinaturas</div>
    <div class="fg" style="margin-bottom:14px">
      <div class="flex jb aic" style="margin-bottom:6px">
        <label class="lbl">Nome do Cliente</label>
      </div>
      <input id="sig-cli-nome" class="inp" placeholder="Nome completo do cliente" style="margin-bottom:8px">
      <div class="flex jb aic" style="margin-bottom:6px">
        <label class="lbl">Assinatura do Cliente</label>
        <button class="btn btn-gh btn-sm" style="width:auto;padding:0 10px;height:28px;font-size:12px" id="clr-cli">Limpar</button>
      </div>
      <canvas id="sig-cli" class="sig-c"></canvas>
    </div>
    <div class="fg">
      <div class="flex jb aic" style="margin-bottom:6px">
        <label class="lbl">Nome do Técnico</label>
      </div>
      <input id="sig-tec-nome" class="inp" value="${S.user?.nome||''}" placeholder="Nome do técnico" style="margin-bottom:8px">
      <div class="flex jb aic" style="margin-bottom:6px">
        <label class="lbl">Assinatura do Técnico</label>
        <button class="btn btn-gh btn-sm" style="width:auto;padding:0 10px;height:28px;font-size:12px" id="clr-tec">Limpar</button>
      </div>
      <canvas id="sig-tec" class="sig-c"></canvas>
    </div>`;
  setTimeout(()=>{
    initSig('sig-cli','cli');
    initSig('sig-tec','tec');
    wrap.querySelector('#clr-cli').addEventListener('click',()=>clearSig('sig-cli','cli'));
    wrap.querySelector('#clr-tec').addEventListener('click',()=>clearSig('sig-tec','tec'));
    // Save names to relDados
    // Names stored separately, not in relDados
  },50);
  return wrap;
}

function initSig(id, type) {
  const canvas=document.getElementById(id); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  canvas.width=canvas.offsetWidth*devicePixelRatio||320;
  canvas.height=120*devicePixelRatio;
  ctx.scale(devicePixelRatio,devicePixelRatio);
  let drawing=false;
  const pos=e=>{const r=canvas.getBoundingClientRect();const src=e.touches?e.touches[0]:e;return{x:src.clientX-r.left,y:src.clientY-r.top}};
  const start=e=>{e.preventDefault();drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};
  const move=e=>{if(!drawing)return;e.preventDefault();const p=pos(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#f0f4ff';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()};
  const end=()=>{drawing=false;if(type==='cli')S.relSigCli=canvas.toDataURL();else S.relSigTec=canvas.toDataURL()};
  canvas.addEventListener('touchstart',start,{passive:false});
  canvas.addEventListener('touchmove',move,{passive:false});
  canvas.addEventListener('touchend',end,{passive:false});
  canvas.addEventListener('mousedown',start);
  canvas.addEventListener('mousemove',move);
  canvas.addEventListener('mouseup',end);
  canvas.addEventListener('mouseleave',end);
  // iOS pointer events fallback
  canvas.addEventListener('pointerdown',start,{passive:false});
  canvas.addEventListener('pointermove',move,{passive:false});
  canvas.addEventListener('pointerup',end);
}

function initSigPad(id, onChange) {
  const canvas=document.getElementById(id); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  canvas.width=canvas.offsetWidth*devicePixelRatio||600;
  canvas.height=180*devicePixelRatio;
  ctx.scale(devicePixelRatio,devicePixelRatio);
  let drawing=false;
  const pos=e=>{const r=canvas.getBoundingClientRect();const src=e.touches?e.touches[0]:e;return{x:src.clientX-r.left,y:src.clientY-r.top}};
  const start=e=>{e.preventDefault();drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};
  const move=e=>{if(!drawing)return;e.preventDefault();const p=pos(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#f0f4ff';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()};
  const end=()=>{drawing=false;if(onChange)onChange(canvas.toDataURL())};
  canvas.addEventListener('touchstart',start,{passive:false});
  canvas.addEventListener('touchmove',move,{passive:false});
  canvas.addEventListener('touchend',end,{passive:false});
  canvas.addEventListener('mousedown',start);
  canvas.addEventListener('mousemove',move);
  canvas.addEventListener('mouseup',end);
  canvas.addEventListener('mouseleave',end);
  canvas.addEventListener('pointerdown',start,{passive:false});
  canvas.addEventListener('pointermove',move,{passive:false});
  canvas.addEventListener('pointerup',end);
}

function clearSig(id,type) {
  const canvas=document.getElementById(id);if(!canvas)return;
  canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  if(type==='cli')S.relSigCli='';else S.relSigTec='';
}

function captureGPS(fieldId) {
  if(!navigator.geolocation){alert('GPS não disponível');return;}
  navigator.geolocation.getCurrentPosition(
    pos=>{S.relDados[fieldId]=`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;render();},
    err=>alert('GPS: '+err.message),
    {enableHighAccuracy:true,timeout:15000}
  );
}

// ── SUBMIT RELATÓRIO ──────────────────────────────────────────
async function submitRelatorio(template, ordem, onBack) {
  const clienteNome = ordem
    ? (ordem.clienteNome||'').trim()
    : (document.getElementById('rel-cli')?.value||'').trim();
  if(!clienteNome){alert('Preencha o nome do cliente');return;}
  if(!ordem && !template?.id){alert('Template não selecionado');return;}

  const TIPOS_VALIDOS = ["corretiva","preventiva","inspecao","instalacao","garantia","checklist_entrada","checklist_saida"];
  const tipoMap = {
    corretiva:"corretiva",preventiva:"preventiva",inspecao:"inspecao",
    checklist_entrada:"checklist_entrada",checklist_saida:"checklist_saida",
    instalacao:"instalacao",garantia:"garantia",
    checklist:"corretiva",formulario:"corretiva",os:"corretiva",
    entrada_saida:"checklist_saida",saida:"checklist_saida",entrada:"checklist_entrada"
  };
  const tipoRaw = tipoMap[ordem?.tipo||template?.tipo||""]||"corretiva";
  const tipo = TIPOS_VALIDOS.includes(tipoRaw) ? tipoRaw : "corretiva";

  // Mapa id → label dos campos do template (para usar label legível nas observações)
  const campoLabelMap = {};
  // template direto, ou via templateId da OS buscando em S.templates
  const templateCampos = template?.campos
    || (ordem?.templateId ? S.templates.find(t=>t.id===ordem.templateId)?.campos : null)
    || [];
  templateCampos.forEach(c=>{ if(c.id&&c.label) campoLabelMap[c.id]=c.label; });

  // Build dados — only safe string values
  const dadosSan = {};
  Object.entries(S.relDados).forEach(([k,v])=>{
    if(k.startsWith('_')) return;           // no internal keys
    if(k.endsWith('_foto')) return;         // no foto keys
    if(k.endsWith('_obs')) { if(v) dadosSan[k]=String(v); return; }
    if(v===null||v===undefined||v==='') return;
    if(typeof v==='string'&&v.startsWith('data:')) return; // no base64
    if(typeof v==='object') return;         // no objects
    dadosSan[k]=String(v);
  });

  const obs = document.getElementById('rel-obs')?.value?.trim()||null;
  const nomeCliente = document.getElementById('sig-cli-nome')?.value?.trim()||null;
  const nomeTecnico = document.getElementById('sig-tec-nome')?.value?.trim()||S.user?.nome||null;
  const obsParts=[obs,nomeCliente?`Cliente: ${nomeCliente}`:'',nomeTecnico?`Técnico: ${nomeTecnico}`:''].filter(Boolean);

  const sigCliCanvas = document.getElementById('sig-cli');
  const sigTecCanvas = document.getElementById('sig-tec');
  const sigCli = (sigCliCanvas && sigCliCanvas.tagName==='CANVAS') ? sigCliCanvas.toDataURL('image/png') : null;
  const sigTec = (sigTecCanvas && sigTecCanvas.tagName==='CANVAS') ? sigTecCanvas.toDataURL('image/png') : null;
  const svsOk = S.relServicos.filter(s=>s.descricao?.trim());
  const pcsOk = S.relPecas.filter(p=>p.nome?.trim());

  // Build payload — omit undefined/null fields that Zod rejects
  const payload = {
    clienteNome: String(clienteNome),
    tipo,
  };
  // templateId só quando não tem ordem (submitRelatorioDireto)
  if(!ordem && template?.id) payload.templateId = Number(template.id);
  // ordemId só quando tem ordem (submitRelatorio)
  if(ordem) payload.ordemId = Number(ordem.id);
  // Campos opcionais — só inclui se tiver valor real
  if(ordem?.equipamentoPatrimonio) payload.equipamentoPatrimonio = String(ordem.equipamentoPatrimonio);
  if(ordem?.equipamentoModelo) payload.equipamentoModelo = String(ordem.equipamentoModelo);
  if(dadosSan["horimetro"]) payload.horimetro = dadosSan["horimetro"];
  // Merge dados do template em observacoes usando labels legíveis
  const dadosExtra = Object.entries(dadosSan)
    .filter(([k])=>k!=="horimetro")
    .map(([k,v])=>`${campoLabelMap[k]||k}: ${v}`)
    .join(" | ");
  const obsAll = [obsParts.join(" | "), dadosExtra].filter(Boolean).join(" | ");
  if(obsAll) payload.observacoes = obsAll;
  // Envia dados com labels legíveis também (backend aceita z.record())
  if(Object.keys(dadosSan).length) {
    const dadosComLabel = {};
    Object.entries(dadosSan).forEach(([k,v])=>{ dadosComLabel[campoLabelMap[k]||k]=v; });
    payload.dados = dadosComLabel;
  }
  if(svsOk.length) payload.servicosRealizados = svsOk.map(s=>({descricao:String(s.descricao),concluido:Boolean(s.concluido)}));
  if(pcsOk.length) payload.pecasUtilizadas = pcsOk.map(p=>({nome:String(p.nome),codigo:p.codigo?String(p.codigo):null,quantidade:Number(p.quantidade)||1}));

  // Fotos — só base64 válido, máx 3
  const fotosValidas = S.relFotos.filter(f=>typeof f==='string'&&f.startsWith('data:')).slice(0,3);
  if(fotosValidas.length) payload.fotos = fotosValidas;

  // Assinaturas — só inclui se canvas foi desenhado (>500 chars) e não é enorme
  if(sigCli && sigCli.length > 500 && sigCli.length < 50000) payload.assinaturaCliente = sigCli;
  if(sigTec && sigTec.length > 500 && sigTec.length < 50000) payload.assinaturaTecnico = sigTec;

  // Log payload para debug (sem base64)
  console.log('[submitRelatorio] payload enviado:', JSON.stringify({
    ...payload,
    assinaturaCliente: payload.assinaturaCliente ? `[base64 ${payload.assinaturaCliente.length}]` : undefined,
    assinaturaTecnico: payload.assinaturaTecnico ? `[base64 ${payload.assinaturaTecnico.length}]` : undefined,
    fotos: payload.fotos ? `[${payload.fotos.length} fotos]` : undefined,
  }));

  const payloadClean = payload;

  const btn = document.querySelector('.btn-gr:last-of-type');
  if(btn){btn.disabled=true;btn.innerHTML=`${IC.send} Enviando...`;}

  try {
    if(S.isOnline) {
      // Usa endpoint REST puro (bypassa tRPC/superjson que causa erro _zod)
      const endpoint = ordem ? ENDPOINTS.submitRelatorio : ENDPOINTS.submitRelatorioDireto;
      const authHeaders = S.authToken ? {'Authorization': `Bearer ${S.authToken}`} : {};
      const restRes = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json', ...authHeaders},
        body: JSON.stringify(payloadClean),
      });
      const restJson = await restRes.json().catch(() => ({}));
      if (!restRes.ok) {
        if (restRes.status === 401) {
          // Token expirado ou ausente — limpa sessão e força login
          S.authToken = null; S.user = null;
          await saveCache('authToken', null); await saveCache('user', null);
          try { localStorage.removeItem('bgcampo_authToken'); localStorage.removeItem('bgcampo_user'); } catch(e){}
          alert('Sessão expirada. Faça login novamente.');
          S.view = 'login'; render(); return;
        }
        throw new Error(restJson?.error || `Erro ${restRes.status}`);
      }
    } else {
      await queueAction(ordem?'submitRelatorio':'submitRelatorioDireto', payloadClean);
    }
    if(ordem){const o=S.ordens.find(x=>x.id===ordem.id);if(o)o.status='concluida';}
    S.showNovoRelatorio=false;S.activeRelatorioOsId=null;S.selectedOrdemId=null;
    S.tab='relatorios';
    resetRelForm();
    // Force reload from server to show new report
    if(S.isOnline) {
      await loadServerData();
    } else {
      await saveCache('ordens',S.ordens);
    }
    render();
    showSuccess('Relatório enviado!','Dados salvos no CRM.');
  } catch(e) {
    if(btn){btn.disabled=false;btn.innerHTML=`${IC.send} Enviar Relatório`;}
    alert('Erro ao enviar: '+e.message);
  }
}

async function processSyncNow() {
  if(!S.isOnline){alert('Sem conexão');return;}
  await processQueue();
  await loadServerData();
  render();
}

// ── BOOT ──────────────────────────────────────────────────────
async function boot() {
  await initDB();
  await loadQueue();
  await checkAuth();
  await loadCachedData();

  // Hide loader
  const loader = document.getElementById('loader');
  loader.style.opacity='0';
  setTimeout(()=>loader.style.display='none',300);
  document.getElementById('app').style.display='flex';

  render();

  // Load fresh data in background
  if(S.user && S.isOnline) {
    loadServerData().then(render);
    processQueue();
  }

  // Service Worker — desabilitado para evitar cache problems
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(r=>r.forEach(s=>s.unregister()));
  }
}

window.processSyncNow = processSyncNow;
boot();

// ── SHOW SUCCESS ──────────────────────────────────────────────
function showSuccess(title, sub) {
  const ov=div('sov');
  ov.innerHTML=`<div class="sov-ico" style="color:var(--green)">${IC.checkCircle}</div><div class="sov-title">${title}</div><div class="sov-sub">${sub||''}</div>`;
  document.body.appendChild(ov);
  setTimeout(()=>ov.remove(),2500);
}

// ── VISITAS COMERCIAL ─────────────────────────────────────────
function renderVisitas() {
  const el = div('pad sp4');
  if(!S.diaAtual) {
    el.innerHTML=`
      <div class="card">
        <div class="card-b" style="text-align:center;padding:24px 16px 16px">
          <h3 style="font-size:17px;font-weight:700;margin-bottom:4px">Iniciar Dia de Visitas</h3>
          <p style="font-size:13px;color:var(--text-2)">Registre o km ao sair de casa</p>
        </div>
        <div class="card-b" style="padding-top:0">
          <div class="fg" style="margin-bottom:12px"><label class="lbl">Km Inicial *</label><input id="km-ini" type="number" class="inp" placeholder="Ex: 45230"></div>
          <button class="btn btn-bl" id="btn-ini-dia">${IC.nav} Iniciar Dia</button>
        </div>
      </div>
      ${renderHistVis()}`;
    el.querySelector('#btn-ini-dia').addEventListener('click',()=>iniciarDia(el.querySelector('#km-ini').value));
  } else if(S.diaAtual.status==='aberto') {
    el.innerHTML=`
      <div style="background:var(--blue-dim);border:1px solid rgba(74,158,255,.2);border-radius:var(--r);padding:14px 16px">
        <div class="flex jb aic">
          <div><p style="font-size:11px;color:var(--blue)">Dia em andamento</p><p style="font-size:16px;font-weight:700">Km inicial: ${S.diaAtual.kmInicial||S.diaAtual.km_inicial}</p></div>
          <span class="badge b-blue">${(S.diaAtual.checkins||[]).length} parada(s)</span>
        </div>
      </div>
      ${(S.diaAtual.checkins||[]).length?`
      <div class="card">
        ${(S.diaAtual.checkins||[]).map((c,i)=>`
          <div class="ci-item" style="${i>0?'border-top:1px solid var(--border)':''}">
            <div class="ci-num">${i+1}</div>
            <div style="flex:1;min-width:0">
              <p style="font-size:14px;font-weight:600">${c.clienteNome||c.cliente_nome||'—'}</p>
              ${c.observacoes?`<span style="font-size:11px;color:var(--text-3)">${c.observacoes}</span>`:''}
            </div>
          </div>`).join('')}
      </div>`:''}
      <div class="card">
        <div class="card-b">
          <div class="fg" style="margin-bottom:10px"><label class="lbl">Cliente / Local *</label><input id="ci-nome" class="inp" placeholder="Nome do cliente"></div>
          <div class="fg" style="margin-bottom:12px"><label class="lbl">Observações</label><input id="ci-obs" class="inp" placeholder="O que foi tratado..."></div>
          <button class="btn btn-or" id="btn-ci">${IC.check} Check-in</button>
        </div>
      </div>
      <div style="background:var(--bg-card);border:1px solid rgba(255,68,85,.2);border-radius:var(--r)">
        <div class="card-b">
          <div class="fg" style="margin-bottom:10px"><label class="lbl">Km Final *</label><input id="km-fin" type="number" class="inp" placeholder="Ex: 45380"></div>
          <button class="btn btn-dn" id="btn-enc">${IC.flag} Encerrar Dia</button>
        </div>
      </div>`;
    el.querySelector('#btn-ci').addEventListener('click',()=>doCheckin(el.querySelector('#ci-nome').value,el.querySelector('#ci-obs').value));
    el.querySelector('#btn-enc').addEventListener('click',()=>encerrarDia(el.querySelector('#km-fin').value));
  } else {
    el.innerHTML=`
      <div style="background:var(--green-dim);border:1px solid rgba(46,201,124,.2);border-radius:var(--r);padding:20px;text-align:center;color:var(--green)">
        ${IC.checkCircle}<p style="font-weight:700;margin-top:8px">Dia Encerrado</p>
      </div>
      <button class="btn btn-gh" id="btn-novo-dia">Iniciar Novo Dia</button>
      ${renderHistVis()}`;
    el.querySelector('#btn-novo-dia').addEventListener('click',()=>{S.diaAtual=null;saveCache('diaAtual',null);render();});
  }
  return el;
}

function renderHistVis() {
  if(!S.historico.length) return '';
  return `<div><div class="sec-ttl">Histórico</div><div class="sp3">
    ${S.historico.slice(0,5).map(d=>`
      <div class="csm" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <p style="font-size:14px;font-weight:600">${fmtDate(d.data||d.createdAt)}</p>
          <p style="font-size:12px;color:var(--text-3)">${d.total_checkins||0} paradas</p>
        </div>
        <span class="badge ${d.status==='fechado'?'b-green':'b-blue'}">${d.status==='fechado'?'Fechado':'Aberto'}</span>
      </div>`).join('')}
  </div></div>`;
}

async function getGPS() {
  return new Promise(resolve=>{
    if(!navigator.geolocation){resolve(null);return;}
    navigator.geolocation.getCurrentPosition(
      p=>resolve({lat:String(p.coords.latitude.toFixed(6)),lng:String(p.coords.longitude.toFixed(6))}),
      ()=>resolve(null),{enableHighAccuracy:true,timeout:10000}
    );
  });
}

async function iniciarDia(km) {
  if(!km){alert('Informe o km inicial');return;}
  const gps=await getGPS();
  const payload={kmInicial:km,latitude:gps?.lat,longitude:gps?.lng};
  try {
    if(S.isOnline){const r=await trpcMutation('campo.visitaComercial.iniciarDia',payload);S.diaAtual=r||{status:'aberto',kmInicial:km,checkins:[]};}
    else{await queueAction('iniciarDia',payload);S.diaAtual={status:'aberto',kmInicial:km,checkins:[]};}
    await saveCache('diaAtual',S.diaAtual);render();
  }catch(e){alert('Erro: '+e.message);}
}

async function doCheckin(nome,obs) {
  if(!nome){alert('Informe o nome do cliente/local');return;}
  const gps=await getGPS();
  const payload={clienteNome:nome,observacoes:obs||undefined,latitude:gps?.lat,longitude:gps?.lng};
  try {
    if(S.isOnline){await trpcMutation('campo.visitaComercial.checkin',payload);const r=await trpcQuery('campo.visitaComercial.diaAtual',{});S.diaAtual=r?.json??r;}
    else{await queueAction('checkin',payload);if(S.diaAtual){S.diaAtual.checkins=S.diaAtual.checkins||[];S.diaAtual.checkins.push({clienteNome:nome,observacoes:obs,hora:new Date().toISOString()});}}
    await saveCache('diaAtual',S.diaAtual);render();
  }catch(e){alert('Erro: '+e.message);}
}

async function encerrarDia(km) {
  if(!km){alert('Informe o km final');return;}
  const gps=await getGPS();
  const payload={kmFinal:km,latitude:gps?.lat,longitude:gps?.lng};
  try {
    if(S.isOnline){const r=await trpcMutation('campo.visitaComercial.encerrarDia',payload);if(r)alert(`Dia encerrado! Reembolso gerado.`);}
    else{await queueAction('encerrarDia',payload);}
    S.diaAtual={...S.diaAtual,status:'fechado',kmFinal:km};
    await saveCache('diaAtual',S.diaAtual);render();
  }catch(e){alert('Erro: '+e.message);}
}

// ── PERFIL ────────────────────────────────────────────────────
function renderPerfil() {
  const u=S.user;
  const el=div('pad sp4');
  el.innerHTML=`
    <div style="text-align:center;padding:24px 0 8px">
      <div class="avatar">${(u.nome||'T').charAt(0).toUpperCase()}</div>
      <h2 style="font-size:22px;font-weight:800;margin-top:12px;letter-spacing:-.5px">${u.nome}</h2>
      <p style="font-size:13px;color:var(--text-2);margin-top:2px">${u.email}</p>
      <span class="badge b-orange" style="margin-top:10px">${(u.role||'tecnico').toUpperCase()}</span>
    </div>
    <div class="det-sec">
      <div class="det-row"><span class="det-k">Acesso</span><span class="det-v">${u.role||'—'}</span></div>
      <div class="det-row"><span class="det-k">OS cache</span><span class="det-v mono">${S.ordens.length}</span></div>
      <div class="det-row"><span class="det-k">Pendentes</span><span class="det-v mono">${S.syncQueue.length}</span></div>
    </div>
    ${S.syncQueue.length?`
    <div>
      <div class="sec-ttl">Pendente de Sincronização</div>
      <div class="sp3">
        ${S.syncQueue.map(q=>`
          <div class="q-item">
            <div class="q-item-info"><p>${q.action}</p><span>${new Date(q.ts).toLocaleTimeString('pt-BR')}</span></div>
            <span class="badge b-yellow">Pendente</span>
          </div>`).join('')}
      </div>
      <button class="btn btn-gh mt3" id="btn-sync-now">${IC.sync} Sincronizar Agora</button>
    </div>`:''}
    <button class="btn btn-gh" id="btn-refresh">${IC.sync} Atualizar Dados</button>
    <button class="btn btn-dn" id="btn-logout">${IC.logout} Sair</button>
  `;
  el.querySelector('#btn-logout').addEventListener('click',doLogout);
  el.querySelector('#btn-refresh').addEventListener('click',async()=>{
    if(!S.isOnline){alert('Sem conexão');return;}
    await loadServerData();render();
  });
  el.querySelector('#btn-sync-now')?.addEventListener('click',processSyncNow);
  return el;
}
