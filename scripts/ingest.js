const fs = require('fs');
const path = require('path');

// Target paths
const appJsPath = path.join(__dirname, '../app.js');
const workoutsJsonPath = path.join(__dirname, '../workouts.json');
const incomingJsonPath = path.join(__dirname, '../data/incoming_workouts.json');

// Self-bootstrapping fallback templates (original 8)
const DEFAULT_WORKOUTS = [
  {
    id: "idea-fullbody-db",
    name: "Full Body Dumbbell Power",
    desc: "Build muscular strength and density across your entire body using only a pair of dumbbells.",
    category: "strength",
    duration: 40,
    difficulty: "Intermediate",
    exercises: [
      { name: "DB Goblet Squats", reps: "3 sets x 10-12 reps" },
      { name: "DB Floor Press", reps: "3 sets x 10-12 reps" },
      { name: "One-Arm Dumbbell Row", reps: "3 sets x 12 reps each" },
      { name: "DB Shoulder Press", reps: "3 sets x 10-12 reps" },
      { name: "DB Romanian Deadlifts", reps: "3 sets x 12 reps" }
    ]
  },
  {
    id: "idea-bodyweight-burn",
    name: "Bodyweight Inferno",
    desc: "High-intensity cardio and core-burning full body routine that requires zero equipment.",
    category: "bodyweight",
    duration: 25,
    difficulty: "Beginner",
    exercises: [
      { name: "Air Squats", reps: "3 sets x 15-20 reps" },
      { name: "Push-ups (or Incline Push-ups)", reps: "3 sets x 10-12 reps" },
      { name: "Walking Lunges", reps: "3 sets x 12 reps each" },
      { name: "Mountain Climbers", reps: "3 sets x 30 sec" },
      { name: "Plank Hold", reps: "3 sets x 45 sec" }
    ]
  },
  {
    id: "idea-core-crusher",
    name: "Core Shredder 150",
    desc: "A rapid, fire-inducing abdominal routine designed to strengthen your midsection.",
    category: "core",
    duration: 15,
    difficulty: "Beginner",
    exercises: [
      { name: "Crunches", reps: "3 sets x 15-20 reps" },
      { name: "Bicycle Crunches", reps: "3 sets x 15 reps each" },
      { name: "Hollow Body Hold", reps: "3 sets x 30 sec" },
      { name: "Russian Twists", reps: "3 sets x 20 reps" },
      { name: "Reverse Crunches", reps: "3 sets x 12 reps" }
    ]
  },
  {
    id: "idea-barbell-strength",
    name: "Compound Power (Barbell)",
    desc: "Heavy compound lifting routine focused on building raw foundational strength and size.",
    category: "strength",
    duration: 45,
    difficulty: "Advanced",
    exercises: [
      { name: "Barbell Back Squat", reps: "4 sets x 5 reps" },
      { name: "Barbell Bench Press", reps: "4 sets x 5 reps" },
      { name: "Barbell Deadlift", reps: "3 sets x 5 reps" },
      { name: "Barbell Overhead Press", reps: "3 sets x 6 reps" },
      { name: "Barbell Row", reps: "3 sets x 8 reps" }
    ]
  },
  {
    id: "idea-hiit-sweat",
    name: "HIIT Metcon Sweat",
    desc: "Metabolic conditioning circuits to burn maximum fat and build athletic conditioning.",
    category: "hiit",
    duration: 20,
    difficulty: "Intermediate",
    exercises: [
      { name: "Burpees", reps: "4 sets x 10 reps" },
      { name: "Jump Squats", reps: "4 sets x 12-15 reps" },
      { name: "Push-up to Plank Jacks", reps: "4 sets x 10 reps" },
      { name: "High Knees", reps: "4 sets x 40 sec" },
      { name: "Plank Hold", reps: "4 sets x 45 sec" }
    ]
  },
  {
    id: "idea-upper-pump",
    name: "Upper Body Hypertrophy",
    desc: "Focused volume and pump routine targeting chest, back, shoulders, and arms.",
    category: "strength",
    duration: 30,
    difficulty: "Intermediate",
    exercises: [
      { name: "DB Flat Bench Press", reps: "3 sets x 12 reps" },
      { name: "DB One-Arm Row", reps: "3 sets x 12 reps each" },
      { name: "DB Lateral Raises", reps: "3 sets x 15 reps" },
      { name: "DB Bicep Curls", reps: "3 sets x 12 reps" },
      { name: "DB Overhead Tricep Extensions", reps: "3 sets x 12 reps" }
    ]
  },
  {
    id: "idea-legs-glutes",
    name: "Legs & Glutes Sculpt",
    desc: "Lower body isolation and strength routines for building powerful quadriceps, hamstrings, and glutes.",
    category: "strength",
    duration: 35,
    difficulty: "Intermediate",
    exercises: [
      { name: "DB Goblet Squats", reps: "3 sets x 12 reps" },
      { name: "DB Romanian Deadlifts", reps: "3 sets x 12 reps" },
      { name: "DB Bulgarian Split Squats", reps: "3 sets x 10 reps each" },
      { name: "Weighted Glute Bridges", reps: "3 sets x 15 reps" },
      { name: "Calf Raises", reps: "3 sets x 20 reps" }
    ]
  },
  {
    id: "idea-recovery-flow",
    name: "Active Recovery & Flow",
    desc: "Gentle mobility flow and cardio walk to speed up recovery and release joint tension.",
    category: "bodyweight",
    duration: 30,
    difficulty: "Beginner",
    exercises: [
      { name: "World's Greatest Stretch", reps: "2 sets x 5 reps each" },
      { name: "Cat-Cow Stretch", reps: "2 sets x 10 reps" },
      { name: "90/90 Hip Flow", reps: "2 sets x 6 reps each" },
      { name: "Cobra to Child's Pose Flow", reps: "2 sets x 8 reps" },
      { name: "Light Jog / Walk", reps: "15 min slow pace" }
    ]
  }
];

