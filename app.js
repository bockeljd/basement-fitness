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
  calendarView: 'bf:calendarView',
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
  },
  {
    "id": "idea-barbell-lower",
    "name": "Lower Body Barbell Power",
    "desc": "Advanced heavy lifting lower body workout focused on building strength in the quads, hamstrings, and glutes.",
    "category": "strength",
    "duration": 35,
    "difficulty": "Advanced",
    "exercises": [
      {
        "name": "Barbell Back Squat",
        "reps": "4 sets x 6 reps"
      },
      {
        "name": "Barbell Romanian Deadlift",
        "reps": "3 sets x 8 reps"
      },
      {
        "name": "Barbell Hip Thrust",
        "reps": "3 sets x 10 reps"
      },
      {
        "name": "Barbell Standing Calf Raise",
        "reps": "3 sets x 15 reps"
      }
    ]
  },
  {
    "id": "idea-calisthenics-strength",
    "name": "Calisthenics Strength Circuit",
    "desc": "Advanced bodyweight-only routine focused on building raw upper body power and control.",
    "category": "bodyweight",
    "duration": 30,
    "difficulty": "Advanced",
    "exercises": [
      {
        "name": "Pull-ups",
        "reps": "4 sets x 8 reps"
      },
      {
        "name": "Parallel Bar Dips",
        "reps": "3 sets x 10 reps"
      },
      {
        "name": "Decline Push-ups",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "Hanging Knee Raises",
        "reps": "3 sets x 12 reps"
      }
    ]
  },
  {
    "id": "idea-athletic-metcon",
    "name": "Athletic Metcon Sweeper",
    "desc": "High-intensity metabolic conditioning circuit combining dumbells and bodyweight for athletic endurance.",
    "category": "hiit",
    "duration": 20,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "Jumping Jacks",
        "reps": "3 sets x 45 sec"
      },
      {
        "name": "DB Thrusters",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "Burpees",
        "reps": "3 sets x 10 reps"
      },
      {
        "name": "DB Renegade Rows",
        "reps": "3 sets x 10 reps each"
      },
      {
        "name": "Mountain Climbers",
        "reps": "3 sets x 30 sec"
      }
    ]
  },
  {
    "id": "idea-restoration-stretch",
    "name": "Deep Restoration Stretch",
    "desc": "A beginner active recovery routine focusing on deep breathing, spinal alignment, and releasing muscle tightness.",
    "category": "bodyweight",
    "duration": 20,
    "difficulty": "Beginner",
    "exercises": [
      {
        "name": "Child's Pose",
        "reps": "2 sets x 45 sec hold"
      },
      {
        "name": "Cobra Stretch",
        "reps": "2 sets x 45 sec hold"
      },
      {
        "name": "Cat-Cow Stretch",
        "reps": "2 sets x 10 reps"
      },
      {
        "name": "Downward Dog",
        "reps": "2 sets x 45 sec hold"
      }
    ]
  },
  {
    "id": "idea-dumbbell-core-arms",
    "name": "Dumbbell Arms & Core Focus",
    "desc": "Volume-focused workout targeting the biceps, triceps, and abdominal stability with dumbbells.",
    "category": "strength",
    "duration": 25,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "DB Bicep Curls",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Overhead Tricep Extensions",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Hammer Curls",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "Russian Twists",
        "reps": "3 sets x 20 reps"
      },
      {
        "name": "Plank Hold",
        "reps": "3 sets x 45 sec"
      }
    ]
  },
  {
    "id": "idea-shoulder-sculptor",
    "name": "Shoulder Sculptor (Dumbbells)",
    "desc": "Focused accessory shoulder routine designed to hit all three heads of the deltoids for muscular balance.",
    "category": "strength",
    "duration": 20,
    "difficulty": "Intermediate",
    "exercises": [
      {
        "name": "DB Shoulder Press",
        "reps": "3 sets x 10 reps"
      },
      {
        "name": "DB Lateral Raises",
        "reps": "3 sets x 12-15 reps"
      },
      {
        "name": "DB Front Raises",
        "reps": "3 sets x 12 reps"
      },
      {
        "name": "DB Rear Delt Flyes",
        "reps": "3 sets x 12-15 reps"
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

const EXERCISES_BY_GROUP = {
  "Chest": [
    {
      name: "Barbell Bench Press",
      type: "Barbell",
      difficulty: "Intermediate",
      target: "Mid Chest",
      info: "Classic compound press for chest mass and upper body power.",
      steps: [
        "Lie flat on the bench, feet flat on the floor, grip the bar slightly wider than shoulder width.",
        "Retract your shoulder blades and brace your core.",
        "Unrack the bar and lower it under control to your mid-chest.",
        "Press the bar back up dynamically to full extension without lifting your hips."
      ],
      proTip: "Keep your elbows tucked at a 45-degree angle to save your shoulder joints."
    },
    {
      name: "Dumbbell Bench Press",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Chest (General)",
      info: "Excellent chest press allowing a greater range of motion and correcting imbalances.",
      steps: [
        "Sit on the bench holding dumbbells, lie back and press them straight above your chest.",
        "Lower the weights slowly until they are near the outer chest level.",
        "Press the dumbbells back up to the starting position, squeezing the chest at the top."
      ],
      proTip: "Do not let the dumbbells clank together at the top; maintain tension on the chest."
    },
    {
      name: "Incline Dumbbell Press",
      type: "Dumbbells",
      difficulty: "Intermediate",
      target: "Upper Chest",
      info: "Dumbbell press performed on a 30-45 degree incline to target upper pectorals.",
      steps: [
        "Set bench to a 30-45 degree incline, lie back holding dumbbells at collarbone level.",
        "Press dumbbells straight up above your eyes.",
        "Lower the weights under control until your elbows are below your shoulders."
      ],
      proTip: "Avoid using a bench angle greater than 45 degrees, which shifts the load to the front delts."
    },
    {
      name: "Chest Dips",
      type: "Bodyweight",
      difficulty: "Advanced",
      target: "Lower Chest",
      info: "Powerful bodyweight exercise focusing on the lower chest and triceps.",
      steps: [
        "Grab the dip bars, lock your arms, and cross your ankles.",
        "Lean your torso forward (about 30 degrees) and flare your elbows slightly.",
        "Lower your body until you feel a light stretch in your chest.",
        "Press back up to lock out your elbows."
      ],
      proTip: "Leaning forward targets the chest, while staying completely upright targets the triceps."
    },
    {
      name: "Push-ups",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Chest (General)",
      info: "Fundamental chest and core builder that can be done anywhere.",
      steps: [
        "Place hands flat on the floor slightly wider than shoulder width.",
        "Establish a rigid straight line from head to heels.",
        "Lower your chest to the floor by bending your elbows.",
        "Press the floor away to return to the top."
      ],
      proTip: "Tuck your elbows to your sides rather than flaring them outwards to protect your rotator cuffs."
    },
    {
      name: "Dumbbell Flys",
      type: "Dumbbells",
      difficulty: "Intermediate",
      target: "Chest Outer / Stretch",
      info: "Isolation movement focusing on horizontal adduction and chest stretch.",
      steps: [
        "Lie on a flat bench holding dumbbells above chest with palms facing each other.",
        "Slightly bend your elbows and lower weights in a wide arc until you feel a chest stretch.",
        "Squeeze chest to return dumbbells in the same wide arc back to the starting point."
      ],
      proTip: "Keep the bend in your elbows constant throughout the movement. It is a fly, not a press."
    },
    {
      name: "Diamond Push-ups",
      type: "Bodyweight",
      difficulty: "Intermediate",
      target: "Inner Chest / Triceps",
      info: "Push-up variation with close hand positioning for inner chest and triceps.",
      steps: [
        "Place hands close together on the floor under your chest, forming a diamond shape with thumbs and index fingers.",
        "Brace core and lower your chest down to meet your hands.",
        "Press up dynamically to full extension."
      ],
      proTip: "If this is too difficult on your toes, perform them with your knees on the floor."
    },
    {
      name: "Cable Crossover",
      type: "Cable",
      difficulty: "Intermediate",
      target: "Lower/Outer Chest",
      info: "Cable flying movement for high pectoral isolation and tension.",
      steps: [
        "Set pulleys to high position, grasp handles, and step forward to create tension.",
        "Bend elbows slightly and lean forward at the hips.",
        "Bring hands down and inward in a wide arc, crossing one hand over the other at the bottom.",
        "Slowly reverse the movement back to the starting stretch."
      ],
      proTip: "Focus on squeezing your chest muscles rather than pushing with your hands, and alternating which hand crosses on top."
    }
  ],
  "Back": [
    {
      name: "Pull-ups",
      type: "Bodyweight",
      difficulty: "Advanced",
      target: "Lats & Upper Back",
      info: "The ultimate vertical pulling exercise for back width and arm strength.",
      steps: [
        "Hang from a pull-up bar with an overhand grip (palms facing away), hands wider than shoulders.",
        "Depress your shoulder blades and pull your chest up to meet the bar.",
        "Lead with your elbows and squeeze your lats at the top.",
        "Slowly lower yourself back to a full hang."
      ],
      proTip: "Avoid swinging or using momentum. Control the lowering phase for maximum hypertrophy."
    },
    {
      name: "Barbell Row",
      type: "Barbell",
      difficulty: "Intermediate",
      target: "Mid Back & Lats",
      info: "Heavy compound horizontal row targeting back thickness.",
      steps: [
        "Hold barbell with overhand grip, bend knees slightly, hinge at hips until torso is near 45 degrees.",
        "Brace core, keep spine neutral, row bar to your lower sternum/belly button.",
        "Squeeze shoulder blades together, then lower the bar with control."
      ],
      proTip: "Pull with your elbows, not your hands, to ensure your back muscles do the work."
    },
    {
      name: "Dumbbell Rows",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Lats & Rhomboids",
      info: "Single-arm row that allows full retraction of the shoulder blade.",
      steps: [
        "Place one knee and hand on a flat bench, holding a dumbbell in the other hand.",
        "With a flat back, pull the dumbbell up to your hip level.",
        "Squeeze your lat, then lower the weight slowly to full arm extension."
      ],
      proTip: "Avoid twisting your torso at the top; keep your hips and shoulders parallel to the floor."
    },
    {
      name: "Chin-ups",
      type: "Bodyweight",
      difficulty: "Intermediate",
      target: "Lower Lats & Biceps",
      info: "Vertical pull with underhand grip that recruits biceps heavily.",
      steps: [
        "Hang from bar with underhand grip (palms facing you), hands shoulder-width apart.",
        "Pull your body up until your chin clears the bar.",
        "Lower yourself slowly to the starting dead-hang position."
      ],
      proTip: "Pull your shoulders down and back before you start pulling with your arms."
    },
    {
      name: "Deadlift",
      type: "Barbell",
      difficulty: "Advanced",
      target: "Entire Posterior Chain",
      info: "Fundamental compound lift for posterior strength, lower back, and hamstrings.",
      steps: [
        "Stand with feet hip-width apart, shins close to the barbell.",
        "Hinge at hips, bend knees, grip bar, flatten your back, and pull chest up.",
        "Drive through your heels, push hips forward, and stand up to lock out.",
        "Lower bar back down by hinging hips and bending knees once bar clears knees."
      ],
      proTip: "Never let your lower back round during the lift. Keep the barbell close to your shins."
    },
    {
      name: "Supermans",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Lower Back / Glutes",
      info: "Simple bodyweight exercise targeting the lower back extensors.",
      steps: [
        "Lie face down on the floor with arms extended forward and legs straight.",
        "Simultaneously lift your arms, chest, and legs off the ground.",
        "Hold the contraction for 2-3 seconds, then lower down slowly."
      ],
      proTip: "Keep your neck neutral by looking at the floor rather than raising your chin."
    },
    {
      name: "Cable Lat Pulldown",
      type: "Cable",
      difficulty: "Beginner",
      target: "Lats & Upper Back",
      info: "Classic vertical pull isolating the latissimus dorsi.",
      steps: [
        "Sit on the pulldown machine, adjust knee pads, grasp the bar with a wide overhand grip.",
        "Lean back slightly, pull the bar down to your upper chest by drawing elbows down and back.",
        "Squeeze lats at the bottom, then slowly return bar to full vertical stretch."
      ],
      proTip: "Avoid using momentum or pulling the bar down to your stomach. Lead with the elbows."
    },
    {
      name: "Cable Seated Row",
      type: "Cable",
      difficulty: "Beginner",
      target: "Mid-back & Lats",
      info: "Horizontal cable pull for mid-back thickness.",
      steps: [
        "Sit at the row station, place feet on pads, grasp handle, and slide hips back with slightly bent knees.",
        "Keep torso upright, pull handle towards your lower chest, retracting shoulder blades.",
        "Extend arms back under control to feel a deep stretch in your upper back."
      ],
      proTip: "Keep your chest puffed out and shoulders back. Avoid leaning back excessively as you pull."
    },
    {
      name: "Banded Pull-Aparts",
      type: "Bands",
      difficulty: "Beginner",
      target: "Upper Back & Rear Delts",
      info: "Excellent posture exercise using a resistance band.",
      steps: [
        "Stand tall holding a resistance band straight in front of you at shoulder height.",
        "Pull your hands apart to stretch the band across your chest, keeping arms straight.",
        "Squeeze your shoulder blades together at full extension, then return under control."
      ],
      proTip: "Focus on pulling with your upper back and rear delts rather than bending your elbows."
    }
  ],
  "Shoulders": [
    {
      name: "Overhead Barbell Press",
      type: "Barbell",
      difficulty: "Intermediate",
      target: "Anterior Delts",
      info: "Standing compound press that builds massive shoulder power and core stability.",
      steps: [
        "Rack barbell at chest height, grip bar slightly wider than shoulders, rack on front delts.",
        "Brace core, squeeze glutes, press bar vertically over your head, clearing your face.",
        "Lock out arms at the top, pushing head slightly forward through the window.",
        "Lower the bar back down to upper chest under control."
      ],
      proTip: "Keep your core braced tightly. Do not lean back excessively to press the weight."
    },
    {
      name: "Dumbbell Shoulder Press",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Shoulders (General)",
      info: "Vertical shoulder press providing independent arm path and stability training.",
      steps: [
        "Sit on utility bench holding dumbbells at ear level with palms facing forward.",
        "Press the weights straight up overhead until arms are extended.",
        "Lower the weights slowly back to the start position."
      ],
      proTip: "Keep your elbows slightly angled forward (in the scapular plane) rather than flared flat."
    },
    {
      name: "Dumbbell Lateral Raise",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Lateral Delts",
      info: "Crucial isolation exercise for building shoulder width and the capped deltoid look.",
      steps: [
        "Stand tall holding dumbbells at your sides, slight bend in elbows.",
        "Raise arms out to sides until they are parallel to the floor.",
        "Lead with the elbows, turn pinkies slightly up, then lower weights slowly."
      ],
      proTip: "Avoid swinging or using body momentum. Pause briefly at the peak of the raise."
    },
    {
      name: "Arnold Press",
      type: "Dumbbells",
      difficulty: "Intermediate",
      target: "Front & Side Delts",
      info: "Rotational press popularized by Arnold Schwarzenegger for complete delt coverage.",
      steps: [
        "Sit on bench, hold dumbbells in front of chest with palms facing you (like top of curl).",
        "Press dumbbells overhead while rotating your wrists so palms face forward at the top.",
        "Reverse the rotation as you lower the weights back to the start."
      ],
      proTip: "Execute the rotation smoothly throughout the press rather than all at once."
    },
    {
      name: "Pike Push-ups",
      type: "Bodyweight",
      difficulty: "Intermediate",
      target: "Front Delts / Triceps",
      info: "Excellent bodyweight shoulder press progression.",
      steps: [
        "Start in a push-up position, then walk your feet forward and lift hips to form an inverted V-shape.",
        "Lower your head forward between your hands by bending your elbows.",
        "Press the floor away to return to the starting pike shape."
      ],
      proTip: "To make it harder, elevate your feet on a bench or box."
    },
    {
      name: "Dumbbell Rear Delt Flys",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Posterior Delts",
      info: "Hinged shoulder fly targeting rear delts and upper back health.",
      steps: [
        "Hinge at hips with flat back, holding dumbbells hanging down, palms facing each other.",
        "With slightly bent elbows, raise dumbbells out to your sides.",
        "Squeeze rear delts at the top, then lower with control."
      ],
      proTip: "Focus on pulling with your elbows and avoid shrugging your shoulders into your neck."
    },
    {
      name: "Cable Face Pulls",
      type: "Cable",
      difficulty: "Intermediate",
      target: "Rear Delts & Rotator Cuff",
      info: "Excellent cable exercise for posture, rear delts, and upper back.",
      steps: [
        "Set cable pulley to upper chest height, grasp rope handles with thumbs facing back.",
        "Step back, pull hands toward your ears, flaring elbows and rotating shoulders outward.",
        "Squeeze the contraction at the ears, then slowly return to full extension."
      ],
      proTip: "Keep your chest high and squeeze your shoulder blades together. Do not pull with your lower back."
    },
    {
      name: "Banded Lateral Raise",
      type: "Bands",
      difficulty: "Intermediate",
      target: "Side Delts",
      info: "Side raise variation using a band for ascending resistance.",
      steps: [
        "Stand on the middle of a resistance band, holding handles at your sides.",
        "Raise your arms out to the sides until they are parallel to the floor.",
        "Squeeze the shoulder contraction under peak tension, then lower slowly."
      ],
      proTip: "Keep a slight bend in your knees and elbows; do not swing your torso."
    }
  ],
  "Biceps": [
    {
      name: "Dumbbell Bicep Curls",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Biceps (Short/Long Head)",
      info: "The standard dumbbell curl. Supinate wrists for maximum contraction.",
      steps: [
        "Stand or sit holding dumbbells at your sides, palms facing in (neutral grip).",
        "Curl weights up while rotating wrists so palms face up at the top.",
        "Squeeze biceps, then lower weights back down slowly, rotating wrists back."
      ],
      proTip: "Keep your elbows pinned close to your torso. Do not swing your hips."
    },
    {
      name: "Hammer Curls",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Brachialis & Forearms",
      info: "Curl performed with neutral grip, targeting forearm and outer arm thickness.",
      steps: [
        "Stand holding dumbbells with palms facing each other.",
        "Keep palms facing each other and curl the weights up.",
        "Lower the weights slowly, resisting gravity."
      ],
      proTip: "This is great for building the brachialis muscle, which sits under the bicep and pushes it up."
    },
    {
      name: "Barbell Bicep Curl",
      type: "Barbell",
      difficulty: "Beginner",
      target: "Biceps (General)",
      info: "Classic barbell movement allowing heavy bicep loading.",
      steps: [
        "Stand holding barbell with underhand grip at shoulder width.",
        "Curl bar upwards, keeping elbows stationary at sides.",
        "Lower bar with control to full extension."
      ],
      proTip: "Do not let your shoulders roll forward at the top of the movement."
    },
    {
      name: "Incline Dumbbell Curl",
      type: "Dumbbells",
      difficulty: "Intermediate",
      target: "Bicep Long Head",
      info: "Seated incline curl that places the biceps under deep stretch.",
      steps: [
        "Sit on incline bench (45 degrees), dumbbells hanging down behind your torso.",
        "Keep elbows locked in place and curl the weights up.",
        "Lower weights back to the full stretch position slowly."
      ],
      proTip: "Do not move your elbows forward during the curl; keep them pinned in place behind you."
    },
    {
      name: "Concentration Curl",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Bicep Peak",
      info: "Seated curl designed to isolate the biceps and build bicep height.",
      steps: [
        "Sit on bench, rest elbow against inner thigh, holding a dumbbell.",
        "Curl dumbbell up toward your chest, isolating bicep contraction.",
        "Lower under control, flattening arm out completely."
      ],
      proTip: "Keep your torso stationary and focus entirely on squeezing the bicep muscle."
    },
    {
      name: "Cable Bicep Curl",
      type: "Cable",
      difficulty: "Beginner",
      target: "Biceps",
      info: "Cable curls keeping constant tension on the bicep muscle.",
      steps: [
        "Attach a straight or EZ-bar to the low pulley, stand close, and grip the bar underhand.",
        "Keep elbows pinned to your sides, curl the bar up toward your shoulders.",
        "Squeeze biceps at the top, then slowly lower the bar back to full extension."
      ],
      proTip: "Keep your upper arms stationary; do not let your elbows drift forward."
    }
  ],
  "Triceps": [
    {
      name: "Tricep Overhead Extension",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Tricep Long Head",
      info: "Overhead press focusing on the long head of the triceps.",
      steps: [
        "Hold dumbbell vertically with both hands behind head, elbows pointing forward.",
        "Extend arms vertically to lift the weight overhead.",
        "Lower dumbbell back down behind your head slowly."
      ],
      proTip: "Keep your elbows tucked inward close to your ears; do not let them flare wide."
    },
    {
      name: "Skull Crushers",
      type: "Barbell / Dumbbells",
      difficulty: "Intermediate",
      target: "Triceps (General)",
      info: "Lying tricep extension targeting lateral and long heads.",
      steps: [
        "Lie on bench, press bar/dumbbells straight above your chest.",
        "Keeping upper arms vertical, bend elbows to lower bar towards forehead.",
        "Use triceps to press bar back to vertical start."
      ],
      proTip: "For shoulder health, lower the bar slightly behind your head rather than straight to your forehead."
    },
    {
      name: "Tricep Pushdowns",
      type: "Cable / Bands",
      difficulty: "Beginner",
      target: "Tricep Lateral Head",
      info: "Cable/band pull down that isolates the outer triceps.",
      steps: [
        "Grip attachment (rope/bar) at chest height, keep elbows tight to ribs.",
        "Extend arms downward, squeezing triceps at lockout.",
        "Return slowly to chest height."
      ],
      proTip: "Keep your shoulders down and avoid using your bodyweight to press the rope down."
    },
    {
      name: "Parallel Bar Dips",
      type: "Bodyweight",
      difficulty: "Advanced",
      target: "Triceps & Lower Chest",
      info: "Upright dip targeting tricep lockouts and pressing power.",
      steps: [
        "Mount dip bars, keep body upright, lock out arms.",
        "Lower body by bending elbows back, keeping torso vertical.",
        "Push back up using triceps to full arm extension."
      ],
      proTip: "Keep your torso vertical to target the triceps; leaning forward shifts focus to the chest."
    },
    {
      name: "Bench Dips",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Triceps",
      info: "Accessible tricep dip that can be done using a bench, chair, or couch.",
      steps: [
        "Place hands on edge of bench behind you, feet extended forward on floor.",
        "Lower hips by bending elbows to 90 degrees.",
        "Press up through palms to lock out arms."
      ],
      proTip: "Keep your back close to the bench as you lower and raise yourself."
    },
    {
      name: "Cable Tricep Pushdown",
      type: "Cable",
      difficulty: "Beginner",
      target: "Triceps",
      info: "Isolation movement using a cable bar or rope to target triceps.",
      steps: [
        "Attach a rope or bar to the high pulley, grasp with overhand grip, step back.",
        "Keep elbows pinned to your ribs, extend arms down to lock out elbows.",
        "Squeeze triceps at the bottom, then slowly return to the starting position (hands at chest height)."
      ],
      proTip: "Keep your upper body still and do not let your shoulders rise up during the eccentric phase."
    }
  ],
  "Legs": [
    {
      name: "Barbell Back Squat",
      type: "Barbell",
      difficulty: "Intermediate",
      target: "Quads & Glutes",
      info: "The king of lower body compound exercises for strength and size.",
      steps: [
        "Position bar on upper back/traps, lift off rack, step back.",
        "Set feet shoulder-width, toes angled slightly out.",
        "Hinge hips and bend knees to lower down to parallel or lower.",
        "Drive through your heels and mid-foot to stand back up."
      ],
      proTip: "Keep your chest up and push your knees out in line with your toes."
    },
    {
      name: "Dumbbell Romanian Deadlift",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Hamstrings & Glutes",
      info: "Hinge exercise targeting the hamstrings, glutes, and lower back.",
      steps: [
        "Stand tall holding dumbbells in front of thighs, feet hip-width apart.",
        "Push hips back and lower weights down front of legs, keeping knees slightly bent.",
        "Once you feel hamstring stretch, squeeze glutes and return to standing."
      ],
      proTip: "Keep the dumbbells close to your legs and maintain a neutral, flat spine throughout."
    },
    {
      name: "Bulgarian Split Squats",
      type: "Dumbbells / Bodyweight",
      difficulty: "Advanced",
      target: "Quads, Glutes & Balance",
      info: "Highly effective single-leg builder. Excellent for correcting imbalances.",
      steps: [
        "Place one foot flat on floor and rest top of other foot on bench behind you.",
        "Lower rear knee toward floor, keeping front knee behind front toes.",
        "Press through front heel to return to vertical."
      ],
      proTip: "Leaning forward slightly targets glutes; staying upright targets quads."
    },
    {
      name: "Dumbbell Goblet Squat",
      type: "Dumbbells",
      difficulty: "Beginner",
      target: "Quads & Core",
      info: "Great squat variation holding dumbbell at chest, correcting squat posture.",
      steps: [
        "Hold dumbbell vertically at chest level, feet shoulder-width.",
        "Squat deep, pushing knees out and keeping chest tall.",
        "Drive back up to starting position."
      ],
      proTip: "This is a great starting squat because the front load acts as a counterweight to help you stay upright."
    },
    {
      name: "Walking Lunges",
      type: "Dumbbells / Bodyweight",
      difficulty: "Beginner",
      target: "Quads, Glutes & Hamstrings",
      info: "Dynamic unilateral leg builder that improves balance and strength.",
      steps: [
        "Step forward, lower hips until back knee is just off floor.",
        "Press through front heel and step forward into next lunge.",
        "Maintain upright chest."
      ],
      proTip: "Take wide steps to target the glutes/hamstrings; shorter steps target the quads."
    },
    {
      name: "Dumbbell Calf Raises",
      type: "Dumbbells / Bodyweight",
      difficulty: "Beginner",
      target: "Calves",
      info: "Isolates the gastrocnemius calf muscle.",
      steps: [
        "Stand holding dumbbells at sides, feet hip-width.",
        "Rise up onto balls of feet as high as possible.",
        "Pause, then lower heels down under control."
      ],
      proTip: "Hold the peak contraction for 1-2 seconds and lower down slowly to eliminate Achilles tendon bounce."
    },
    {
      name: "Banded Squats",
      type: "Bands / Bodyweight",
      difficulty: "Beginner",
      target: "Quads & Glutes",
      info: "Squat variation with a resistance band looped around thighs to engage glutes.",
      steps: [
        "Loop a resistance band just above your knees, stand with feet shoulder-width apart.",
        "Squat down, actively pushing outward against the band to keep knees aligned with toes.",
        "Drive through your heels to return to standing, squeezing glutes at the top."
      ],
      proTip: "Keep the tension on the band throughout the exercise. Do not let your knees collapse inward."
    }
  ],
  "Core": [
    {
      name: "Plank Hold",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Transverse Abdominis",
      info: "Isometric core strength standard that builds complete core stability.",
      steps: [
        "Rest forearms on floor, hands apart, step feet back.",
        "Create straight line from head to heels.",
        "Tighten abs, squeeze glutes, and hold."
      ],
      proTip: "Do not let your hips sag or arch up. Imagine pulling your belly button into your spine."
    },
    {
      name: "Bicycle Crunches",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Six-pack Abs / Obliques",
      info: "Rotational crunch targeting rectus abdominis and obliques.",
      steps: [
        "Lie on back, hands behind head, raise legs, knees bent.",
        "Pedal legs while rotating torso, bringing elbow to opposite knee.",
        "Alternate sides in controlled fluid tempo."
      ],
      proTip: "Move slowly and focus on the torso rotation rather than just pulling your elbows forward."
    },
    {
      name: "Hanging Leg Raises",
      type: "Bodyweight",
      difficulty: "Advanced",
      target: "Lower Abs / Grip",
      info: "High-intensity abdominal exercise hanging from a pull-up bar.",
      steps: [
        "Hang from bar with overhand grip, arms straight.",
        "Keeping legs straight, lift them up to form a 90-degree angle with torso.",
        "Slowly lower legs back down, avoiding swinging."
      ],
      proTip: "If straight legs are too difficult, bend your knees and lift your knees to your chest."
    },
    {
      name: "Russian Twists",
      type: "Dumbbells / Bodyweight",
      difficulty: "Beginner",
      target: "Obliques",
      info: "Rotational core exercise performed in a V-sit posture.",
      steps: [
        "Sit on floor, lean back, elevate feet slightly off floor.",
        "Hold hands (or a dumbbell) and rotate torso to touch floor on right, then left.",
        "Repeat under control."
      ],
      proTip: "Follow your hands with your eyes to ensure your entire torso is rotating, not just your arms."
    },
    {
      name: "Hollow Body Hold",
      type: "Bodyweight",
      difficulty: "Intermediate",
      target: "Deep Core Stability",
      info: "Gymnastics core hold that keeps the entire core under deep isometric tension.",
      steps: [
        "Lie flat on back, extend arms overhead and legs straight out.",
        "Raise legs, head, and shoulders slightly off ground.",
        "Press your lower back flat into the floor; there should be no gap."
      ],
      proTip: "If your lower back arches off the floor, lift your legs higher or bend your knees until it is flat."
    },
    {
      name: "Banded Woodchopper",
      type: "Bands",
      difficulty: "Intermediate",
      target: "Obliques & Core Rotation",
      info: "Rotational core exercise using a resistance band anchored to a post.",
      steps: [
        "Anchor a resistance band at chest height, stand sideways to the anchor and grab the handle with both hands.",
        "Rotate your torso away from the anchor point, pulling the band across your body.",
        "Keep your arms straight and pivot your back foot, then return slowly."
      ],
      proTip: "Generate the power from your obliques and hips rather than pulling with your arms."
    }
  ],
  "Cardio": [
    {
      name: "Burpees",
      type: "Bodyweight",
      difficulty: "Intermediate",
      target: "Full Body Cardio",
      info: "High-intensity aerobic conditioning movement.",
      steps: [
        "From standing, squat down, place hands on floor.",
        "Kick feet back into push-up position, perform push-up.",
        "Jump feet back to hands, explode up into jump, clap overhead."
      ],
      proTip: "Pace yourself; finding a steady rhythm is better than sprinting and burning out in 5 reps."
    },
    {
      name: "Mountain Climbers",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Cardio & Core",
      info: "Cardiovascular builder simulating running in a plank position.",
      steps: [
        "Start in high push-up plank position.",
        "Drive right knee under chest to head height, return to start.",
        "Alternate rapidly with left knee."
      ],
      proTip: "Keep your hips low and in line with your shoulders; do not bounce your hips up and down."
    },
    {
      name: "Kettlebell Swings",
      type: "Dumbbells / Kettlebell",
      difficulty: "Intermediate",
      target: "Glutes, Hamstrings & Cardio",
      info: "Explosive hip hinge movement that trains cardiovascular endurance and hip power.",
      steps: [
        "Stand over weight, hinge hips back, grip weight.",
        "Swing weight back between legs, then snap hips forward dynamically.",
        "Stand tall, letting weight float up to shoulder height.",
        "Control descent, hinging back into next rep."
      ],
      proTip: "This is a hinge, not a squat. The power comes from snapping your hips, not lifting with your arms."
    },
    {
      name: "Jumping Jacks",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Cardio (Aerobic)",
      info: "Classic aerobic warming up standard.",
      steps: [
        "Stand tall, feet together, arms at sides.",
        "Jump feet wide while raising arms overhead.",
        "Jump back to start."
      ],
      proTip: "Land softly on the balls of your feet to reduce impact on your knees."
    },
    {
      name: "High Knees",
      type: "Bodyweight",
      difficulty: "Beginner",
      target: "Cardio (Anaerobic)",
      info: "Rapid sprint in place with knee drive.",
      steps: [
        "Stand, run in place rapidly.",
        "Drive knees up to hip height on each stride.",
        "Pump arms in sync."
      ],
      proTip: "Keep your torso tall; do not lean backward to get your knees higher."
    },
    {
      name: "Rowing Machine Intervals",
      type: "Rower",
      difficulty: "Intermediate",
      target: "Full Body Cardio",
      info: "High-intensity cardio intervals on the rowing machine.",
      steps: [
        "Sit on the rower seat, strap feet in, and grab the handle with both hands.",
        "Push back with your legs, then lean back slightly and pull the handle to your lower ribs.",
        "Extend arms, hinge at hips, and bend knees to return to starting position.",
        "Alternate 1 minute of hard rowing with 1 minute of light active recovery."
      ],
      proTip: "Rowing is 60% legs, 20% core, and 20% arms. Drive hard with your legs first."
    },
    {
      name: "Rowing 500m Sprint",
      type: "Rower",
      difficulty: "Advanced",
      target: "Full Body Cardio & Endurance",
      info: "Speed sprint targeting explosive endurance across legs, core, and back.",
      steps: [
        "Strap into the rowing machine and set monitor to track 500 meters.",
        "Row at maximum effort, focusing on a strong leg drive and fast pull stroke.",
        "Complete the 500m distance as fast as possible."
      ],
      proTip: "Pace yourself slightly in the first 100m, then maintain a high, powerful stroke rate."
    }
  ],
  "Stretching & Mobility": [
    {
      name: "World's Greatest Stretch",
      type: "Stretching",
      difficulty: "Beginner",
      target: "Hips, Spine & Shoulders",
      info: "Comprehensive full body mobility sequence.",
      steps: [
        "Step forward into deep lunge, place opposite hand flat on floor inside front foot.",
        "Reach front elbow down toward inside of ankle, then rotate arm up toward ceiling, looking up.",
        "Return hand, sit back to stretch hamstrings, then return to start."
      ],
      proTip: "Take your time in each position. Exhale as you rotate your torso upward."
    },
    {
      name: "Child's Pose",
      type: "Stretching",
      difficulty: "Beginner",
      target: "Lower Back & Hips",
      info: "Resting stretch that decompresses the spine and opens hips.",
      steps: [
        "Kneel, sit hips back on heels, touch big toes, knees apart.",
        "Reach arms forward flat on floor, lower chest to floor.",
        "Breathe deeply and sink into stretch."
      ],
      proTip: "Walk your hands to the left and right to feel an additional stretch along your lats and obliques."
    },
    {
      name: "Cat-Cow Stretch",
      type: "Stretching",
      difficulty: "Beginner",
      target: "Spine Mobility",
      info: "Flow stretch to warm up the spine and relieve back stiffness.",
      steps: [
        "Start on hands and knees (tabletop position).",
        "Inhale: Arch back, drop belly, look up to ceiling (Cow).",
        "Exhale: Round spine, tuck chin, tuck tailbone (Cat)."
      ],
      proTip: "Move slowly and initiate the movement from your tailbone, letting it ripple up your spine."
    },
    {
      name: "Downward Dog",
      type: "Stretching",
      difficulty: "Beginner",
      target: "Hamstrings, Calves & Shoulders",
      info: "Classic yoga posture that stretches the entire backside of the body.",
      steps: [
        "Start in push-up plank, lift hips high and back.",
        "Push heels toward floor, press chest back towards thighs.",
        "Splay fingers wide, press floor away."
      ],
      proTip: "If your hamstrings are tight, bend your knees slightly to maintain a straight line in your back."
    },
    {
      name: "Cobra Stretch",
      type: "Stretching",
      difficulty: "Beginner",
      target: "Abs & Spine Extension",
      info: "Prone back extension that opens the abdominal wall and chest.",
      steps: [
        "Lie face down, hands flat on floor under shoulders.",
        "Press up to lift chest, keeping thighs on floor.",
        "Look straight ahead or up slightly."
      ],
      proTip: "Keep your shoulders down and away from your ears; do not lock out your elbows if it pinches your lower back."
    }
  ]
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
  calendarView: 'list',
  timer: {
    mode: 'countdown',
    running: false,
    interval: null,
    remainingSec: 0,
    elapsedSec: 0,
    tabata: {
      round: 1,
      maxRounds: 8,
      phase: 'prep',
      workSec: 20,
      restSec: 10,
      prepSec: 5
    }
  },
  activeTab: 'dashboard',
  generatedRoutine: null,
  workoutLibrary: [],
  analyticsChart: 'consistency'
};

function seedIfEmpty() {
  const r = store.get(KEYS.routines, null);
  const hasRoutines = Array.isArray(r) && r.length;

  if (!hasRoutines) {
    store.set(KEYS.routines, []);
    store.set(KEYS.sessions, []);
    store.set(KEYS.profile, { goal: 'general', durationMin: 30, equipment: ['bodyweight'] });
  }

  // Seed a default empty goal so the calendar shows a 'set goal' prompt instead of
  // a confusing pre-baked plan. Users must explicitly set their goal in Settings.
  const pg = store.get(KEYS.primaryGoal, null);
  if (!pg) {
    // No default seeded — user will see the 'Set a goal' CTA on the dashboard
  }
}

function loadState() {
  state.routines = store.get(KEYS.routines, []);
  state.sessions = store.get(KEYS.sessions, []);
  state.activeSessionId = store.get(KEYS.active, null);
  state.profile = store.get(KEYS.profile, state.profile);
  state.primaryGoal = store.get(KEYS.primaryGoal, null);
  state.secondaryGoal = store.get(KEYS.secondaryGoal, null);
  state.goals = [];
  state.theme = store.get(KEYS.theme, 'light');
  state.plan = store.get(KEYS.plan, state.plan);
  state.calendarView = store.get(KEYS.calendarView, 'list');
  state.workoutLibrary = store.get(KEYS.workoutLibrary, WORKOUT_LIBRARY);
}

function saveRoutines() { store.set(KEYS.routines, state.routines); }
function saveSessions() { store.set(KEYS.sessions, state.sessions); }
function saveActive() { store.set(KEYS.active, state.activeSessionId); }
function saveProfile() { store.set(KEYS.profile, state.profile); }
function saveTheme() { store.set(KEYS.theme, state.theme); }
function savePrimaryGoal() { store.set(KEYS.primaryGoal, state.primaryGoal); }
function saveSecondaryGoal() { store.set(KEYS.secondaryGoal, state.secondaryGoal); }
function savePlan() { store.set(KEYS.plan, state.plan); }
function saveCalendarView() { store.set(KEYS.calendarView, state.calendarView); }

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
      <div class="routineMeta" style="flex: 1;">
        <div class="routineName">${escapeHtml(r.name)}</div>
        <div class="routineDesc">${escapeHtml(r.desc || '')}</div>
      </div>
      <div class="row wrap" style="gap: 6px;">
        <button class="btn" data-action="start" data-id="${r.id}" type="button">Start</button>
        <button class="btn secondary" data-action="edit" data-id="${r.id}" type="button">Edit</button>
        <button class="btn secondary" data-action="clone" data-id="${r.id}" title="Duplicate Routine" type="button">Clone</button>
        <button class="btn danger" style="padding: 8px 10px;" data-action="delete" data-id="${r.id}" type="button">Del</button>
      </div>
    `;
    el.appendChild(item);
  });
}

function activeSession() {
  return state.sessions.find(s => s.id === state.activeSessionId) || null;
}

function activeRoutine(session) {
  if (session && session.routineId === 'active-recovery') {
    return { id: 'active-recovery', name: 'Active Recovery', exercises: [] };
  }
  return state.routines.find(r => r.id === session.routineId) || null;
}

function ensureSessionShape(s) {
  s.entries = s.entries || {};
  s.notes = s.notes || '';
  if (!s.exercises || s.exercises.length === 0) {
    const r = activeRoutine(s);
    if (r && r.exercises) {
      s.exercises = r.exercises.map(ex => ({ id: ex.id, name: ex.name, info: ex.info || '' }));
    } else {
      s.exercises = [];
    }
  }
  return s;
}

function getRecentExercises() {
  const recentNames = new Set();
  const completed = state.sessions.filter(s => s.endedAt).slice(0, 3);
  
  completed.forEach(s => {
    const r = state.routines.find(rt => rt.id === s.routineId);
    if (s.entries) {
      Object.keys(s.entries).forEach(exId => {
        let exName = '';
        const foundInSession = s.exercises?.find(e => e.id === exId);
        if (foundInSession) {
          exName = foundInSession.name;
        } else {
          const foundInRoutine = r?.exercises?.find(e => e.id === exId);
          if (foundInRoutine) {
            exName = foundInRoutine.name;
          } else {
            for (const rt of state.routines) {
              const found = rt.exercises?.find(e => e.id === exId);
              if (found) {
                exName = found.name;
                break;
              }
            }
          }
        }
        if (exName) {
          const base = exName.split(' (')[0].trim().toLowerCase();
          recentNames.add(base);
        }
      });
    }
  });
  return recentNames;
}

function getPreviousLogForExercise(rawName) {
  if (!rawName) return null;
  const targetBase = rawName.split(' (')[0].trim().toLowerCase();
  const completed = state.sessions.filter(s => s.endedAt);
  
  for (const s of completed) {
    const r = state.routines.find(rt => rt.id === s.routineId);
    if (s.entries) {
      for (const exId of Object.keys(s.entries)) {
        let name = '';
        const foundInSession = s.exercises?.find(e => e.id === exId);
        if (foundInSession) {
          name = foundInSession.name;
        } else {
          const foundInRoutine = r?.exercises?.find(e => e.id === exId);
          if (foundInRoutine) {
            name = foundInRoutine.name;
          } else {
            for (const rt of state.routines) {
              const found = rt.exercises?.find(e => e.id === exId);
              if (found) {
                name = found.name;
                break;
              }
            }
          }
        }
        
        if (name) {
          const base = name.split(' (')[0].trim().toLowerCase();
          if (base === targetBase) {
            const sets = s.entries[exId] || [];
            if (sets.length > 0) {
              let maxW = 0;
              let maxR = 0;
              sets.forEach(st => {
                const w = Number(st.w || 0);
                const r = Number(st.r || 0);
                if (w > maxW) maxW = w;
                if (r > maxR) maxR = r;
              });
              
              const dateStr = new Date(s.endedAt || s.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              return {
                setsCount: sets.length,
                maxWeight: maxW,
                maxReps: maxR,
                dateStr,
                rawSets: sets
              };
            }
          }
        }
      }
    }
  }
  return null;
}

function pickExerciseFromPool(pool, recentNames) {
  if (!pool || pool.length === 0) return null;
  const fresh = pool.filter(ex => {
    const base = ex.name.split(' (')[0].trim().toLowerCase();
    return !recentNames.has(base);
  });
  const selectedPool = fresh.length > 0 ? fresh : pool;
  const idx = Math.floor(Math.random() * selectedPool.length);
  const pick = selectedPool[idx];
  const origIdx = pool.findIndex(ex => ex.name === pick.name);
  if (origIdx !== -1) pool.splice(origIdx, 1);
  return pick;
}

const expandedGuides = new Set();

function findLibraryExercise(rawName) {
  if (!rawName) return null;
  let name = rawName.split('(')[0].trim().toLowerCase();
  
  const norm = (s) => s
    .replace(/\bdb\b/g, 'dumbbell')
    .replace(/\bbb\b/g, 'barbell')
    .replace(/flat\b/g, '')
    .replace(/machine\b/g, '')
    .replace(/stretches\b/g, 'stretch')
    .replace(/s\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
    
  const cleanName = norm(name);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const group in EXERCISES_BY_GROUP) {
    for (const ex of EXERCISES_BY_GROUP[group]) {
      const exClean = norm(ex.name.toLowerCase());
      if (cleanName === exClean) {
        return ex;
      }
      
      let score = 0;
      if (cleanName.includes(exClean) || exClean.includes(cleanName)) {
        score = Math.min(cleanName.length, exClean.length);
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = ex;
      }
    }
  }
  
  return bestScore > 2 ? bestMatch : null;
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
    const isExpanded = expandedGuides.has(ex.id);
    const guideStyle = isExpanded ? 'max-height: none; opacity: 1; margin-top: 8px; border-top: 1px dashed var(--border);' : '';
    const iconStyle = isExpanded ? 'transform: rotate(180deg);' : '';

    exEl.innerHTML = `
      <div class="exerciseHeader">
        <div>
          <div class="exerciseName">${escapeHtml(ex.name)}</div>
          ${ex.info ? `<div class="small" style="color: var(--accent); font-weight: 600; margin-top: 1px;">Target: ${escapeHtml(ex.info)}</div>` : ''}
          <div class="small" style="display: flex; gap: 8px; align-items: center; margin-top: 2px;">
            <span>${sets.length} sets logged</span>
            <button class="btn-guide-toggle" data-ex-id="${ex.id}" type="button" style="background: none; border: none; padding: 0; color: var(--accent); font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 3px;">
              <span>📖 Form Guide</span> <span class="guide-toggle-icon" style="font-size: 8px; transition: transform 0.2s ease; ${iconStyle}">▼</span>
            </button>
          </div>
        </div>
        <div class="row">
          <button class="btn secondary" data-action="renameExercise" data-ex="${ex.id}" type="button">Rename</button>
          <button class="btn danger" data-action="removeExercise" data-ex="${ex.id}" type="button">Remove</button>
        </div>
      </div>
      
      <!-- Collapsible Form Guide Drawer -->
      <div class="exercise-dir-details" id="guide-${ex.id}" style="${guideStyle} padding-top: 0; border-top: none;">
        <!-- Filled dynamically below -->
      </div>

      <div class="sets" id="sets-${ex.id}"></div>
      <div class="row wrap" style="margin-top:10px">
        <input class="input" style="width: 100px;" inputmode="decimal" placeholder="Weight" data-field="w" data-ex="${ex.id}" />
        <input class="input" style="width: 80px;" inputmode="numeric" placeholder="Reps" data-field="r" data-ex="${ex.id}" />
        <button class="btn" data-action="logSet" data-ex="${ex.id}" type="button">Log set</button>
      </div>
    `;

    list.appendChild(exEl);

    // populate form guide drawer
    const matched = findLibraryExercise(ex.name);
    const guideEl = exEl.querySelector(`#guide-${CSS.escape(ex.id)}`);
    const prevLog = getPreviousLogForExercise(ex.name);
    let overloadHtml = '';
    if (prevLog) {
      const overloadWeight = prevLog.maxWeight > 0 ? `${prevLog.maxWeight + 5} lb` : null;
      const overloadRepsMin = prevLog.maxReps + 1;
      const overloadRepsMax = prevLog.maxReps + 2;
      const targetText = overloadWeight 
        ? `🏋️ Overload Target: Try ${overloadWeight} or ${overloadRepsMin}-${overloadRepsMax} reps`
        : `💪 Overload Target: Try ${overloadRepsMin}-${overloadRepsMax} reps`;
      
      overloadHtml = `
        <div class="exercise-overload-card" style="margin-bottom: 8px; padding: 8px 10px; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 6px; font-size: 12px;">
          <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px;">⚡ Previous Session (${escapeHtml(prevLog.dateStr)})</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text);">
            <span>Best Set: ${prevLog.maxWeight > 0 ? `${prevLog.maxWeight} lb x ` : ''}${prevLog.maxReps} reps</span>
            <span>Logged Sets: ${prevLog.setsCount}</span>
          </div>
          <div style="font-weight: 600; color: var(--text-dark);">${targetText}</div>
        </div>
      `;
    }
    
    if (matched) {
      const stepsHtml = (matched.steps || []).map(step => `<li>${escapeHtml(step)}</li>`).join('');
      const proTipHtml = matched.proTip ? `
        <div class="exercise-pro-tip" style="margin-bottom: 6px;">
          <strong>💡 Pro Tip:</strong> ${escapeHtml(matched.proTip)}
        </div>
      ` : '';
      
      guideEl.innerHTML = `
        <div style="padding: 10px 0 6px;">
          ${overloadHtml}
          <div class="exercise-detail-row" style="margin-top: 0;">
            <span class="detail-label">Target Area:</span>
            <span class="detail-val" style="color: var(--accent);">${escapeHtml(matched.target || 'General')}</span>
          </div>
          <div class="exercise-detail-row">
            <span class="detail-label">Difficulty:</span>
            <span class="detail-val">${escapeHtml(matched.difficulty || 'Intermediate')}</span>
          </div>
          <div class="exercise-detail-row">
            <span class="detail-label">Equipment:</span>
            <span class="detail-val" style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: var(--accent); background: rgba(99, 102, 241, 0.08); padding: 1px 4px; border-radius: 4px;">${escapeHtml(matched.type || 'Bodyweight')}</span>
          </div>
          
          <div class="exercise-detail-heading">How to Perform:</div>
          <ol class="exercise-steps-list" style="margin-bottom: 10px;">
            ${stepsHtml}
          </ol>
          ${proTipHtml}
        </div>
      `;
    } else {
      guideEl.innerHTML = `
        <div style="padding: 10px 0 6px;">
          ${overloadHtml}
          <div class="exercise-detail-heading">General Form Pointers:</div>
          <ol class="exercise-steps-list" style="margin-bottom: 10px;">
            <li><strong>Mind-Muscle Connection:</strong> Focus on the active muscle contracting and stretching throughout the movement.</li>
            <li><strong>Controlled Eccentrics:</strong> Lower the weight slowly (2-3 seconds) to maintain tension and protect joints.</li>
            <li><strong>Full Range of Motion:</strong> Perform the complete movement path without short-cutting or using momentum.</li>
            <li><strong>Proper Breathing:</strong> Inhale on the release/lowering, exhale on the contraction/push. Do not hold your breath.</li>
            <li><strong>Spine Safety:</strong> Brace your core and maintain a neutral/flat back on all movements.</li>
          </ol>
          <div class="exercise-pro-tip" style="margin-bottom: 6px;">
            <strong>💡 Pro Tip:</strong> If you feel joint pain or lose form, reduce the weight immediately or perform a bodyweight alternative.
          </div>
        </div>
      `;
    }

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

  // Bind click listeners for guide toggle buttons
  list.querySelectorAll('.btn-guide-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const exId = btn.getAttribute('data-ex-id');
      const details = list.querySelector(`#guide-${CSS.escape(exId)}`);
      const icon = btn.querySelector('.guide-toggle-icon');
      
      const isExpanded = expandedGuides.has(exId);
      
      if (!isExpanded) {
        expandedGuides.add(exId);
        details.style.maxHeight = details.scrollHeight + 'px';
        details.style.opacity = '1';
        details.style.marginTop = '8px';
        details.style.borderTop = '1px dashed var(--border)';
        if (icon) icon.style.transform = 'rotate(180deg)';
        setTimeout(() => {
          if (expandedGuides.has(exId)) {
            details.style.maxHeight = 'none';
          }
        }, 300);
      } else {
        expandedGuides.delete(exId);
        if (details.style.maxHeight === 'none') {
          details.style.maxHeight = details.scrollHeight + 'px';
          details.offsetHeight; // force reflow
        }
        details.style.maxHeight = '0';
        details.style.opacity = '0';
        details.style.marginTop = '0';
        details.style.borderTop = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
    });
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
    entries: {},
    exercises: (r.exercises || []).map(ex => ({ id: ex.id, name: ex.name, info: ex.info || '' }))
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
  const newEx = { id: uid(), name: name.trim() };
  r.exercises.push(newEx);
  saveRoutines();
  
  s.exercises = s.exercises || [];
  s.exercises.push({ ...newEx, info: '' });
  saveSessions();
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
  
  if (s.exercises) {
    const sEx = s.exercises.find(e => e.id === exId);
    if (sEx) sEx.name = name.trim();
  }
  saveSessions();
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
  if (!confirm('Reset all local data (routines, history, goals, profile, plan settings)?')) return;
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  window.location.reload();
}

// Timer
// Timer Audio synthesize using web audio
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Smooth envelope to prevent pops
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('AudioContext playback blocked or unsupported', e);
  }
}

