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
  plan: 'bf:plan',
  workoutLibrary: 'bf:workoutLibrary'
};

// Curated Workout Ideas Library
const WORKOUT_LIBRARY = [
  {
    "id": "idea-fullbody-db",
    "name": "Full Body Dumbbell Power",
    "desc": "Build muscular strength and density across your entire body using only a pair of dumbbells.",
    "category": "strength",
    "duration": 40,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "DB Goblet Squats",
        "reps": "3 sets x 10-12 reps"
      },
      {
        "name": "DB Floor Press",
        "reps": "3 sets x 10-12 reps"
      },
      {
        "name": "One-Arm Dumbbell Row",
        "reps": "3 sets x 12 reps each"
      },
      {
        "name": "DB Shoulder Press",
        "reps": "3 sets x 10-12 reps"
      },
      {
        "name": "DB Romanian Deadlifts",
        "reps": "3 sets x 12 reps"
      }
    ]
  },
  {
    "id": "idea-bodyweight-burn",
    "name": "Bodyweight Inferno",
    "desc": "High-intensity cardio and core-burning full body routine that requires zero equipment.",
    "category": "bodyweight",
    "duration": 25,
    "difficulty": "Beginner",
    "exercises": [
      {
        "name": "Air Squats",
        "reps": "3 sets x 15-20 reps"
      },
      {
        "name": "Push-ups (or Incline Push-ups)",
        "reps": "3 sets x 10-12 reps"
      },
      {
        "name": "Walking Lunges",
        "reps": "3 sets x 12 reps each"
      },
      {
        "name": "Mountain Climbers",
        "reps": "3 sets x 30 sec"
      },
      {
        "name": "Plank Hold",
        "reps": "3 sets x 45 sec"
      }
    ]
  },
  {
    "id": "idea-core-crusher",
    "name": "Core Shredder 150",
    "desc": "A rapid, fire-inducing abdominal routine designed to strengthen your midsection.",
    "category": "core",
    "duration": 15,
    "difficulty": "Beginner",
    "exercises": [
      {
        "name": "Crunches",
        "reps": "3 sets x 15-20 reps"
      },
      {
        "name": "Bicycle Crunches",
        "reps": "3 sets x 15 reps each"
      },
      {
        "name": "Hollow Body Hold",
        "reps": "3 sets x 30 sec"
      },
      {
        "name": "Russian Twists",
        "reps": "3 sets x 20 reps"
      },
      {
        "name": "Reverse Crunches",
        "reps": "3 sets x 12 reps"
      }
    ]
  },
  {
    "id": "idea-barbell-strength",
    "name": "Compound Power (Barbell)",
    "desc": "Heavy compound lifting routine focused on building raw foundational strength and size.",
    "category": "strength",
    "duration": 45,
    "difficulty": "Advanced",
    "exercises": [
      {
        "name": "Barbell Back Squat",
        "reps": "4 sets x 5 reps"
      },
      {
        "name": "Barbell Bench Press",
        "reps": "4 sets x 5 reps"
      },
      {
        "name": "Barbell Deadlift",
        "reps": "3 sets x 5 reps"
      },
      {
        "name": "Barbell Overhead Press",
        "reps": "3 sets x 6 reps"
      },
      {
        "name": "Barbell Row",
        "reps": "3 sets x 8 reps"
      }
    ]
  },
  {
    "id": "idea-hiit-sweat",
    "name": "HIIT Metcon Sweat",
    "desc": "Metabolic conditioning circuits to burn maximum fat and build athletic conditioning.",
    "category": "hiit",
    "duration": 20,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "Burpees",
        "reps": "4 sets x 10 reps"
      },
      {
        "name": "Jump Squats",
        "reps": "4 sets x 12-15 reps"
      },
      {
        "name": "Push-up to Plank Jacks",
        "reps": "4 sets x 10 reps"
      },
      {
        "name": "High Knees",
        "reps": "4 sets x 40 sec"
      },
      {
        "name": "Plank Hold",
        "reps": "4 sets x 45 sec"
      }
    ]
  },
  {
    "id": "idea-upper-pump",
    "name": "Upper Body Hypertrophy",
    "desc": "Focused volume and pump routine targeting chest, back, shoulders, and arms.",
    "category": "strength",
    "duration": 30,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "DB Flat Bench Press",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB One-Arm Row",
        "reps": "3 sets x 12 reps each"
      },
      {
        "name": "DB Lateral Raises",
        "reps": "3 sets x 15 reps"
      },
      {
        "name": "DB Bicep Curls",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Overhead Tricep Extensions",
        "reps": "3 sets x 12 reps"
      }
    ]
  },
  {
    "id": "idea-legs-glutes",
    "name": "Legs & Glutes Sculpt",
    "desc": "Lower body isolation and strength routines for building powerful quadriceps, hamstrings, and glutes.",
    "category": "strength",
    "duration": 35,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "DB Goblet Squats",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Romanian Deadlifts",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Bulgarian Split Squats",
        "reps": "3 sets x 10 reps each"
      },
      {
        "name": "Weighted Glute Bridges",
        "reps": "3 sets x 15 reps"
      },
      {
        "name": "Calf Raises",
        "reps": "3 sets x 20 reps"
      }
    ]
  },
  {
    "id": "idea-recovery-flow",
    "name": "Active Recovery & Flow",
    "desc": "Gentle mobility flow and cardio walk to speed up recovery and release joint tension.",
    "category": "bodyweight",
    "duration": 30,
    "difficulty": "Beginner",
    "exercises": [
      {
        "name": "World's Greatest Stretch",
        "reps": "2 sets x 5 reps each"
      },
      {
        "name": "Cat-Cow Stretch",
        "reps": "2 sets x 10 reps"
      },
      {
        "name": "90/90 Hip Flow",
        "reps": "2 sets x 6 reps each"
      },
      {
        "name": "Cobra to Child's Pose Flow",
        "reps": "2 sets x 8 reps"
      },
      {
        "name": "Light Jog / Walk",
        "reps": "15 min slow pace"
      }
    ]
  },
  {
    "id": "idea-cardio-core-hiit",
    "name": "Cardio & Core HIIT Burner",
    "desc": "Fast-paced cardiovascular and abdominal circuit designed to elevate heart rate and build core strength.",
    "category": "hiit",
    "duration": 20,
    "difficulty": "Beginner",
    "exercises": [
      {
        "name": "Jumping Jacks",
        "reps": "3 sets x 45 sec"
      },
      {
        "name": "Mountain Climbers",
        "reps": "3 sets x 30 sec"
      },
      {
        "name": "Plank Shoulder Taps",
        "reps": "3 sets x 12 reps each"
      },
      {
        "name": "Bicycle Crunches",
        "reps": "3 sets x 15 reps each"
      },
      {
        "name": "High Knees",
        "reps": "3 sets x 30 sec"
      }
    ]
  },
  {
    "id": "idea-db-leg-crusher",
    "name": "Dumbbell Leg Crusher",
    "desc": "Focused lower body strength training targeting the quads, hamstrings, and calves with heavy dumbbell movements.",
    "category": "strength",
    "duration": 35,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "DB Romanian Deadlifts",
        "reps": "4 sets x 10 reps"
      },
      {
        "name": "DB Goblet Squats",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Bulgarian Split Squats",
        "reps": "3 sets x 8 reps each"
      },
      {
        "name": "DB Weighted Calf Raises",
        "reps": "3 sets x 15 reps"
      },
      {
        "name": "Bodyweight Glute Bridges",
        "reps": "3 sets x 15 reps"
      }
    ]
  },
  {
    "id": "idea-db-upper-sculpt",
    "name": "Upper Body Dumbbell Sculpt",
    "desc": "Target your arms, shoulders, and chest using controlled, high-volume dumbbell movements.",
    "category": "strength",
    "duration": 30,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "DB Flat Bench Press",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB One-Arm Rows",
        "reps": "3 sets x 12 reps each"
      },
      {
        "name": "DB Shoulder Press",
        "reps": "3 sets x 10 reps"
      },
      {
        "name": "DB Bicep Curls",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Overhead Tricep Extensions",
        "reps": "3 sets x 12 reps"
      }
    ]
  },
  {
    "id": "idea-yoga-flex-flow",
    "name": "Power Yoga & Flexibility Flow",
    "desc": "Enhance flexibility, joint mobility, and core balance with a bodyweight flow.",
    "category": "bodyweight",
    "duration": 25,
    "difficulty": "Beginner",
    "exercises": [
      {
        "name": "Down Dog to Cobra",
        "reps": "3 sets x 5 reps"
      },
      {
        "name": "Cat-Cow Stretch",
        "reps": "3 sets x 10 reps"
      },
      {
        "name": "Warrior I & II Pose",
        "reps": "3 sets x 30 sec hold each side"
      },
      {
        "name": "Crescent Lunge",
        "reps": "3 sets x 30 sec hold each side"
      },
      {
        "name": "Child's Pose Hold",
        "reps": "1 set x 60 sec"
      }
    ]
  },
  {
    "id": "idea-barbell-hypertrophy",
    "name": "Barbell Hypertrophy Upper",
    "desc": "Advanced upper body workout focused on building size and raw power with heavy barbell compounds.",
    "category": "strength",
    "duration": 40,
    "difficulty": "Advanced",
    "exercises": [
      {
        "name": "Barbell Bench Press",
        "reps": "4 sets x 8 reps"
      },
      {
        "name": "Barbell Bent-Over Row",
        "reps": "4 sets x 8 reps"
      },
      {
        "name": "Barbell Overhead Press",
        "reps": "3 sets x 8 reps"
      },
      {
        "name": "Barbell Bicep Curls",
        "reps": "3 sets x 10 reps"
      },
      {
        "name": "Barbell Skull Crushers",
        "reps": "3 sets x 10 reps"
      }
    ]
  }
];