function validateWorkout(workout, index) {
  const prefix = `Workout #${index} (${workout.name || 'Unnamed'}):`;
  if (!workout.id || typeof workout.id !== 'string' || !workout.id.startsWith('idea-')) {
    throw new Error(`${prefix} Missing or invalid 'id' (must start with 'idea-')`);
  }
  if (!workout.name || typeof workout.name !== 'string') {
    throw new Error(`${prefix} Missing or invalid 'name'`);
  }
  if (!workout.desc || typeof workout.desc !== 'string') {
    throw new Error(`${prefix} Missing or invalid 'desc'`);
  }
  const validCategories = ['strength', 'bodyweight', 'core', 'hiit', 'cardio'];
  if (!workout.category || !validCategories.includes(workout.category)) {
    throw new Error(`${prefix} Missing or invalid 'category' (must be one of: ${validCategories.join(', ')})`);
  }
  if (typeof workout.duration !== 'number' || workout.duration <= 0) {
    throw new Error(`${prefix} Missing or invalid 'duration' (must be a positive number)`);
  }
  const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
  if (!workout.difficulty || !validDifficulties.includes(workout.difficulty)) {
    throw new Error(`${prefix} Missing or invalid 'difficulty' (must be one of: ${validDifficulties.join(', ')})`);
  }
  if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
    throw new Error(`${prefix} 'exercises' must be a non-empty array`);
  }
  workout.exercises.forEach((ex, exIndex) => {
    if (!ex.name || typeof ex.name !== 'string') {
      throw new Error(`${prefix} Exercise #${exIndex} is missing a name`);
    }
    if (!ex.reps || typeof ex.reps !== 'string') {
      throw new Error(`${prefix} Exercise #${exIndex} is missing reps`);
    }
  });
}