function playFanfare() {
  const notes = [
    { freq: 523.25, dur: 0.15 }, // C5
    { freq: 659.25, dur: 0.15 }, // E5
    { freq: 783.99, dur: 0.15 }, // G5
    { freq: 1046.50, dur: 0.40 } // C6
  ];
  let time = 0;
  notes.forEach(note => {
    setTimeout(() => {
      playTone(note.freq, note.dur);
    }, time);
    time += note.dur * 1000 + 50;
  });
}

function applyTabataPhaseStyle(phase) {
  const panel = $('timerPanel');
  if (!panel) return;
  panel.classList.remove('phase-prep', 'phase-work', 'phase-rest');
  if (phase === 'prep') panel.classList.add('phase-prep');
  else if (phase === 'work') panel.classList.add('phase-work');
  else if (phase === 'rest') panel.classList.add('phase-rest');
}

function updateTabataDisplay() {
  const phaseBadge = $('tabataPhaseBadge');
  const roundText = $('tabataRoundText');
  if (phaseBadge) {
    const phase = state.timer.tabata.phase;
    phaseBadge.textContent = phase.toUpperCase();
    phaseBadge.className = 'category-badge';
    if (phase === 'prep') phaseBadge.classList.add('bodyweight');
    else if (phase === 'work') phaseBadge.classList.add('strength');
    else if (phase === 'rest') phaseBadge.classList.add('hiit');
  }
  if (roundText) {
    roundText.textContent = `Round ${state.timer.tabata.round}/${state.timer.tabata.maxRounds}`;
  }
}

