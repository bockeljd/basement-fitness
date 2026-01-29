/* Basement Fitness (static, localStorage-first)
   Data model:
   - bf:routines = [{id,name,desc,exercises:[{id,name}]}]
   - bf:sessions = [{id,routineId,startedAt,endedAt,notes,entries:{[exerciseId]:[{w,r,ts}]}}]
*/

const $ = (id) => document.getElementById(id);
const uid = () => Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

const KEYS = {
  routines: 'bf:routines',
  sessions: 'bf:sessions',
  active: 'bf:activeSessionId'
};

function seedIfEmpty() {
  const r = store.get(KEYS.routines, null);
  if (Array.isArray(r) && r.length) return;

  const routineId = uid();
  const sample = [
    {
      id: routineId,
      name: 'Full Body (Sample)',
      desc: 'Edit this routine to match your workout.',
      exercises: [
        { id: uid(), name: 'Bench Press' },
        { id: uid(), name: 'Lat Pulldown' },
        { id: uid(), name: 'Squat' },
      ]
    }
  ];
  store.set(KEYS.routines, sample);
  store.set(KEYS.sessions, []);
}

let state = {
  routines: [],
  sessions: [],
  activeSessionId: null,
  timer: { remainingSec: 0, running: false, interval: null }
};

function loadState() {
  state.routines = store.get(KEYS.routines, []);
  state.sessions = store.get(KEYS.sessions, []);
  state.activeSessionId = store.get(KEYS.active, null);
}

function saveRoutines() { store.set(KEYS.routines, state.routines); }
function saveSessions() { store.set(KEYS.sessions, state.sessions); }
function saveActive() { store.set(KEYS.active, state.activeSessionId); }

function fmtTimer(sec) {
  const s = Math.max(0, sec|0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2,'0')}`;
}

function setSubtitle(text) {
  $('subtitle').textContent = text;
}

function renderRoutines() {
  const el = $('routineList');
  el.innerHTML = '';
  state.routines.forEach(r => {
    const item = document.createElement('div');
    item.className = 'routineItem';
    item.innerHTML = `
      <div class="routineMeta">
        <div class="routineName">${escapeHtml(r.name)}</div>
        <div class="routineDesc">${escapeHtml(r.desc || '')}</div>
      </div>
      <div class="row">
        <button class="btn" data-action="start" data-id="${r.id}">Start</button>
        <button class="btn secondary" data-action="edit" data-id="${r.id}">Edit</button>
      </div>
    `;
    el.appendChild(item);
  });
}

function activeSession() {
  return state.sessions.find(s => s.id === state.activeSessionId) || null;
}

function activeRoutine(session) {
  return state.routines.find(r => r.id === session.routineId) || null;
}

function ensureSessionShape(s) {
  s.entries = s.entries || {};
  s.notes = s.notes || '';
  return s;
}

function renderWorkout() {
  const s = activeSession();
  const card = $('cardWorkout');
  if (!s) {
    card.hidden = true;
    $('cardRoutines').hidden = false;
    setSubtitle('Workout tracker');
    return;
  }
  ensureSessionShape(s);

  const r = activeRoutine(s);
  $('cardRoutines').hidden = true;
  card.hidden = false;

  $('workoutTitle').textContent = r ? `Workout — ${r.name}` : 'Workout';
  setSubtitle(`Session started ${new Date(s.startedAt).toLocaleString()}`);

  $('workoutNotes').value = s.notes || '';

  const list = $('exerciseList');
  list.innerHTML = '';

  const exercises = (r?.exercises || []);
  exercises.forEach(ex => {
    const exEl = document.createElement('div');
    exEl.className = 'exercise';

    const sets = s.entries[ex.id] || [];

    exEl.innerHTML = `
      <div class="exerciseHeader">
        <div>
          <div class="exerciseName">${escapeHtml(ex.name)}</div>
          <div class="small">${sets.length} sets logged</div>
        </div>
        <div class="row">
          <button class="btn secondary" data-action="renameExercise" data-ex="${ex.id}">Rename</button>
          <button class="btn danger" data-action="removeExercise" data-ex="${ex.id}">Remove</button>
        </div>
      </div>
      <div class="sets" id="sets-${ex.id}"></div>
      <div class="row wrap" style="margin-top:10px">
        <input class="input" inputmode="decimal" placeholder="Weight" data-field="w" data-ex="${ex.id}" />
        <input class="input" inputmode="numeric" placeholder="Reps" data-field="r" data-ex="${ex.id}" />
        <button class="btn" data-action="logSet" data-ex="${ex.id}">Log set</button>
      </div>
    `;

    list.appendChild(exEl);

    // render sets list
    const setsEl = exEl.querySelector(`#sets-${CSS.escape(ex.id)}`);
    setsEl.innerHTML = sets.map((st, idx) => {
      const ts = st.ts ? new Date(st.ts).toLocaleTimeString() : '';
      return `
        <div class="setRow">
          <div class="small">#${idx+1} · ${escapeHtml(String(st.w ?? ''))} lb</div>
          <div class="small">${escapeHtml(String(st.r ?? ''))} reps · ${escapeHtml(ts)}</div>
          <button class="btn danger" data-action="deleteSet" data-ex="${ex.id}" data-idx="${idx}">Del</button>
        </div>
      `;
    }).join('');
  });
}