function ingest() {
  console.log('--- Workout Ingestion Tool ---');

  // 1. Read existing workouts.json or default to defaults
  let currentWorkouts = [];
  if (fs.existsSync(workoutsJsonPath)) {
    try {
      currentWorkouts = JSON.parse(fs.readFileSync(workoutsJsonPath, 'utf8'));
      console.log(`Loaded ${currentWorkouts.length} existing workouts from workouts.json`);
    } catch (e) {
      console.warn('Error reading workouts.json, using fallback defaults:', e.message);
      currentWorkouts = [...DEFAULT_WORKOUTS];
    }
  } else {
    console.log('workouts.json does not exist. Initializing with default curated templates...');
    currentWorkouts = [...DEFAULT_WORKOUTS];
  }

  // Map to index by ID for deduplication
  const workoutsMap = new Map();
  currentWorkouts.forEach(w => workoutsMap.set(w.id, w));

  // 2. Read incoming workouts
  if (!fs.existsSync(incomingJsonPath)) {
    console.warn(`Incoming workouts file not found at ${incomingJsonPath}`);
    console.log('Skipping merge. Saving master list to output files...');
  } else {
    try {
      const incoming = JSON.parse(fs.readFileSync(incomingJsonPath, 'utf8'));
      if (!Array.isArray(incoming)) {
        throw new Error('Incoming file format must be a JSON array of workout objects.');
      }
      
      console.log(`Found ${incoming.length} incoming workouts to ingest...`);
      
      let ingestedCount = 0;
      let updatedCount = 0;

      incoming.forEach((workout, index) => {
        validateWorkout(workout, index);
        
        if (workoutsMap.has(workout.id)) {
          console.log(`  Updating existing workout: ${workout.name} (${workout.id})`);
          updatedCount++;
        } else {
          console.log(`  Adding new workout: ${workout.name} (${workout.id})`);
          ingestedCount++;
        }
        workoutsMap.set(workout.id, workout);
      });

      console.log(`Ingestion completed: ${ingestedCount} new added, ${updatedCount} updated.`);
    } catch (e) {
      console.error('Ingestion failed due to validation error:');
      console.error(e.message);
      process.exit(1);
    }
  }

  const finalWorkoutsList = Array.from(workoutsMap.values());

  // 3. Write to workouts.json
  try {
    fs.writeFileSync(workoutsJsonPath, JSON.stringify(finalWorkoutsList, null, 2), 'utf8');
    console.log(`Successfully updated ${workoutsJsonPath} with ${finalWorkoutsList.length} workouts.`);
  } catch (e) {
    console.error('Failed to write workouts.json:', e.message);
    process.exit(1);
  }

  // 4. Update fallback array in app.js
  if (!fs.existsSync(appJsPath)) {
    console.error(`app.js not found at ${appJsPath}. Ingestion completed with workouts.json only.`);
    process.exit(0);
  }

  try {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Stringify final workouts to write as standard JS literal
    const listStringified = JSON.stringify(finalWorkoutsList, null, 2);
    
    // Regular expression matching const WORKOUT_LIBRARY = [ ... ];
    const regex = /const WORKOUT_LIBRARY = \[\s*[\s\S]*?\n\];/;
    
    if (!regex.test(appJsContent)) {
      throw new Error("Could not locate definition of 'const WORKOUT_LIBRARY' in app.js. Regex failed to match.");
    }
    
    const replacement = `const WORKOUT_LIBRARY = ${listStringified};`;
    const updatedAppJsContent = appJsContent.replace(regex, replacement);
    
    fs.writeFileSync(appJsPath, updatedAppJsContent, 'utf8');
    console.log(`Successfully updated app.js fallback list. offline cache matches exactly.`);
  } catch (e) {
    console.error('Failed to update app.js:', e.message);
    process.exit(1);
  }

  console.log('--- Ingestion Process Complete ---');
}

ingest();