function updateLiveSessionTitle(sec) {
  const activeTabBtn = $('tabActiveWorkout');
  if (activeTabBtn && state.activeSessionId) {
    const timerText = sec > 0 ? ` (${fmtTimer(sec)})` : '';
    activeTabBtn.querySelector('.tab-text').textContent = `Live Session${timerText}`;
  }
}

function switchTimerMode(newMode) {
  stopTimer();
  state.timer.mode = newMode;

  document.querySelectorAll('.timer-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === newMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const countdownControls = $('timer-countdown-controls');
  const tabataSetup = $('timer-tabata-setup');
  const tabataStatus = $('timer-tabata-status');
  const timerTitle = $('timerPanelTitle');
  const timerTip = $('timerTipText');

  if (countdownControls) countdownControls.style.display = (newMode === 'countdown') ? 'block' : 'none';
  if (tabataSetup) tabataSetup.style.display = (newMode === 'tabata') ? 'block' : 'none';
  if (tabataStatus) tabataStatus.style.display = 'none';
  if (timerTip) timerTip.style.display = (newMode === 'countdown') ? 'block' : 'none';

  if (timerTitle) {
    if (newMode === 'countdown') timerTitle.textContent = 'Rest timer';
    else if (newMode === 'countup') timerTitle.textContent = 'Stopwatch';
    else if (newMode === 'tabata') timerTitle.textContent = 'Tabata interval timer';
  }

  applyTabataPhaseStyle(null);

  if (newMode === 'countdown') {
    state.timer.remainingSec = 0;
    $('timer').textContent = fmtTimer(0);
  } else if (newMode === 'countup') {
    state.timer.elapsedSec = 0;
    $('timer').textContent = fmtTimer(0);
  } else if (newMode === 'tabata') {
    state.timer.remainingSec = 5;
    state.timer.tabata.phase = 'prep';
    state.timer.tabata.round = 1;
    $('timer').textContent = fmtTimer(5);
  }

  updateLiveSessionTitle(0);
}

function tick() {
  if (!state.timer.running) return;

  const mode = state.timer.mode;

  if (mode === 'countdown') {
    state.timer.remainingSec = Math.max(0, state.timer.remainingSec - 1);
    $('timer').textContent = fmtTimer(state.timer.remainingSec);
    updateLiveSessionTitle(state.timer.remainingSec);

    if (state.timer.remainingSec <= 0) {
      stopTimer();
      if (navigator.vibrate) navigator.vibrate([120, 50, 120]);
      playTone(880, 0.3);
    }
  } else if (mode === 'countup') {
    state.timer.elapsedSec = (state.timer.elapsedSec || 0) + 1;
    $('timer').textContent = fmtTimer(state.timer.elapsedSec);
    updateLiveSessionTitle(state.timer.elapsedSec);
  } else if (mode === 'tabata') {
    state.timer.remainingSec = Math.max(0, state.timer.remainingSec - 1);
    $('timer').textContent = fmtTimer(state.timer.remainingSec);
    updateLiveSessionTitle(state.timer.remainingSec);

    const phase = state.timer.tabata.phase;
    const round = state.timer.tabata.round;
    const maxRds = state.timer.tabata.maxRounds;

    if (state.timer.remainingSec >= 1 && state.timer.remainingSec <= 3) {
      playTone(440, 0.08);
    }

    if (state.timer.remainingSec <= 0) {
      if (phase === 'prep') {
        state.timer.tabata.phase = 'work';
        state.timer.remainingSec = state.timer.tabata.workSec;
        applyTabataPhaseStyle('work');
        playTone(880, 0.4);
        updateTabataDisplay();
      } else if (phase === 'work') {
        if (round >= maxRds) {
          stopTimer();
          applyTabataPhaseStyle(null);
          playFanfare();
          if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          }
          resetTimer();
        } else {
          state.timer.tabata.phase = 'rest';
          state.timer.remainingSec = state.timer.tabata.restSec;
          applyTabataPhaseStyle('rest');
          playTone(550, 0.4);
          updateTabataDisplay();
        }
      } else if (phase === 'rest') {
        state.timer.tabata.round += 1;
        state.timer.tabata.phase = 'work';
        state.timer.remainingSec = state.timer.tabata.workSec;
        applyTabataPhaseStyle('work');
        playTone(880, 0.4);
        updateTabataDisplay();
      }
    }
  }
}

function startTimer() {
  if (state.timer.running) return;

  const mode = state.timer.mode;

  if (mode === 'countdown') {
    if (state.timer.remainingSec <= 0) {
      state.timer.remainingSec = 90;
      $('timer').textContent = fmtTimer(state.timer.remainingSec);
    }
  } else if (mode === 'countup') {
    // Keep current elapsed
  } else if (mode === 'tabata') {
    const setupEl = $('timer-tabata-setup');
    const statusEl = $('timer-tabata-status');
    const isFresh = state.timer.remainingSec <= 0 || (state.timer.tabata.phase === 'prep' && state.timer.remainingSec === 5 && state.timer.tabata.round === 1);
    
    if (isFresh) {
      const wSec = Math.max(5, parseInt($('tabataWork')?.value || 20, 10));
      const rSec = Math.max(0, parseInt($('tabataRest')?.value || 10, 10));
      const maxRds = Math.max(1, parseInt($('tabataRounds')?.value || 8, 10));

      state.timer.tabata.workSec = wSec;
      state.timer.tabata.restSec = rSec;
      state.timer.tabata.maxRounds = maxRds;
      state.timer.tabata.round = 1;
      state.timer.tabata.phase = 'prep';
      state.timer.remainingSec = 5;

      applyTabataPhaseStyle('prep');
      updateTabataDisplay();
    }

    if (setupEl) setupEl.style.display = 'none';
    if (statusEl) statusEl.style.display = 'flex';
  }

  getAudioContext();

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
  applyTabataPhaseStyle(null);
  
  const setupEl = $('timer-tabata-setup');
  const statusEl = $('timer-tabata-status');

  if (state.timer.mode === 'countdown') {
    state.timer.remainingSec = 0;
    $('timer').textContent = fmtTimer(0);
  } else if (state.timer.mode === 'countup') {
    state.timer.elapsedSec = 0;
    $('timer').textContent = fmtTimer(0);
  } else if (state.timer.mode === 'tabata') {
    state.timer.remainingSec = 5;
    state.timer.tabata.phase = 'prep';
    state.timer.tabata.round = 1;
    $('timer').textContent = fmtTimer(5);
    
    if (setupEl) setupEl.style.display = 'block';
    if (statusEl) statusEl.style.display = 'none';
  }
}

function addRest(sec) {
  if (state.timer.mode !== 'countdown') {
    switchTimerMode('countdown');
  }
  state.timer.remainingSec += (sec|0);
  $('timer').textContent = fmtTimer(state.timer.remainingSec);
  startTimer();
}

// Dashboard (daily/weekly/monthly goals)
function startOfDay(d) {
  const x = new Date(d);
  if (isNaN(x.getTime())) {
    const now = new Date();
    now.setHours(0,0,0,0);
    return now;
  }
  x.setHours(0,0,0,0);
  return x;
}
function ymd(d) {
  const x = new Date(d);
  if (isNaN(x.getTime())) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }
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
  if (state.primaryGoal && state.primaryGoal.daysPerWeek) return Number(state.primaryGoal.daysPerWeek);
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

    const checkinArea = $('primaryGoalCheckinArea');
    const checkinNotice = $('checkpointDueNotice');
    if (checkinArea) {
      checkinArea.style.display = 'flex';
      const due = isCheckpointDue();
      if (due) {
        if (checkinNotice) {
          checkinNotice.innerHTML = `⚡ Check-in Due!`;
          checkinNotice.style.color = '#fbbf24';
          checkinNotice.style.animation = 'pulse 1.5s infinite alternate';
        }
      } else {
        if (checkinNotice) {
          checkinNotice.style.animation = 'none';
          checkinNotice.style.color = 'var(--muted)';
          const checkpoints = g.checkpoints || [];
          if (checkpoints.length > 0) {
            const lastCp = checkpoints[checkpoints.length - 1];
            try {
              const diffTime = Date.now() - new Date(lastCp.date).getTime();
              const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
              checkinNotice.textContent = `Check-in: ${diffDays === 0 ? 'today' : `${diffDays}d ago`}`;
            } catch {
              checkinNotice.textContent = `Checked-in`;
            }
          } else {
            checkinNotice.textContent = `No check-ins yet`;
          }
        }
      }
    }
  } else {
    if (kpiPrimaryLabel) kpiPrimaryLabel.textContent = 'Primary Goal';
    if (kpiPrimaryVal) kpiPrimaryVal.textContent = 'Not Set';
    if (kpiPrimaryFill) kpiPrimaryFill.style.width = '0%';
    const checkinArea = $('primaryGoalCheckinArea');
    if (checkinArea) checkinArea.style.display = 'none';
  }

  // Render checkpoint history in Settings
  renderCheckpointsHistory();

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
  renderAnalytics();
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
  const splitType = String($('primarySplit')?.value || 'alternating').trim();
  const difficulty = String($('primaryDifficulty')?.value || 'intermediate').trim();

  // Collect equipment from the goal form checkboxes
  const eqChecks = document.querySelectorAll('#goalEquipment input[data-goal-eq]:checked');
  let equipment = Array.from(eqChecks).map(cb => cb.getAttribute('data-goal-eq')).filter(Boolean);
  if (equipment.length === 0) equipment = ['bodyweight'];

  const goal = {
    type: t,
    durationMin: durationMin || 30,
    daysPerWeek: daysPerWeek || 3,
    splitType: splitType,
    difficulty: difficulty,
    equipment: equipment,
    createdAt: new Date().toISOString()
  };

  // Sync equipment back to profile so Quick Start stays consistent
  state.profile.equipment = equipment;
  saveProfile();

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
    if (progressVal) {
      goal.currentWeightLbs = progressVal;

      // Update weight trend history
      goal.weightHistory = state.primaryGoal?.weightHistory || [];
      const todayStr = ymd(new Date());
      const existsIdx = goal.weightHistory.findIndex(h => h.date === todayStr);
      if (existsIdx !== -1) {
        goal.weightHistory[existsIdx].weight = progressVal;
      } else {
        goal.weightHistory.push({ date: todayStr, weight: progressVal });
      }
      goal.weightHistory.sort((a, b) => a.date.localeCompare(b.date));
    }
  }

  state.primaryGoal = goal;

  const st = String($('secondaryType')?.value || '').trim();
  state.secondaryGoal = st ? { type: st, createdAt: new Date().toISOString() } : null;

  savePrimaryGoal();
  saveSecondaryGoal();
  regeneratePlan();
  renderDashboard();

  // Show confirmation
  const btn = $('btnSaveGoals');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✅ Goal saved & plan updated!';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2500);
  }
}