function startRoutine(routineId) {
  const r = state.routines.find(x => x.id === routineId);
  if (!r) return;

  const s = {
    id: uid(),
    routineId: r.id,
    startedAt: new Date().toISOString(),
    endedAt: null,
    notes: '',
    entries: {}
  };
  state.sessions.unshift(s);
  state.activeSessionId = s.id;
  saveSessions();
  saveActive();
  renderWorkout();
}

function endWorkout() {
  const s = activeSession();
  if (!s) return;
  s.endedAt = new Date().toISOString();
  state.activeSessionId = null;
  saveSessions();
  saveActive();
  stopTimer();
  renderWorkout();
}

function addExercise() {
  const s = activeSession();
  if (!s) return;
  const r = activeRoutine(s);
  if (!r) return;
  const name = prompt('Exercise name?');
  if (!name) return;
  r.exercises = r.exercises || [];
  r.exercises.push({ id: uid(), name: name.trim() });
  saveRoutines();
  renderWorkout();
}

function renameExercise(exId) {
  const s = activeSession();
  if (!s) return;
  const r = activeRoutine(s);
  const ex = r?.exercises?.find(e => e.id === exId);
  if (!ex) return;
  const name = prompt('New exercise name?', ex.name);
  if (!name) return;
  ex.name = name.trim();
  saveRoutines();
  renderWorkout();
}

function removeExercise(exId) {
  const s = activeSession();
  if (!s) return;
  const r = activeRoutine(s);
  if (!r) return;
  if (!confirm('Remove exercise (and keep logged sets)?')) return;
  r.exercises = (r.exercises || []).filter(e => e.id !== exId);
  saveRoutines();
  renderWorkout();
}

function logSet(exId) {
  const s = activeSession();
  if (!s) return;
  ensureSessionShape(s);

  // read inputs from the exercise card
  const container = $('exerciseList');
  const wInput = container.querySelector(`input[data-field="w"][data-ex="${CSS.escape(exId)}"]`);
  const rInput = container.querySelector(`input[data-field="r"][data-ex="${CSS.escape(exId)}"]`);
  const w = wInput?.value?.trim();
  const r = rInput?.value?.trim();
  if (!w || !r) {
    alert('Enter weight and reps.');
    return;
  }

  s.entries[exId] = s.entries[exId] || [];
  s.entries[exId].push({ w, r, ts: new Date().toISOString() });
  saveSessions();

  // quick UX
  if (wInput) wInput.value = w;
  if (rInput) rInput.value = '';

  // start a default rest timer
  addRest(90);
  renderWorkout();
}

function deleteSet(exId, idx) {
  const s = activeSession();
  if (!s) return;
  s.entries[exId] = (s.entries[exId] || []).filter((_, i) => i !== idx);
  saveSessions();
  renderWorkout();
}

function newRoutine() {
  const name = prompt('Routine name?');
  if (!name) return;
  const desc = prompt('Optional description?') || '';
  state.routines.unshift({ id: uid(), name: name.trim(), desc: desc.trim(), exercises: [] });
  saveRoutines();
  renderRoutines();
}