// Generator Exercise Database Pool
const EXERCISE_POOL = {
  fullbody: {
    bodyweight: [
      { name: "Air Squats", reps: "15-20 reps", info: "Focus on depth and keeping chest up." },
      { name: "Push-ups", reps: "10-15 reps", info: "Maintain a straight line from head to heels." },
      { name: "Walking Lunges", reps: "10 reps each", info: "Step forward and lower hips until knees are 90 degrees." },
      { name: "Mountain Climbers", reps: "30 seconds", info: "Keep hips low and drive knees to chest." },
      { name: "Plank Hold", reps: "30-60 seconds", info: "Engage core and squeeze glutes." }
    ],
    dumbbells: [
      { name: "Dumbbell Goblet Squats", reps: "10-12 reps", info: "Hold dumbbell vertically at chest level." },
      { name: "Dumbbell Floor Press", reps: "10-12 reps", info: "Press weights up from the floor, elbows touch ground." },
      { name: "Dumbbell Rows", reps: "10-12 reps", info: "Bend at hips and pull dumbbells to ribs." },
      { name: "Dumbbell Shoulder Press", reps: "10-12 reps", info: "Press dumbbells vertically over shoulders." },
      { name: "Dumbbell Romanian Deadlifts", reps: "12 reps", info: "Hinge at hips, slight bend in knees." }
    ],
    barbell: [
      { name: "Barbell Back Squat", reps: "8-10 reps", info: "Keep chest tall, descend below parallel." },
      { name: "Barbell Bench Press", reps: "8-10 reps", info: "Lower bar to mid-chest, press up." },
      { name: "Barbell Row", reps: "10 reps", info: "Pull bar to lower sternum with bent-over posture." },
      { name: "Barbell Romanian Deadlift", reps: "10 reps", info: "Push hips back, feel stretch in hamstrings." }
    ]
  },
  upper: {
    bodyweight: [
      { name: "Push-ups", reps: "12-15 reps", info: "Vary hand width to shift chest/tricep focus." },
      { name: "Pike Push-ups", reps: "8-10 reps", info: "Elevate hips, lower head toward hands to target shoulders." },
      { name: "Bench Dips", reps: "12 reps", info: "Use a chair or bench, keep hips close to edge." },
      { name: "Plank Shoulder Taps", reps: "20 taps", info: "Tap opposite shoulder without shifting hips." }
    ],
    dumbbells: [
      { name: "Dumbbell Bench Press", reps: "10-12 reps", info: "Press weights from chest level, control descent." },
      { name: "Dumbbell Row", reps: "10-12 reps", info: "Support body on bench/knee, row to hip." },
      { name: "Dumbbell Lateral Raise", reps: "12-15 reps", info: "Raise arms out to sides, lead with elbows." },
      { name: "Dumbbell Overhead Shoulder Press", reps: "10 reps", info: "Press up, control down." },
      { name: "Dumbbell Bicep Curls", reps: "12 reps", info: "Keep elbows pinned to sides." }
    ],
    barbell: [
      { name: "Barbell Bench Press", reps: "8-10 reps", info: "Press bar straight up with controlled tempo." },
      { name: "Barbell Row", reps: "8-10 reps", info: "Squeeze shoulder blades at top." },
      { name: "Barbell Overhead Press", reps: "8 reps", info: "Press barbell overhead, brace core." }
    ]
  },
  lower: {
    bodyweight: [
      { name: "Air Squats", reps: "20 reps", info: "Keep heels flat, stand up fully." },
      { name: "Reverse Lunges", reps: "12 reps each", info: "Step backward and lower knee near floor." },
      { name: "Bulgarian Split Squats", reps: "10 reps each", info: "Rear foot elevated on bench." },
      { name: "Single-Leg Glute Bridges", reps: "12 reps each", info: "Drive through heel, lift hips." }
    ],
    dumbbells: [
      { name: "Dumbbell Goblet Squats", reps: "12 reps", info: "Deep squat holding DB at chest." },
      { name: "Dumbbell Romanian Deadlifts", reps: "12 reps", info: "Hold DBs in front, hinge at hips." },
      { name: "Dumbbell Reverse Lunges", reps: "10 reps each", info: "Hold DBs at sides, step back." },
      { name: "Dumbbell Calf Raises", reps: "20 reps", info: "Hold DBs, rise up onto toes." }
    ],
    barbell: [
      { name: "Barbell Back Squat", reps: "8 reps", info: "Push knees out, drive up through mid-foot." },
      { name: "Barbell Front Squat", reps: "8 reps", info: "Bar on front shoulders, elbows high." },
      { name: "Barbell Romanian Deadlift", reps: "10 reps", info: "Hinge hips back, brace core." }
    ]
  },
  core: {
    bodyweight: [
      { name: "Crunches", reps: "20 reps", info: "Exhale on crunch, squeeze abs." },
      { name: "Bicycle Crunches", reps: "15 reps each", info: "Bring elbow to opposite knee." },
      { name: "Hollow Hold", reps: "30 seconds", info: "Press lower back flat into ground." },
      { name: "Russian Twists", reps: "20 taps", info: "Rotate torso side to side." },
      { name: "Reverse Crunches", reps: "15 reps", info: "Lift hips off floor using lower abs." }
    ],
    dumbbells: [
      { name: "Dumbbell Russian Twists", reps: "20 taps", info: "Hold a dumbbell with both hands." },
      { name: "Dumbbell Plank Pull-Throughs", reps: "10 reps", info: "Pull DB across under body in plank." },
      { name: "Dumbbell Side Bends", reps: "15 reps each", info: "Stand upright, lower DB down side of leg." }
    ],
    barbell: [
      { name: "Barbell Rollouts", reps: "8 reps", info: "Kneel, roll bar out and pull back using core." }
    ]
  },
  cardio: {
    bodyweight: [
      { name: "Jumping Jacks", reps: "45 seconds", info: "Steady rapid pace." },
      { name: "Burpees", reps: "10 reps", info: "Chest to ground, jump at top." },
      { name: "High Knees", reps: "45 seconds", info: "Drive knees up high, run in place." },
      { name: "Jump Squats", reps: "12 reps", info: "Explode up, land softly." }
    ],
    treadmill: [
      { name: "Treadmill Brisk Walk / Jog", reps: "15 min moderate pace", info: "Zone 2 cardio speed." },
      { name: "Treadmill Hill Intervals", reps: "5 rounds of 1m fast / 1m walk", info: "Increase incline on treadmill." }
    ]
  }
};

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
  timer: { remainingSec: 0, running: false, interval: null },
  activeTab: 'dashboard',
  generatedRoutine: null,
  workoutLibrary: []
};