function hydrateGoalsForm() {
  const pt = $('primaryType');
  const pm = $('primaryMinutes');
  const pd = $('primaryDays');
  const st = $('secondaryType');
  const base = $('primaryBaseline');
  const prog = $('primaryProgress');
  const diff = $('primaryDifficulty');

  if (pt) pt.value = state.primaryGoal?.type || '';
  if (pm) pm.value = String(state.primaryGoal?.durationMin || state.profile.durationMin || 30);
  if (pd) pd.value = String(state.primaryGoal?.daysPerWeek || 3);
  if (st) st.value = state.secondaryGoal?.type || '';
  if (diff) diff.value = state.primaryGoal?.difficulty || state.profile?.difficulty || 'intermediate';

  const ps = $('primarySplit');
  if (ps) ps.value = state.primaryGoal?.splitType || 'alternating';

  // Hydrate equipment checkboxes from the goal's equipment, falling back to profile
  const goalEq = new Set(state.primaryGoal?.equipment || state.profile?.equipment || ['bodyweight']);
  document.querySelectorAll('#goalEquipment input[data-goal-eq]').forEach(cb => {
    cb.checked = goalEq.has(cb.getAttribute('data-goal-eq'));
  });

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
  
  // Clean up any past days and remove any previously corrupted invalid days
  if (state.plan && Array.isArray(state.plan.days)) {
    state.plan.days = state.plan.days.filter(d => d.date >= today && d.date !== 'NaN-NaN-NaN');
  } else {
    state.plan = { 
      generatedAt: new Date().toISOString(), 
      days: [],
      goalType: state.primaryGoal?.type,
      daysPerWeek: state.primaryGoal?.daysPerWeek,
      splitType: state.primaryGoal?.splitType,
      difficulty: state.primaryGoal?.difficulty,
      equipment: state.primaryGoal?.equipment ? [...state.primaryGoal.equipment] : []
    };
  }

  // Detect stale plan data based on goal settings metadata or legacy naming
  const planGoalType = state.plan?.goalType;
  const planDaysPerWeek = state.plan?.daysPerWeek;
  const planSplitType = state.plan?.splitType;
  const planDifficulty = state.plan?.difficulty;
  const planEquipmentStr = state.plan?.equipment ? JSON.stringify(state.plan.equipment) : '';
  const currentEquipmentStr = state.primaryGoal?.equipment ? JSON.stringify(state.primaryGoal.equipment) : '';

  const isPlanStale = !planGoalType || 
    planGoalType !== state.primaryGoal?.type ||
    planDaysPerWeek !== state.primaryGoal?.daysPerWeek ||
    planSplitType !== state.primaryGoal?.splitType ||
    planDifficulty !== state.primaryGoal?.difficulty ||
    planEquipmentStr !== currentEquipmentStr;

  const hasStaleNames = state.plan.days.some(d =>
    d.kind === 'workout' && d.routine?.name && /^Goal Session:/i.test(d.routine.name)
  );

  if (isPlanStale || hasStaleNames) {
    state.plan = { 
      generatedAt: new Date().toISOString(), 
      days: [],
      goalType: state.primaryGoal?.type,
      daysPerWeek: state.primaryGoal?.daysPerWeek,
      splitType: state.primaryGoal?.splitType,
      difficulty: state.primaryGoal?.difficulty,
      equipment: state.primaryGoal?.equipment ? [...state.primaryGoal.equipment] : []
    };
  }
  
  // If remaining plan days is less than 30, extend it to 30 days
  if (state.plan.days.length < 30) {
    extendPlan();
  }
  return true;
}

function extendPlan() {
  if (!state.primaryGoal) return;
  
  state.plan = state.plan || { 
    generatedAt: new Date().toISOString(), 
    days: [],
    goalType: state.primaryGoal?.type,
    daysPerWeek: state.primaryGoal?.daysPerWeek,
    splitType: state.primaryGoal?.splitType,
    difficulty: state.primaryGoal?.difficulty,
    equipment: state.primaryGoal?.equipment ? [...state.primaryGoal.equipment] : []
  };
  state.plan.days = state.plan.days || [];
  
  const daysPerWeek = Math.max(1, Math.min(7, Number(state.primaryGoal.daysPerWeek || 3)));
  const cadence = Math.max(1, Math.floor(7 / daysPerWeek));
  
  if (state.plan.days.length === 0) {
    state.plan.generatedAt = new Date().toISOString();
    state.plan.goalType = state.primaryGoal?.type;
    state.plan.daysPerWeek = state.primaryGoal?.daysPerWeek;
    state.plan.splitType = state.primaryGoal?.splitType;
    state.plan.difficulty = state.primaryGoal?.difficulty;
    state.plan.equipment = state.primaryGoal?.equipment ? [...state.primaryGoal.equipment] : [];
  }
  
  let genDate = new Date(state.plan.generatedAt);
  if (isNaN(genDate.getTime())) {
    genDate = new Date();
    state.plan.generatedAt = genDate.toISOString();
  }
  
  while (state.plan.days.length < 30) {
    let nextDate;
    if (state.plan.days.length > 0) {
      const lastDayStr = state.plan.days[state.plan.days.length - 1].date;
      if (lastDayStr && lastDayStr !== 'NaN-NaN-NaN') {
        const [y, m, d] = lastDayStr.split('-').map(Number);
        nextDate = new Date(y, m - 1, d + 1);
      } else {
        nextDate = new Date();
      }
    } else {
      nextDate = new Date();
    }
    
    const dateStr = ymd(nextDate);
    const daysSinceStart = Math.round((nextDate - genDate) / 86400000);
    const isWorkoutDay = (daysSinceStart % cadence) === 0;
    
    if (isWorkoutDay) {
      const workoutCount = state.plan.days.filter(d => d.kind === 'workout').length;
      const routine = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal, workoutCount);
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

  // Build 30-day calendar plan
  const now = new Date();
  const daysPerWeek = Math.max(1, Math.min(7, Number(state.primaryGoal.daysPerWeek || 3)));
  const cadence = Math.max(1, Math.floor(7 / daysPerWeek));

  const planDays = [];
  let workoutCount = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const isWorkoutDay = (i % cadence) === 0;
    if (isWorkoutDay) {
      const routine = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal, workoutCount);
      workoutCount++;
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

  state.plan = { 
    generatedAt: new Date().toISOString(), 
    days: planDays,
    goalType: state.primaryGoal?.type,
    daysPerWeek: state.primaryGoal?.daysPerWeek,
    splitType: state.primaryGoal?.splitType,
    difficulty: state.primaryGoal?.difficulty,
    equipment: state.primaryGoal?.equipment ? [...state.primaryGoal.equipment] : []
  };
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
  const r = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal, 0);
  state.routines = [r, ...state.routines.filter(x => x.id !== r.id)];
  saveRoutines();
  renderRoutines();
  startRoutine(r.id);
}

// Month Calendar Grid Views
function renderMonthCalendar() {
  const el = $('planList');
  if (!el) return;

  ensurePlanGenerated();
  const days = state.plan?.days || [];
  if (days.length === 0) return;

  const today = ymd(new Date());

  // Render headers
  let html = `
    <div class="calendar-grid">
      <div class="calendar-grid-header">Sun</div>
      <div class="calendar-grid-header">Mon</div>
      <div class="calendar-grid-header">Tue</div>
      <div class="calendar-grid-header">Wed</div>
      <div class="calendar-grid-header">Thu</div>
      <div class="calendar-grid-header">Fri</div>
      <div class="calendar-grid-header">Sat</div>
  `;

  // Determine weekday offset for the first day
  const [y, m, d] = days[0].date.split('-').map(Number);
  const firstDate = new Date(y, m - 1, d, 12, 0, 0);
  const offset = firstDate.getDay(); // 0 is Sunday, 1 is Monday...

  // Empty cells for offset
  for (let i = 0; i < offset; i++) {
    html += `<div class="calendar-cell empty"></div>`;
  }

  // Render cells
  days.forEach(day => {
    const isToday = day.date === today;
    const isWorkout = day.kind === 'workout' && day.routine;
    
    let cellClass = 'calendar-cell';
    if (isToday) cellClass += ' today';
    
    let emoji = '';
    let bodyHtml = '';
    const hasLoggedRecovery = state.sessions.some(s => s.endedAt && s.routineId === 'active-recovery' && ymd(new Date(s.endedAt)) === day.date);
    
    if (isWorkout) {
      cellClass += ' workout';
      emoji = '💪';
      
      // Strip boilerplate prefixes so calendar cells show only the meaningful split label
      const rawName = day.routine.name || '';
      const cellName = rawName
        .replace(/^Goal Session:\s*(Build Muscle|Fat Loss|)\s*\(?/i, '')
        .replace(/^Goal Session:\s*/i, '')
        .replace(/^Strength Split:\s*/i, '')
        .replace(/^General Split:\s*/i, '')
        .replace(/\)$/, '')
        .trim();
      
      const exPreviews = (day.routine.exercises || [])
        .filter(ex => !ex.name.toLowerCase().startsWith('warm-up') && !ex.name.toLowerCase().startsWith('cool down'))
        .map(ex => ex.name.split(' (')[0].trim())
        .slice(0, 2)
        .join(', ');
        
      bodyHtml = `
        <div class="calendar-cell-body">
          <div class="calendar-cell-name">${escapeHtml(cellName)}</div>
          <div class="calendar-cell-exercises">${escapeHtml(exPreviews)}</div>
        </div>
      `;
    } else {
      if (hasLoggedRecovery) {
        cellClass += ' completed-recovery';
        emoji = '🧘';
        bodyHtml = `
          <div class="calendar-cell-body">
            <div class="calendar-cell-name">Recovery</div>
            <div class="calendar-cell-exercises">15m session logged</div>
          </div>
        `;
      } else {
        cellClass += ' rest';
        bodyHtml = `
          <div class="calendar-cell-body">
            <div class="calendar-cell-name">Rest</div>
            <div class="calendar-cell-exercises">Active recovery or rest</div>
          </div>
        `;
      }
    }

    const dayNum = day.date.split('-')[2];
    const tooltipText = isWorkout ? day.routine.name : (hasLoggedRecovery ? 'Recovery Completed' : 'Rest Day');

    html += `
      <div class="${cellClass}" data-calendar-date="${day.date}" title="${escapeHtml(tooltipText)}">
        <div class="calendar-cell-num">${dayNum}</div>
        ${bodyHtml}
        ${emoji ? `<span class="calendar-cell-emoji">${emoji}</span>` : ''}
      </div>
    `;
  });

  html += `</div>`;
  el.innerHTML = html;
  
  // Wire click listener for cells in Month View
  el.querySelectorAll('.calendar-cell:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.getAttribute('data-calendar-date');
      if (dateStr) showDayPopover(dateStr);
    });
  });
}

function showDayPopover(dateStr) {
  const modal = $('modalDayDetails');
  const titleEl = $('dayDetailsTitle');
  const contentEl = $('dayDetailsContent');
  if (!modal || !titleEl || !contentEl) return;

  const item = (state.plan?.days || []).find(d => d.date === dateStr);
  if (!item) return;

  // Format title date
  let dateTitle = dateStr;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dateTitle = dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {}

  titleEl.textContent = dateTitle;

  const isWorkout = item.kind === 'workout' && item.routine;
  const hasLoggedRecovery = state.sessions.some(s => s.endedAt && s.routineId === 'active-recovery' && ymd(new Date(s.endedAt)) === dateStr);

  let html = '';
  if (isWorkout) {
    // Strip boilerplate prefixes for clean display in the modal header
    const modalTitle = (item.routine.name || '')
      .replace(/^Goal Session:\s*(Build Muscle|Fat Loss|)\s*\(?/i, '')
      .replace(/^Goal Session:\s*/i, '')
      .replace(/^Strength Split:\s*/i, '')
      .replace(/^General Split:\s*/i, '')
      .replace(/\)$/, '')
      .trim() || item.routine.name;

    const exercisesHtml = item.routine.exercises.map(ex => {
      const parts = ex.name.split(' (');
      const baseName = parts[0].trim();
      const reps = parts[1] ? parts[1].replace(')', '').trim() : '';
      return `<li style="margin-bottom: 6px; font-size: 13px;"><strong>${escapeHtml(baseName)}</strong> ${reps ? `<span style="color: var(--accent); font-weight: 700;">(${escapeHtml(reps)})</span>` : ''} - <span class="muted">${escapeHtml(ex.info || '')}</span></li>`;
    }).join('');

    html = `
      <div style="padding: 10px 0;">
        <h4 style="font-size: 16px; font-weight: 800; color: var(--accent); margin-bottom: 4px;">${escapeHtml(modalTitle)}</h4>
        <p class="muted" style="font-size: 12px; margin-bottom: 12px;">${escapeHtml(item.routine.name)}</p>
        
        <div class="panel" style="margin-bottom: 16px;">
          <div class="panelTitle" style="font-size: 11px; text-transform: uppercase; margin-bottom: 6px;">Exercise Sequence</div>
          <ol style="margin: 0; padding-left: 18px; line-height: 1.4;">
            ${exercisesHtml}
          </ol>
        </div>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 15px;">
          <button class="btn" data-plan-action="start" data-plan-date="${dateStr}" type="button" style="flex: 1; min-width: 100px;">Start Session</button>
          <button class="btn secondary" data-plan-action="edit-workout" data-plan-date="${dateStr}" type="button">✏️ Edit Workout</button>
          <button class="btn secondary" data-plan-action="swap" data-plan-date="${dateStr}" type="button">🔁 Swap Focus</button>
          <button class="btn secondary" data-plan-action="shift" data-plan-date="${dateStr}" type="button">➡️ Shift Day</button>
          <button class="btn danger" data-plan-action="toggle" data-plan-date="${dateStr}" type="button">❌ Make Rest</button>
        </div>
      </div>
    `;
  } else {
    let actionButtons = '';
    let recoveryStateHtml = '';
    
    if (hasLoggedRecovery) {
      recoveryStateHtml = `
        <div class="exercise-overload-card" style="margin-bottom: 12px; padding: 10px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 6px; font-size: 13px;">
          <div style="font-weight: 700; color: var(--success); display: flex; align-items: center; gap: 6px;">
            <span>✅ Active Recovery Completed</span>
          </div>
          <p class="muted" style="font-size: 11px; margin-top: 4px; margin-bottom: 0;">15-minute active stretching and light mobility session logged.</p>
        </div>
      `;
      actionButtons = `
        <button class="btn secondary" data-plan-action="toggle" data-plan-date="${dateStr}" type="button" style="width: 100%;">➕ Change to Workout</button>
      `;
    } else {
      recoveryStateHtml = `
        <div class="exercise-overload-card" style="margin-bottom: 12px; padding: 10px; background: rgba(71, 85, 105, 0.03); border: 1px solid var(--border); border-radius: 6px; font-size: 13px;">
          <div style="font-weight: 700; color: var(--muted);">🧘 Recovery Target</div>
          <p class="muted" style="font-size: 11px; margin-top: 4px; margin-bottom: 0;">Active recovery, stretching, light walking, or mobility work.</p>
        </div>
      `;
      actionButtons = `
        <button class="btn" data-plan-action="log-recovery" data-plan-date="${dateStr}" type="button" style="flex: 1;">🧘 Log 15m Recovery</button>
        <button class="btn secondary" data-plan-action="toggle" data-plan-date="${dateStr}" type="button">➕ Change to Workout</button>
      `;
    }

    html = `
      <div style="padding: 10px 0;">
        <h4 style="font-size: 16px; font-weight: 800; color: var(--muted); margin-bottom: 8px;">Rest & Recovery</h4>
        <p class="muted" style="font-size: 12px; margin-bottom: 12px;">Active recovery or rest day</p>
        
        ${recoveryStateHtml}
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 15px;">
          ${actionButtons}
        </div>
      </div>
    `;
  }

  contentEl.innerHTML = html;
  modal.classList.add('active');
}

function closeDayPopover() {
  const modal = $('modalDayDetails');
  if (modal) modal.classList.remove('active');
}

// Inline editing state for calendar day workouts
let currentEditingDate = null;
let currentEditingExercises = [];

function showEditWorkoutView(dateStr) {
  const modal = $('modalDayDetails');
  const titleEl = $('dayDetailsTitle');
  const contentEl = $('dayDetailsContent');
  if (!modal || !titleEl || !contentEl) return;

  const item = (state.plan?.days || []).find(d => d.date === dateStr);
  if (!item || !item.routine) return;

  currentEditingDate = dateStr;
  currentEditingExercises = (item.routine.exercises || []).map(ex => {
    let name = ex.name || '';
    let info = ex.info || '';
    if (!info) {
      const emDashIndex = name.indexOf(' — ');
      if (emDashIndex !== -1) {
        info = name.substring(emDashIndex + 3).trim();
        name = name.substring(0, emDashIndex).trim();
      } else {
        const match = name.match(/^(.*?)\s*\(([^)]+)\)$/);
        if (match) {
          name = match[1].trim();
          info = match[2].trim();
        }
      }
    }
    return {
      id: ex.id || uid(),
      name,
      info
    };
  });

  let dateTitle = dateStr;
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dateTitle = 'Edit: ' + dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {}
  titleEl.textContent = dateTitle;

  contentEl.innerHTML = `
    <div style="padding: 10px 0;">
      <div style="margin-bottom: 16px;">
        <label class="small" style="display:block; margin-bottom: 6px; font-weight: 700; color: var(--text);">Workout Name</label>
        <input type="text" id="editPlanWorkoutName" class="input" style="font-weight: 800;" value="${escapeHtml(item.routine.name)}">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label class="small" style="display:block; margin-bottom: 6px; font-weight: 700; color: var(--text);">Exercises</label>
        <div id="editPlanExercisesList" style="display: grid; gap: 10px;">
          <!-- Populated dynamically -->
        </div>
        <button class="btn secondary" id="btnEditPlanAddEx" type="button" style="width: 100%; justify-content: center; font-size: 13px; margin-top: 10px;">➕ Add Custom Exercise</button>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 20px; border-top: 1px solid var(--border); padding-top: 15px;">
        <button class="btn" id="btnEditPlanSave" type="button" style="flex: 1;">Save Changes</button>
        <button class="btn secondary" id="btnEditPlanCancel" type="button" style="flex: 1;">Cancel</button>
      </div>
    </div>
  `;

  // Bind actions
  $('btnEditPlanAddEx')?.addEventListener('click', () => {
    syncEditingExercisesFromDOM();
    currentEditingExercises.push({ id: uid(), name: '', info: '' });
    renderEditWorkoutExercises();
  });

  $('btnEditPlanSave')?.addEventListener('click', () => {
    saveEditedWorkout();
  });

  $('btnEditPlanCancel')?.addEventListener('click', () => {
    showDayPopover(dateStr);
  });

  renderEditWorkoutExercises();
}

function syncEditingExercisesFromDOM() {
  const container = $('editPlanExercisesList');
  if (!container) return;
  const rows = container.querySelectorAll('.edit-ex-row');
  rows.forEach((row) => {
    const exId = row.getAttribute('data-ex-id');
    const nameVal = row.querySelector('.editPlanExName')?.value || '';
    const infoVal = row.querySelector('.editPlanExInfo')?.value || '';
    const ex = currentEditingExercises.find(e => e.id === exId);
    if (ex) {
      ex.name = nameVal.trim();
      ex.info = infoVal.trim();
    }
  });
}