function editRoutine(routineId) {
  const r = state.routines.find(x => x.id === routineId);
  if (!r) return;
  const name = prompt('Routine name?', r.name);
  if (name) r.name = name.trim();
  const desc = prompt('Description?', r.desc || '');
  if (desc !== null) r.desc = desc.trim();
  saveRoutines();
  renderRoutines();
}

function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    routines: state.routines,
    sessions: state.sessions
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `basement-fitness-export-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || '{}'));
      if (!data || !Array.isArray(data.routines) || !Array.isArray(data.sessions)) {
        alert('Invalid export file.');
        return;
      }
      state.routines = data.routines;
      state.sessions = data.sessions;
      state.activeSessionId = null;
      saveRoutines();
      saveSessions();
      saveActive();
      renderRoutines();
      renderWorkout();
      alert('Imported.');
    } catch (e) {
      alert('Import failed.');
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  if (!confirm('Reset all local data (routines + workout history)?')) return;
  localStorage.removeItem(KEYS.routines);
  localStorage.removeItem(KEYS.sessions);
  localStorage.removeItem(KEYS.active);
  seedIfEmpty();
  loadState();
  renderRoutines();
  renderWorkout();
}

// Timer
function tick() {
  if (!state.timer.running) return;
  state.timer.remainingSec = Math.max(0, state.timer.remainingSec - 1);
  $('timer').textContent = fmtTimer(state.timer.remainingSec);
  if (state.timer.remainingSec <= 0) {
    stopTimer();
    // subtle beep using vibration if available
    if (navigator.vibrate) navigator.vibrate([120, 50, 120]);
  }
}

function startTimer() {
  if (state.timer.running) return;
  state.timer.running = true;
  state.timer.interval = setInterval(tick, 1000);
  $('btnTimerStartStop').textContent = 'Pause';
}

function stopTimer() {
  state.timer.running = false;
  if (state.timer.interval) clearInterval(state.timer.interval);
  state.timer.interval = null;
  $('btnTimerStartStop').textContent = 'Start';
}

function resetTimer() {
  stopTimer();
  state.timer.remainingSec = 0;
  $('timer').textContent = fmtTimer(0);
}

function addRest(sec) {
  state.timer.remainingSec += (sec|0);
  $('timer').textContent = fmtTimer(state.timer.remainingSec);
  startTimer();
}

// Helpers
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Events
function wire() {
  $('btnNewRoutine').addEventListener('click', newRoutine);
  $('btnAddExercise').addEventListener('click', addExercise);
  $('btnEndWorkout').addEventListener('click', endWorkout);

  $('btnTimerStartStop').addEventListener('click', () => {
    state.timer.running ? stopTimer() : startTimer();
  });
  $('btnTimerReset').addEventListener('click', resetTimer);

  document.querySelectorAll('[data-rest]').forEach(btn => {
    btn.addEventListener('click', () => addRest(Number(btn.getAttribute('data-rest') || '0')));
  });

  $('workoutNotes').addEventListener('input', (e) => {
    const s = activeSession();
    if (!s) return;
    s.notes = e.target.value;
    saveSessions();
  });

  $('routineList').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (action === 'start') startRoutine(id);
    if (action === 'edit') editRoutine(id);
  });

  $('exerciseList').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const exId = btn.getAttribute('data-ex');
    if (!action || !exId) return;
    if (action === 'logSet') logSet(exId);
    if (action === 'renameExercise') renameExercise(exId);
    if (action === 'removeExercise') removeExercise(exId);
    if (action === 'deleteSet') {
      const idx = Number(btn.getAttribute('data-idx'));
      deleteSet(exId, idx);
    }
  });

  $('btnExport').addEventListener('click', exportData);
  $('btnImport').addEventListener('click', () => $('fileImport').click());
  $('fileImport').addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (f) importData(f);
    e.target.value = '';
  });

  $('btnReset').addEventListener('click', resetAll);

  // enable keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') stopTimer();
  });
}

function boot() {
  seedIfEmpty();
  loadState();
  wire();
  $('timer').textContent = fmtTimer(0);
  renderRoutines();
  renderWorkout();
}

boot();
