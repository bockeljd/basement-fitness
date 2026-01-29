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
  active: 'bf:activeSessionId',
  profile: 'bf:profile',
  goals: 'bf:goals',
  theme: 'bf:theme',
  primaryGoal: 'bf:primaryGoal',
  secondaryGoal: 'bf:secondaryGoal',
  plan: 'bf:plan'
};

function seedIfEmpty() {
  const r = store.get(KEYS.routines, null);
  if (Array.isArray(r) && r.length) return;

  // Start clean: no sample routines.
  store.set(KEYS.routines, []);
  store.set(KEYS.sessions, []);

  // Default profile
  store.set(KEYS.profile, { goal: 'general', durationMin: 30, equipment: ['bodyweight'] });
}

let state = {
  routines: [],
  sessions: [],
  activeSessionId: null,
  profile: {
    goal: 'general',
    durationMin: 30,
    equipment: ['bodyweight']
  },
  primaryGoal: null,
  secondaryGoal: null,
  goals: [],
  theme: 'light',
  plan: { generatedAt: null, days: [] },
  timer: { remainingSec: 0, running: false, interval: null }
};

function loadState() {
  state.routines = store.get(KEYS.routines, []);
  state.sessions = store.get(KEYS.sessions, []);
  state.activeSessionId = store.get(KEYS.active, null);
  state.profile = store.get(KEYS.profile, state.profile);
  state.primaryGoal = store.get(KEYS.primaryGoal, null);
  state.secondaryGoal = store.get(KEYS.secondaryGoal, null);
  state.goals = store.get(KEYS.goals, []);
  state.theme = store.get(KEYS.theme, 'light');
  state.plan = store.get(KEYS.plan, state.plan);
}

function saveRoutines() { store.set(KEYS.routines, state.routines); }
function saveSessions() { store.set(KEYS.sessions, state.sessions); }
function saveActive() { store.set(KEYS.active, state.activeSessionId); }
function saveProfile() { store.set(KEYS.profile, state.profile); }
function saveGoals() { store.set(KEYS.goals, state.goals); }
function saveTheme() { store.set(KEYS.theme, state.theme); }
function savePrimaryGoal() { store.set(KEYS.primaryGoal, state.primaryGoal); }
function saveSecondaryGoal() { store.set(KEYS.secondaryGoal, state.secondaryGoal); }
function savePlan() { store.set(KEYS.plan, state.plan); }

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