function renderEditWorkoutExercises() {
  const container = $('editPlanExercisesList');
  if (!container) return;

  if (currentEditingExercises.length === 0) {
    container.innerHTML = `<div class="muted" style="text-align: center; padding: 10px; font-size: 12px;">No exercises in this workout. Add one below.</div>`;
    return;
  }

  container.innerHTML = currentEditingExercises.map((ex, idx) => {
    return `
      <div class="panel edit-ex-row" data-ex-id="${ex.id}" style="padding: 10px; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg);">
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" class="input editPlanExName" style="flex: 1; font-size: 13px; padding: 6px 10px;" value="${escapeHtml(ex.name)}" placeholder="Exercise Name">
          <button class="btn danger btnEditPlanExDelete" data-idx="${idx}" style="padding: 6px 10px; font-size: 13px;" type="button" title="Remove">✕</button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" class="input editPlanExInfo" style="flex: 1; font-size: 12px; padding: 6px 10px;" value="${escapeHtml(ex.info)}" placeholder="Sets/Reps or details (e.g. 3 x 8-10 reps)">
          <div style="display: flex; gap: 4px;">
            <button class="btn secondary btnEditPlanExMoveUp" data-idx="${idx}" style="padding: 6px 8px; font-size: 11px;" type="button" title="Move Up" ${idx === 0 ? 'disabled' : ''}>▲</button>
            <button class="btn secondary btnEditPlanExMoveDown" data-idx="${idx}" style="padding: 6px 8px; font-size: 11px;" type="button" title="Move Down" ${idx === currentEditingExercises.length - 1 ? 'disabled' : ''}>▼</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Wire buttons inside the container
  container.querySelectorAll('.btnEditPlanExDelete').forEach(btn => {
    btn.addEventListener('click', () => {
      syncEditingExercisesFromDOM();
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      currentEditingExercises.splice(idx, 1);
      renderEditWorkoutExercises();
    });
  });

  container.querySelectorAll('.btnEditPlanExMoveUp').forEach(btn => {
    btn.addEventListener('click', () => {
      syncEditingExercisesFromDOM();
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (idx > 0) {
        const temp = currentEditingExercises[idx];
        currentEditingExercises[idx] = currentEditingExercises[idx - 1];
        currentEditingExercises[idx - 1] = temp;
        renderEditWorkoutExercises();
      }
    });
  });

  container.querySelectorAll('.btnEditPlanExMoveDown').forEach(btn => {
    btn.addEventListener('click', () => {
      syncEditingExercisesFromDOM();
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (idx < currentEditingExercises.length - 1) {
        const temp = currentEditingExercises[idx];
        currentEditingExercises[idx] = currentEditingExercises[idx + 1];
        currentEditingExercises[idx + 1] = temp;
        renderEditWorkoutExercises();
      }
    });
  });
}

function saveEditedWorkout() {
  const dateStr = currentEditingDate;
  if (!dateStr) return;

  const item = (state.plan?.days || []).find(d => d.date === dateStr);
  if (!item || !item.routine) return;

  const nameVal = $('editPlanWorkoutName')?.value?.trim();
  if (!nameVal) {
    alert('Please enter a workout name.');
    return;
  }

  syncEditingExercisesFromDOM();

  const missingNames = currentEditingExercises.some(ex => !ex.name.trim());
  if (missingNames) {
    alert('Please enter a name for all exercises.');
    return;
  }

  item.routine.name = nameVal;
  item.routine.exercises = currentEditingExercises.map(ex => ({
    id: ex.id,
    name: ex.name.trim(),
    info: ex.info.trim()
  }));

  savePlan();
  
  if (state.calendarView === 'month') {
    renderMonthCalendar();
  } else {
    renderPlan();
  }

  showDayPopover(dateStr);
}

function handleCalendarAction(act, dateStr) {
  if (!dateStr || !act) return;
  
  if (act === 'start') {
    closeDayPopover();
    startPlannedWorkout(dateStr);
  } else if (act === 'edit-workout') {
    showEditWorkoutView(dateStr);
  } else if (act === 'swap') {
    const idx = state.plan.days.findIndex(d => d.date === dateStr);
    if (idx !== -1) {
      const item = state.plan.days[idx];
      if (item.routine && item.routine.id) {
        const parts = item.routine.id.split(':');
        let dayIndex = parseInt(parts[parts.length - 1], 10);
        if (isNaN(dayIndex)) dayIndex = 0;
        const nextDayIndex = dayIndex + 1;
        const newRoutine = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal, nextDayIndex);
        parts[parts.length - 1] = String(nextDayIndex);
        newRoutine.id = parts.join(':');
        item.routine = newRoutine;
        savePlan();
        if (state.calendarView === 'month') {
          renderMonthCalendar();
          showDayPopover(dateStr);
        } else {
          renderPlan();
        }
      }
    }
  } else if (act === 'shift') {
    const idx = state.plan.days.findIndex(d => d.date === dateStr);
    if (idx !== -1 && idx < state.plan.days.length - 1) {
      const current = state.plan.days[idx];
      const next = state.plan.days[idx + 1];
      
      const tempKind = current.kind;
      const tempRoutine = current.routine;
      
      current.kind = next.kind;
      current.routine = next.routine;
      
      next.kind = tempKind;
      next.routine = tempRoutine;
      
      savePlan();
      if (state.calendarView === 'month') {
        renderMonthCalendar();
        showDayPopover(next.date);
      } else {
        renderPlan();
      }
    }
  } else if (act === 'toggle') {
    const idx = state.plan.days.findIndex(d => d.date === dateStr);
    if (idx !== -1) {
      const day = state.plan.days[idx];
      if (day.kind === 'workout') {
        day.kind = 'rest';
        day.routine = null;
      } else {
        day.kind = 'workout';
        const priorWorkouts = state.plan.days.slice(0, idx).filter(d => d.kind === 'workout').length;
        day.routine = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal, priorWorkouts);
      }
      savePlan();
      if (state.calendarView === 'month') {
        renderMonthCalendar();
        showDayPopover(dateStr);
      } else {
        renderPlan();
      }
    }
  } else if (act === 'log-recovery') {
    const todayStr = ymd(new Date());
    let startedAt, endedAt;
    if (dateStr === todayStr) {
      const now = new Date();
      endedAt = now.toISOString();
      startedAt = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
    } else {
      const parts = dateStr.split('-');
      const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      endedAt = dt.toISOString();
      startedAt = new Date(dt.getTime() - 15 * 60 * 1000).toISOString();
    }
    
    const recoverySession = {
      id: uid(),
      routineId: 'active-recovery',
      startedAt,
      endedAt,
      notes: '15-min active recovery / stretching completed',
      entries: {}
    };
    
    state.sessions.unshift(recoverySession);
    saveSessions();
    
    if (typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
    
    renderDashboard();
    if (state.calendarView === 'month') {
      showDayPopover(dateStr);
    }
  }
}

function renderPlan() {
  const el = $('planList');
  if (!el) return;

  const toggleBtn = $('btnToggleCalendarView');
  if (toggleBtn) {
    toggleBtn.textContent = state.calendarView === 'month' ? '📝 List View' : '📅 Month View';
  }

  if (!state.primaryGoal) {
    el.innerHTML = '<div class="muted">Set a primary goal to generate a plan.</div>';
    return;
  }

  if (state.calendarView === 'month') {
    renderMonthCalendar();
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

  const isWarmupOrStretch = (name) => {
    const base = name.split(' (')[0].trim().toLowerCase();
    const warmupBases = ["world's greatest stretch", "cat-cow stretch", "jumping jacks", "high knees"];
    if (warmupBases.includes(base)) return true;
    
    const matched = findLibraryExercise(name);
    if (matched) {
      for (const group in EXERCISES_BY_GROUP) {
        if (group === 'Stretching & Mobility') {
          if (EXERCISES_BY_GROUP[group].some(ex => ex.name.toLowerCase() === matched.name.toLowerCase())) {
            return true;
          }
        }
      }
    }
    return false;
  };

  el.innerHTML = '';
  days.forEach(d => {
    const item = document.createElement('div');
    const isToday = d.date === today;
    item.className = `planItem${isToday ? ' today' : ''}`;

    const isWorkout = d.kind === 'workout' && d.routine;
    const label = isWorkout ? (d.routine?.name || 'Workout') : 'Recovery / Optional Walk';

    let subtitle = '';
    if (isWorkout && d.routine.exercises) {
      const workingExs = d.routine.exercises.filter(e => !isWarmupOrStretch(e.name));
      const displayExs = workingExs.length > 0 ? workingExs : d.routine.exercises;
      const exNames = displayExs.slice(0, 3).map(e => e.name.split(' (')[0].trim()).join(', ');
      subtitle = `Focus: ${exNames}${displayExs.length > 3 ? '...' : ''}`;
    } else {
      subtitle = 'Active recovery, stretching, or light walk';
    }

    const hasLoggedRecovery = state.sessions.some(s => s.endedAt && s.routineId === 'active-recovery' && ymd(new Date(s.endedAt)) === d.date);
    
    let badge = '';
    let actionButtons = '';
    
    if (isWorkout) {
      badge = '<span class="planBadge">Workout</span>';
      actionButtons = `
        <button class="btn" data-plan-action="start" data-plan-date="${d.date}" style="padding: 4px 8px; font-size: 11px;" type="button">Start</button>
        <button class="btn secondary" data-plan-action="swap" data-plan-date="${d.date}" style="padding: 4px 8px; font-size: 11px;" title="Swap focus split" type="button">🔁 Swap</button>
        <button class="btn secondary" data-plan-action="shift" data-plan-date="${d.date}" style="padding: 4px 8px; font-size: 11px;" title="Shift day" type="button">➡️ Shift</button>
        <button class="btn danger" data-plan-action="toggle" data-plan-date="${d.date}" style="padding: 4px 8px; font-size: 11px;" title="Change to Rest" type="button">❌ Rest</button>
      `;
    } else {
      if (hasLoggedRecovery) {
        badge = '<span class="planBadge rest" style="background: rgba(16, 185, 129, 0.1); color: var(--success); border-color: rgba(16, 185, 129, 0.2);">Rest</span>';
        actionButtons = `<span class="small" style="color: var(--success); font-weight: 700; display: flex; align-items: center; gap: 4px;">✅ Completed</span>`;
      } else {
        badge = '<span class="planBadge rest">Rest</span>';
        actionButtons = `
          <button class="btn" data-plan-action="log-recovery" data-plan-date="${d.date}" style="padding: 4px 8px; font-size: 11px;" title="Log 15m recovery" type="button">🧘 Log Recovery</button>
          <button class="btn secondary" data-plan-action="toggle" data-plan-date="${d.date}" style="padding: 4px 8px; font-size: 11px;" title="Change to Workout" type="button">➕ Workout</button>
        `;
      }
    }

    item.innerHTML = `
      <div class="planMeta">
        <div class="planDate">${isToday ? 'Today' : fmtDay(d.date)}</div>
        <div class="planTitle">${escapeHtml(label)}</div>
        <div class="planExercises">${escapeHtml(subtitle)}</div>
      </div>
      <div class="planActions">
        ${badge}
        ${actionButtons}
      </div>
    `;
    el.appendChild(item);
  });
}

function wireDashboard() {
  $('btnSaveGoals')?.addEventListener('click', saveGoalsFromForm);
  $('primaryType')?.addEventListener('change', updateGoalFieldVisibility);
  $('btnGenerateToday')?.addEventListener('click', generateTodayFromGoals);
  $('btnRegenPlan')?.addEventListener('click', regeneratePlan);

  $('btnToggleCalendarView')?.addEventListener('click', () => {
    state.calendarView = state.calendarView === 'month' ? 'list' : 'month';
    saveCalendarView();
    renderPlan();
  });

  $('btnDayDetailsClose')?.addEventListener('click', closeDayPopover);
  $('modalDayDetails')?.addEventListener('click', (e) => {
    if (e.target === $('modalDayDetails')) closeDayPopover();
  });

  $('planList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const act = btn.getAttribute('data-plan-action');
    const dateStr = btn.getAttribute('data-plan-date');
    handleCalendarAction(act, dateStr);
  });

  $('dayDetailsContent')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const act = btn.getAttribute('data-plan-action');
    const dateStr = btn.getAttribute('data-plan-date');
    handleCalendarAction(act, dateStr);
  });

  // Checkpoints event listeners
  $('btnPrimaryCheckin')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showCheckpointModal();
  });
  $('kpiPrimary')?.addEventListener('click', () => {
    if (state.primaryGoal) showCheckpointModal();
  });
  $('btnManualCheckin')?.addEventListener('click', () => {
    showCheckpointModal();
  });
  $('btnCheckpointClose')?.addEventListener('click', closeCheckpointModal);
  $('modalCheckpoint')?.addEventListener('click', (e) => {
    if (e.target === $('modalCheckpoint')) closeCheckpointModal();
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
    if (group.id === 'genFocus') {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        btn.classList.toggle('active');
        // Ensure at least one muscle group focus remains selected
        const actives = group.querySelectorAll('.pill-btn.active');
        if (actives.length === 0) {
          btn.classList.add('active');
        }
      });
      return;
    }

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
    
    const selectedFoci = [];
    container.querySelectorAll('#genFocus .pill-btn.active').forEach(btn => {
      selectedFoci.push(btn.getAttribute('data-value'));
    });
    
    const difficulty = container.querySelector('#genDifficulty .pill-btn.active').getAttribute('data-value');
    
    const equipment = ['bodyweight'];
    container.querySelectorAll('#genEquipment input[type="checkbox"]').forEach(cb => {
      if (cb.checked && cb.getAttribute('data-eq') !== 'bodyweight') {
        equipment.push(cb.getAttribute('data-eq'));
      }
    });

    generateCustomWorkout(Number(duration), selectedFoci, equipment, difficulty);
  });

  // Start generated workout
  $('btnStartGeneratedWorkout')?.addEventListener('click', () => {
    if (!state.generatedRoutine) return;
    
    const finalized = finalizeGeneratedRoutine();
    if (!finalized) return;
    
    // Add finalized generated workout to routines state
    state.routines = [finalized, ...state.routines.filter(r => r.id !== finalized.id)];
    saveRoutines();
    renderRoutines();
    
    // Launch workout
    startRoutine(finalized.id);
  });

  // Save generated routine
  $('btnSaveGeneratedRoutine')?.addEventListener('click', () => {
    if (!state.generatedRoutine) return;
    
    const finalized = finalizeGeneratedRoutine();
    if (!finalized) return;
    
    // Assign a fresh permanent ID to make it unique for saving
    finalized.id = uid();
    
    state.routines.unshift(finalized);
    saveRoutines();
    renderRoutines();
    
    alert(`Routine "${finalized.name}" saved successfully to your Custom Routines!`);
  });
}

function matchEquipment(exType, exName, eqSet) {
  const tLower = exType.toLowerCase();
  const nLower = exName.toLowerCase();
  
  if (tLower === 'bodyweight' || tLower === 'stretching' || tLower.includes('bodyweight')) return true;
  
  let matches = false;
  if (tLower.includes('cable')) matches = matches || eqSet.has('cables');
  if (tLower.includes('band')) matches = matches || eqSet.has('resistancebands');
  if (tLower.includes('dumbbell') || tLower.includes('kettlebell')) matches = matches || eqSet.has('dumbbells');
  if (tLower.includes('barbell')) matches = matches || eqSet.has('barbell');
  if (tLower.includes('treadmill') || nLower.includes('treadmill')) matches = matches || eqSet.has('treadmill');
  if (tLower.includes('rower') || nLower.includes('rower') || nLower.includes('rowing machine')) matches = matches || eqSet.has('rower');
  if (nLower.includes('pull-up') || nLower.includes('chin-up') || tLower.includes('pullupbar')) matches = matches || eqSet.has('pullupbar');
  
  return matches;
}

function generateRepsForExercise(ex, difficulty, goal = 'general') {
  const nameL = (ex.name || '').toLowerCase();
  const typeL = (ex.type || '').toLowerCase();

  // Stretching / cool-down — always holds, regardless of goal
  if (typeL === 'stretching') {
    if (difficulty === 'beginner') return '2 sets × 30s hold';
    if (difficulty === 'advanced') return '3 sets × 60s hold';
    return '2 sets × 45s hold';
  }

  // Isometric holds (plank, wall sit, etc.)
  if (nameL.includes('plank') || nameL.includes('hold') || nameL.includes('wall sit')) {
    if (difficulty === 'beginner') return '3 sets × 20s hold';
    if (difficulty === 'advanced') return '4 sets × 60s hold';
    return '3 sets × 40s hold';
  }

  // Cardio / HIIT movements
  if (nameL.includes('burpee') || nameL.includes('jack') || nameL.includes('climber') || nameL.includes('high knee') || nameL.includes('sprint')) {
    if (difficulty === 'beginner') return '3 sets × 30s work / 30s rest';
    if (difficulty === 'advanced') return '4 sets × 45s work / 15s rest';
    return '3 sets × 40s work / 20s rest';
  }

  // ── Goal-specific rep schemes ──

  // Strength: low reps, heavy — 4–5 sets × 3–6 reps
  if (goal === 'strength') {
    if (difficulty === 'beginner') return '3 sets × 6–8 reps (heavy)';
    if (difficulty === 'advanced') return '5 sets × 3–5 reps (heavy)';
    return '4 sets × 4–6 reps (heavy)';
  }

  // Muscle building / hypertrophy: moderate-heavy, 8–12 reps
  if (goal === 'build_muscle' || goal === 'hypertrophy') {
    if (difficulty === 'beginner') return '3 sets × 10–12 reps';
    if (difficulty === 'advanced') return '4 sets × 8–12 reps (controlled)';
    return '3 sets × 8–12 reps';
  }

  // Fat loss / weight loss: higher reps, shorter rest, circuit style
  if (goal === 'lose_weight' || goal === 'fat_loss') {
    if (difficulty === 'beginner') return '3 sets × 15 reps (30s rest)';
    if (difficulty === 'advanced') return '4 sets × 20 reps (15s rest)';
    return '3 sets × 15–20 reps (20s rest)';
  }

  // General / fallback
  if (difficulty === 'beginner') return '2 sets × 10–12 reps';
  if (difficulty === 'advanced') return '4 sets × 8–12 reps';
  return '3 sets × 10–12 reps';
}


function getExerciseTier(ex, groupName) {
  const nameL = ex.name.toLowerCase();
  const typeL = (ex.type || '').toLowerCase();
  const groupL = (groupName || '').toLowerCase();

  // Warm-up phase
  if (groupL === 'warm-up') {
    return 0;
  }

  // Cool-down / Stretching
  if (groupL === 'stretching & mobility' || typeL === 'stretching') {
    return 4;
  }

  // Core & Cardio / Finishers
  if (groupL === 'cardio' || groupL === 'core' || nameL.includes('plank') || nameL.includes('crunch') || nameL.includes('twist') || nameL.includes('hold') || nameL.includes('burpee') || nameL.includes('jack') || nameL.includes('climber') || nameL.includes('knee')) {
    return 3;
  }

  // Heavy Compounds
  if (
    typeL === 'barbell' || 
    nameL.includes('squat') || 
    nameL.includes('deadlift') || 
    nameL.includes('press') || 
    nameL.includes('row') || 
    nameL.includes('pull-up') || 
    nameL.includes('chin-up')
  ) {
    return 1;
  }

  // Accessories / Isolation
  return 2;
}

let lastSwappedIndex = null;

function swapExerciseAtIndex(idx) {
  if (!state.generatedRoutine || !state.lastGenParams) return;
  const exercises = state.generatedRoutine.exercises;
  if (idx < 0 || idx >= exercises.length) return;

  const currentEx = exercises[idx];
  const group = currentEx.sourceGroup;
  if (!group) return;

  const eqSet = new Set(state.lastGenParams.equipment || ['bodyweight']);
  let pool;
  if (group === 'Warm-up') {
    const warmupNames = ["World's Greatest Stretch", "Cat-Cow Stretch", "Jumping Jacks", "High Knees"];
    const allExercises = [
      ...(EXERCISES_BY_GROUP["Cardio"] || []),
      ...(EXERCISES_BY_GROUP["Stretching & Mobility"] || [])
    ];
    pool = allExercises.filter(ex => warmupNames.includes(ex.name) && matchEquipment(ex.type, ex.name, eqSet));
  } else {
    pool = (EXERCISES_BY_GROUP[group] || []).filter(ex => {
      return matchEquipment(ex.type, ex.name, eqSet);
    });
  }

  // Exclude current exercise names in the routine to prevent duplicates
  const currentNames = exercises.map(ex => ex.name);
  let candidates = pool.filter(ex => !currentNames.includes(ex.name));

  // If no candidates found, relax exclusion to allow any exercise in the pool except the one at this index
  if (candidates.length === 0) {
    candidates = pool.filter(ex => ex.name !== currentEx.name);
  }

  if (candidates.length === 0) {
    alert(`No other exercises in the "${group}" library match your equipment settings.`);
    return;
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const repsDetails = generateRepsForExercise(pick, state.lastGenParams?.difficulty || 'intermediate', state.primaryGoal?.type || 'general');

  let swapReason = '';
  if (group === 'Warm-up') {
    swapReason = ["Jumping Jacks", "High Knees"].includes(pick.name)
      ? "Warm-up: Swapped dynamic cardio to raise heart rate"
      : "Warm-up: Swapped joint mobility preparation";
  } else if (group === 'Stretching & Mobility') {
    swapReason = "Cool-down: Swapped stretch for muscle recovery";
  } else {
    swapReason = `Swapped target movement for ${group}`;
  }

  // Replace exercise in place
  exercises[idx] = {
    id: uid(),
    name: pick.name,
    reps: repsDetails,
    sourceGroup: group,
    info: pick.info,
    type: pick.type,
    reason: swapReason
  };

  lastSwappedIndex = idx;
  renderGeneratorPreview();
}

function renderGeneratorPreview() {
  if (!state.generatedRoutine) return;

  const routineInput = $('customRoutineName');
  if (routineInput) {
    // Only set if input value is empty or hasn't been custom-edited by user
    if (!routineInput.value || routineInput.value.startsWith('Custom ') || routineInput.value.trim() === '') {
      routineInput.value = state.generatedRoutine.name;
    }
  }

  $('previewWorkoutDesc').textContent = state.generatedRoutine.desc;

  const previewList = $('previewExercisesList');
  previewList.innerHTML = '';

  state.generatedRoutine.exercises.forEach((ex, idx) => {
    const item = document.createElement('div');
    item.className = 'routineItem' + (idx === lastSwappedIndex ? ' animate-swap' : '');
    item.style.padding = '10px 14px';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.gap = '12px';

    let phaseBadge = '';
    if (ex.sourceGroup === 'Warm-up') {
      phaseBadge = `<span style="background: rgba(59, 130, 246, 0.12); color: #3b82f6; font-size: 11px; font-weight: 800; padding: 3px 6px; border-radius: 4px; margin-right: 8px; text-transform: uppercase; display: inline-block; vertical-align: middle; line-height: 1;">Warm-up</span>`;
    } else if (ex.sourceGroup === 'Stretching & Mobility') {
      phaseBadge = `<span style="background: rgba(168, 85, 247, 0.12); color: #a855f7; font-size: 11px; font-weight: 800; padding: 3px 6px; border-radius: 4px; margin-right: 8px; text-transform: uppercase; display: inline-block; vertical-align: middle; line-height: 1;">Cool-down</span>`;
    }

    item.innerHTML = `
      <div style="flex: 1;">
        <div style="font-weight: 800; font-size:14.5px;">${phaseBadge}${escapeHtml(ex.name)} <span style="color: var(--accent); font-weight: 700; font-size: 13.5px;">(${escapeHtml(ex.reps)})</span></div>
        <div class="small">${escapeHtml(ex.info || 'Control movement and focus on form.')}</div>
        <div style="font-size: 11px; color: var(--accent); opacity: 0.85; margin-top: 3.5px; font-weight: 500;">💡 ${escapeHtml(ex.reason || 'Included for balanced training')}</div>
      </div>
      <button class="btn secondary btn-swap-exercise" data-swap-idx="${idx}" type="button" style="padding: 6px 10px; font-size: 12px; white-space: nowrap;">🔁 Swap</button>
    `;
    previewList.appendChild(item);
  });

  // Reset lastSwappedIndex so future actions don't trigger animation
  lastSwappedIndex = null;

  // Bind click listeners for swap buttons
  previewList.querySelectorAll('.btn-swap-exercise').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-swap-idx'), 10);
      swapExerciseAtIndex(idx);
    });
  });
}

function finalizeGeneratedRoutine() {
  if (!state.generatedRoutine) return null;

  const customName = $('customRoutineName')?.value.trim() || state.generatedRoutine.name;

  // Map elements to the combined style structure { id, name: "Name (Reps)", info }
  const canonicalExercises = state.generatedRoutine.exercises.map(ex => {
    const combinedName = ex.reps ? `${ex.name} (${ex.reps})` : ex.name;
    return {
      id: ex.id || uid(),
      name: combinedName,
      info: ex.info || 'Control movement and focus on form.'
    };
  });

  return {
    id: state.generatedRoutine.id,
    name: customName,
    desc: state.generatedRoutine.desc,
    exercises: canonicalExercises
  };
}

function generateCustomWorkout(duration, selectedFoci, equipment, difficulty) {
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
    
    // Determine movement structure and select exercises
    let matchPool = [];
    
    selectedFoci.forEach(focusKey => {
      const list = EXERCISES_BY_GROUP[focusKey] || [];
      list.forEach(ex => {
        if (matchEquipment(ex.type, ex.name, eqSet)) {
          matchPool.push({
            ...ex,
            sourceGroup: focusKey
          });
        }
      });
    });

    // Determine count based on duration (15m: 3, 30m: 4, 45m: 5, 60m: 6)
    const exerciseCount = duration <= 15 ? 3 : duration <= 30 ? 4 : duration <= 45 ? 5 : 6;

    let selected = [];
    if (matchPool.length > 0) {
      // Group matched exercises by their muscle group
      const groupsMap = {};
      selectedFoci.forEach(f => { groupsMap[f] = []; });
      matchPool.forEach(ex => {
        if (groupsMap[ex.sourceGroup]) {
          groupsMap[ex.sourceGroup].push(ex);
        }
      });
      
      const activeGroups = selectedFoci.filter(f => groupsMap[f] && groupsMap[f].length > 0);
      
      if (activeGroups.length > 0) {
        let groupIndex = 0;
        const maxAttempts = exerciseCount * 4;
        let attempts = 0;
        
        while (selected.length < exerciseCount && attempts < maxAttempts) {
          attempts++;
          const currentGroup = activeGroups[groupIndex % activeGroups.length];
          const poolForGroup = groupsMap[currentGroup];
          
          if (poolForGroup && poolForGroup.length > 0) {
            const idx = Math.floor(Math.random() * poolForGroup.length);
            const pick = poolForGroup.splice(idx, 1)[0];
            
            if (!selected.some(s => s.name === pick.name)) {
              pick.reason = `Primary target movement for ${pick.sourceGroup}`;
              selected.push(pick);
            }
          }
          groupIndex++;
        }
      }
    }

    // Fallback: If we still don't have enough exercises, pull randomly from matches
    if (selected.length < exerciseCount && matchPool.length > 0) {
      const remainingMatches = matchPool.filter(m => !selected.some(s => s.name === m.name));
      while (selected.length < exerciseCount && remainingMatches.length > 0) {
        const idx = Math.floor(Math.random() * remainingMatches.length);
        const pick = remainingMatches.splice(idx, 1)[0];
        pick.reason = `Target movement for ${pick.sourceGroup}`;
        selected.push(pick);
      }
    }

    // Inject Pull-up Bar if checked and focus includes Back/Shoulders
    if (eqSet.has('pullupbar') && (selectedFoci.includes('Back') || selectedFoci.includes('Shoulders')) && selected.length > 0) {
      const pullupEx = { 
        name: "Pull-ups (or Chin-ups)", 
        type: "Bodyweight", 
        info: "Hang from bar, pull chest to bar, control down.",
        sourceGroup: selectedFoci.includes('Back') ? 'Back' : 'Shoulders',
        reason: "Injected vertical pull since Pull-up Bar is available"
      };
      if (!selected.some(s => s.name.includes("Pull-ups") || s.name.includes("Chin-ups"))) {
        if (selected.length >= exerciseCount) {
          selected[selected.length - 1] = pullupEx;
        } else {
          selected.push(pullupEx);
        }
      }
    }
    
    // Inject Cardio Machine if checked and focus includes Cardio
    if (eqSet.has('treadmill') && selectedFoci.includes('Cardio') && selected.length > 0) {
      const machineEx = { 
        name: "Treadmill or Bike Interval", 
        type: "Treadmill", 
        info: "Alternate 1m moderate, 1m fast pace.",
        sourceGroup: 'Cardio',
        reason: "Cardio machine interval conditioning"
      };
      if (!selected.some(s => s.name.includes("Treadmill") || s.name.includes("Bike"))) {
        selected[0] = machineEx;
      }
    }

    // Inject two warm-up exercises if the focus is not purely Stretching
    if (selected.length > 0 && !(selectedFoci.length === 1 && selectedFoci[0] === 'Stretching & Mobility')) {
      const warmupNames = ["World's Greatest Stretch", "Cat-Cow Stretch", "Jumping Jacks", "High Knees"];
      const allExercises = [
        ...(EXERCISES_BY_GROUP["Cardio"] || []),
        ...(EXERCISES_BY_GROUP["Stretching & Mobility"] || [])
      ];
      const warmupPool = allExercises.filter(ex => warmupNames.includes(ex.name) && matchEquipment(ex.type, ex.name, eqSet));
      
      if (warmupPool.length > 0) {
        // 1. Dynamic Heart-rate Warm-up (Jumping Jacks or High Knees)
        const currentNames1 = selected.map(ex => ex.name);
        const cardioCandidates = warmupPool.filter(ex => ["Jumping Jacks", "High Knees"].includes(ex.name) && !currentNames1.includes(ex.name));
        const finalCardioPool = cardioCandidates.length > 0 ? cardioCandidates : warmupPool.filter(ex => ["Jumping Jacks", "High Knees"].includes(ex.name));
        
        if (finalCardioPool.length > 0) {
          const pickCardio = finalCardioPool[Math.floor(Math.random() * finalCardioPool.length)];
          selected.push({
            ...pickCardio,
            sourceGroup: 'Warm-up',
            reason: "Warm-up: Raise heart rate and warm up muscles"
          });
        }

        // 2. Mobility Warm-up Stretch (World's Greatest Stretch or Cat-Cow Stretch)
        const currentNames2 = selected.map(ex => ex.name);
        const mobilityCandidates = warmupPool.filter(ex => ["World's Greatest Stretch", "Cat-Cow Stretch"].includes(ex.name) && !currentNames2.includes(ex.name));
        const finalMobilityPool = mobilityCandidates.length > 0 ? mobilityCandidates : warmupPool.filter(ex => ["World's Greatest Stretch", "Cat-Cow Stretch"].includes(ex.name));
        
        if (finalMobilityPool.length > 0) {
          let bestMobility = [];
          const fociLower = selectedFoci.map(f => f.toLowerCase());
          
          finalMobilityPool.forEach(ex => {
            const targetL = (ex.target || '').toLowerCase();
            const infoL = (ex.info || '').toLowerCase();
            let score = 0;
            fociLower.forEach(focus => {
              if (focus === 'back' || focus === 'core') {
                if (ex.name === "Cat-Cow Stretch") score += 2;
              }
              if (focus === 'legs' || focus === 'shoulders' || focus === 'chest') {
                if (ex.name === "World's Greatest Stretch") score += 2;
              }
            });
            bestMobility.push({ ex, score });
          });
          
          bestMobility.sort((a, b) => b.score - a.score);
          const finalMobility = bestMobility[0].ex;
          selected.push({
            ...finalMobility,
            sourceGroup: 'Warm-up',
            reason: "Warm-up: Joint mobility for workout preparation"
          });
        }
      }
    }

    // Inject cool-down stretches matched to active muscle focus areas (max 2 stretches)
    if (selected.length > 0 && !selectedFoci.includes('Stretching & Mobility')) {
      const stretchPool = EXERCISES_BY_GROUP["Stretching & Mobility"] || [];
      const matchStretches = stretchPool.filter(ex => matchEquipment(ex.type, ex.name, eqSet));
      
      if (matchStretches.length > 0) {
        // Find targeted muscle foci (excluding Cardio and Stretching)
        const activeFoci = selectedFoci.filter(f => f !== 'Cardio' && f !== 'Stretching & Mobility');
        // Limit to top 2 muscle groups to keep workout length reasonable
        const fociToStretch = activeFoci.slice(0, 2);
        
        if (fociToStretch.length === 0) {
          // Fallback if they only selected Cardio: just add one random stretch
          const currentNames = selected.map(ex => ex.name);
          const candidates = matchStretches.filter(ex => !currentNames.includes(ex.name));
          const finalPool = candidates.length > 0 ? candidates : matchStretches;
          const pick = finalPool[Math.floor(Math.random() * finalPool.length)];
          selected.push({
            ...pick,
            sourceGroup: 'Stretching & Mobility',
            reason: "Cool-down: General stretching and recovery"
          });
        } else {
          fociToStretch.forEach(focus => {
            // Find best stretch for this specific focus group
            let bestMatches = [];
            const focusLower = focus.toLowerCase();
            
            // Exclude exercises already in the routine to prevent duplicates
            const currentNames = selected.map(ex => ex.name);
            const candidates = matchStretches.filter(ex => !currentNames.includes(ex.name));
            const poolForFocus = candidates.length > 0 ? candidates : matchStretches;
            
            poolForFocus.forEach(ex => {
              const targetL = (ex.target || '').toLowerCase();
              const infoL = (ex.info || '').toLowerCase();
              let score = 0;
              
              if (focusLower === 'back') {
                if (targetL.includes('back') || targetL.includes('spine') || infoL.includes('back') || infoL.includes('spine')) score += 2;
              }
              if (focusLower === 'chest') {
                if (targetL.includes('chest') || infoL.includes('chest') || targetL.includes('abs') || infoL.includes('abdominal')) score += 2;
              }
              if (focusLower === 'shoulders') {
                if (targetL.includes('shoulders') || infoL.includes('shoulders')) score += 2;
              }
              if (focusLower === 'legs') {
                if (targetL.includes('hips') || targetL.includes('hamstring') || targetL.includes('calves') || infoL.includes('hips') || infoL.includes('hamstring')) score += 2;
              }
              if (focusLower === 'core') {
                if (targetL.includes('abs') || targetL.includes('spine') || infoL.includes('abdominal') || infoL.includes('spine')) score += 2;
              }
              if (focusLower === 'biceps' || focusLower === 'triceps') {
                if (targetL.includes('shoulders') || targetL.includes('upper body') || targetL.includes('spine')) score += 1;
              }
              
              if (score > 0) {
                bestMatches.push({ ex, score });
              }
            });
            
            let finalStretch;
            if (bestMatches.length > 0) {
              bestMatches.sort((a, b) => b.score - a.score);
              finalStretch = bestMatches[0].ex;
            } else {
              finalStretch = poolForFocus[Math.floor(Math.random() * poolForFocus.length)];
            }
            
            selected.push({
              ...finalStretch,
              sourceGroup: 'Stretching & Mobility',
              reason: `Cool-down: Target stretch for ${focus}`
            });
          });
        }
      }
    }

    // Sort selected exercises by tier sequence (Tier 1 -> Tier 4)
    selected.sort((a, b) => {
      const groupA = a.sourceGroup || '';
      const groupB = b.sourceGroup || '';
      return getExerciseTier(a, groupA) - getExerciseTier(b, groupB);
    });

    let difficultyBadge = "Intermediate";
    if (difficulty === 'beginner') difficultyBadge = "Beginner";
    else if (difficulty === 'advanced') difficultyBadge = "Advanced";

    const exercisesMapped = selected.map(ex => {
      const repsDetails = generateRepsForExercise(ex, difficulty, state.primaryGoal?.type || 'general');
      return {
        id: uid(),
        name: ex.name,
        reps: repsDetails,
        sourceGroup: ex.sourceGroup || '',
        info: ex.info,
        type: ex.type || '',
        reason: ex.reason || 'Workout sequence movement'
      };
    });

    const displayFocus = selectedFoci.join(' + ');
    const routineId = `gen:${selectedFoci.join('-')}:${duration}:${difficulty}:${uid()}`;
    
    state.generatedRoutine = {
      id: routineId,
      name: `Custom ${selectedFoci.length > 2 ? 'Mixed' : displayFocus} (${duration}m)`,
      desc: `Generated: ${difficultyBadge} · Focus: ${selectedFoci.join(', ')} · Equip: ${equipment.join(', ')}`,
      exercises: exercisesMapped
    };

    // Save generation state parameter values to state.lastGenParams
    state.lastGenParams = {
      duration,
      selectedFoci,
      equipment,
      difficulty
    };

    // Render Preview
    renderGeneratorPreview();

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
      
      <div class="row" style="margin-top: auto; gap: 8px; width: 100%;">
        <button class="btn primary-gradient start-idea-btn" style="flex: 1; justify-content: center;" data-id="${idea.id}" type="button">
          Start
        </button>
        <button class="btn secondary clone-idea-btn" style="padding: 8px 12px;" data-id="${idea.id}" title="Clone to Custom Routines" type="button">
          Clone
        </button>
      </div>
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

  container.querySelectorAll('.clone-idea-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ideaId = btn.getAttribute('data-id');
      const idea = library.find(i => i.id === ideaId);
      if (!idea) return;

      const exercises = idea.exercises.map(ex => ({
        id: uid(),
        name: `${ex.name} (${ex.reps})`
      }));

      const newRoutine = {
        id: uid(),
        name: idea.name,
        desc: `${idea.difficulty} · Category: ${displayCategory(idea.category)}`,
        exercises: exercises
      };

      state.routines.unshift(newRoutine);
      saveRoutines();
      renderRoutines();
      
      alert(`Cloned "${idea.name}" to your Custom Routines.`);
    });
  });
}

function renderExercisesDirectory() {
  const container = $('exercisesGrid');
  if (!container) return;
  container.innerHTML = '';

  const groupEmojis = {
    "Chest": "🏋️‍♂️",
    "Back": "🧗‍♂️",
    "Shoulders": "🛡️",
    "Biceps": "💪",
    "Triceps": "⚡",
    "Legs": "🦵",
    "Core": "🧩",
    "Cardio": "🫀",
    "Stretching & Mobility": "🧘"
  };

  Object.entries(EXERCISES_BY_GROUP).forEach(([groupName, list]) => {
    const card = document.createElement('div');
    card.className = 'exercise-group-card';
    const emoji = groupEmojis[groupName] || "💪";

    const itemsHtml = list.map((ex, idx) => {
      const exId = `${groupName.replace(/\s+/g, '-')}-${idx}`;
      const stepsList = ex.steps ? ex.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('') : '';
      
      return `
        <div class="exercise-dir-item" data-ex-id="${exId}">
          <div class="exercise-dir-top">
            <span class="exercise-dir-name">${escapeHtml(ex.name)}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="exercise-dir-meta">${escapeHtml(ex.type)}</span>
              <span class="exercise-dir-indicator" style="font-size: 8px; color: var(--muted); transition: transform 0.25s ease;">▼</span>
            </div>
          </div>
          <div class="exercise-dir-info">${escapeHtml(ex.info)}</div>
          
          <div class="exercise-dir-details" id="details-${exId}" style="max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin-top 0.25s ease;">
            <div class="exercise-detail-row">
              <span class="detail-label">🎯 Target:</span>
              <span class="detail-val">${escapeHtml(ex.target || 'General')}</span>
            </div>
            <div class="exercise-detail-row">
              <span class="detail-label">⚡ Difficulty:</span>
              <span class="detail-val">${escapeHtml(ex.difficulty || 'Beginner')}</span>
            </div>
            <div class="exercise-detail-heading">Execution Steps</div>
            <ol class="exercise-steps-list">
              ${stepsList}
            </ol>
            ${ex.proTip ? `
              <div class="exercise-pro-tip">
                <strong>Pro Tip:</strong> ${escapeHtml(ex.proTip)}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="exercise-group-header">
        <h3 class="exercise-group-title">
          <span>${emoji}</span> ${escapeHtml(groupName)}
        </h3>
        <span class="exercise-group-count">${list.length} exercises</span>
      </div>
      <div class="exercise-dir-list">
        ${itemsHtml}
      </div>
    `;

    container.appendChild(card);
  });

  // Wire expand/collapse click events
  container.querySelectorAll('.exercise-dir-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Prevent expand/collapse if clicking copyable text inside details panel
      if (e.target.closest('.exercise-dir-details')) return;

      const details = item.querySelector('.exercise-dir-details');
      const indicator = item.querySelector('.exercise-dir-indicator');
      const isExpanded = item.classList.toggle('expanded');
      
      if (isExpanded) {
        details.style.maxHeight = details.scrollHeight + 'px';
        details.style.opacity = '1';
        details.style.marginTop = '10px';
        if (indicator) indicator.style.transform = 'rotate(180deg)';
      } else {
        details.style.maxHeight = '0';
        details.style.opacity = '0';
        details.style.marginTop = '0';
        if (indicator) indicator.style.transform = 'rotate(0deg)';
      }
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
    const r = generateRoutineFromProfile(state.profile, state.primaryGoal, state.secondaryGoal, 0);
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

function generateRoutineFromProfile(profile, primaryGoal = null, secondaryGoal = null, dayIndex = 0) {
  const goal = primaryGoal?.type || profile?.goal || 'general';
  const dur = Number(primaryGoal?.durationMin || profile?.durationMin || 30);
  // Prefer equipment from the goal (set in Settings), fall back to profile (set in Quick Start)
  const eq = new Set(primaryGoal?.equipment || profile?.equipment || ['bodyweight']);

  const wantsRun = eq.has('treadmill') || eq.has('bike');
  const hasPullup = eq.has('pullupbar');
  const hasDB = eq.has('dumbbells');
  const hasBB = eq.has('barbell');

  let name = 'Quick Start';
  let desc = `Goal: ${goal}, Duration: ${dur}m, Equipment: ${Array.from(eq).join(', ')}`;
  let exercises = [];

  const splitType = primaryGoal?.splitType || profile?.splitType || 'alternating';
  
  let variant = 0;
  if (splitType === 'full_body') {
    variant = 2; // Always Full Body
  } else if (splitType === 'upper_lower') {
    variant = dayIndex % 2;
  } else if (splitType === 'ppl') {
    variant = dayIndex % 3;
  } else {
    variant = dayIndex % 3;
  }

  if (goal === 'run_5k' || goal === '5k') {
    if (variant === 0) {
      name = 'Goal Session: 5K - Intervals';
      exercises = [
        { id: uid(), name: 'Warm-up jog (5 min)', info: 'Easy conversational pace. Loosen hips and ankles before picking up speed.' },
        { id: uid(), name: wantsRun ? 'Intervals: run 1 min hard / walk 1 min (12–20 min)' : 'Intervals: run/walk alternating (12–20 min)', info: 'Hard = 7–8/10 effort. Recovery walk = fully catch breath. Aim for consistent splits each interval.' },
        { id: uid(), name: 'Easy pace cool-down (5–10 min)', info: 'Drop to 50% effort. Focus on breathing slowing down before you stop.' },
        { id: uid(), name: 'Standing leg & calf stretch (5 min)', info: 'Hold each stretch 30–45 seconds. Priority: calves, hip flexors, hamstrings.' },
      ];
    } else if (variant === 1) {
      name = 'Goal Session: 5K - Tempo Run';
      exercises = [
        { id: uid(), name: 'Warm-up jog (5 min)', info: 'Start slow. Build pace gradually over the first 2 minutes.' },
        { id: uid(), name: wantsRun ? 'Tempo run: sustained moderate-hard pace (15–20 min)' : 'Brisk walk/jog tempo intervals (15–20 min)', info: 'Target 6–7/10 effort — comfortably uncomfortable. You should be able to say a few words, not hold a conversation.' },
        { id: uid(), name: 'Cool-down walk + stretch (5 min)', info: 'Slow to a walk immediately. Stretch hip flexors and quads while warm.' },
      ];
    } else {
      name = 'Goal Session: 5K - Recovery & Hills';
      exercises = [
        { id: uid(), name: 'Warm-up walk/jog (5 min)', info: 'Very easy. Today is about active recovery and building leg strength, not speed.' },
        { id: uid(), name: wantsRun ? 'Hill repeats or light recovery jog (10–15 min)' : 'Brisk walk with incline/hills (10–15 min)', info: 'Hill repeats: run up at hard effort, walk back down. Light jog: stay at 5/10 effort throughout.' },
        { id: uid(), name: 'Cool-down + full lower body stretch (5 min)', info: 'Focus on calves, IT band, and glutes — common tight spots after hills.' },
      ];
    }
  } else if (goal === 'bar_hang' || goal === 'barhang') {
    const baseline = Number(primaryGoal?.bestHangSec || primaryGoal?.maxHangSec || 30);
    const work = Math.max(10, Math.round(baseline * 0.6));
    const sets = baseline >= 60 ? 6 : 5;

    if (variant === 0) {
      name = 'Goal Session: Grip & Upper Hang';
      exercises = hasPullup ? [
        { id: uid(), name: `Dead hang — ${sets} × ${work}s (rest 60–90s)`, info: 'Full grip, relaxed shoulders. Count the seconds out loud. Stop before your grip fails completely.' },
        { id: uid(), name: 'Scapular pull-ups — 3 × 8', info: 'Arms straight, depress shoulder blades down and back. No elbow bend. This builds the base for longer hangs.' },
        { id: uid(), name: 'Farmer carry / grip — 3 × 45s', info: 'Walk slowly with heavy load. Grip as hard as you can without bending the wrists.' },
        { id: uid(), name: 'Hollow hold — 3 × 25s', info: 'Lower back pressed into the floor, ribs down, legs low. This trains the body tension needed for a strong hang.' },
      ] : [
        { id: uid(), name: `Towel grip holds — ${sets} × ${work}s`, info: 'Wrap a towel around a door handle or bar. Squeeze as hard as possible while hanging or holding.' },
        { id: uid(), name: 'Forearm extensor work — 3 × 20', info: 'Use a light weight or band. Extend wrist upward against resistance to balance the grip muscles.' },
        { id: uid(), name: 'Plank — 3 × 30s', info: 'Build the core stability that supports your hang. Keep hips level, don\'t let them sag.' },
      ];
    } else if (variant === 1) {
      name = 'Goal Session: Core & Pull Hang';
      exercises = hasPullup ? [
        { id: uid(), name: `Active hang — ${sets - 1} × ${work + 5}s`, info: 'Pull shoulder blades down and engage lats slightly — don\'t fully hang passive. This is the position you\'ll need for longer holds.' },
        { id: uid(), name: 'L-sit hang or knee raises — 3 × 10', info: 'Lift knees toward chest while hanging. This builds the core-grip connection critical for a 2-minute hang.' },
        { id: uid(), name: 'Chin-up holds — 3 × 15s', info: 'Hold at top (chin over bar). Focuses the shoulder girdle in a shortened position.' },
        { id: uid(), name: 'Plank — 3 × 45s', info: 'Squeeze everything. Tight core = more efficient hang.' },
      ] : [
        { id: uid(), name: `Towel grip holds — ${sets} × ${work}s`, info: 'Wrap towel over a bar or door. Hold as hard as possible for the full duration.' },
        { id: uid(), name: 'Pinch grip holds — 3 × 30s', info: 'Pinch a plate or book with thumb and fingers. Trains the thumb side of grip often missed in regular hanging.' },
        { id: uid(), name: 'Hollow hold — 3 × 30s', info: 'Core tension practice. Lower back down, abs tight, legs straight at 45°.' },
      ];
    } else {
      name = 'Goal Session: Shoulder Stability Hang';
      exercises = hasPullup ? [
        { id: uid(), name: `Dead hang — ${sets} × ${work}s`, info: 'Aim for relaxed but controlled. Let the shoulder joint decompress. Don\'t shrug up — think "long neck".' },
        { id: uid(), name: 'Passive to active hang transitions — 3 × 8', info: 'Switch between fully passive (no muscle) and fully active (scaps down, lats engaged) every 3 seconds. Teaches control.' },
        { id: uid(), name: 'Farmer carry / grip — 3 × 45s', info: 'Maintain upright posture while carrying heavy. Forearms and grip endurance builder.' },
        { id: uid(), name: 'Shoulder taps — 3 × 20', info: 'In plank position, tap each shoulder alternately without rotating. Stabilizes the shoulder girdle.' },
      ] : [
        { id: uid(), name: `Towel grip holds — ${sets} × ${work}s`, info: 'Go as long as possible each set. Rest 90 seconds between.' },
        { id: uid(), name: 'Wrist curls — 3 × 15', info: 'Forearm on knee, curl wrist up with a light weight. Addresses flexor strength directly.' },
        { id: uid(), name: 'Plank shoulder taps — 3 × 20', info: 'Slow and controlled. No hip rotation. Builds the link between shoulder stability and core.' },
      ];
    }
  } else if (goal === 'pushups') {
    const baseline = Number(primaryGoal?.bestPushups || primaryGoal?.maxPushups || 10);
    const rep = Math.max(3, Math.floor(baseline * 0.6));
    if (variant === 0) {
      name = 'Goal Session: Pushup Volume';
      exercises = [
        { id: uid(), name: `Pushups — 6 × ${rep} reps (60s rest)`, info: 'Full chest-to-floor range. Lock out at the top. If form breaks, stop the set — quality over quantity.' },
        { id: uid(), name: 'Incline pushups — 3 × 12', info: 'Hands elevated on bench or step. Easier angle — use this to push extra volume when regular pushups are too fatiguing.' },
        { id: uid(), name: 'Plank — 3 × 30s', info: 'After pushups, a plank locks in the core stability that makes your pushup base stronger.' },
      ];
    } else if (variant === 1) {
      name = 'Goal Session: Pushup Strength';
      exercises = [
        { id: uid(), name: `Close-grip pushups — 4 × ${Math.max(2, Math.floor(rep * 0.7))} reps (60s rest)`, info: 'Hands under shoulders, elbows track close to ribs. Harder, builds tricep and chest strength directly.' },
        { id: uid(), name: 'Decline pushups — 3 × 10', info: 'Feet elevated — shifts load to upper chest and shoulders. Do these slow: 2 seconds down, 1 second up.' },
        { id: uid(), name: 'Hollow hold — 3 × 30s', info: 'Core bracing practice. A tight core is what lets you push more reps without your hips sagging.' },
      ];
    } else {
      name = 'Goal Session: Pushup Endurance';
      exercises = [
        { id: uid(), name: `Wide-grip pushups — 4 × ${rep} reps (45s rest)`, info: 'Wider stance hits the chest more. Shorter rest builds endurance — the key to hitting 30 pushups non-stop.' },
        { id: uid(), name: 'Scapular pushups — 3 × 15', info: 'Arms straight, protract and retract shoulder blades only. Trains the serratus — critical for full pushup strength.' },
        { id: uid(), name: 'Plank shoulder taps — 3 × 20', info: 'Slow tap, no hip sway. Builds rotational stability needed for high rep pushup sets.' },
      ];
    }
  } else {
    const isDynamicGoal = ['lose_weight', 'fat_loss', 'build_muscle', 'hypertrophy', 'general', 'strength'].includes(goal) || (!['run_5k', '5k', 'bar_hang', 'barhang', 'pushups'].includes(goal));
    if (isDynamicGoal) {
      let selectedFoci = [];
      if (splitType === 'ppl') {
        if (variant === 0) {
          name = 'Goal Session: Push Focus';
          selectedFoci = ["Chest", "Shoulders", "Triceps"];
        } else if (variant === 1) {
          name = 'Goal Session: Pull Focus';
          selectedFoci = ["Back", "Biceps"];
        } else {
          name = 'Goal Session: Legs & Core Focus';
          selectedFoci = ["Legs", "Core"];
        }
      } else if (splitType === 'upper_lower') {
        if (variant === 0) {
          name = 'Goal Session: Upper Focus';
          selectedFoci = ["Chest", "Back", "Shoulders", "Biceps", "Triceps"];
        } else {
          name = 'Goal Session: Lower Focus';
          selectedFoci = ["Legs", "Core"];
        }
      } else if (splitType === 'full_body') {
        name = 'Goal Session: Full Body';
        selectedFoci = ["Chest", "Back", "Legs", "Shoulders", "Core"];
      } else { // alternating
        if (variant === 0) {
          name = 'Goal Session: Upper Focus';
          selectedFoci = ["Chest", "Back", "Shoulders", "Biceps", "Triceps"];
        } else if (variant === 1) {
          name = 'Goal Session: Lower Focus';
          selectedFoci = ["Legs", "Core"];
        } else {
          name = 'Goal Session: Full Body';
          selectedFoci = ["Chest", "Back", "Legs", "Shoulders", "Core"];
        }
      }

      if (goal === 'lose_weight' || goal === 'fat_loss') {
        name = name.replace('Goal Session:', 'Goal Session: Fat Loss (');
        name += ')';
      } else if (goal === 'build_muscle' || goal === 'hypertrophy') {
        name = name.replace('Goal Session:', 'Goal Session: Build Muscle (');
        name += ')';
      } else if (goal === 'strength') {
        name = name.replace('Goal Session:', 'Strength Split: ');
      } else {
        name = name.replace('Goal Session:', 'General Split: ');
      }

      const recentNames = getRecentExercises();
      const matchPool = [];
      
      selectedFoci.forEach(focusKey => {
        const list = EXERCISES_BY_GROUP[focusKey] || [];
        list.forEach(ex => {
          if (ex && matchEquipment(ex.type, ex.name, eq)) {
            matchPool.push({
              ...ex,
              sourceGroup: focusKey
            });
          }
        });
      });

      const maxEx = dur <= 20 ? 3 : dur <= 30 ? 4 : dur <= 45 ? 5 : 6;
      
      const groupsMap = {};
      selectedFoci.forEach(f => { groupsMap[f] = []; });
      matchPool.forEach(ex => {
        if (groupsMap[ex.sourceGroup]) {
          groupsMap[ex.sourceGroup].push(ex);
        }
      });
      
      const activeGroups = selectedFoci.filter(f => groupsMap[f] && groupsMap[f].length > 0);
      const selected = [];
      
      if (activeGroups.length > 0) {
        let groupIndex = 0;
        const maxAttempts = maxEx * 4;
        let attempts = 0;
        
        while (selected.length < maxEx && attempts < maxAttempts) {
          attempts++;
          const currentGroup = activeGroups[groupIndex % activeGroups.length];
          const poolForGroup = groupsMap[currentGroup];
          
          if (poolForGroup && poolForGroup.length > 0) {
            const pick = pickExerciseFromPool(poolForGroup, recentNames);
            if (pick && !selected.some(s => s.name === pick.name)) {
              pick.reason = `Primary target movement for ${pick.sourceGroup}`;
              selected.push(pick);
            }
          }
          groupIndex++;
        }
      }
      
      if (selected.length < maxEx && matchPool.length > 0) {
        const remainingMatches = matchPool.filter(m => !selected.some(s => s.name === m.name));
        while (selected.length < maxEx && remainingMatches.length > 0) {
          const pick = pickExerciseFromPool(remainingMatches, recentNames);
          if (pick) {
            pick.reason = `Target movement for ${pick.sourceGroup}`;
            selected.push(pick);
          } else {
            break;
          }
        }
      }
      
      if (eq.has('pullupbar') && (selectedFoci.includes('Back') || selectedFoci.includes('Shoulders')) && selected.length > 0) {
        const pullupEx = { 
          name: "Pull-ups (or Chin-ups)", 
          type: "Bodyweight", 
          info: "Hang from bar, pull chest to bar, control down.",
          sourceGroup: selectedFoci.includes('Back') ? 'Back' : 'Shoulders',
          reason: "Injected vertical pull since Pull-up Bar is available"
        };
        if (!selected.some(s => s.name.includes("Pull-ups") || s.name.includes("Chin-ups"))) {
          if (selected.length >= maxEx) {
            selected[selected.length - 1] = pullupEx;
          } else {
            selected.push(pullupEx);
          }
        }
      }
      
      if (eq.has('treadmill') && selectedFoci.includes('Cardio') && selected.length > 0) {
        const machineEx = { 
          name: "Treadmill or Bike Interval", 
          type: "Treadmill", 
          info: "Alternate 1m moderate, 1m fast pace.",
          sourceGroup: 'Cardio',
          reason: "Cardio machine interval conditioning"
        };
        if (!selected.some(s => s.name.includes("Treadmill") || s.name.includes("Bike"))) {
          selected[0] = machineEx;
        }
      }

      if (selected.length > 0 && !selectedFoci.includes('Stretching & Mobility')) {
        const warmupNames = ["World's Greatest Stretch", "Cat-Cow Stretch", "Jumping Jacks", "High Knees"];
        const allExercises = [
          ...(EXERCISES_BY_GROUP["Cardio"] || []),
          ...(EXERCISES_BY_GROUP["Stretching & Mobility"] || [])
        ];
        const warmupPool = allExercises.filter(ex => warmupNames.includes(ex.name) && matchEquipment(ex.type, ex.name, eq));
        
        if (warmupPool.length > 0) {
          const currentNames1 = selected.map(ex => ex.name);
          const cardioCandidates = warmupPool.filter(ex => ["Jumping Jacks", "High Knees"].includes(ex.name) && !currentNames1.includes(ex.name));
          const finalCardioPool = cardioCandidates.length > 0 ? cardioCandidates : warmupPool.filter(ex => ["Jumping Jacks", "High Knees"].includes(ex.name));
          
          if (finalCardioPool.length > 0) {
            const pickCardio = finalCardioPool[Math.floor(Math.random() * finalCardioPool.length)];
            selected.push({
              ...pickCardio,
              sourceGroup: 'Warm-up',
              reason: "Warm-up: Raise heart rate and warm up muscles"
            });
          }

          const currentNames2 = selected.map(ex => ex.name);
          const mobilityCandidates = warmupPool.filter(ex => ["World's Greatest Stretch", "Cat-Cow Stretch"].includes(ex.name) && !currentNames2.includes(ex.name));
          const finalMobilityPool = mobilityCandidates.length > 0 ? mobilityCandidates : warmupPool.filter(ex => ["World's Greatest Stretch", "Cat-Cow Stretch"].includes(ex.name));
          
          if (finalMobilityPool.length > 0) {
            let bestMobility = [];
            const fociLower = selectedFoci.map(f => f.toLowerCase());
            finalMobilityPool.forEach(ex => {
              let score = 0;
              fociLower.forEach(focus => {
                if (focus === 'back' || focus === 'core') {
                  if (ex.name === "Cat-Cow Stretch") score += 2;
                }
                if (focus === 'legs' || focus === 'shoulders' || focus === 'chest') {
                  if (ex.name === "World's Greatest Stretch") score += 2;
                }
              });
              bestMobility.push({ ex, score });
            });
            bestMobility.sort((a, b) => b.score - a.score);
            const finalMobility = bestMobility[0].ex;
            selected.push({
              ...finalMobility,
              sourceGroup: 'Warm-up',
              reason: "Warm-up: Joint mobility for workout preparation"
            });
          }
        }
      }

      if (selected.length > 0 && !selectedFoci.includes('Stretching & Mobility')) {
        const stretchPool = EXERCISES_BY_GROUP["Stretching & Mobility"] || [];
        const matchStretches = stretchPool.filter(ex => matchEquipment(ex.type, ex.name, eq));
        
        if (matchStretches.length > 0) {
          const activeFoci = selectedFoci.filter(f => f !== 'Cardio' && f !== 'Stretching & Mobility');
          const fociToStretch = activeFoci.slice(0, 2);
          
          if (fociToStretch.length === 0) {
            const currentNames = selected.map(ex => ex.name);
            const candidates = matchStretches.filter(ex => !currentNames.includes(ex.name));
            const finalPool = candidates.length > 0 ? candidates : matchStretches;
            const pick = finalPool[Math.floor(Math.random() * finalPool.length)];
            selected.push({
              ...pick,
              sourceGroup: 'Stretching & Mobility',
              reason: "Cool-down: General stretching and recovery"
            });
          } else {
            fociToStretch.forEach(focus => {
              let bestMatches = [];
              const focusLower = focus.toLowerCase();
              const currentNames = selected.map(ex => ex.name);
              const candidates = matchStretches.filter(ex => !currentNames.includes(ex.name));
              const poolForFocus = candidates.length > 0 ? candidates : matchStretches;
              
              poolForFocus.forEach(ex => {
                const targetL = (ex.target || '').toLowerCase();
                const infoL = (ex.info || '').toLowerCase();
                let score = 0;
                if (focusLower === 'back') {
                  if (targetL.includes('back') || targetL.includes('spine') || infoL.includes('back') || infoL.includes('spine')) score += 2;
                }
                if (focusLower === 'chest') {
                  if (targetL.includes('chest') || infoL.includes('chest') || targetL.includes('abs') || infoL.includes('abdominal')) score += 2;
                }
                if (focusLower === 'shoulders') {
                  if (targetL.includes('shoulders') || infoL.includes('shoulders')) score += 2;
                }
                if (focusLower === 'legs') {
                  if (targetL.includes('hips') || targetL.includes('hamstring') || targetL.includes('calves') || infoL.includes('hips') || infoL.includes('hamstring')) score += 2;
                }
                if (focusLower === 'core') {
                  if (targetL.includes('abs') || targetL.includes('spine') || infoL.includes('abdominal') || infoL.includes('spine')) score += 2;
                }
                if (focusLower === 'biceps' || focusLower === 'triceps') {
                  if (targetL.includes('shoulders') || targetL.includes('upper body') || targetL.includes('spine')) score += 1;
                }
                if (score > 0) {
                  bestMatches.push({ ex, score });
                }
              });
              
              let finalStretch;
              if (bestMatches.length > 0) {
                bestMatches.sort((a, b) => b.score - a.score);
                finalStretch = bestMatches[0].ex;
              } else {
                finalStretch = poolForFocus[Math.floor(Math.random() * poolForFocus.length)];
              }
              selected.push({
                ...finalStretch,
                sourceGroup: 'Stretching & Mobility',
                reason: `Cool-down: Target stretch for ${focus}`
              });
            });
          }
        }
      }

      selected.sort((a, b) => getExerciseTier(a, a.sourceGroup) - getExerciseTier(b, b.sourceGroup));

      const difficulty = primaryGoal?.difficulty || profile?.difficulty || 'intermediate';
      exercises = selected.map(ex => {
        // Pass the goal type so rep/set schemes are goal-appropriate
        const repsDetails = generateRepsForExercise(ex, difficulty, goal);
        return {
          id: uid(),
          name: `${ex.name} (${repsDetails})`,
          info: ex.info || 'Control movement, breathe through the rep, and focus on form.',
          reason: ex.reason || 'Workout sequence movement'
        };
      });
    }
  }

  // Only apply the exercise cap to the core working set (warm-up & cool-down are additive).
  // DO NOT re-slice after appending finishers — that would cut the cool-down.
  const fin = secondaryFinisher(secondaryGoal, eq);
  if (fin.length) exercises = [...exercises, ...fin];

  const idGoal = (primaryGoal?.type || goal);
  return {
    id: `gen:${idGoal}:${dur}:${Array.from(eq).sort().join('-')}:${dayIndex}`,
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
    if (action === 'clone') cloneRoutine(id);
    if (action === 'delete') deleteRoutine(id);
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

  // Timer Mode toggles
  document.querySelectorAll('.timer-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode) switchTimerMode(mode);
    });
  });

  // Analytics graph selector toggles
  document.querySelectorAll('#analyticsToggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.analyticsChart = btn.getAttribute('data-chart') || 'consistency';
      renderAnalytics();
    });
  });

  // History modal show/hide wiring
  $('btnShowAllLogs')?.addEventListener('click', showHistoryModal);
  $('btnHistoryModalClose')?.addEventListener('click', hideHistoryModal);
  $('modalHistory')?.addEventListener('click', (e) => {
    if (e.target === $('modalHistory')) hideHistoryModal();
  });
}