function seedIfEmpty() {
  const r = store.get(KEYS.routines, null);
  const hasRoutines = Array.isArray(r) && r.length;

  if (!hasRoutines) {
    store.set(KEYS.routines, []);
    store.set(KEYS.sessions, []);
    store.set(KEYS.profile, { goal: 'general', durationMin: 30, equipment: ['bodyweight'] });
  }

  // Seed default goals if they don't exist
  const g = store.get(KEYS.goals, null);
  if (!Array.isArray(g) || g.length === 0) {
    const defaultGoals = [
      { id: 'goal-daily-hydration', title: 'Hydration (8 cups)', period: 'daily', target: 8, progress: {} },
      { id: 'goal-daily-meals', title: 'Healthy Meals', period: 'daily', target: 3, progress: {} },
      { id: 'goal-weekly-workouts', title: 'Workouts', period: 'weekly', target: 3, progress: {} },
      { id: 'goal-weekly-steps', title: 'Steps (10k / day)', period: 'weekly', target: 7, progress: {} }
    ];
    store.set(KEYS.goals, defaultGoals);
  }

  // Seed a default primary goal if none exists so the calendar is populated out of the box
  const pg = store.get(KEYS.primaryGoal, null);
  if (!pg) {
    const defaultPrimary = {
      type: 'lose_weight',
      durationMin: 30,
      daysPerWeek: 3,
      createdAt: new Date().toISOString(),
      startWeightLbs: 180,
      currentWeightLbs: 180
    };
    store.set(KEYS.primaryGoal, defaultPrimary);
  }
}

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
  state.workoutLibrary = store.get(KEYS.workoutLibrary, WORKOUT_LIBRARY);
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