// Dashboard (daily/weekly/monthly goals)
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}
function ymd(d) {
  const x = startOfDay(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth()+1).padStart(2,'0');
  const dd = String(x.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
function weekKey(d) {
  // ISO-ish week key: YYYY-Www (rough, good enough for UX)
  const x = startOfDay(d);
  const jan1 = new Date(x.getFullYear(), 0, 1);
  const days = Math.floor((x - jan1) / 86400000);
  const w = Math.floor((days + jan1.getDay()) / 7) + 1;
  return `${x.getFullYear()}-W${String(w).padStart(2,'0')}`;
}
function monthKey(d) {
  const x = startOfDay(d);
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`;
}
function goalPeriodKey(goal, now=new Date()) {
  if (goal.period === 'daily') return ymd(now);
  if (goal.period === 'weekly') return weekKey(now);
  return monthKey(now);
}
function currentProgress(goal, now=new Date()) {
  goal.progress = goal.progress || {};
  const k = goalPeriodKey(goal, now);
  return Number(goal.progress[k] || 0);
}
function setProgress(goalId, val, now=new Date()) {
  const g = state.goals.find(x => x.id === goalId);
  if (!g) return;
  g.progress = g.progress || {};
  const k = goalPeriodKey(g, now);
  g.progress[k] = Math.max(0, Number(val || 0));
  saveGoals();
}
function incProgress(goalId, delta=1) {
  const g = state.goals.find(x => x.id === goalId);
  if (!g) return;
  const cur = currentProgress(g);
  setProgress(goalId, cur + delta);
  renderDashboard();
}
function addGoal() {
  const title = prompt('Goal name? (e.g., Workouts, Protein days, Steps, Pushups)');
  if (!title) return;
  const period = prompt('Period? Enter daily / weekly / monthly', 'daily');
  const p = String(period || 'daily').toLowerCase();
  if (!['daily','weekly','monthly'].includes(p)) {
    alert('Period must be daily, weekly, or monthly.');
    return;
  }
  const targetRaw = prompt('Target number? (e.g., 1 per day, 4 per week, 12 per month)', '1');
  const target = Number(targetRaw || 1);
  if (!target || Number.isNaN(target) || target <= 0) {
    alert('Target must be a positive number.');
    return;
  }

  state.goals.unshift({
    id: uid(),
    title: title.trim(),
    period: p,
    target,
    progress: {}
  });
  saveGoals();
  renderDashboard();
}
function deleteGoal(goalId) {
  if (!confirm('Delete goal?')) return;
  state.goals = state.goals.filter(g => g.id !== goalId);
  saveGoals();
  renderDashboard();
}
function renderGoalList(elId, period) {
  const el = $(elId);
  if (!el) return;
  const now = new Date();
  const goals = (state.goals || []).filter(g => g.period === period);
  if (!goals.length) {
    el.innerHTML = `<div class="muted">No ${period} goals yet.</div>`;
    return;
  }
  el.innerHTML = '';
  goals.forEach(g => {
    const cur = currentProgress(g, now);
    const pct = Math.max(0, Math.min(100, (cur / g.target) * 100));
    const item = document.createElement('div');
    item.className = 'goalItem';
    item.innerHTML = `
      <div style="flex:1;min-width:180px">
        <div style="font-weight:900">${escapeHtml(g.title)}</div>
        <div class="small">${cur} / ${g.target} (${g.period})</div>
        <div class="progressBar" style="margin-top:8px"><div class="progressFill" style="width:${pct}%"></div></div>
      </div>
      <div class="row wrap">
        <button class="btn" data-goal-action="inc" data-goal-id="${g.id}">+1</button>
        <button class="btn secondary" data-goal-action="dec" data-goal-id="${g.id}">-1</button>
        <button class="btn danger" data-goal-action="del" data-goal-id="${g.id}">Del</button>
      </div>
    `;
    el.appendChild(item);
  });
}
function computeStreak() {
  // streak = consecutive days with at least 1 ended workout session
  const sessions = (state.sessions || []).filter(s => s.endedAt);
  const days = new Set(sessions.map(s => ymd(new Date(s.endedAt))));
  let streak = 0;
  let d = startOfDay(new Date());
  // if no workout today, allow streak to be based on yesterday
  if (!days.has(ymd(d))) d = new Date(d.getTime() - 86400000);
  while (days.has(ymd(d))) {
    streak += 1;
    d = new Date(d.getTime() - 86400000);
  }
  return streak;
}
function renderDashboard() {
  // Primary / secondary
  const pg = $('primaryGoal');
  const pprog = $('primaryGoalProgress');
  if (pg) {
    if (!state.primaryGoal) {
      pg.textContent = 'Not set';
      if (pprog) pprog.textContent = '';
    } else {
      const g = state.primaryGoal;
      pg.textContent = `${g.type.replace('_',' ')} · ${g.daysPerWeek || 3}x/week · ${g.durationMin || 30}m`;
      if (pprog) {
        if (g.type === 'lose_weight') {
          const sw = g.startWeightLbs ? `Start ${g.startWeightLbs} lb` : '';
          const cw = g.currentWeightLbs ? `Current ${g.currentWeightLbs} lb` : '';
          pprog.textContent = [sw, cw].filter(Boolean).join(' · ');
        } else if (g.type === 'run_5k') {
          const base = g.canRun10Min ? 'can run 10 min' : 'run/walk';
          const best = g.best5kMin ? `best ${g.best5kMin} min` : '';
          pprog.textContent = ['Baseline: ' + base, best].filter(Boolean).join(' · ');
        } else if (g.type === 'bar_hang') {
          const base = g.maxHangSec ? `baseline ${g.maxHangSec}s` : '';
          const best = g.bestHangSec ? `best ${g.bestHangSec}s` : '';
          pprog.textContent = [base, best].filter(Boolean).join(' · ');
        } else if (g.type === 'pushups') {
          const base = g.maxPushups ? `baseline ${g.maxPushups}` : '';
          const best = g.bestPushups ? `best ${g.bestPushups}` : '';
          pprog.textContent = [base, best].filter(Boolean).join(' · ');
        } else {
          pprog.textContent = '';
        }
      }
    }
  }
  const sg = $('secondaryGoal');
  if (sg) sg.textContent = state.secondaryGoal?.type ? state.secondaryGoal.type : 'None';

  // Habit goals
  renderGoalList('goalsDaily', 'daily');
  renderGoalList('goalsWeekly', 'weekly');
  renderGoalList('goalsMonthly', 'monthly');

  const st = computeStreak();
  const el = $('streakText');
  if (el) el.textContent = st ? `${st} day streak` : 'No streak yet';

  renderPlan();
}
function updateGoalFieldVisibility() {
  const t = String($('primaryType')?.value || '').trim();
  const baseWrap = $('primaryBaselineWrap');
  const progWrap = $('primaryProgressWrap');
  const baseLabel = $('primaryBaselineLabel');
  const progLabel = $('primaryProgressLabel');
  const baseHint = $('primaryBaselineHint');
  const progHint = $('primaryProgressHint');

  if (!baseWrap || !progWrap) return;

  // default hidden
  baseWrap.hidden = true;
  progWrap.hidden = true;

  if (t === 'bar_hang') {
    baseWrap.hidden = false;
    progWrap.hidden = false;
    baseLabel.textContent = 'Baseline max hang (seconds)';
    progLabel.textContent = 'Current best hang (seconds)';
    baseHint.textContent = 'Enter your best hang today (e.g., 30).';
    progHint.textContent = 'Update as you improve; we’ll scale intervals from this.';
  } else if (t === 'pushups') {
    baseWrap.hidden = false;
    progWrap.hidden = false;
    baseLabel.textContent = 'Baseline max pushups (reps)';
    progLabel.textContent = 'Current best pushups (reps)';
    baseHint.textContent = 'Enter your current max reps (e.g., 12).';
    progHint.textContent = 'Update as your max increases.';
  } else if (t === 'run_5k') {
    baseWrap.hidden = false;
    progWrap.hidden = false;
    baseLabel.textContent = 'Baseline: can run 10 min? (1=yes, 0=no)';
    progLabel.textContent = 'Best 5K time (minutes, optional)';
    baseHint.textContent = 'Use 1 if yes, 0 if no.';
    progHint.textContent = 'Optional: enter best time in minutes when you have it.';
  } else if (t === 'lose_weight') {
    baseWrap.hidden = false;
    progWrap.hidden = false;
    baseLabel.textContent = 'Start weight (lbs)';
    progLabel.textContent = 'Current weight (lbs)';
    baseHint.textContent = 'Optional but recommended.';
    progHint.textContent = 'Update periodically to track progress.';
  }
}

function saveGoalsFromForm() {
  const t = String($('primaryType')?.value || '').trim();
  if (!t) {
    alert('Pick a primary goal.');
    return;
  }
  const durationMin = Number($('primaryMinutes')?.value || state.profile.durationMin || 30);
  const daysPerWeek = Number($('primaryDays')?.value || 3);

  const goal = {
    type: t,
    durationMin: durationMin || 30,
    daysPerWeek: daysPerWeek || 3,
    createdAt: new Date().toISOString()
  };

  // goal-specific baseline + progress
  const baselineVal = Number($('primaryBaseline')?.value || 0);
  const progressVal = Number($('primaryProgress')?.value || 0);

  if (t === 'bar_hang') {
    if (baselineVal) goal.maxHangSec = baselineVal;
    if (progressVal) goal.bestHangSec = progressVal;
  } else if (t === 'pushups') {
    if (baselineVal) goal.maxPushups = baselineVal;
    if (progressVal) goal.bestPushups = progressVal;
  } else if (t === 'run_5k') {
    goal.canRun10Min = Boolean(baselineVal);
    if (progressVal) goal.best5kMin = progressVal;
  } else if (t === 'lose_weight') {
    if (baselineVal) goal.startWeightLbs = baselineVal;
    if (progressVal) goal.currentWeightLbs = progressVal;
  }

  state.primaryGoal = goal;

  const st = String($('secondaryType')?.value || '').trim();
  state.secondaryGoal = st ? { type: st, createdAt: new Date().toISOString() } : null;

  savePrimaryGoal();
  saveSecondaryGoal();
  regeneratePlan();
  renderDashboard();
}

function hydrateGoalsForm() {
  const pt = $('primaryType');
  const pm = $('primaryMinutes');
  const pd = $('primaryDays');
  const st = $('secondaryType');
  const base = $('primaryBaseline');
  const prog = $('primaryProgress');

  if (pt) pt.value = state.primaryGoal?.type || '';
  if (pm) pm.value = String(state.primaryGoal?.durationMin || state.profile.durationMin || 30);
  if (pd) pd.value = String(state.primaryGoal?.daysPerWeek || 3);
  if (st) st.value = state.secondaryGoal?.type || '';

  // baseline/progress fields
  const t = state.primaryGoal?.type;
  if (t === 'bar_hang') {
    if (base) base.value = String(state.primaryGoal?.maxHangSec || '');
    if (prog) prog.value = String(state.primaryGoal?.bestHangSec || '');
  } else if (t === 'pushups') {
    if (base) base.value = String(state.primaryGoal?.maxPushups || '');
    if (prog) prog.value = String(state.primaryGoal?.bestPushups || '');
  } else if (t === 'run_5k') {
    if (base) base.value = state.primaryGoal?.canRun10Min ? '1' : '0';
    if (prog) prog.value = String(state.primaryGoal?.best5kMin || '');
  } else if (t === 'lose_weight') {
    if (base) base.value = String(state.primaryGoal?.startWeightLbs || '');
    if (prog) prog.value = String(state.primaryGoal?.currentWeightLbs || '');
  } else {
    if (base) base.value = '';
    if (prog) prog.value = '';
  }

  updateGoalFieldVisibility();
}

function ensurePlanGenerated() {
  if (!state.primaryGoal) return false;
  if (!state.plan || !Array.isArray(state.plan.days) || state.plan.days.length === 0) {
    regeneratePlan();
  }
  return true;
}

function regeneratePlan() {
  if (!state.primaryGoal) {
    alert('Set a primary goal first.');
    return;
  }

  // Build a simple 14-day plan.
  const now = new Date();
  const daysPerWeek = Math.max(1, Math.min(7, Number(state.primaryGoal.daysPerWeek || 3)));
  const cadence = Math.max(1, Math.floor(7 / daysPerWeek));

  const planDays = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const isWorkoutDay = (i % cadence) === 0;
    if (isWorkoutDay) {
      const routine = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal);
      planDays.push({
        date: ymd(d),
        kind: 'workout',
        routine
      });
    } else {
      planDays.push({
        date: ymd(d),
        kind: 'rest',
        routine: null
      });
    }
  }

  state.plan = { generatedAt: new Date().toISOString(), days: planDays };
  savePlan();
  renderPlan();
}

function startPlannedWorkout(dateStr) {
  ensurePlanGenerated();
  const item = (state.plan.days || []).find(x => x.date === dateStr);
  if (!item || !item.routine) return;
  const r = item.routine;
  state.routines = [r, ...state.routines.filter(x => x.id !== r.id)];
  saveRoutines();
  renderRoutines();
  startRoutine(r.id);
}

function generateTodayFromGoals() {
  // Generate or start today's planned workout.
  if (!ensurePlanGenerated()) {
    alert('Set a primary goal first.');
    return;
  }
  const today = ymd(new Date());
  const item = (state.plan.days || []).find(x => x.date === today);
  if (item?.routine) return startPlannedWorkout(today);
  // If today is rest day, just generate a one-off session.
  const r = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal);
  state.routines = [r, ...state.routines.filter(x => x.id !== r.id)];
  saveRoutines();
  renderRoutines();
  startRoutine(r.id);
}

function renderPlan() {
  const el = $('planList');
  if (!el) return;

  if (!state.primaryGoal) {
    el.innerHTML = '<div class="muted">Set a primary goal to generate a plan.</div>';
    return;
  }

  ensurePlanGenerated();
  const days = (state.plan?.days || []).slice(0, 14);
  const today = ymd(new Date());

  el.innerHTML = '';
  days.forEach(d => {
    const item = document.createElement('div');
    item.className = 'planItem';
    const isToday = d.date === today;
    const label = d.kind === 'workout' ? (d.routine?.name || 'Workout') : 'Rest / Recovery';
    item.innerHTML = `
      <div class="planMeta">
        <div class="planDate">${isToday ? 'Today' : d.date}</div>
        <div class="planTitle">${escapeHtml(label)}</div>
      </div>
      <div class="row wrap">
        ${d.kind === 'workout' ? `<button class="btn" data-plan-action="start" data-plan-date="${d.date}">Start</button>` : ''}
      </div>
    `;
    el.appendChild(item);
  });
}

function wireDashboard() {
  $('btnAddGoal')?.addEventListener('click', addGoal);
  $('btnSaveGoals')?.addEventListener('click', saveGoalsFromForm);
  $('primaryType')?.addEventListener('change', updateGoalFieldVisibility);
  $('btnGenerateToday')?.addEventListener('click', generateTodayFromGoals);
  $('btnRegenPlan')?.addEventListener('click', regeneratePlan);

  $('planList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const act = btn.getAttribute('data-plan-action');
    const dateStr = btn.getAttribute('data-plan-date');
    if (act === 'start' && dateStr) startPlannedWorkout(dateStr);
  });

  // event delegation
  ['goalsDaily','goalsWeekly','goalsMonthly'].forEach(id => {
    $(id)?.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const act = btn.getAttribute('data-goal-action');
      const gid = btn.getAttribute('data-goal-id');
      if (!act || !gid) return;
      if (act === 'inc') incProgress(gid, 1);
      if (act === 'dec') incProgress(gid, -1);
      if (act === 'del') deleteGoal(gid);
    });
  });
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
function wireQuickStart() {
  // Initialize UI from stored profile
  const goalSel = $('qsGoal');
  const durSel = $('qsDuration');
  if (goalSel) goalSel.value = state.profile.goal || 'general';
  if (durSel) durSel.value = String(state.profile.durationMin || 30);

  // equipment checkboxes
  document.querySelectorAll('#qsEquipment input[type="checkbox"][data-eq]').forEach(cb => {
    const k = cb.getAttribute('data-eq');
    cb.checked = (state.profile.equipment || []).includes(k);
    cb.addEventListener('change', () => {
      const eq = new Set(state.profile.equipment || []);
      if (cb.checked) eq.add(k);
      else eq.delete(k);
      // always keep at least bodyweight
      if (eq.size === 0) eq.add('bodyweight');
      state.profile.equipment = Array.from(eq);
      saveProfile();
    });
  });

  if (goalSel) goalSel.addEventListener('change', () => {
    state.profile.goal = goalSel.value;
    saveProfile();
  });
  if (durSel) durSel.addEventListener('change', () => {
    state.profile.durationMin = Number(durSel.value || 30);
    saveProfile();
  });

  $('btnQuickStart')?.addEventListener('click', () => {
    const r = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal);
    // Add as a routine (so it can be reused) and start
    state.routines = [r, ...state.routines.filter(x => x.id !== r.id)];
    saveRoutines();
    renderRoutines();
    startRoutine(r.id);
  });
}

function secondaryFinisher(secondaryGoal, eq) {
  const s = secondaryGoal?.type;
  if (!s) return [];
  if (s === 'steps') return [{ id: uid(), name: 'Walk (10–20 min)' }];
  if (s === 'zone2' && (eq.has('treadmill') || eq.has('bike'))) return [{ id: uid(), name: 'Zone 2 cardio (15–25 min)' }];
  if (s === 'mobility') return [{ id: uid(), name: 'Mobility flow (8–12 min)' }];
  if (s === 'protein') return [{ id: uid(), name: 'Protein check (hit target today)' }];
  return [];
}

function generateRoutineFromProfile(profile, primaryGoal = null, secondaryGoal = null) {
  const goal = primaryGoal?.type || profile?.goal || 'general';
  const dur = Number(primaryGoal?.durationMin || profile?.durationMin || 30);
  const eq = new Set(profile?.equipment || ['bodyweight']);

  // Choose a template by goal and available equipment.
  const wantsRun = eq.has('treadmill') || eq.has('bike');
  const hasPullup = eq.has('pullupbar');
  const hasDB = eq.has('dumbbells');
  const hasBB = eq.has('barbell');

  let name = 'Quick Start';
  let desc = `Goal: ${goal}, Duration: ${dur}m, Equipment: ${Array.from(eq).join(', ')}`;

  let exercises = [];

  // Primary goal templates
  if (goal === 'run_5k' || goal === '5k') {
    name = 'Goal Session: 5K';
    exercises = [
      { id: uid(), name: 'Warm-up (5 min)' },
      { id: uid(), name: wantsRun ? 'Intervals: run 1 min / walk 1 min (12–20 min)' : 'Intervals: run/walk (12–20 min)' },
      { id: uid(), name: 'Easy pace (5–10 min)' },
      { id: uid(), name: 'Cool down + stretch (5 min)' },
    ];
  } else if (goal === 'bar_hang' || goal === 'barhang') {
    name = 'Goal Session: 2-min Hang';

    const baseline = Number(primaryGoal?.bestHangSec || primaryGoal?.maxHangSec || 30);
    const work = Math.max(10, Math.round(baseline * 0.6));
    const sets = baseline >= 60 ? 6 : 5;

    exercises = hasPullup ? [
      { id: uid(), name: `Dead hang — ${sets} x ${work}s (rest 60–90s)` },
      { id: uid(), name: 'Scapular pull-ups — 3 x 8' },
      { id: uid(), name: 'Farmer carry / grip — 3 x 45s' },
      { id: uid(), name: 'Hollow hold — 3 x 25s' },
    ] : [
      { id: uid(), name: `Towel grip holds — ${sets} x ${work}s` },
      { id: uid(), name: 'Forearm extensor work — 3 x 20' },
      { id: uid(), name: 'Plank — 3 x 30s' },
    ];
  } else if (goal === 'lose_weight' || goal === 'fat_loss') { 

    name = 'Goal Session: Fat Loss (Full Body)';
    exercises = hasDB ? [
      { id: uid(), name: 'DB Goblet Squat' },
      { id: uid(), name: 'DB Row' },
      { id: uid(), name: 'DB Press' },
      { id: uid(), name: 'Conditioning finisher (8–12 min)' },
    ] : [
      { id: uid(), name: 'Air Squat' },
      { id: uid(), name: 'Pushups' },
      { id: uid(), name: 'Hip hinge (good morning)' },
      { id: uid(), name: 'Brisk walk / intervals (10–20 min)' },
    ];
  } else if (goal === 'pushups') {
    name = 'Goal Session: Pushups';
    const baseline = Number(primaryGoal?.bestPushups || primaryGoal?.maxPushups || 10);
    const rep = Math.max(3, Math.floor(baseline * 0.6));
    exercises = [
      { id: uid(), name: `Pushups — 6 x ${rep} (rest 60s)` },
      { id: uid(), name: 'Incline pushups — 3 x 12' },
      { id: uid(), name: 'Plank — 3 x 30s' },
    ];
  } else if (goal === 'build_muscle' || goal === 'hypertrophy') {
    name = 'Goal Session: Build Muscle';
    exercises = hasDB ? [
      { id: uid(), name: 'DB Squat / Split Squat' },
      { id: uid(), name: 'DB Bench / Floor Press' },
      { id: uid(), name: 'One-arm DB Row' },
      { id: uid(), name: 'DB Shoulder Press' },
    ] : hasBB ? [
      { id: uid(), name: 'Squat' },
      { id: uid(), name: 'Bench Press' },
      { id: uid(), name: 'Barbell Row' },
      { id: uid(), name: 'Accessory (arms/shoulders)' },
    ] : [
      { id: uid(), name: 'Pushups (volume)' },
      { id: uid(), name: 'Bodyweight row (if available) / band row' },
      { id: uid(), name: 'Split squats' },
      { id: uid(), name: 'Plank (time)' },
    ];
  } else {
    name = (profile?.goal === 'strength' && hasBB) ? 'Quick Start: Strength (Barbell)' : 'Quick Start';
    exercises = (profile?.goal === 'strength' && hasBB) ? [
      { id: uid(), name: 'Squat' },
      { id: uid(), name: 'Bench Press' },
      { id: uid(), name: 'Deadlift' },
    ] : hasDB ? [
      { id: uid(), name: 'Dumbbell Goblet Squat' },
      { id: uid(), name: 'Dumbbell Bench / Floor Press' },
      { id: uid(), name: 'One-arm Dumbbell Row' },
      { id: uid(), name: 'Dumbbell Shoulder Press' },
    ] : [
      { id: uid(), name: 'Air Squat' },
      { id: uid(), name: 'Pushups' },
      { id: uid(), name: 'Hip Hinge (Good morning)' },
      { id: uid(), name: 'Plank (time)' },
    ];
  }

  // Trim based on duration (rough heuristic)
  const maxEx = dur <= 20 ? 3 : dur <= 30 ? 4 : 6;
  exercises = exercises.slice(0, maxEx);

  // Inject optional secondary finisher (if time allows)
  const fin = secondaryFinisher(secondaryGoal, eq);
  if (fin.length && exercises.length < maxEx) exercises = [...exercises, ...fin].slice(0, maxEx);

  const idGoal = (primaryGoal?.type || goal);
  return {
    id: `gen:${idGoal}:${dur}:${Array.from(eq).sort().join('-')}`,
    name,
    desc,
    exercises
  };
}

function wire() {
  $('btnNewRoutine').addEventListener('click', newRoutine);
  $('btnAddExercise').addEventListener('click', addExercise);
  $('btnEndWorkout').addEventListener('click', endWorkout);

  $('btnTheme')?.addEventListener('click', toggleTheme);

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

function applyTheme() {
  const theme = state.theme || 'light';
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
}

function toggleTheme() {
  state.theme = (state.theme === 'dark') ? 'light' : 'dark';
  saveTheme();
  applyTheme();
}

function boot() {
  seedIfEmpty();
  loadState();
  applyTheme();
  wire();
  wireDashboard();
  hydrateGoalsForm();
  $('timer').textContent = fmtTimer(0);
  renderDashboard();
  renderRoutines();
  renderWorkout();
}

boot();