// Custom routine duplication
function cloneRoutine(routineId) {
  const original = state.routines.find(r => r.id === routineId);
  if (!original) return;
  
  const exercises = (original.exercises || []).map(ex => ({
    id: uid(),
    name: ex.name
  }));
  
  const cloned = {
    id: uid(),
    name: `${original.name} (Copy)`,
    desc: original.desc || '',
    exercises: exercises
  };
  
  state.routines.unshift(cloned);
  saveRoutines();
  renderRoutines();
}

// Custom routine deletion
function deleteRoutine(routineId) {
  if (!confirm('Are you sure you want to delete this custom routine?')) return;
  state.routines = state.routines.filter(r => r.id !== routineId);
  saveRoutines();
  renderRoutines();
}

// Analytics Rendering Dispatcher
function renderAnalytics() {
  const container = $('analyticsChartContainer');
  if (!container) return;

  const currentChart = state.analyticsChart || 'consistency';

  // Toggle active button class
  document.querySelectorAll('#analyticsToggle button').forEach(btn => {
    if (btn.getAttribute('data-chart') === currentChart) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const desc = $('analyticsMutedDesc');
  if (currentChart === 'consistency') {
    if (desc) desc.textContent = 'Weekly workout completions for the last 7 weeks.';
    renderConsistencyChart(container);
  } else {
    if (desc) desc.textContent = 'Body weight progression tracking (lbs).';
    renderWeightChart(container);
  }
}

function renderConsistencyChart(container) {
  const target = getWeeklyWorkoutsTarget();
  const weekData = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const key = weekKey(d);
    const label = getWeekLabel(d);
    
    const count = (state.sessions || []).filter(s => {
      if (!s.endedAt) return false;
      return weekKey(new Date(s.endedAt)) === key;
    }).length;
    
    weekData.push({ label, count });
  }

  const maxCount = Math.max(target + 1, ...weekData.map(d => d.count), 4);
  const heightVal = 160;
  const widthVal = 500;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingLeft = 40;
  const paddingRight = 60;
  
  const graphHeight = heightVal - paddingTop - paddingBottom;
  const graphWidth = widthVal - paddingLeft - paddingRight;
  const colWidth = graphWidth / 7;
  const barWidth = 22;

  const valToY = (val) => heightVal - paddingBottom - (val / maxCount) * graphHeight;

  let svgContent = `
    <svg viewBox="0 0 ${widthVal} ${heightVal}" width="100%" height="100%">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" />
          <stop offset="100%" stop-color="var(--accent-light)" />
        </linearGradient>
        <linearGradient id="barGradSuccess" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#34d399" />
        </linearGradient>
      </defs>
      
      <line x1="30" y1="${valToY(target)}" x2="440" y2="${valToY(target)}" class="chart-grid" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4,4" />
      <text x="445" y="${valToY(target) + 3}" font-size="10" font-weight="700" fill="#f59e0b">Target (${target})</text>
  `;

  weekData.forEach((w, i) => {
    const x = paddingLeft + i * colWidth + (colWidth - barWidth) / 2;
    const y = valToY(w.count);
    const barHeight = Math.max(2, heightVal - paddingBottom - y);
    const isSuccess = w.count >= target;

    svgContent += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="${isSuccess ? 'url(#barGradSuccess)' : 'url(#barGrad)'}" class="chart-bar" />
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text)">${w.count}</text>
      <text x="${x + barWidth / 2}" y="${heightVal - 10}" text-anchor="middle" font-size="10" fill="var(--muted)">${w.label}</text>
    `;
  });

  svgContent += `
      <line x1="30" y1="${heightVal - paddingBottom}" x2="440" y2="${heightVal - paddingBottom}" stroke="var(--border)" stroke-width="1" />
    </svg>
  `;

  container.innerHTML = svgContent;
}

function renderWeightChart(container) {
  const history = state.primaryGoal?.weightHistory || [];
  
  if (!state.primaryGoal || state.primaryGoal.type !== 'lose_weight' || history.length === 0) {
    container.innerHTML = `
      <svg viewBox="0 0 500 160" width="100%" height="100%">
        <text x="250" y="80" text-anchor="middle" fill="var(--muted)" font-size="13" font-family="'Outfit', sans-serif">
          No weight logs found. Set Weight Loss goal & log weights in Settings.
        </text>
      </svg>
    `;
    return;
  }

  const points = history.slice(-10);
  const weights = points.map(p => p.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const wDiff = maxW - minW;
  const padding = wDiff === 0 ? 5 : wDiff * 0.15;
  const yMin = minW - padding;
  const yMax = maxW + padding;

  const heightVal = 160;
  const widthVal = 500;
  const paddingBottom = 30;
  const paddingTop = 25;
  const paddingLeft = 45;
  const paddingRight = 35;

  const graphHeight = heightVal - paddingTop - paddingBottom;
  const graphWidth = widthVal - paddingLeft - paddingRight;
  const colWidth = points.length > 1 ? graphWidth / (points.length - 1) : graphWidth;

  const valToY = (w) => heightVal - paddingBottom - ((w - yMin) / (yMax - yMin)) * graphHeight;
  const valToX = (idx) => paddingLeft + idx * colWidth;

  let pathD = "";
  points.forEach((pt, idx) => {
    const x = valToX(idx);
    const y = valToY(pt.weight);
    if (idx === 0) pathD += `M ${x} ${y}`;
    else pathD += ` L ${x} ${y}`;
  });

  let areaD = "";
  if (points.length > 1) {
    areaD = pathD + ` L ${valToX(points.length - 1)} ${heightVal - paddingBottom} L ${valToX(0)} ${heightVal - paddingBottom} Z`;
  }

  let svgContent = `
    <svg viewBox="0 0 ${widthVal} ${heightVal}" width="100%" height="100%">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--accent)" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.0" />
        </linearGradient>
      </defs>
  `;

  const gridLinesCount = 3;
  for (let i = 0; i < gridLinesCount; i++) {
    const ratio = i / (gridLinesCount - 1);
    const val = yMin + ratio * (yMax - yMin);
    const y = valToY(val);
    svgContent += `
      <line x1="${paddingLeft}" y1="${y}" x2="${widthVal - paddingRight}" y2="${y}" class="chart-grid" stroke="var(--border)" stroke-width="0.8" />
      <text x="${paddingLeft - 8}" y="${y + 3}" text-anchor="end" font-size="9" fill="var(--muted)">${Math.round(val)}</text>
    `;
  }

  if (points.length > 1) {
    svgContent += `
      <path d="${areaD}" fill="url(#areaGrad)" />
      <path d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="3" class="chart-line" stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  points.forEach((pt, idx) => {
    const x = valToX(idx);
    const y = valToY(pt.weight);
    
    svgContent += `
      <circle cx="${x}" cy="${y}" r="4" fill="var(--card)" stroke="var(--accent)" stroke-width="2" class="chart-point" />
      <text x="${x}" y="${y - 8}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text)">${pt.weight}</text>
      <text x="${x}" y="${heightVal - 10}" text-anchor="middle" font-size="9" fill="var(--muted)">${formatDateMD(pt.date)}</text>
    `;
  });

  svgContent += `
    </svg>
  `;

  container.innerHTML = svgContent;
}

function getWeekLabel(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[monday.getMonth()]} ${monday.getDate()}`;
}

function formatDateMD(dateStr) {
  try {
    const parts = dateStr.split('-');
    return `${Number(parts[1])}/${Number(parts[2])}`;
  } catch {
    return dateStr;
  }
}

// Modal for Historical Logs
function showHistoryModal() {
  const modal = $('modalHistory');
  if (!modal) return;
  modal.classList.add('active');
  renderHistoryLogs();
}

function hideHistoryModal() {
  const modal = $('modalHistory');
  if (modal) modal.classList.remove('active');
}

function renderHistoryLogs() {
  const container = $('historyLogsList');
  if (!container) return;
  
  const completedSessions = (state.sessions || []).filter(s => s.endedAt);
  
  if (completedSessions.length === 0) {
    container.innerHTML = '<div class="muted" style="text-align: center; padding: 20px;">No workout history logs yet.</div>';
    return;
  }

  container.innerHTML = '';
  completedSessions.forEach(s => {
    const r = activeRoutine(s) || (state.workoutLibrary || []).find(w => w.id === s.routineId);
    const routineName = r ? r.name : 'Custom Workout';
    const dateStr = new Date(s.endedAt).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const minutes = getSessionDurationMin(s);
    
    let exercisesHtml = '';
    if (s.entries && Object.keys(s.entries).length > 0) {
      exercisesHtml = '<div style="margin-top: 8px; display: grid; gap: 4px;">';
      Object.keys(s.entries).forEach(exId => {
        const sets = s.entries[exId] || [];
        if (sets.length > 0) {
          let exName = 'Exercise';
          const sessionEx = s.exercises?.find(e => e.id === exId);
          if (sessionEx) {
            exName = sessionEx.name;
          } else {
            const routineEx = r?.exercises?.find(e => e.id === exId);
            if (routineEx) {
              exName = routineEx.name;
            } else {
              state.routines.forEach(rt => {
                const found = rt.exercises?.find(e => e.id === exId);
                if (found) exName = found.name;
              });
            }
          }
          
          const setsSummary = sets.map((st, idx) => `#${idx + 1}: ${st.w} lb x ${st.r}`).join(' · ');
          exercisesHtml += `
            <div class="small" style="line-height: 1.4;">
              <strong>${escapeHtml(exName)}</strong>: <span class="muted">${escapeHtml(setsSummary)}</span>
            </div>
          `;
        }
      });
      exercisesHtml += '</div>';
    } else {
      exercisesHtml = '<div class="small muted" style="margin-top: 4px;">No exercises logged.</div>';
    }

    let notesHtml = '';
    if (s.notes && s.notes.trim()) {
      notesHtml = `<div class="small italic muted" style="margin-top: 8px; border-left: 2px solid var(--accent); padding-left: 8px;">"${escapeHtml(s.notes.trim())}"</div>`;
    }

    const card = document.createElement('div');
    card.className = 'routineItem';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'stretch';
    card.style.gap = '8px';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div>
          <div style="font-weight: 800; font-family: 'Outfit', sans-serif; font-size: 15px;">${escapeHtml(routineName)}</div>
          <div class="small" style="color: var(--muted); margin-top: 2px;">${dateStr} · ⏱️ ${minutes} min</div>
        </div>
        <button class="btn danger" style="padding: 6px 10px; font-size: 12px;" data-delete-session-id="${s.id}" type="button">Delete</button>
      </div>
      ${exercisesHtml}
      ${notesHtml}
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('[data-delete-session-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sessionId = btn.getAttribute('data-delete-session-id');
      if (sessionId) deleteSession(sessionId);
    });
  });
}