// SPA Routing: Switch Tabs
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update Tab buttons
  document.querySelectorAll('#tabbar button[data-tab]').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    if (panel.id === `panel-${tabId}`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Scroll to top of app
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderRoutines() {
  const el = $('routineList');
  if (!el) return;
  el.innerHTML = '';
  
  if (state.routines.length === 0) {
    el.innerHTML = '<div class="muted">No custom routines created yet. Use "New routine" above to build one.</div>';
    return;
  }

  state.routines.forEach(r => {
    const item = document.createElement('div');
    item.className = 'routineItem';
    item.innerHTML = `
      <div class="routineMeta">
        <div class="routineName">${escapeHtml(r.name)}</div>
        <div class="routineDesc">${escapeHtml(r.desc || '')}</div>
      </div>
      <div class="row">
        <button class="btn" data-action="start" data-id="${r.id}" type="button">Start</button>
        <button class="btn secondary" data-action="edit" data-id="${r.id}" type="button">Edit</button>
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
  const activeTabBtn = $('tabActiveWorkout');
  
  if (!s) {
    if (activeTabBtn) activeTabBtn.style.display = 'none';
    if (state.activeTab === 'workout') {
      switchTab('dashboard');
    }
    setSubtitle('Workout tracker');
    return;
  }
  
  ensureSessionShape(s);
  const r = activeRoutine(s);
  
  // Show Active Workout Tab
  if (activeTabBtn) {
    activeTabBtn.style.display = 'flex';
    const timerText = state.timer.remainingSec > 0 ? ` (${fmtTimer(state.timer.remainingSec)})` : '';
    activeTabBtn.querySelector('.tab-text').textContent = `Live Session${timerText}`;
  }

  $('workoutTitle').textContent = r ? `Workout — ${r.name}` : 'Workout';
  setSubtitle(`Session started ${new Date(s.startedAt).toLocaleString()}`);

  $('workoutNotes').value = s.notes || '';

  const list = $('exerciseList');
  list.innerHTML = '';

  const exercises = (r?.exercises || []);
  if (exercises.length === 0) {
    list.innerHTML = '<div class="muted">No exercises in this workout. Tap "Add Custom Exercise" below to start.</div>';
  }

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
          <button class="btn secondary" data-action="renameExercise" data-ex="${ex.id}" type="button">Rename</button>
          <button class="btn danger" data-action="removeExercise" data-ex="${ex.id}" type="button">Remove</button>
        </div>
      </div>
      <div class="sets" id="sets-${ex.id}"></div>
      <div class="row wrap" style="margin-top:10px">
        <input class="input" style="width: 100px;" inputmode="decimal" placeholder="Weight" data-field="w" data-ex="${ex.id}" />
        <input class="input" style="width: 80px;" inputmode="numeric" placeholder="Reps" data-field="r" data-ex="${ex.id}" />
        <button class="btn" data-action="logSet" data-ex="${ex.id}" type="button">Log set</button>
      </div>
    `;

    list.appendChild(exEl);

    // render sets list
    const setsEl = exEl.querySelector(`#sets-${CSS.escape(ex.id)}`);
    setsEl.innerHTML = sets.map((st, idx) => {
      const ts = st.ts ? new Date(st.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
      return `
        <div class="setRow">
          <div class="small" style="font-weight:700">Set #${idx+1} · ${escapeHtml(String(st.w ?? ''))} lb</div>
          <div class="small">${escapeHtml(String(st.r ?? ''))} reps · ${escapeHtml(ts)}</div>
          <button class="btn danger" style="padding: 4px 8px; font-size: 11px;" data-action="deleteSet" data-ex="${ex.id}" data-idx="${idx}" type="button">Del</button>
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
  
  // Switch to Active Workout tab
  switchTab('workout');
  renderWorkout();
  
  // Confetti!
  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
  }
}

function endWorkout() {
  const s = activeSession();
  if (!s) return;
  
  if (confirm('Are you ready to complete and log this workout session?')) {
    s.endedAt = new Date().toISOString();
    state.activeSessionId = null;
    saveSessions();
    saveActive();
    stopTimer();
    
    // Increment completion goals if a primary/habits setup matches
    // (Existing goals progress increment code, for user custom goals)
    const routineObj = activeRoutine(s);
    if (routineObj) {
      // Find a goal matching "Workouts" or "Exercise" to auto-increment progress
      const matchingGoal = state.goals.find(g => g.title.toLowerCase().includes('workout') || g.title.toLowerCase().includes('exercise'));
      if (matchingGoal) {
        incProgress(matchingGoal.id, 1);
      }
    }
    
    // Switch to Dashboard
    switchTab('dashboard');
    renderWorkout();
    renderDashboard();
    
    // Success completion confetti!
    if (typeof confetti === 'function') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }
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

  // start a default rest timer (90 seconds)
  resetTimer();
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
      alert('Imported successfully.');
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
  
  // Update Live Session tab title text with timer
  const activeTabBtn = $('tabActiveWorkout');
  if (activeTabBtn && state.activeSessionId) {
    const timerText = state.timer.remainingSec > 0 ? ` (${fmtTimer(state.timer.remainingSec)})` : '';
    activeTabBtn.querySelector('.tab-text').textContent = `Live Session${timerText}`;
  }

  if (state.timer.remainingSec <= 0) {
    stopTimer();
    // Vibrate/beep alert
    if (navigator.vibrate) navigator.vibrate([120, 50, 120]);
    // HTML5 Audio beep
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880; // High pitch beep
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  }
}

function startTimer() {
  if (state.timer.running) return;
  if (state.timer.remainingSec <= 0) {
    state.timer.remainingSec = 90; // Default to 90 seconds (1:30)
    $('timer').textContent = fmtTimer(state.timer.remainingSec);
  }
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
  const titleLower = (goal.title || '').toLowerCase();
  if (titleLower.includes('workout') || titleLower.includes('exercise')) {
    const k = goalPeriodKey(goal, now);
    const completedSessions = (state.sessions || []).filter(s => {
      if (!s.endedAt) return false;
      try {
        const endedDate = new Date(s.endedAt);
        return goalPeriodKey(goal, endedDate) === k;
      } catch {
        return false;
      }
    });
    return completedSessions.length;
  }

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
  const titleLower = (g.title || '').toLowerCase();
  if (titleLower.includes('workout') || titleLower.includes('exercise')) return;
  const cur = currentProgress(g);
  setProgress(goalId, cur + delta);
  renderDashboard();
}
function toggleGoal(goalId) {
  const g = state.goals.find(x => x.id === goalId);
  if (!g) return;
  const titleLower = (g.title || '').toLowerCase();
  if (titleLower.includes('workout') || titleLower.includes('exercise')) return;
  const cur = currentProgress(g);
  if (cur >= g.target) {
    setProgress(goalId, 0);
  } else {
    setProgress(goalId, g.target);
  }
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
    
    const titleLower = (g.title || '').toLowerCase();
    const isAuto = titleLower.includes('workout') || titleLower.includes('exercise');
    const actionsHtml = isAuto
      ? `<span class="badge-auto">Auto</span>`
      : `
        <button class="btn" data-goal-action="inc" data-goal-id="${g.id}" type="button">+1</button>
        <button class="btn secondary" data-goal-action="dec" data-goal-id="${g.id}" type="button">-1</button>
      `;

    if (period === 'daily') {
      item.className = `habit-item ${cur >= g.target ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="habit-info">
          <button class="habit-checkbox-btn" data-goal-action="toggle" data-goal-id="${g.id}" type="button">✓</button>
          <div>
            <div class="habit-title" style="font-weight:800; font-family:'Outfit',sans-serif;">${escapeHtml(g.title)}</div>
            <div class="small">${cur} / ${g.target}</div>
          </div>
        </div>
        <div class="row wrap" style="align-items: center; gap: 8px;">
          ${actionsHtml}
          <button class="btn danger" style="padding: 8px 10px;" data-goal-action="del" data-goal-id="${g.id}" type="button">Del</button>
        </div>
      `;
    } else {
      item.className = 'goalItem';
      item.innerHTML = `
        <div style="flex:1;min-width:180px">
          <div style="font-weight:800; font-family:'Outfit',sans-serif;">${escapeHtml(g.title)}</div>
          <div class="small">${cur} / ${g.target} (${g.period})</div>
          <div class="progressBar"><div class="progressFill" style="width:${pct}%"></div></div>
        </div>
        <div class="row wrap">
          ${actionsHtml}
          <button class="btn danger" style="padding: 8px 10px;" data-goal-action="del" data-goal-id="${g.id}" type="button">Del</button>
        </div>
      `;
    }
    el.appendChild(item);
  });
}
function computeStreak() {
  const sessions = (state.sessions || []).filter(s => s.endedAt);
  const days = new Set(sessions.map(s => ymd(new Date(s.endedAt))));
  let streak = 0;
  let d = startOfDay(new Date());
  if (!days.has(ymd(d))) d = new Date(d.getTime() - 86400000);
  while (days.has(ymd(d))) {
    streak += 1;
    d = new Date(d.getTime() - 86400000);
  }
  return streak;
}
function getSessionDurationMin(session) {
  if (session.startedAt && session.endedAt) {
    const elapsedMs = new Date(session.endedAt) - new Date(session.startedAt);
    const elapsedMin = Math.floor(elapsedMs / 60000);
    if (elapsedMin > 0) {
      return elapsedMin;
    }
  }
  const r = activeRoutine(session) || (state.workoutLibrary || []).find(w => w.id === session.routineId);
  if (r) {
    if (r.duration) return Number(r.duration);
    if (r.id && r.id.startsWith('gen:')) {
      const parts = r.id.split(':');
      if (parts[2]) {
        const dVal = Number(parts[2]);
        if (!isNaN(dVal) && dVal > 0) return dVal;
      }
    }
    const m = r.name ? r.name.match(/\((\d+)m\)/) : null;
    if (m && m[1]) {
      return Number(m[1]);
    }
  }
  return Number(state.primaryGoal?.durationMin || state.profile?.durationMin || 30);
}
function getWeeklyWorkoutsTarget() {
  const g = (state.goals || []).find(x => x.period === 'weekly' && (x.title.toLowerCase().includes('workout') || x.title.toLowerCase().includes('exercise')));
  if (g) return g.target;
  if (state.primaryGoal && state.primaryGoal.daysPerWeek) return state.primaryGoal.daysPerWeek;
  return 3;
}
function getWeeklyWorkoutsCompleted() {
  const currentWeekVal = weekKey(new Date());
  const completedThisWeek = (state.sessions || []).filter(s => {
    if (!s.endedAt) return false;
    try {
      return weekKey(new Date(s.endedAt)) === currentWeekVal;
    } catch {
      return false;
    }
  });
  return completedThisWeek.length;
}
function getWeeklyMinutesCompleted() {
  const currentWeekVal = weekKey(new Date());
  const completedThisWeek = (state.sessions || []).filter(s => {
    if (!s.endedAt) return false;
    try {
      return weekKey(new Date(s.endedAt)) === currentWeekVal;
    } catch {
      return false;
    }
  });
  return completedThisWeek.reduce((sum, s) => sum + getSessionDurationMin(s), 0);
}
function getWeeklyVolumeTarget() {
  const targetWorkouts = getWeeklyWorkoutsTarget();
  const sessionDur = Number(state.primaryGoal?.durationMin || state.profile?.durationMin || 30);
  return targetWorkouts * sessionDur;
}
function renderRecentActivity() {
  const el = $('activityFeed');
  if (!el) return;
  const completedSessions = (state.sessions || []).filter(s => s.endedAt);
  if (!completedSessions.length) {
    el.innerHTML = '<div class="muted">No workouts completed yet. Start your first session!</div>';
    return;
  }
  const recent = completedSessions.slice(0, 5);
  el.innerHTML = '';
  recent.forEach(s => {
    const r = activeRoutine(s) || (state.workoutLibrary || []).find(w => w.id === s.routineId);
    const routineName = r ? r.name : 'Custom Workout';
    const dateStr = new Date(s.endedAt).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const minutes = getSessionDurationMin(s);
    let exercisesCount = 0;
    let totalSets = 0;
    if (s.entries) {
      Object.keys(s.entries).forEach(exId => {
        const sets = s.entries[exId] || [];
        if (sets.length > 0) {
          exercisesCount++;
          totalSets += sets.length;
        }
      });
    }
    const card = document.createElement('div');
    card.className = 'activity-card';
    let notesHtml = '';
    if (s.notes && s.notes.trim()) {
      notesHtml = `<div class="small italic muted" style="margin-top: 4px; border-left: 2px solid var(--accent); padding-left: 8px;">"${escapeHtml(s.notes.trim())}"</div>`;
    }
    card.innerHTML = `
      <div class="activity-meta">
        <span style="font-weight: 800; font-family: 'Outfit', sans-serif; color: var(--text);">${escapeHtml(routineName)}</span>
        <span class="small" style="color: var(--muted);">${dateStr}</span>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;" class="small">
        <span>⏱️ <strong>${minutes}</strong> min</span>
        <span>💪 <strong>${exercisesCount}</strong> exercises</span>
        <span>🏋️ <strong>${totalSets}</strong> sets</span>
      </div>
      ${notesHtml}
    `;
    el.appendChild(card);
  });
}
function renderDashboard() {
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

  const workoutsCompleted = getWeeklyWorkoutsCompleted();
  const workoutsTarget = getWeeklyWorkoutsTarget();
  const workoutsPct = Math.max(0, Math.min(100, (workoutsCompleted / workoutsTarget) * 100));
  const kpiWorkoutsVal = $('kpiWorkoutsVal');
  const kpiWorkoutsFill = $('kpiWorkoutsFill');
  if (kpiWorkoutsVal) kpiWorkoutsVal.textContent = `${workoutsCompleted}/${workoutsTarget}`;
  if (kpiWorkoutsFill) kpiWorkoutsFill.style.width = `${workoutsPct}%`;

  const streak = computeStreak();
  const streakPct = Math.max(0, Math.min(100, (streak / 7) * 100));
  const kpiStreakVal = $('kpiStreakVal');
  const kpiStreakFill = $('kpiStreakFill');
  if (kpiStreakVal) kpiStreakVal.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;
  if (kpiStreakFill) kpiStreakFill.style.width = `${streakPct}%`;

  const minutesCompleted = getWeeklyMinutesCompleted();
  const minutesTarget = getWeeklyVolumeTarget();
  const minutesPct = Math.max(0, Math.min(100, (minutesCompleted / minutesTarget) * 100));
  const kpiMinutesVal = $('kpiMinutesVal');
  const kpiMinutesFill = $('kpiMinutesFill');
  if (kpiMinutesVal) kpiMinutesVal.textContent = `${minutesCompleted}/${minutesTarget} Min`;
  if (kpiMinutesFill) kpiMinutesFill.style.width = `${minutesPct}%`;

  const kpiPrimaryLabel = $('kpiPrimaryLabel');
  const kpiPrimaryVal = $('kpiPrimaryVal');
  const kpiPrimaryFill = $('kpiPrimaryFill');
  if (state.primaryGoal) {
    const g = state.primaryGoal;
    let label = 'Primary Goal';
    let valText = 'Active';
    let pct = 0;
    if (g.type === 'lose_weight') {
      label = 'Weight Loss';
      const start = g.startWeightLbs || 180;
      const current = g.currentWeightLbs || start;
      const lost = start - current;
      valText = lost >= 0 ? `-${lost.toFixed(1)} lb` : `+${Math.abs(lost).toFixed(1)} lb`;
      valText += ` (Start: ${start})`;
      pct = Math.max(0, Math.min(100, (lost / 10) * 100));
    } else if (g.type === 'run_5k') {
      label = '5K Run';
      if (g.best5kMin) {
        valText = `${g.best5kMin} min`;
        pct = 100;
      } else {
        valText = g.canRun10Min ? 'Run 10m' : 'Run/Walk';
        pct = g.canRun10Min ? 50 : 20;
      }
    } else if (g.type === 'bar_hang') {
      label = 'Bar Hang';
      const curHang = g.bestHangSec || g.maxHangSec || 0;
      valText = `${curHang}s / 120s`;
      pct = Math.max(0, Math.min(100, (curHang / 120) * 100));
    } else if (g.type === 'pushups') {
      label = 'Pushups';
      const curPushups = g.bestPushups || g.maxPushups || 0;
      valText = `${curPushups} / 30 reps`;
      pct = Math.max(0, Math.min(100, (curPushups / 30) * 100));
    } else if (g.type === 'build_muscle') {
      label = 'Build Muscle';
      valText = `${workoutsCompleted}/${workoutsTarget} workouts`;
      pct = workoutsPct;
    } else if (g.type === 'custom') {
      label = 'Goal';
      valText = g.customText || 'Active';
      pct = workoutsPct;
    } else {
      label = g.type ? g.type.replace('_', ' ') : 'Primary Goal';
    }
    if (kpiPrimaryLabel) kpiPrimaryLabel.textContent = label;
    if (kpiPrimaryVal) kpiPrimaryVal.textContent = valText;
    if (kpiPrimaryFill) kpiPrimaryFill.style.width = `${pct}%`;
  } else {
    if (kpiPrimaryLabel) kpiPrimaryLabel.textContent = 'Primary Goal';
    if (kpiPrimaryVal) kpiPrimaryVal.textContent = 'Not Set';
    if (kpiPrimaryFill) kpiPrimaryFill.style.width = '0%';
  }

  renderGoalList('goalsDaily', 'daily');
  renderGoalList('goalsWeekly', 'weekly');
  renderGoalList('goalsMonthly', 'monthly');

  const badge = $('streakBadge');
  if (badge) {
    if (streak > 0) {
      badge.textContent = `🔥 ${streak} day streak`;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  renderPlan();
  renderRecentActivity();
}
function updateGoalFieldVisibility() {
  const t = String($('primaryType')?.value || '').trim();
  const baseWrap = $('primaryBaselineWrap');
  const progWrap = $('primaryProgressWrap');
  const customWrap = $('primaryCustomWrap');
  const baseLabel = $('primaryBaselineLabel');
  const progLabel = $('primaryProgressLabel');
  const baseHint = $('primaryBaselineHint');
  const progHint = $('primaryProgressHint');

  if (!baseWrap || !progWrap) return;

  baseWrap.hidden = true;
  progWrap.hidden = true;
  if (customWrap) customWrap.hidden = true;

  if (t === 'custom') {
    if (customWrap) customWrap.hidden = false;
    return;
  }

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

  if (t === 'custom') {
    const txt = String($('primaryCustomText')?.value || '').trim();
    if (!txt) {
      alert('Enter a custom goal description.');
      return;
    }
    goal.customText = txt;
  }

  const baselineVal = Number($('primaryBaseline')?.value || 0);
  const progressVal = Number($('primaryProgress')?.value || 0);

  if (t === 'custom') {
    // no structured baseline/progress
  } else if (t === 'bar_hang') {
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

  const c = $('primaryCustomText');
  if (c) c.value = String(state.primaryGoal?.customText || '');

  updateGoalFieldVisibility();
}

function ensurePlanGenerated() {
  if (!state.primaryGoal) return false;
  
  const today = ymd(new Date());
  
  // Clean up any past days
  if (state.plan && Array.isArray(state.plan.days)) {
    state.plan.days = state.plan.days.filter(d => d.date >= today);
  } else {
    state.plan = { generatedAt: new Date().toISOString(), days: [] };
  }
  
  // If remaining plan days is less than 7, extend it to 14 days
  if (state.plan.days.length < 7) {
    extendPlan();
  }
  return true;
}

function extendPlan() {
  if (!state.primaryGoal) return;
  
  state.plan = state.plan || { generatedAt: new Date().toISOString(), days: [] };
  state.plan.days = state.plan.days || [];
  
  const daysPerWeek = Math.max(1, Math.min(7, Number(state.primaryGoal.daysPerWeek || 3)));
  const cadence = Math.max(1, Math.floor(7 / daysPerWeek));
  
  if (state.plan.days.length === 0) {
    state.plan.generatedAt = new Date().toISOString();
  }
  
  let genDate = new Date(state.plan.generatedAt);
  if (isNaN(genDate.getTime())) {
    genDate = new Date();
    state.plan.generatedAt = genDate.toISOString();
  }
  
  while (state.plan.days.length < 14) {
    let nextDate;
    if (state.plan.days.length > 0) {
      const lastDayStr = state.plan.days[state.plan.days.length - 1].date;
      const [y, m, d] = lastDayStr.split('-').map(Number);
      nextDate = new Date(y, m - 1, d + 1);
    } else {
      nextDate = new Date();
    }
    
    const dateStr = ymd(nextDate);
    const daysSinceStart = Math.round((nextDate - genDate) / 86400000);
    const isWorkoutDay = (daysSinceStart % cadence) === 0;
    
    if (isWorkoutDay) {
      const routine = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal);
      state.plan.days.push({
        date: dateStr,
        kind: 'workout',
        routine
      });
    } else {
      state.plan.days.push({
        date: dateStr,
        kind: 'rest',
        routine: null
      });
    }
  }
  
  savePlan();
}

function regeneratePlan() {
  if (!state.primaryGoal) {
    return;
  }

  // Build 14-day calendar plan
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
  if (!ensurePlanGenerated()) {
    alert('Set a primary goal first.');
    return;
  }
  const today = ymd(new Date());
  const item = (state.plan.days || []).find(x => x.date === today);
  if (item?.routine) return startPlannedWorkout(today);
  
  // If rest day, generate a custom session
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
  const days = (state.plan?.days || []).slice(0, 7);
  const today = ymd(new Date());

  const fmtDay = (ymdStr) => {
    try {
      const [y,m,d] = ymdStr.split('-').map(Number);
      const dt = new Date(y, m-1, d);
      return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return ymdStr;
    }
  };

  el.innerHTML = '';
  days.forEach(d => {
    const item = document.createElement('div');
    const isToday = d.date === today;
    item.className = `planItem${isToday ? ' today' : ''}`;

    const isWorkout = d.kind === 'workout' && d.routine;
    const badge = isWorkout ? '<span class="planBadge">Workout</span>' : '<span class="planBadge rest">Rest</span>';
    const label = isWorkout ? (d.routine?.name || 'Workout') : 'Recovery / Optional Walk';

    item.innerHTML = `
      <div class="planMeta">
        <div class="planDate">${isToday ? 'Today' : fmtDay(d.date)}</div>
        <div class="planTitle">${escapeHtml(label)}</div>
      </div>
      <div class="planActions">
        ${badge}
        ${isWorkout ? `<button class="btn" data-plan-action="start" data-plan-date="${d.date}" type="button">Start</button>` : ''}
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

  ['goalsDaily','goalsWeekly','goalsMonthly'].forEach(id => {
    $(id)?.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const act = btn.getAttribute('data-goal-action');
      const gid = btn.getAttribute('data-goal-id');
      if (!act || !gid) return;
      if (act === 'inc') incProgress(gid, 1);
      if (act === 'dec') incProgress(gid, -1);
      if (act === 'toggle') toggleGoal(gid);
      if (act === 'del') deleteGoal(gid);
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Workout Generator Code Wiring & Logic
function wireGenerator() {
  const container = $('panel-generator');
  if (!container) return;

  // Toggle buttons in groups
  container.querySelectorAll('.pill-group').forEach(group => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      group.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Run generator
  $('btnRunGenerator')?.addEventListener('click', () => {
    // Collect Form inputs
    const duration = container.querySelector('#genDuration .pill-btn.active').getAttribute('data-value');
    const focus = container.querySelector('#genFocus .pill-btn.active').getAttribute('data-value');
    const difficulty = container.querySelector('#genDifficulty .pill-btn.active').getAttribute('data-value');
    
    const equipment = ['bodyweight'];
    container.querySelectorAll('#genEquipment input[type="checkbox"]').forEach(cb => {
      if (cb.checked && cb.getAttribute('data-eq') !== 'bodyweight') {
        equipment.push(cb.getAttribute('data-eq'));
      }
    });

    generateCustomWorkout(Number(duration), focus, equipment, difficulty);
  });

  // Start generated workout
  $('btnStartGeneratedWorkout')?.addEventListener('click', () => {
    if (!state.generatedRoutine) return;
    
    // Add generated workout to routines state
    state.routines = [state.generatedRoutine, ...state.routines.filter(r => r.id !== state.generatedRoutine.id)];
    saveRoutines();
    renderRoutines();
    
    // Launch workout
    startRoutine(state.generatedRoutine.id);
  });
}

function generateCustomWorkout(duration, focus, equipment, difficulty) {
  // Hide form and results, show loader
  $('generatorForm').style.display = 'none';
  $('generatorPreview').style.display = 'none';
  const loader = $('generatorLoading');
  const statusEl = $('generatorStatus');
  loader.style.display = 'block';

  // Interactive step-by-step loading messages
  const steps = [
    { text: "Scanning exercise pool...", ms: 400 },
    { text: "Analyzing available equipment...", ms: 800 },
    { text: "Selecting optimal target movements...", ms: 1200 },
    { text: "Calibrating target sets and reps...", ms: 1500 }
  ];

  steps.forEach(step => {
    setTimeout(() => {
      statusEl.textContent = step.text;
    }, step.ms);
  });

  setTimeout(() => {
    // Process generator algorithm
    const eqSet = new Set(equipment);
    
    // Determine movement structure and selects exercises
    let exercises = [];
    const pool = EXERCISE_POOL[focus] || EXERCISE_POOL.fullbody;
    
    // 1. Gather all matched exercises from focus pool
    let matchPool = [];
    
    // Always include bodyweight
    if (pool.bodyweight) matchPool.push(...pool.bodyweight.map(ex => ({ ...ex, source: 'bodyweight' })));
    
    // Include others if checked
    if (eqSet.has('dumbbells') && pool.dumbbells) {
      matchPool.push(...pool.dumbbells.map(ex => ({ ...ex, source: 'dumbbells' })));
    }
    if (eqSet.has('barbell') && pool.barbell) {
      matchPool.push(...pool.barbell.map(ex => ({ ...ex, source: 'barbell' })));
    }

    // Determine count based on duration (15m: 3, 30m: 4, 45m: 5, 60m: 6)
    const exerciseCount = duration <= 15 ? 3 : duration <= 30 ? 4 : duration <= 45 ? 5 : 6;

    // Structured selection (rather than pure random) to ensure balanced workout
    let selected = [];
    
    // If equipment has dumbbells/barbell, try to mix compound and bodyweight
    const weights = matchPool.filter(e => e.source === 'dumbbells' || e.source === 'barbell');
    const bodyweight = matchPool.filter(e => e.source === 'bodyweight');

    // Alternate selections to build a smart workout
    for (let i = 0; i < exerciseCount; i++) {
      let pick = null;
      if (i % 2 === 0 && weights.length > 0) {
        // Pick weight exercise
        const idx = Math.floor(Math.random() * weights.length);
        pick = weights.splice(idx, 1)[0];
      } else if (bodyweight.length > 0) {
        // Pick bodyweight exercise
        const idx = Math.floor(Math.random() * bodyweight.length);
        pick = bodyweight.splice(idx, 1)[0];
      } else if (weights.length > 0) {
        // Fallback weight
        const idx = Math.floor(Math.random() * weights.length);
        pick = weights.splice(idx, 1)[0];
      }
      
      if (pick) selected.push(pick);
    }

    // Inject Pull-up Bar if checked
    if (eqSet.has('pullupbar') && (focus === 'fullbody' || focus === 'upper') && selected.length > 0) {
      // Replace last exercise or insert pullups
      const pullupEx = { name: "Pull-ups (or Chin-ups)", reps: "3 sets x max reps", info: "Hang from bar, pull chest to bar, control down." };
      if (selected.length >= exerciseCount) {
        selected[selected.length - 1] = pullupEx;
      } else {
        selected.push(pullupEx);
      }
    }
    
    // Inject Cardio Machine if checked
    if (eqSet.has('treadmill') && focus === 'cardio' && selected.length > 0) {
      const machineEx = { name: "Treadmill or Bike Interval", reps: "15 min interval", info: "Alternate 1m moderate, 1m fast pace." };
      selected[0] = machineEx; // Put cardiorespiratory first
    }

    // 2. Adjust sets/reps scaling based on intensity difficulty
    let setMultiplier = 3;
    let difficultyBadge = "Intermediate";
    if (difficulty === 'beginner') {
      setMultiplier = 2;
      difficultyBadge = "Beginner";
    } else if (difficulty === 'advanced') {
      setMultiplier = 4;
      difficultyBadge = "Advanced";
    }

    exercises = selected.map(ex => {
      // Parse out reps format
      let formattedReps = ex.reps;
      if (ex.reps.includes('sets')) {
        formattedReps = ex.reps.replace(/^\d+ sets/, `${setMultiplier} sets`);
      } else {
        formattedReps = `${setMultiplier} sets x ${ex.reps}`;
      }
      
      // Combine name with reps details for compatibility with existing tracking model
      return {
        id: uid(),
        name: `${ex.name} (${formattedReps})`,
        info: ex.info
      };
    });

    const displayFocus = focus.charAt(0).toUpperCase() + focus.slice(1);
    const routineId = `gen:${focus}:${duration}:${difficulty}:${uid()}`;
    
    state.generatedRoutine = {
      id: routineId,
      name: `Custom ${displayFocus} (${duration}m)`,
      desc: `Generated: ${difficultyBadge} · Focus: ${displayFocus} · Equip: ${equipment.join(', ')}`,
      exercises: exercises
    };

    // Render Preview
    $('previewWorkoutName').textContent = state.generatedRoutine.name;
    $('previewWorkoutDesc').textContent = state.generatedRoutine.desc;
    
    const previewList = $('previewExercisesList');
    previewList.innerHTML = '';
    
    exercises.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'routineItem';
      item.style.padding = '10px 14px';
      item.innerHTML = `
        <div>
          <div style="font-weight: 800; font-size:14.5px;">${escapeHtml(ex.name)}</div>
          <div class="small">${escapeHtml(ex.info || 'Control movement and focus on form.')}</div>
        </div>
      `;
      previewList.appendChild(item);
    });

    // Toggle View State
    loader.style.display = 'none';
    $('generatorForm').style.display = 'flex';
    $('generatorPreview').style.display = 'block';
  }, 1800);
}

// Synchronize Workout Library from static JSON
async function syncWorkoutLibrary(force = false) {
  const syncStatus = $('syncWorkoutsStatus');
  if (syncStatus && force) syncStatus.textContent = 'Syncing...';
  
  try {
    const res = await fetch('/workouts.json');
    if (!res.ok) throw new Error('Fetch failed');
    const fetched = await res.json();
    if (!Array.isArray(fetched)) throw new Error('Invalid workouts format');
    
    // Merge, avoiding duplicates
    const mergedMap = new Map();
    // Pre-populate with fallback list
    WORKOUT_LIBRARY.forEach(w => mergedMap.set(w.id, w));
    // Overwrite with locally stored
    const cached = store.get(KEYS.workoutLibrary, []);
    cached.forEach(w => mergedMap.set(w.id, w));
    // Overwrite with newly fetched
    fetched.forEach(w => mergedMap.set(w.id, w));
    
    const finalLibrary = Array.from(mergedMap.values());
    store.set(KEYS.workoutLibrary, finalLibrary);
    state.workoutLibrary = finalLibrary;
    
    renderWorkoutIdeas();
    
    if (syncStatus) {
      syncStatus.textContent = `Sync successful! ${fetched.length} templates loaded. Total: ${finalLibrary.length} workouts.`;
      setTimeout(() => { syncStatus.textContent = ''; }, 5000);
    }
  } catch (err) {
    console.warn('Failed to sync workouts from static json:', err);
    if (syncStatus && force) {
      syncStatus.textContent = `Sync failed: ${err.message}. Using offline cache.`;
      setTimeout(() => { syncStatus.textContent = ''; }, 5000);
    }
    // ensure state is populated
    if (!state.workoutLibrary || state.workoutLibrary.length === 0) {
      state.workoutLibrary = store.get(KEYS.workoutLibrary, WORKOUT_LIBRARY);
      renderWorkoutIdeas();
    }
  }
}

// Workout Ideas rendering
function renderWorkoutIdeas() {
  const container = $('ideasGrid');
  if (!container) return;
  container.innerHTML = '';

  const library = state.workoutLibrary && state.workoutLibrary.length > 0 ? state.workoutLibrary : WORKOUT_LIBRARY;

  library.forEach(idea => {
    const card = document.createElement('div');
    card.className = 'idea-card';
    
    const displayCat = idea.category.charAt(0).toUpperCase() + idea.category.slice(1);
    
    const exercisesSummary = idea.exercises.map(ex => `<div class="idea-ex-item"><span class="idea-ex-name">${escapeHtml(ex.name)}</span><span class="idea-ex-reps">${escapeHtml(ex.reps)}</span></div>`).join('');
    
    card.innerHTML = `
      <div class="idea-header">
        <span class="category-badge ${idea.category}">${displayCat}</span>
        <div class="row" style="gap:4px">
          <span class="meta-badge">⏱️ ${idea.duration}m</span>
          <span class="meta-badge">💪 ${idea.difficulty}</span>
        </div>
      </div>
      <h3 class="idea-title" style="margin-top: 0;">${escapeHtml(idea.name)}</h3>
      <p class="idea-desc">${escapeHtml(idea.desc)}</p>
      
      <div class="idea-exercises-list">
        ${exercisesSummary}
      </div>
      
      <button class="btn primary-gradient start-idea-btn" style="margin-top:auto; width:100%; justify-content:center;" data-id="${idea.id}" type="button">
        Start Workout
      </button>
    `;
    container.appendChild(card);
  });

  // Wire click events
  container.querySelectorAll('.start-idea-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ideaId = btn.getAttribute('data-id');
      const idea = library.find(i => i.id === ideaId);
      if (!idea) return;

      // Map library exercises to standard routine structure (including sets/reps inside naming)
      const exercises = idea.exercises.map(ex => ({
        id: uid(),
        name: `${ex.name} (${ex.reps})`
      }));

      const newRoutine = {
        id: `lib:${idea.id}:${uid()}`,
        name: idea.name,
        desc: `${idea.difficulty} · Category: ${displayCategory(idea.category)}`,
        exercises: exercises
      };

      // Add to routines list
      state.routines = [newRoutine, ...state.routines.filter(r => r.id !== newRoutine.id)];
      saveRoutines();
      renderRoutines();

      // Launch workout
      startRoutine(newRoutine.id);
    });
  });
}

function displayCategory(cat) {
  if (cat === 'hiit') return 'HIIT';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

// Quick Start widgets (Dashboard)
function wireQuickStart() {
  const goalSel = $('qsGoal');
  const durSel = $('qsDuration');
  if (goalSel) goalSel.value = state.profile.goal || 'general';
  if (durSel) durSel.value = String(state.profile.durationMin || 30);

  document.querySelectorAll('#qsEquipment input[type="checkbox"][data-eq]').forEach(cb => {
    const k = cb.getAttribute('data-eq');
    cb.checked = (state.profile.equipment || []).includes(k);
    cb.addEventListener('change', () => {
      const eq = new Set(state.profile.equipment || []);
      if (cb.checked) eq.add(k);
      else eq.delete(k);
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

  const wantsRun = eq.has('treadmill') || eq.has('bike');
  const hasPullup = eq.has('pullupbar');
  const hasDB = eq.has('dumbbells');
  const hasBB = eq.has('barbell');

  let name = 'Quick Start';
  let desc = `Goal: ${goal}, Duration: ${dur}m, Equipment: ${Array.from(eq).join(', ')}`;
  let exercises = [];

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
      { id: uid(), name: 'Bodyweight row / band row' },
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

  const maxEx = dur <= 20 ? 3 : dur <= 30 ? 4 : 6;
  exercises = exercises.slice(0, maxEx);

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
  $('btnNewRoutine')?.addEventListener('click', newRoutine);
  $('btnAddExercise')?.addEventListener('click', addExercise);
  $('btnEndWorkout')?.addEventListener('click', endWorkout);
  $('btnTheme')?.addEventListener('click', toggleTheme);

  $('btnTimerStartStop')?.addEventListener('click', () => {
    state.timer.running ? stopTimer() : startTimer();
  });
  $('btnTimerReset')?.addEventListener('click', resetTimer);

  document.querySelectorAll('[data-rest]').forEach(btn => {
    btn.addEventListener('click', () => addRest(Number(btn.getAttribute('data-rest') || '0')));
  });

  $('workoutNotes')?.addEventListener('input', (e) => {
    const s = activeSession();
    if (!s) return;
    s.notes = e.target.value;
    saveSessions();
  });

  $('routineList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (action === 'start') startRoutine(id);
    if (action === 'edit') editRoutine(id);
  });

  $('exerciseList')?.addEventListener('click', (e) => {
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

  $('btnExport')?.addEventListener('click', exportData);
  $('btnImport')?.addEventListener('click', () => $('fileImport')?.click());
  $('fileImport')?.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (f) importData(f);
    e.target.value = '';
  });

  $('btnReset')?.addEventListener('click', resetAll);

  $('btnSyncWorkouts')?.addEventListener('click', () => {
    syncWorkoutLibrary(true);
  });

  // Keyboard support for rest timer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') stopTimer();
  });

  // SPA Tab Buttons
  document.querySelectorAll('#tabbar button[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
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
  
  // Wire events
  wire();
  wireDashboard();
  wireGenerator();
  
  // Render views
  renderWorkoutIdeas();
  renderDashboard();
  renderRoutines();
  renderWorkout();
  
  hydrateGoalsForm();
  
  $('timer').textContent = fmtTimer(0);
  
  // Auto-switch to active session tab if in progress
  if (state.activeSessionId) {
    switchTab('workout');
  } else {
    switchTab('dashboard');
  }
  
  // Trigger background sync of workouts library
  syncWorkoutLibrary();
}

boot();
