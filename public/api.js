/**
 * api.js — ForgeFit Frontend API Client
 * All requests go to /api/* — API keys never touch the browser.
 */

const API_BASE = '/api';

const store = {
  get token() { return localStorage.getItem('gp_token'); },
  set token(v) { v ? localStorage.setItem('gp_token', v) : localStorage.removeItem('gp_token'); },
  get user() {
    try { return JSON.parse(localStorage.getItem('gp_user')); } catch { return null; }
  },
  set user(v) { v ? localStorage.setItem('gp_user', JSON.stringify(v)) : localStorage.removeItem('gp_user'); },
  clear() { localStorage.removeItem('gp_token'); localStorage.removeItem('gp_user'); },
};

class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message); this.status = status; this.errors = errors;
  }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (store.token) headers['Authorization'] = `Bearer ${store.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = {};
  try { data = await res.json(); } catch {}

  if (res.status === 401) {
    store.clear();
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register'))
      window.location.href = '/login.html';
    throw new ApiError(data.error || 'Unauthorized', 401);
  }

  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.errors || []);
  return data;
}

// ── Auth ──────────────────────────────────────────────────────
const auth = {
  async register(payload) {
    const data = await request('/auth/register', { method: 'POST', body: payload });
    store.token = data.token; store.user = data.user;
    return data;
  },
  async login(email, password) {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } });
    store.token = data.token; store.user = data.user;
    return data;
  },
  async me() {
    const data = await request('/auth/me');
    store.user = data.user; return data.user;
  },
  logout() { store.clear(); window.location.href = '/login.html'; },
  isLoggedIn() { return !!store.token; },
  currentUser() { return store.user; },
};

// ── Workouts ──────────────────────────────────────────────────
const workouts = {
  list(params = {})      { const qs = new URLSearchParams(params).toString(); return request(`/workouts${qs ? '?'+qs : ''}`); },
  get(id)                { return request(`/workouts/${id}`); },
  create(payload)        { return request('/workouts', { method: 'POST', body: payload }); },
  update(id, payload)    { return request(`/workouts/${id}`, { method: 'PATCH', body: payload }); },
  delete(id)             { return request(`/workouts/${id}`, { method: 'DELETE' }); },
};

// ── AI ────────────────────────────────────────────────────────
const ai = {
  generateWorkout(prefs)         { return request('/ai/generate-workout', { method: 'POST', body: prefs }); },
  chat(messages, userProfile={}) { return request('/ai/chat', { method: 'POST', body: { messages, userProfile } }); },
  analyzeWorkout(workout)        { return request('/ai/analyze-workout', { method: 'POST', body: { workout } }); },
};

// ── Users ─────────────────────────────────────────────────────
const users = {
  updateProfile(payload)  { return request('/users/profile',  { method: 'PATCH',  body: payload }); },
  changePassword(payload) { return request('/users/password', { method: 'PATCH',  body: payload }); },
  deleteAccount()         { return request('/users/account',  { method: 'DELETE' }); },
};

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 5000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// ── Guards ────────────────────────────────────────────────────
function requireAuth() {
  if (!auth.isLoggedIn()) { window.location.href = '/login.html'; return false; }
  return true;
}
function redirectIfAuth() {
  if (auth.isLoggedIn()) window.location.href = '/dashboard.html';
}

// ── Helpers ───────────────────────────────────────────────────
function checkPasswordStrength(pw) {
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = ['','weak','fair','good','strong','strong'];
  const labels = ['','Weak','Fair','Good','Strong','Very Strong'];
  return { score: s, level: levels[s]||'weak', label: labels[s]||'Weak' };
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function formatRelative(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1)    return 'Just now';
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m/60)}h ago`;
  return `${Math.floor(m/1440)}d ago`;
}

function capitalize(str) { return str ? str[0].toUpperCase()+str.slice(1) : ''; }

window.GymApp = { auth, workouts, ai, users, showToast, requireAuth, redirectIfAuth, checkPasswordStrength, formatDate, formatRelative, capitalize, ApiError };