function deleteSession(sessionId) {
  if (!confirm('Are you sure you want to delete this workout history log? This will recalculate all streak and consistency metrics.')) return;
  state.sessions = state.sessions.filter(s => s.id !== sessionId);
  saveSessions();
  
  renderHistoryLogs();
  renderDashboard();
}

// ── Goal Checkpoints & Workout Auto-Adjustment Features ──

function isCheckpointDue() {
  if (!state.primaryGoal) return false;
  const g = state.primaryGoal;
  const lastDateStr = g.checkpoints && g.checkpoints.length > 0
    ? g.checkpoints[g.checkpoints.length - 1].date
    : g.createdAt || ymd(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  
  const lastTime = new Date(lastDateStr).getTime();
  const nowTime = new Date().getTime();
  const diffDays = (nowTime - lastTime) / (1000 * 60 * 60 * 24);
  if (diffDays >= 7) return true;

  const lastDateYmd = ymd(new Date(lastDateStr));
  const workoutsCompleted = state.sessions.filter(s => 
    s.endedAt && 
    ymd(new Date(s.endedAt)) > lastDateYmd && 
    s.routineId !== 'active-recovery'
  ).length;

  if (workoutsCompleted >= 5) return true;
  return false;
}

function showCheckpointModal() {
  const modal = $('modalCheckpoint');
  const content = $('checkpointContent');
  if (!modal || !content || !state.primaryGoal) return;

  const g = state.primaryGoal;
  let metricLabel = 'Current progress value:';
  let metricInputHtml = '';
  let currentValue = '';

  if (g.type === 'lose_weight') {
    metricLabel = 'What is your current weight (lbs) today?';
    currentValue = g.currentWeightLbs || g.startWeightLbs || '';
    metricInputHtml = `<input type="number" id="checkpointVal" class="input" step="0.1" value="${escapeHtml(currentValue)}" placeholder="e.g. 175.5" required>`;
  } else if (g.type === 'pushups') {
    metricLabel = 'What is your current max pushups in a single set?';
    currentValue = g.bestPushups || g.maxPushups || '';
    metricInputHtml = `<input type="number" id="checkpointVal" class="input" step="1" value="${escapeHtml(currentValue)}" placeholder="e.g. 20" required>`;
  } else if (g.type === 'bar_hang') {
    metricLabel = 'What is your current best bar hang time (seconds)?';
    currentValue = g.bestHangSec || g.maxHangSec || '';
    metricInputHtml = `<input type="number" id="checkpointVal" class="input" step="1" value="${escapeHtml(currentValue)}" placeholder="e.g. 45" required>`;
  } else if (g.type === 'run_5k') {
    metricLabel = 'What is your current best 5K time (minutes)?';
    currentValue = g.best5kMin || '';
    const hasRun10 = g.canRun10Min ? 'checked' : '';
    metricInputHtml = `
      <div style="display: grid; gap: 10px;">
        <input type="number" id="checkpointVal" class="input" step="0.1" value="${escapeHtml(currentValue)}" placeholder="e.g. 28.5 (leave empty if not run yet)">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; font-weight: 600;">
          <input type="checkbox" id="checkpointCanRun10" ${hasRun10}> 🏃 Can you now run continuously for 10 minutes?
        </label>
      </div>
    `;
  } else if (g.type === 'custom') {
    metricLabel = 'Update your custom progress metric or note:';
    currentValue = g.customText || '';
    metricInputHtml = `<input type="text" id="checkpointVal" class="input" value="${escapeHtml(currentValue)}" placeholder="e.g. Completed 3 weeks of consistency" required>`;
  } else {
    metricLabel = 'Current progress (estimated 1RM, muscle measurements, or progress note):';
    currentValue = g.currentProgressNote || '';
    metricInputHtml = `<input type="text" id="checkpointVal" class="input" value="${escapeHtml(currentValue)}" placeholder="e.g. Squat 225 lbs x 5 reps" required>`;
  }

  content.innerHTML = `
    <form id="checkpointForm" style="padding: 10px 0;">
      <div class="panel" style="margin-bottom: 16px; background: rgba(99, 102, 241, 0.04); border-color: rgba(99, 102, 241, 0.15);">
        <div style="font-weight: 800; font-size: 14.5px; color: var(--accent); margin-bottom: 4px;">Goal: ${escapeHtml(g.type.replace('_', ' '))}</div>
        <div class="small" style="font-weight: 500;">Current difficulty: <strong style="text-transform: uppercase;">${escapeHtml(g.difficulty || 'intermediate')}</strong> · Duration: <strong>${escapeHtml(g.durationMin || 30)}m</strong></div>
      </div>

      <div style="margin-bottom: 16px;">
        <label class="small" style="display:block; margin-bottom:6px; font-weight:700;">${metricLabel}</label>
        ${metricInputHtml}
      </div>

      <div style="margin-bottom: 20px;">
        <label class="small" style="display:block; margin-bottom:8px; font-weight:700;">How are the workouts feeling?</label>
        <div style="display:grid; gap:10px;">
          <label class="panel" style="display:flex; align-items:center; gap:10px; font-size:13.5px; cursor:pointer; padding: 10px; border-radius: 8px; margin: 0; background: var(--bg); transition: border-color 0.15s;">
            <input type="radio" name="workoutFeel" value="too_hard">
            <div>
              <strong style="color: #ef4444;">🥵 Too hard</strong>
              <div class="muted" style="font-size: 11px; margin-top: 2px;">I am struggling to complete it / feeling excessively fatigued.</div>
            </div>
          </label>
          <label class="panel" style="display:flex; align-items:center; gap:10px; font-size:13.5px; cursor:pointer; padding: 10px; border-radius: 8px; margin: 0; background: var(--bg); transition: border-color 0.15s;">
            <input type="radio" name="workoutFeel" value="just_right" checked>
            <div>
              <strong style="color: var(--accent);">🙂 Just right</strong>
              <div class="muted" style="font-size: 11px; margin-top: 2px;">It's challenging but manageable and I feel good.</div>
            </div>
          </label>
          <label class="panel" style="display:flex; align-items:center; gap:10px; font-size:13.5px; cursor:pointer; padding: 10px; border-radius: 8px; margin: 0; background: var(--bg); transition: border-color 0.15s;">
            <input type="radio" name="workoutFeel" value="too_easy">
            <div>
              <strong style="color: #10b981;">🥱 Too easy</strong>
              <div class="muted" style="font-size: 11px; margin-top: 2px;">I am breezing through workouts without much effort.</div>
            </div>
          </label>
        </div>
      </div>

      <button class="btn" id="btnSaveCheckpoint" type="submit" style="width: 100%; justify-content: center; font-size: 14px; padding: 10px;">Save Check-in & Adjust Plan</button>
    </form>
  `;

  modal.classList.add('active');

  const form = $('checkpointForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveCheckpoint();
    });
  }
}

function closeCheckpointModal() {
  const modal = $('modalCheckpoint');
  if (modal) modal.classList.remove('active');
}

function saveCheckpoint() {
  if (!state.primaryGoal) return;
  
  const g = state.primaryGoal;
  const valInput = $('checkpointVal');
  const feelInput = document.querySelector('input[name="workoutFeel"]:checked');
  const canRun10Input = $('checkpointCanRun10');

  const feelVal = feelInput ? feelInput.value : 'just_right';
  const todayStr = ymd(new Date());

  let newVal = null;
  let textVal = '';
  if (valInput) {
    textVal = valInput.value.trim();
    newVal = Number(textVal);
  }

  let adjustmentNote = 'No adjustments made.';
  let deltaMsg = '';
  let valDisplay = textVal;

  const oldDiff = g.difficulty || 'intermediate';
  const oldDur = g.durationMin || 30;
  const oldFreq = g.daysPerWeek || 3;

  if (g.type === 'lose_weight') {
    const sw = g.startWeightLbs || 180;
    const prevWeight = g.currentWeightLbs || sw;
    g.currentWeightLbs = newVal || prevWeight;
    
    g.weightHistory = g.weightHistory || [];
    const existsIdx = g.weightHistory.findIndex(h => h.date === todayStr);
    if (existsIdx !== -1) {
      g.weightHistory[existsIdx].weight = g.currentWeightLbs;
    } else {
      g.weightHistory.push({ date: todayStr, weight: g.currentWeightLbs });
    }
    g.weightHistory.sort((a, b) => a.date.localeCompare(b.date));
    
    const diff = prevWeight - g.currentWeightLbs;
    if (diff > 0) {
      deltaMsg = `Lost ${diff.toFixed(1)} lbs since last weight record!`;
    } else if (diff < 0) {
      deltaMsg = `Gained ${Math.abs(diff).toFixed(1)} lbs.`;
    } else {
      deltaMsg = `Weight maintained at ${g.currentWeightLbs} lbs.`;
    }
    valDisplay = `${g.currentWeightLbs} lbs`;
  } else if (g.type === 'pushups') {
    const prevPushups = g.bestPushups || g.maxPushups || 0;
    if (newVal > prevPushups) {
      g.bestPushups = newVal;
      deltaMsg = `New pushup record: +${newVal - prevPushups} reps!`;
    } else {
      g.bestPushups = newVal || prevPushups;
      deltaMsg = `Pushups logged: ${g.bestPushups} reps (record: ${prevPushups}).`;
    }
    valDisplay = `${g.bestPushups} reps`;
  } else if (g.type === 'bar_hang') {
    const prevHang = g.bestHangSec || g.maxHangSec || 0;
    if (newVal > prevHang) {
      g.bestHangSec = newVal;
      deltaMsg = `New hang record: +${newVal - prevHang}s!`;
    } else {
      g.bestHangSec = newVal || prevHang;
      deltaMsg = `Hang time logged: ${g.bestHangSec}s (record: ${prevHang}s).`;
    }
    valDisplay = `${g.bestHangSec}s`;
  } else if (g.type === 'run_5k') {
    const oldCanRun = g.canRun10Min;
    if (canRun10Input) {
      g.canRun10Min = canRun10Input.checked;
    }
    const prev5k = g.best5kMin || 0;
    if (newVal) {
      g.best5kMin = newVal;
      if (prev5k && newVal < prev5k) {
        deltaMsg = `5K run improved by ${(prev5k - newVal).toFixed(1)} min!`;
      } else {
        deltaMsg = `5K run logged: ${newVal} min.`;
      }
    }
    if (g.canRun10Min && !oldCanRun) {
      deltaMsg += (deltaMsg ? ' ' : '') + 'Unlocked continuous running level! 🏃';
    }
    valDisplay = newVal ? `${newVal} min` : (g.canRun10Min ? 'Run level' : 'Walk/Run level');
  } else if (g.type === 'custom') {
    g.customText = textVal;
    deltaMsg = `Checkpoint logged: "${textVal}"`;
    valDisplay = textVal;
  } else {
    g.currentProgressNote = textVal;
    deltaMsg = `Progress logged: "${textVal}"`;
    valDisplay = textVal;
  }

  let newDiff = oldDiff;
  let newDur = oldDur;
  let newFreq = oldFreq;

  if (feelVal === 'too_hard') {
    if (oldDiff === 'advanced') {
      newDiff = 'intermediate';
      adjustmentNote = 'Difficulty decreased to Intermediate for recovery.';
    } else if (oldDiff === 'intermediate') {
      newDiff = 'beginner';
      adjustmentNote = 'Difficulty decreased to Beginner to rebuild base strength.';
    } else {
      if (oldDur > 15) {
        newDur = oldDur - 15;
        adjustmentNote = `Workout duration shortened to ${newDur}m to manage fatigue.`;
      } else {
        if (oldFreq > 2) {
          newFreq = oldFreq - 1;
          adjustmentNote = `Training frequency reduced to ${newFreq}x/week for extra rest.`;
        } else {
          adjustmentNote = 'Reps & workload scaled back for extra recovery.';
        }
      }
    }
  } else if (feelVal === 'too_easy') {
    if (oldDiff === 'beginner') {
      newDiff = 'intermediate';
      adjustmentNote = 'Difficulty increased to Intermediate to keep progress moving.';
    } else if (oldDiff === 'intermediate') {
      newDiff = 'advanced';
      adjustmentNote = 'Difficulty increased to Advanced! Time to push harder. 🔥';
    } else {
      if (oldDur < 60) {
        newDur = oldDur + 15;
        adjustmentNote = `Workout duration extended to ${newDur}m for extra training volume.`;
      } else {
        if (oldFreq < 6) {
          newFreq = oldFreq + 1;
          adjustmentNote = `Weekly frequency increased to ${newFreq}x/week for higher conditioning.`;
        } else {
          adjustmentNote = 'Workload target and rep parameters scaled up!';
        }
      }
    }
  } else {
    adjustmentNote = 'Plan is perfectly on track! Workload and difficulty maintained.';
  }

  g.difficulty = newDiff;
  g.durationMin = newDur;
  g.daysPerWeek = newFreq;

  g.checkpoints = g.checkpoints || [];
  g.checkpoints.push({
    date: todayStr,
    value: valDisplay,
    feel: feelVal,
    note: `${deltaMsg ? deltaMsg + ' ' : ''}${adjustmentNote}`
  });

  state.primaryGoal = g;
  savePrimaryGoal();
  
  regeneratePlan();
  closeCheckpointModal();

  if (typeof confetti === 'function') {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  }

  alert(`🏁 Check-in Saved!\n\n${deltaMsg ? deltaMsg + '\n' : ''}Adjustment: ${adjustmentNote}`);
  renderDashboard();
}

function renderCheckpointsHistory() {
  const container = $('settingsCheckpointsList');
  const wrapper = $('settingsCheckpointsSection');
  if (!container || !wrapper) return;

  const g = state.primaryGoal;
  if (!g) {
    wrapper.style.display = 'none';
    return;
  }

  wrapper.style.display = 'block';
  const history = g.checkpoints || [];

  if (history.length === 0) {
    container.innerHTML = `<div class="muted" style="font-size: 11px; text-align: center; padding: 6px 0;">No checkpoints logged yet. Check-in from the dashboard to start!</div>`;
    return;
  }

  const renderedList = [...history].reverse().map(item => {
    let feelBadgeColor = 'var(--accent)';
    let feelLabel = 'Just right';
    if (item.feel === 'too_hard') {
      feelBadgeColor = '#ef4444';
      feelLabel = 'Too hard';
    } else if (item.feel === 'too_easy') {
      feelBadgeColor = '#10b981';
      feelLabel = 'Too easy';
    }

    let formattedDate = item.date;
    try {
      const [y, m, d] = item.date.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      formattedDate = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
    } catch {}

    return `
      <div style="padding: 8px; border: 1.5px solid var(--border); border-radius: 6px; background: var(--bg); display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 800; font-size: 11.5px; color: var(--text);">${escapeHtml(formattedDate)}</span>
          <span style="background: ${feelBadgeColor}15; color: ${feelBadgeColor}; font-size: 10px; font-weight: 800; padding: 2px 5px; border-radius: 4px; text-transform: uppercase;">${feelLabel}</span>
        </div>
        <div style="font-size: 11px; color: var(--text); font-weight: 500;">Value: <strong>${escapeHtml(item.value)}</strong></div>
        <div style="font-size: 11px; color: var(--muted); line-height: 1.3;">${escapeHtml(item.note)}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = renderedList;
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
  wireGenerator();
  
  renderWorkoutIdeas();
  renderExercisesDirectory();
  renderDashboard();
  renderRoutines();
  renderWorkout();
  
  hydrateGoalsForm();
  
  $('timer').textContent = fmtTimer(5);
  switchTimerMode('countdown'); // Ensure it sets up correctly on boot
  
  if (state.activeSessionId) {
    switchTab('workout');
  } else {
    switchTab('dashboard');
  }
  
  syncWorkoutLibrary();
}

boot();
