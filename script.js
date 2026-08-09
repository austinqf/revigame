/* ============================================================
   ReviGame — Single-player quiz game
   Open index.html in any browser to play. No server needed.
   ============================================================ */

// ----- Configuration -----
const QUESTIONS_PER_GAME = 10;
const FEEDBACK_DELAY_MS = 1500;       // Pause before moving to next question
const TRANSITION_DELAY_MS = 350;      // Animation duration between questions

// Points & coins awarded per difficulty level
const DIFFICULTY_CONFIG = {
  1: { label: 'Easy',   points: 10, coins: 5  },
  2: { label: 'Medium', points: 20, coins: 10 },
  3: { label: 'Hard',   points: 30, coins: 15 },
};

// Shop prices
const SHOP_ITEMS = {
  double: { cost: 50, name: 'Double Points' },
  skip:   { cost: 30, name: 'Skip Question' },
};

// Boss Battle balance
const BOSS_BATTLE = {
  playerMaxHp: 100,
  bossHpBase: 150,           // Primary 1 boss HP
  bossHpPerLevel: 25,        // +25 HP per primary level
  playerDamage: 10,          // Boss hits player (phase 1)
  playerDamagePhase2: 15,    // Boss hits harder below 50% HP
  bossDamageByDifficulty: { 1: 18, 2: 22, 3: 28 },
  streakBonus: 5,            // Bonus boss damage per streak after 2 correct
  winCoinBonus: 50,          // Base coin bonus for defeating boss
  winCoinPerLevel: 10,
  feedbackDelayPhase2: 1200, // Faster transitions in phase 2
};

// Boss names per subject
const BOSS_NAMES = {
  'Mathematics':   { name: 'Equation Dragon', avatar: '🐉' },
  'English':       { name: 'Grammar Golem',   avatar: '🗿' },
  'Science':       { name: 'Lab Lich',        avatar: '🧪' },
  'Mother Tongue': { name: 'Character King',  avatar: '👑' },
};

// Evolution paths for Evolution Mode
const EVOLUTIONS = {
  base: {
    name: 'Small Animal',
    emoji: '🐾',
    choices: [
      { id: 'wings', name: 'Grow Wings', emoji: '🦋', description: 'Unlock flying creatures' },
      { id: 'gills', name: 'Develop Gills', emoji: '🐟', description: 'Unlock aquatic creatures' },
      { id: 'fur', name: 'Thick Fur', emoji: '🐺', description: 'Unlock land predators' }
    ]
  },
  wings: {
    name: 'Flying Creature',
    emoji: '🦅',
    choices: [
      { id: 'eagle', name: 'Eagle', emoji: '🦅', description: 'Final form: Apex predator of the sky', final: true },
      { id: 'bat', name: 'Bat', emoji: '🦇', description: 'Final form: Nocturnal hunter', final: true }
    ]
  },
  gills: {
    name: 'Aquatic Creature',
    emoji: '🐠',
    choices: [
      { id: 'shark', name: 'Shark', emoji: '🦈', description: 'Final form: Ocean predator', final: true },
      { id: 'dolphin', name: 'Dolphin', emoji: '🐬', description: 'Final form: Intelligent swimmer', final: true }
    ]
  },
  fur: {
    name: 'Land Creature',
    emoji: '🐺',
    choices: [
      { id: 'wolf', name: 'Wolf', emoji: '🐺', description: 'Final form: Pack hunter', final: true },
      { id: 'polarBear', name: 'Polar Bear', emoji: '🐻‍❄️', description: 'Final form: Arctic survivor', final: true }
    ]
  },
  // Final forms (no further evolution)
  eagle: { name: 'Eagle', emoji: '🦅', final: true },
  bat: { name: 'Bat', emoji: '🦇', final: true },
  shark: { name: 'Shark', emoji: '🦈', final: true },
  dolphin: { name: 'Dolphin', emoji: '🐬', final: true },
  wolf: { name: 'Wolf', emoji: '🐺', final: true },
  polarBear: { name: 'Polar Bear', emoji: '🐻‍❄️', final: true }
};

// localStorage keys
const STORAGE_KEYS = {
  highScore:       'revigame_highScore',
  coins:           'revigame_coins',
  inventory:       'revigame_inventory',
  avatarInventory: 'revigame_avatar_inventory',
  avatarEquipped:  'revigame_avatar_equipped',
  battlePass:      'revigame_battlepass',
  slotMachine:     'revigame_slots',
};

// Battle Pass Configuration
const BATTLE_PASS_CONFIG = {
  maxLevel: 20,
  baseXP: 100,
  xpIncrement: 50,
  getXPForLevel(level) {
    return this.baseXP + (level - 1) * this.xpIncrement;
  }
};

// Battle Pass Rewards
const BATTLE_PASS_REWARDS = [
  // Free track rewards
  { level: 1, free: { type: 'coins', amount: 50 }, premium: { type: 'coins', amount: 100 } },
  { level: 2, free: { type: 'coins', amount: 75 }, premium: { type: 'crate', rarity: 'basic' } },
  { level: 3, free: { type: 'crate', rarity: 'basic' }, premium: { type: 'avatar', category: 'faces', item: 'cool' } },
  { level: 4, free: { type: 'coins', amount: 100 }, premium: { type: 'coins', amount: 200 } },
  { level: 5, free: { type: 'avatar', category: 'accessories', item: 'glasses' }, premium: { type: 'crate', rarity: 'rare' } },
  { level: 6, free: { type: 'coins', amount: 125 }, premium: { type: 'avatar', category: 'bases', item: 'robot' } },
  { level: 7, free: { type: 'crate', rarity: 'basic' }, premium: { type: 'coins', amount: 300 } },
  { level: 8, free: { type: 'coins', amount: 150 }, premium: { type: 'avatar', category: 'faces', item: 'wink' } },
  { level: 9, free: { type: 'avatar', category: 'faces', item: 'happy' }, premium: { type: 'crate', rarity: 'rare' } },
  { level: 10, free: { type: 'coins', amount: 200 }, premium: { type: 'avatar', category: 'accessories', item: 'crown' } },
  { level: 11, free: { type: 'crate', rarity: 'rare' }, premium: { type: 'coins', amount: 400 } },
  { level: 12, free: { type: 'coins', amount: 225 }, premium: { type: 'avatar', category: 'bases', item: 'alien' } },
  { level: 13, free: { type: 'avatar', category: 'accessories', item: 'hat' }, premium: { type: 'crate', rarity: 'rare' } },
  { level: 14, free: { type: 'coins', amount: 250 }, premium: { type: 'avatar', category: 'faces', item: 'star' } },
  { level: 15, free: { type: 'crate', rarity: 'rare' }, premium: { type: 'coins', amount: 500 } },
  { level: 16, free: { type: 'coins', amount: 275 }, premium: { type: 'avatar', category: 'bases', item: 'dragon' } },
  { level: 17, free: { type: 'avatar', category: 'faces', item: 'sunglasses' }, premium: { type: 'crate', rarity: 'rare' } },
  { level: 18, free: { type: 'coins', amount: 300 }, premium: { type: 'avatar', category: 'accessories', item: 'wings' } },
  { level: 19, free: { type: 'crate', rarity: 'rare' }, premium: { type: 'avatar', category: 'faces', item: 'fire' } },
  { level: 20, free: { type: 'coins', amount: 500 }, premium: { type: 'avatar', category: 'accessories', item: 'halo' } },
];

// Slot Machine Configuration
const SLOT_SYMBOLS = [
  { icon: '🪙', type: 'coins', weight: 40 },
  { icon: '🎁', type: 'crate', weight: 25 },
  { icon: '👤', type: 'avatar_base', weight: 10 },
  { icon: '😊', type: 'avatar_face', weight: 10 },
  { icon: '👑', type: 'avatar_accessory', weight: 10 },
  { icon: '💎', type: 'jackpot', weight: 5 },
];

const SLOT_REWARDS = {
  '3-coins': { type: 'coins', amount: 500, message: '🎉 JACKPOT! 500 Coins!' },
  '2-coins': { type: 'coins', amount: 100, message: '✨ Nice! 100 Coins!' },
  '3-crate': { type: 'crate', rarity: 'rare', message: '🎁 Rare Crate!' },
  '2-crate': { type: 'crate', rarity: 'basic', message: '📦 Basic Crate!' },
  '3-avatar': { type: 'avatar', message: '🎭 Avatar Bundle!' },
  'jackpot': { type: 'coins', amount: 1000, message: '💎 MEGA JACKPOT! 1000 Coins!' },
  'mixed': { type: 'coins', amount: 25, message: '🪙 25 Coins' },
};

// Avatar Cosmetics Catalog (3 Layers: Base, Face, Accessory)
const AVATAR_CATALOG = {
  bases: [
    { id: 'human', name: 'Human', type: 'base', rarity: 'common', icon: '🧑', duplicateCoins: 20 },
    { id: 'cat',   name: 'Cat Hero', type: 'base', rarity: 'common', icon: '🐱', duplicateCoins: 20 },
    { id: 'robot', name: 'Robot', type: 'base', rarity: 'rare', icon: '🤖', duplicateCoins: 50 },
    { id: 'ninja', name: 'Ninja', type: 'base', rarity: 'rare', icon: '🥷', duplicateCoins: 50 },
    { id: 'alien', name: 'Alien', type: 'base', rarity: 'epic', icon: '👽', duplicateCoins: 100 },
    { id: 'wizard', name: 'Wizard', type: 'base', rarity: 'epic', icon: '🧙', duplicateCoins: 100 },
  ],
  faces: [
    { id: 'smile',      name: 'Smile', type: 'face', rarity: 'common', icon: '😊', duplicateCoins: 20 },
    { id: 'angry',      name: 'Angry', type: 'face', rarity: 'common', icon: '😠', duplicateCoins: 20 },
    { id: 'wink',       name: 'Wink', type: 'face', rarity: 'common', icon: '😜', duplicateCoins: 20 },
    { id: 'sunglasses', name: 'Sunglasses', type: 'face', rarity: 'rare', icon: '😎', duplicateCoins: 50 },
    { id: 'focused',    name: 'Focused', type: 'face', rarity: 'rare', icon: '🧐', duplicateCoins: 50 },
    { id: 'stareyes',   name: 'Star Eyes', type: 'face', rarity: 'epic', icon: '🤩', duplicateCoins: 100 },
  ],
  accessories: [
    { id: 'none',       name: 'None', type: 'accessory', rarity: 'common', icon: '❌', duplicateCoins: 0 },
    { id: 'partyhat',   name: 'Party Hat', type: 'accessory', rarity: 'common', icon: '🥳', duplicateCoins: 20 },
    { id: 'glasses',    name: 'Glasses', type: 'accessory', rarity: 'common', icon: '👓', duplicateCoins: 20 },
    { id: 'headphones', name: 'Headphones', type: 'accessory', rarity: 'rare', icon: '🎧', duplicateCoins: 50 },
    { id: 'halo',       name: 'Halo', type: 'accessory', rarity: 'rare', icon: '😇', duplicateCoins: 50 },
    { id: 'crown',      name: 'Crown', type: 'accessory', rarity: 'epic', icon: '👑', duplicateCoins: 100 },
    { id: 'aura',       name: 'Fire Aura', type: 'accessory', rarity: 'epic', icon: '🔥', duplicateCoins: 100 },
  ]
};

// MOE subject config — Science is only taught from Primary 3 onwards
const SUBJECT_CONFIG = {
  'Mathematics':   { minLevel: 1, maxLevel: 6, short: 'Math' },
  'English':       { minLevel: 1, maxLevel: 6, short: 'Eng' },
  'Science':       { minLevel: 3, maxLevel: 6, short: 'Sci' },
  'Mother Tongue': { minLevel: 1, maxLevel: 6, short: 'MT' },
};

// MOE syllabus topics breakdown per Subject & Primary level
const SUBJECT_TOPICS = {
  'Mathematics': {
    1: ['Addition', 'Subtraction', 'Numbers & Shapes'],
    2: ['Addition & Subtraction', 'Multiplication', 'Fractions', 'Money & Time'],
    3: ['Multiplication & Division', 'Fractions', 'Perimeter & Area', 'Measurement'],
    4: ['Perimeter & Area', 'Decimals', 'Angles', 'Factors & Multiples'],
    5: ['Percentages', 'Ratios', 'Volume', 'Decimals & Fractions'],
    6: ['Speed', 'Algebra', 'Circles', 'Percentages & Ratios', 'Triangles & Angles']
  },
  'English': {
    1: ['Rhymes & Sounds', 'Vocabulary & Nouns', 'Grammar & Punctuation'],
    2: ['Nouns & Verbs', 'Tenses & Plurals', 'Vocabulary & Spelling'],
    3: ['Conjunctions & Prefixes', 'Synonyms & Antonyms', 'Sentence Structure'],
    4: ['Synonyms & Antonyms', 'Similes & Figurative Language', 'Grammar & Clauses'],
    5: ['Metaphors & Onomatopoeia', 'Vocabulary & Connotations', 'Grammar & Sentences'],
    6: ['Comprehension & Inference', 'Rhetoric & Style', 'Vocabulary & Synthesis']
  },
  'Science': {
    3: ['Living & Non-Living Things', 'Life Cycles', 'Materials & Magnets', 'Plant Systems'],
    4: ['Water Cycle & Matter', 'Human Systems', 'Electricity & Circuits', 'Heat & Light'],
    5: ['Plant & Human Reproduction', 'Forces & Friction', 'Electrical Systems', 'Energy Conversions'],
    6: ['Forces & Motion', 'Ecosystems & Environment', 'Circulatory & Skeletal Systems', 'Adaptations']
  },
  'Mother Tongue': {
    1: ['Basic Characters & Numbers', 'Nouns & Nature', 'Everyday Words'],
    2: ['Family & School', 'Greetings & Expressions', 'Activities & Weather'],
    3: ['Conjunctions (因为/虽然)', 'Health & Environment', 'Habits & Values'],
    4: ['Idioms & Sentences', 'Responsibility & Development', 'Values & Perseverance'],
    5: ['Idioms (成语)', 'Society & Innovation', 'Communication & Culture'],
    6: ['Rhetoric & Literary Devices (修辞)', 'Critical Thinking & Synthesis', 'Culture & Heritage']
  }
};

// ----- Question Bank (Singapore MOE Primary Syllabus) -----
// Fields: question, options, correct (0-3), difficulty (1-3), subject, level (1-6)
const QUESTIONS = [
  // ── Mathematics · Primary 1 ──
  { question: 'What is 5 + 3?', options: ['6', '7', '8', '9'], correct: 2, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'What is 9 − 4?', options: ['3', '4', '5', '6'], correct: 2, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'Which number comes after 17?', options: ['16', '18', '19', '20'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'Which is the smallest number?', options: ['8', '3', '5', '9'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'What is 2 + 2 + 2?', options: ['4', '5', '6', '8'], correct: 2, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'Which shape has 4 equal sides?', options: ['Circle', 'Triangle', 'Square', 'Rectangle'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 1 },
  { question: 'What is 10 − 7?', options: ['2', '3', '4', '5'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'Which coin has the value of 50 cents in Singapore?', options: ['5¢', '10¢', '20¢', '50¢'], correct: 3, difficulty: 2, subject: 'Mathematics', level: 1 },
  { question: 'What is 6 + 4?', options: ['8', '9', '10', '11'], correct: 2, difficulty: 1, subject: 'Mathematics', level: 1 },
  { question: 'Which number is smaller than 15?', options: ['17', '19', '12', '15'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 1 },
  { question: 'What is 15 − 8?', options: ['5', '6', '7', '8'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 1 },

  // ── Mathematics · Primary 2 ──
  { question: 'What is 45 + 23?', options: ['58', '67', '68', '78'], correct: 2, difficulty: 1, subject: 'Mathematics', level: 2 },
  { question: 'What is 72 − 35?', options: ['37', '38', '47', '57'], correct: 0, difficulty: 2, subject: 'Mathematics', level: 2 },
  { question: 'How many tens are in 340?', options: ['3', '4', '34', '340'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 2 },
  { question: 'What is 5 × 2?', options: ['7', '10', '12', '15'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 2 },
  { question: 'Which fraction shows half?', options: ['1/4', '1/2', '1/3', '2/3'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 2 },
  { question: 'What time is "half past 3"?', options: ['3:00', '3:15', '3:30', '3:45'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 2 },
  { question: 'What is 3 × 4?', options: ['7', '10', '12', '14'], correct: 2, difficulty: 1, subject: 'Mathematics', level: 2 },
  { question: 'Which is the largest: 456, 465, 546?', options: ['456', '465', '546', 'All equal'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 2 },
  { question: 'What is 100 − 47?', options: ['43', '53', '63', '73'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 2 },
  { question: 'How many 50¢ coins make $1?', options: ['1', '2', '3', '4'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 2 },
  { question: 'What is 8 × 2?', options: ['10', '14', '16', '18'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 2 },
  { question: 'Which shape has no corners?', options: ['Square', 'Triangle', 'Circle', 'Rectangle'], correct: 2, difficulty: 1, subject: 'Mathematics', level: 2 },

  // ── Mathematics · Primary 3 ──
  { question: 'What is 7 × 8?', options: ['54', '56', '58', '64'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'What is 84 ÷ 7?', options: ['10', '11', '12', '13'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'Which fraction is equivalent to 1/2?', options: ['2/4', '1/3', '3/4', '2/3'], correct: 0, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'What is 456 + 278?', options: ['624', '734', '744', '754'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'How many millimetres are in 1 cm?', options: ['10', '100', '1000', '5'], correct: 0, difficulty: 1, subject: 'Mathematics', level: 3 },
  { question: 'What is 1000 − 456?', options: ['544', '554', '644', '654'], correct: 0, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'What is 9 × 6?', options: ['45', '54', '56', '63'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'Which is a right angle?', options: ['45°', '90°', '120°', '180°'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'What is 1/4 of 20?', options: ['4', '5', '6', '8'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'Round 347 to the nearest ten.', options: ['340', '350', '360', '400'], correct: 1, difficulty: 3, subject: 'Mathematics', level: 3 },
  { question: 'What is 6 × 7?', options: ['42', '43', '48', '49'], correct: 0, difficulty: 2, subject: 'Mathematics', level: 3 },
  { question: 'Perimeter of a square with side 5 cm?', options: ['10 cm', '15 cm', '20 cm', '25 cm'], correct: 2, difficulty: 3, subject: 'Mathematics', level: 3 },

  // ── Mathematics · Primary 4 ──
  { question: 'What is 3.5 + 2.1?', options: ['5.4', '5.6', '5.8', '6.4'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'Which is a factor of 24?', options: ['5', '6', '7', '9'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'What is 1/2 + 1/4?', options: ['1/6', '2/4', '3/4', '1/8'], correct: 2, difficulty: 3, subject: 'Mathematics', level: 4 },
  { question: 'What is 48 × 12?', options: ['476', '576', '586', '596'], correct: 1, difficulty: 3, subject: 'Mathematics', level: 4 },
  { question: 'Convert 2.5 km to metres.', options: ['250', '2500', '25', '25000'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'What is the area of a 6 cm × 4 cm rectangle?', options: ['10 cm²', '20 cm²', '24 cm²', '48 cm²'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'Which number is divisible by 3?', options: ['14', '15', '16', '17'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 4 },
  { question: 'What is 7/10 as a decimal?', options: ['0.07', '0.7', '7.0', '0.17'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'What is 3600 ÷ 9?', options: ['300', '400', '500', '600'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'Angles in a triangle add up to ___°.', options: ['90', '180', '270', '360'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'What is 0.6 × 10?', options: ['0.06', '6', '60', '600'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 4 },
  { question: 'Which is the LCM of 4 and 6?', options: ['6', '10', '12', '24'], correct: 2, difficulty: 3, subject: 'Mathematics', level: 4 },

  // ── Mathematics · Primary 5 ──
  { question: 'What is 20% of 150?', options: ['20', '25', '30', '35'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 5 },
  { question: 'Simplify the ratio 12:8.', options: ['2:3', '3:2', '4:3', '6:4'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 5 },
  { question: 'What is 3/5 as a percentage?', options: ['35%', '50%', '60%', '75%'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 5 },
  { question: 'Volume of a 5×4×3 cm cuboid?', options: ['12 cm³', '60 cm³', '120 cm³', '150 cm³'], correct: 1, difficulty: 3, subject: 'Mathematics', level: 5 },
  { question: 'What is 2.4 × 0.5?', options: ['1.0', '1.2', '1.4', '2.0'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 5 },
  { question: 'Average of 10, 20, 30?', options: ['15', '20', '25', '30'], correct: 1, difficulty: 1, subject: 'Mathematics', level: 5 },
  { question: 'What is 3/4 ÷ 1/2?', options: ['3/8', '1/2', '3/2', '2/3'], correct: 2, difficulty: 3, subject: 'Mathematics', level: 5 },
  { question: 'GST in Singapore is 9%. GST on $100?', options: ['$7', '$8', '$9', '$10'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 5 },
  { question: 'What is (-3) + 8?', options: ['-11', '-5', '5', '11'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 5 },
  { question: 'Express 0.375 as a fraction in simplest form.', options: ['3/8', '375/100', '3/75', '37/5'], correct: 0, difficulty: 3, subject: 'Mathematics', level: 5 },
  { question: 'If x + 5 = 12, what is x?', options: ['5', '6', '7', '8'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 5 },
  { question: 'Circumference formula for a circle?', options: ['πr', '2πr', 'πr²', '2πr²'], correct: 1, difficulty: 3, subject: 'Mathematics', level: 5 },

  // ── Mathematics · Primary 6 ──
  { question: 'What is 2³?', options: ['6', '8', '9', '12'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 6 },
  { question: 'Solve: 2x − 7 = 11', options: ['7', '8', '9', '10'], correct: 2, difficulty: 3, subject: 'Mathematics', level: 6 },
  { question: 'What is 15% of 200?', options: ['15', '25', '30', '35'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 6 },
  { question: 'Ratio of boys to girls is 3:2. If 15 boys, how many girls?', options: ['8', '10', '12', '15'], correct: 1, difficulty: 3, subject: 'Mathematics', level: 6 },
  { question: 'What is √144?', options: ['10', '11', '12', '14'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 6 },
  { question: 'Speed = distance ÷ time. 120 km in 2 h = ?', options: ['40 km/h', '50 km/h', '60 km/h', '80 km/h'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 6 },
  { question: 'What is 0.08 × 1000?', options: ['0.8', '8', '80', '800'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 6 },
  { question: 'Area of triangle: ½ × base × height. Base 10, height 6?', options: ['16', '30', '60', '120'], correct: 1, difficulty: 2, subject: 'Mathematics', level: 6 },
  { question: 'Express 3/8 as a decimal.', options: ['0.375', '0.38', '0.83', '3.8'], correct: 0, difficulty: 3, subject: 'Mathematics', level: 6 },
  { question: 'If 4 pens cost $6, how much for 10 pens?', options: ['$12', '$15', '$18', '$20'], correct: 1, difficulty: 3, subject: 'Mathematics', level: 6 },
  { question: 'What is 5² − 3²?', options: ['4', '8', '16', '34'], correct: 2, difficulty: 3, subject: 'Mathematics', level: 6 },
  { question: 'A discount of 10% on $80 saves how much?', options: ['$4', '$6', '$8', '$10'], correct: 2, difficulty: 2, subject: 'Mathematics', level: 6 },

  // ── English · Primary 1 ──
  { question: 'Which word rhymes with "cat"?', options: ['cap', 'bat', 'cut', 'car'], correct: 1, difficulty: 1, subject: 'English', level: 1 },
  { question: 'What is the opposite of "hot"?', options: ['warm', 'cold', 'wet', 'big'], correct: 1, difficulty: 1, subject: 'English', level: 1 },
  { question: 'Which is a naming word (noun)?', options: ['run', 'happy', 'book', 'quickly'], correct: 2, difficulty: 1, subject: 'English', level: 1 },
  { question: 'Choose the correct spelling.', options: ['frend', 'friend', 'freind', 'friand'], correct: 1, difficulty: 1, subject: 'English', level: 1 },
  { question: 'Which sentence is correct?', options: ['I goed to school.', 'I went to school.', 'I go to school yesterday.', 'I going to school.'], correct: 1, difficulty: 2, subject: 'English', level: 1 },
  { question: 'How many letters are in the alphabet?', options: ['24', '25', '26', '27'], correct: 2, difficulty: 1, subject: 'English', level: 1 },
  { question: 'Which word starts with the same sound as "sun"?', options: ['fish', 'sit', 'cat', 'dog'], correct: 1, difficulty: 1, subject: 'English', level: 1 },
  { question: 'What punctuation ends a question?', options: ['.', '!', '?', ','], correct: 2, difficulty: 1, subject: 'English', level: 1 },
  { question: 'Which is a colour word?', options: ['run', 'blue', 'fast', 'under'], correct: 1, difficulty: 1, subject: 'English', level: 1 },
  { question: 'The cat ___ on the mat.', options: ['sit', 'sits', 'sitting', 'satting'], correct: 1, difficulty: 2, subject: 'English', level: 1 },
  { question: 'Which word means more than one "child"?', options: ['childs', 'children', 'childes', 'child'], correct: 1, difficulty: 2, subject: 'English', level: 1 },
  { question: 'Pick the action word (verb).', options: ['table', 'jump', 'red', 'slowly'], correct: 1, difficulty: 1, subject: 'English', level: 1 },

  // ── English · Primary 2 ──
  { question: 'She ___ to the park every Sunday.', options: ['go', 'goes', 'going', 'gone'], correct: 1, difficulty: 2, subject: 'English', level: 2 },
  { question: 'Which is a proper noun?', options: ['city', 'Singapore', 'country', 'school'], correct: 1, difficulty: 2, subject: 'English', level: 2 },
  { question: 'Choose the correct plural: one mouse, two ___.', options: ['mouses', 'mice', 'mouse', 'mices'], correct: 1, difficulty: 2, subject: 'English', level: 2 },
  { question: 'What is the past tense of "eat"?', options: ['eated', 'ate', 'eaten', 'eating'], correct: 1, difficulty: 2, subject: 'English', level: 2 },
  { question: 'Which word is an adjective?', options: ['quickly', 'beautiful', 'run', 'and'], correct: 1, difficulty: 2, subject: 'English', level: 2 },
  { question: 'Find the synonym of "happy".', options: ['sad', 'glad', 'angry', 'tired'], correct: 1, difficulty: 2, subject: 'English', level: 2 },
  { question: 'Which sentence uses "their" correctly?', options: ['Their going home.', 'They\'re books are new.', 'Their house is big.', 'There house is big.'], correct: 2, difficulty: 3, subject: 'English', level: 2 },
  { question: 'What type of word is "under" in "under the table"?', options: ['noun', 'verb', 'preposition', 'adjective'], correct: 2, difficulty: 2, subject: 'English', level: 2 },
  { question: 'Which is a complete sentence?', options: ['Running fast.', 'The boy runs fast.', 'Fast the boy.', 'Boy runs.'], correct: 1, difficulty: 2, subject: 'English', level: 2 },
  { question: 'Antonym of "begin"?', options: ['start', 'end', 'open', 'first'], correct: 1, difficulty: 1, subject: 'English', level: 2 },
  { question: 'Correct spelling:', options: ['becuse', 'because', 'becaus', 'becouse'], correct: 1, difficulty: 1, subject: 'English', level: 2 },
  { question: 'Which is a question word?', options: ['what', 'the', 'and', 'very'], correct: 0, difficulty: 1, subject: 'English', level: 2 },

  // ── English · Primary 3 ──
  { question: 'He ___ his homework before dinner.', options: ['do', 'does', 'did', 'done'], correct: 2, difficulty: 2, subject: 'English', level: 3 },
  { question: 'Which word is a conjunction?', options: ['and', 'happy', 'run', 'quickly'], correct: 0, difficulty: 2, subject: 'English', level: 3 },
  { question: 'Synonym of "big"?', options: ['small', 'large', 'tiny', 'short'], correct: 1, difficulty: 1, subject: 'English', level: 3 },
  { question: 'Which sentence is in the future tense?', options: ['I eat lunch.', 'I ate lunch.', 'I will eat lunch.', 'I am eating lunch.'], correct: 2, difficulty: 2, subject: 'English', level: 3 },
  { question: 'The prefix "un-" in "unhappy" means ___.', options: ['again', 'not', 'before', 'after'], correct: 1, difficulty: 2, subject: 'English', level: 3 },
  { question: 'Which is a compound word?', options: ['sun', 'sunlight', 'sunny', 'light'], correct: 1, difficulty: 2, subject: 'English', level: 3 },
  { question: 'Choose the correct homophone: I can ___ the bell.', options: ['here', 'hear', 'hair', 'hare'], correct: 1, difficulty: 2, subject: 'English', level: 3 },
  { question: 'What is the subject in "The dog barked loudly"?', options: ['barked', 'loudly', 'The dog', 'The'], correct: 2, difficulty: 3, subject: 'English', level: 3 },
  { question: 'Antonym of "generous"?', options: ['kind', 'selfish', 'happy', 'brave'], correct: 1, difficulty: 2, subject: 'English', level: 3 },
  { question: 'Which uses an apostrophe correctly?', options: ['its raining', 'it\'s raining', 'its\' raining', 'it,s raining'], correct: 1, difficulty: 3, subject: 'English', level: 3 },
  { question: 'Past participle of "write"?', options: ['wrote', 'written', 'writed', 'writing'], correct: 1, difficulty: 3, subject: 'English', level: 3 },
  { question: 'Which is an adverb?', options: ['slow', 'slowly', 'slowness', 'slowed'], correct: 1, difficulty: 2, subject: 'English', level: 3 },

  // ── English · Primary 4 ──
  { question: 'Synonym of "ancient"?', options: ['new', 'old', 'modern', 'young'], correct: 1, difficulty: 2, subject: 'English', level: 4 },
  { question: 'Which sentence uses a simile?', options: ['He is brave.', 'He is as brave as a lion.', 'He is a lion.', 'He bravely fought.'], correct: 1, difficulty: 3, subject: 'English', level: 4 },
  { question: 'The suffix "-ful" in "hopeful" means ___.', options: ['without', 'full of', 'before', 'again'], correct: 1, difficulty: 2, subject: 'English', level: 4 },
  { question: 'Which is a complex sentence?', options: ['I ran.', 'I ran and jumped.', 'I ran because I was late.', 'Run fast!'], correct: 2, difficulty: 3, subject: 'English', level: 4 },
  { question: 'Antonym of "expand"?', options: ['grow', 'shrink', 'increase', 'widen'], correct: 1, difficulty: 2, subject: 'English', level: 4 },
  { question: 'Correct use of "affect" vs "effect": The rain ___ the match.', options: ['effected', 'affected', 'affecting', 'effects'], correct: 1, difficulty: 3, subject: 'English', level: 4 },
  { question: 'Which word is a pronoun?', options: ['she', 'school', 'quickly', 'happy'], correct: 0, difficulty: 2, subject: 'English', level: 4 },
  { question: 'Direct speech: He said, "I am tired." Reported: He said that ___.', options: ['I am tired.', 'he was tired.', 'he is tired.', 'I was tired.'], correct: 1, difficulty: 3, subject: 'English', level: 4 },
  { question: 'Root word of "unhappiness"?', options: ['happy', 'unhappy', 'happiness', 'ness'], correct: 0, difficulty: 2, subject: 'English', level: 4 },
  { question: 'Which is written in passive voice?', options: ['Tom ate the cake.', 'The cake was eaten by Tom.', 'Tom is eating.', 'Eat the cake.'], correct: 1, difficulty: 3, subject: 'English', level: 4 },
  { question: 'Synonym of "rapid"?', options: ['slow', 'quick', 'calm', 'lazy'], correct: 1, difficulty: 1, subject: 'English', level: 4 },
  { question: 'Which punctuation joins two related sentences?', options: [',', ';', '?', '!'], correct: 1, difficulty: 3, subject: 'English', level: 4 },

  // ── English · Primary 5 ──
  { question: 'What is onomatopoeia?', options: ['A comparison using "like"', 'A word that imitates a sound', 'An exaggeration', 'A hidden meaning'], correct: 1, difficulty: 3, subject: 'English', level: 5 },
  { question: 'Metaphor example:', options: ['He runs like the wind.', 'He is a shining star.', 'The wind howled.', 'She is very tall.'], correct: 1, difficulty: 3, subject: 'English', level: 5 },
  { question: 'Synonym of "diligent"?', options: ['lazy', 'hardworking', 'careless', 'slow'], correct: 1, difficulty: 2, subject: 'English', level: 5 },
  { question: 'Which is an opinion?', options: ['Water boils at 100°C.', 'Singapore is in Asia.', 'Pizza is the best food.', 'There are 7 days in a week.'], correct: 2, difficulty: 2, subject: 'English', level: 5 },
  { question: 'Antonym of "ambiguous"?', options: ['unclear', 'vague', 'clear', 'confusing'], correct: 2, difficulty: 3, subject: 'English', level: 5 },
  { question: 'Main idea of a paragraph is usually found in the ___.', options: ['last sentence only', 'topic sentence', 'title only', 'middle only'], correct: 1, difficulty: 2, subject: 'English', level: 5 },
  { question: 'Hyperbole example:', options: ['She is as quiet as a mouse.', 'I have told you a million times!', 'The stars winked.', 'Time is money.'], correct: 1, difficulty: 3, subject: 'English', level: 5 },
  { question: 'Which word has a negative connotation?', options: ['slim', 'skinny', 'thin', 'lean'], correct: 1, difficulty: 3, subject: 'English', level: 5 },
  { question: 'Correct: Neither Tom nor Jerry ___ present.', options: ['was', 'were', 'is', 'are'], correct: 0, difficulty: 3, subject: 'English', level: 5 },
  { question: 'Persuasive writing aims to ___.', options: ['entertain only', 'convince the reader', 'describe a scene', 'tell a joke'], correct: 1, difficulty: 2, subject: 'English', level: 5 },
  { question: 'Synonym of "fragile"?', options: ['strong', 'delicate', 'heavy', 'solid'], correct: 1, difficulty: 2, subject: 'English', level: 5 },
  { question: 'Which is a clause?', options: ['Under the tree', 'Because it rained', 'Quickly', 'Happy child'], correct: 1, difficulty: 3, subject: 'English', level: 5 },

  // ── English · Primary 6 ──
  { question: 'Inference means ___.', options: ['stating facts directly', 'reading between the lines', 'copying text', 'ignoring context'], correct: 1, difficulty: 2, subject: 'English', level: 6 },
  { question: 'Which shows irony?', options: ['The fire station burned down.', 'The sun is hot.', 'She ran fast.', 'Birds have wings.'], correct: 0, difficulty: 3, subject: 'English', level: 6 },
  { question: 'Synonym of "meticulous"?', options: ['careless', 'careful', 'lazy', 'rough'], correct: 1, difficulty: 3, subject: 'English', level: 6 },
  { question: 'Author\'s purpose: a recipe aims to ___.', options: ['persuade', 'inform/instruct', 'entertain', 'confuse'], correct: 1, difficulty: 2, subject: 'English', level: 6 },
  { question: 'Antonym of "concise"?', options: ['brief', 'short', 'wordy', 'clear'], correct: 2, difficulty: 3, subject: 'English', level: 6 },
  { question: 'Synthesis skill means ___.', options: ['combining ideas from texts', 'copying sentences', 'ignoring details', 'memorising only'], correct: 0, difficulty: 2, subject: 'English', level: 6 },
  { question: 'Which is formal language?', options: ['Hey, what\'s up?', 'I am writing to enquire about…', 'Gonna grab food.', 'LOL that\'s funny.'], correct: 1, difficulty: 2, subject: 'English', level: 6 },
  { question: 'Personification example:', options: ['The wind whispered through the trees.', 'He is like a rock.', 'She is a star.', 'Bang! went the door.'], correct: 0, difficulty: 3, subject: 'English', level: 6 },
  { question: 'Correct: The data ___ useful.', options: ['is', 'are', 'were', 'have'], correct: 0, difficulty: 3, subject: 'English', level: 6 },
  { question: 'Bias in a text means ___.', options: ['neutral reporting', 'a one-sided viewpoint', 'factual accuracy', 'no opinion'], correct: 1, difficulty: 2, subject: 'English', level: 6 },
  { question: 'Synonym of "abundant"?', options: ['scarce', 'plentiful', 'empty', 'limited'], correct: 1, difficulty: 2, subject: 'English', level: 6 },
  { question: 'Which connector shows contrast?', options: ['and', 'because', 'however', 'so'], correct: 2, difficulty: 2, subject: 'English', level: 6 },

  // ── Science · Primary 3 (MOE: Diversity, Cycles, Systems) ──
  { question: 'Which of the following is a characteristic of all living things?', options: ['They make their own food.', 'They respond to changes around them.', 'They move from place to place by themselves.', 'They lay eggs.'], correct: 1, difficulty: 1, subject: 'Science', level: 3 },
  { question: 'Plants make their own food through photosynthesis. What gas is taken in during this process?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Water vapour'], correct: 1, difficulty: 2, subject: 'Science', level: 3 },
  { question: 'Which group of living things reproduces by spores?', options: ['Flowering plants', 'Fungi and ferns', 'Mammals', 'Reptiles'], correct: 1, difficulty: 2, subject: 'Science', level: 3 },
  { question: 'How many stages are in the life cycle of a cockroach?', options: ['2', '3', '4', '5'], correct: 1, difficulty: 2, subject: 'Science', level: 3 },
  { question: 'Which material is magnetic?', options: ['Aluminum', 'Copper', 'Steel', 'Plastic'], correct: 2, difficulty: 2, subject: 'Science', level: 3 },
  { question: 'What is the main function of plant roots?', options: ['Make food for the plant', 'Absorb water and mineral salts', 'Attract insects', 'Produce seeds'], correct: 1, difficulty: 1, subject: 'Science', level: 3 },
  { question: 'Which animal group has hair or fur and produces milk for its young?', options: ['Amphibians', 'Reptiles', 'Birds', 'Mammals'], correct: 3, difficulty: 1, subject: 'Science', level: 3 },
  { question: 'Which system breaks down food into simple substances for absorption?', options: ['Digestive system', 'Respiratory system', 'Circulatory system', 'Skeletal system'], correct: 0, difficulty: 1, subject: 'Science', level: 3 },
  { question: 'What property allows a object to float on water?', options: ['It is magnetic.', 'It is light for its volume / less dense.', 'It absorbs water.', 'It conducts heat.'], correct: 1, difficulty: 2, subject: 'Science', level: 3 },
  { question: 'Which part of a plant carries water from roots to leaves?', options: ['Leaf blade', 'Flower', 'Stem', 'Stomata'], correct: 2, difficulty: 2, subject: 'Science', level: 3 },
  { question: 'Which animal undergoes a 4-stage life cycle?', options: ['Cockroach', 'Butterfly', 'Frog', 'Chicken'], correct: 1, difficulty: 2, subject: 'Science', level: 3 },
  { question: 'Fungi obtain their nutrients by ___.', options: ['making food in sunlight', 'breaking down dead or decaying matter', 'drinking water', 'hunting small animals'], correct: 1, difficulty: 2, subject: 'Science', level: 3 },

  // ── Science · Primary 4 ──
  { question: 'The water cycle includes evaporation, condensation, and ___.', options: ['photosynthesis', 'precipitation', 'digestion', 'respiration'], correct: 1, difficulty: 2, subject: 'Science', level: 4 },
  { question: 'Which organ pumps blood around the body?', options: ['Lungs', 'Heart', 'Stomach', 'Brain'], correct: 1, difficulty: 1, subject: 'Science', level: 4 },
  { question: 'A circuit needs a power source, wires, and a ___.', options: ['magnet', 'switch or load', 'mirror', 'lens'], correct: 1, difficulty: 2, subject: 'Science', level: 4 },
  { question: 'Which state of matter has a fixed shape and volume?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], correct: 0, difficulty: 1, subject: 'Science', level: 4 },
  { question: 'The digestive system breaks down ___.', options: ['air', 'food', 'light', 'sound'], correct: 1, difficulty: 1, subject: 'Science', level: 4 },
  { question: 'Which energy source is renewable?', options: ['Coal', 'Solar', 'Oil', 'Natural gas'], correct: 1, difficulty: 2, subject: 'Science', level: 4 },
  { question: 'Matter is made up of tiny particles called ___.', options: ['cells', 'atoms', 'organs', 'molecules only'], correct: 1, difficulty: 2, subject: 'Science', level: 4 },
  { question: 'Shadows are formed when light is ___.', options: ['reflected', 'refracted', 'blocked', 'absorbed only'], correct: 2, difficulty: 2, subject: 'Science', level: 4 },
  { question: 'Which body system helps us breathe?', options: ['Circulatory', 'Respiratory', 'Skeletal', 'Muscular'], correct: 1, difficulty: 1, subject: 'Science', level: 4 },
  { question: 'Heat flows from a ___ object to a cooler one.', options: ['cooler', 'hotter', 'smaller', 'lighter'], correct: 1, difficulty: 2, subject: 'Science', level: 4 },
  { question: 'What type of rock is formed from cooled lava?', options: ['Sedimentary', 'Metamorphic', 'Igneous', 'Fossil'], correct: 2, difficulty: 3, subject: 'Science', level: 4 },
  { question: 'A light bulb converts electrical energy into ___ and heat.', options: ['sound', 'light', 'magnetism', 'chemical'], correct: 1, difficulty: 2, subject: 'Science', level: 4 },

  // ── Science · Primary 5 ──
  { question: 'The reproductive part of a flowering plant is the ___.', options: ['root', 'flower', 'stem', 'leaf'], correct: 1, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'Which force pulls objects towards Earth?', options: ['Friction', 'Gravity', 'Magnetism', 'Elasticity'], correct: 1, difficulty: 1, subject: 'Science', level: 5 },
  { question: 'The human body has ___ main types of blood vessels.', options: ['2', '3', '4', '5'], correct: 1, difficulty: 3, subject: 'Science', level: 5 },
  { question: 'Electrical conductors allow ___ to flow through easily.', options: ['water only', 'electric current', 'air', 'light only'], correct: 1, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'Which gas is needed for burning?', options: ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Helium'], correct: 1, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'The water cycle returns water to Earth as ___.', options: ['evaporation', 'rain/snow', 'transpiration only', 'condensation only'], correct: 1, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'A series circuit has ___ path for current.', options: ['one', 'two', 'many', 'no'], correct: 0, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'Which adaptation helps a cactus survive in the desert?', options: ['Broad leaves', 'Thick stem stores water', 'Long roots in water', 'Dark colour'], correct: 1, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'The respiratory system takes in oxygen and removes ___.', options: ['nitrogen', 'carbon dioxide', 'hydrogen', 'helium'], correct: 1, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'Which is a non-renewable resource?', options: ['Wind', 'Solar', 'Coal', 'Hydroelectric'], correct: 2, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'Frictional force acts ___ motion.', options: ['in the direction of', 'against', 'perpendicular to', 'without affecting'], correct: 1, difficulty: 2, subject: 'Science', level: 5 },
  { question: 'The unit of force is the ___.', options: ['joule', 'newton', 'watt', 'metre'], correct: 1, difficulty: 3, subject: 'Science', level: 5 },

  // ── Science · Primary 6 ──
  { question: 'Energy cannot be created or destroyed — this is the law of ___.', options: ['gravity', 'conservation of energy', 'motion', 'friction'], correct: 1, difficulty: 3, subject: 'Science', level: 6 },
  { question: 'Which type of energy is stored in food?', options: ['Kinetic', 'Chemical', 'Nuclear', 'Sound'], correct: 1, difficulty: 2, subject: 'Science', level: 6 },
  { question: 'The force of friction depends on the surfaces and ___.', options: ['colour', 'weight pressing them', 'temperature only', 'shape only'], correct: 1, difficulty: 3, subject: 'Science', level: 6 },
  { question: 'Photosynthesis takes place mainly in the ___.', options: ['roots', 'leaves', 'flowers', 'stem'], correct: 1, difficulty: 2, subject: 'Science', level: 6 },
  { question: 'Which organ system supports and protects the body?', options: ['Muscular', 'Skeletal', 'Digestive', 'Nervous'], correct: 1, difficulty: 1, subject: 'Science', level: 6 },
  { question: 'A parallel circuit has ___ than one path for current.', options: ['less', 'more', 'no', 'exactly zero'], correct: 1, difficulty: 2, subject: 'Science', level: 6 },
  { question: 'The main function of red blood cells is to transport ___.', options: ['food', 'oxygen', 'waste only', 'hormones only'], correct: 1, difficulty: 2, subject: 'Science', level: 6 },
  { question: 'Which energy conversion happens in a solar panel?', options: ['Light → Electrical', 'Electrical → Light', 'Heat → Sound', 'Chemical → Kinetic'], correct: 0, difficulty: 2, subject: 'Science', level: 6 },
  { question: 'Adaptation helps organisms ___.', options: ['become extinct', 'survive in their environment', 'stop growing', 'avoid all predators always'], correct: 1, difficulty: 2, subject: 'Science', level: 6 },
  // ── Adaptations ──
  { question: 'What is an adaptation?', options: ['A feature that makes animals look different', 'A feature or behaviour that helps living things survive', 'A change in weather patterns', 'A type of food animals eat'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Which is a structural adaptation?', options: ['Flying south for winter', 'Sharp teeth for tearing meat', 'Hunting in groups', 'Sleeping during the day'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Which is a behavioural adaptation?', options: ['Thick fur for warmth', 'Gills for breathing underwater', 'Migration to find food', 'Webbed feet for swimming'], correct: 2, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Why do polar bears have thick fur?', options: ['To swim faster', 'To stay warm in the cold Arctic', 'To hide from predators', 'To catch fish'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'How does a camel\'s hump help it survive in the desert?', options: ['Stores water for drinking', 'Stores fat as energy when food is scarce', 'Protects from the sun', 'Helps it run faster'], correct: 1, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Why do fish have gills?', options: ['To swim faster', 'To breathe underwater', 'To see in dark water', 'To protect from predators'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'What adaptation helps a chameleon survive?', options: ['Sharp claws', 'Changing colour to blend in', 'Thick skin', 'Flying ability'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Why do desert plants have thick stems?', options: ['To grow taller', 'To store water', 'To attract insects', 'To absorb more sunlight'], correct: 1, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Which animal has a streamlined body shape for swimming?', options: ['Eagle', 'Dolphin', 'Cactus', 'Polar bear'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Why do some animals migrate?', options: ['To find better weather and food', 'To escape from predators only', 'To find a mate only', 'To sleep more'], correct: 0, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'How does sharp teeth help a lion survive?', options: ['To chew plants', 'To tear meat for eating', 'To climb trees', 'To swim in water'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Why do ducks have webbed feet?', options: ['To walk on land', 'To swim better in water', 'To fly faster', 'To keep warm'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'What would happen if a polar bear had thin fur?', options: ['It would swim faster', 'It would freeze in the cold', 'It would eat more food', 'It would have more babies'], correct: 1, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Which adaptation helps a cactus survive with little water?', options: ['Broad leaves', 'Spines instead of leaves', 'Bright flowers', 'Soft stem'], correct: 1, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Why do owls hunt at night (nocturnal)?', options: ['They cannot see in day', 'Their prey is active at night', 'They sleep during day', 'They are afraid of sun'], correct: 1, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'How does camouflage help animals?', options: ['Makes them move faster', 'Helps them hide from predators or prey', 'Makes them stronger', 'Helps them find water'], correct: 1, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Which animal is adapted to live in water?', options: ['Camel', 'Kangaroo', 'Shark', 'Eagle'], correct: 2, difficulty: 1, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Why do trees in forests grow tall?', options: ['To reach sunlight', 'To get more water', 'To avoid wind', 'To attract birds'], correct: 0, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'What adaptation helps penguins survive in cold?', options: ['Thick layer of fat (blubber)', 'Large ears', 'Thin fur', 'Long legs'], correct: 0, difficulty: 2, subject: 'Science', level: 6, topic: 'Adaptations' },
  { question: 'Which is a contact force?', options: ['Gravity', 'Magnetic force at distance', 'Friction', 'Gravitational pull of Earth'], correct: 2, difficulty: 3, subject: 'Science', level: 6 },
  { question: 'The circulatory system transports blood, nutrients, and ___.', options: ['light', 'oxygen', 'sound', 'magnetism'], correct: 1, difficulty: 2, subject: 'Science', level: 6 },
  { question: 'Global warming is mainly linked to increased ___.', options: ['oxygen', 'greenhouse gases', 'nitrogen', 'helium'], correct: 1, difficulty: 3, subject: 'Science', level: 6 },

  // ── Mother Tongue (Chinese) · Primary 1 ──
  { question: '"一" means ___.', options: ['two', 'one', 'three', 'ten'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"水" means ___.', options: ['fire', 'water', 'wood', 'gold'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"大" means ___.', options: ['small', 'big', 'tall', 'short'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"人" means ___.', options: ['person', 'door', 'mouth', 'hand'], correct: 0, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"口" means ___.', options: ['eye', 'ear', 'mouth', 'nose'], correct: 2, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"山" means ___.', options: ['river', 'mountain', 'field', 'sky'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"天" means ___.', options: ['earth', 'sky/heaven', 'sun', 'moon'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"火" means ___.', options: ['water', 'fire', 'stone', 'wind'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"木" means ___.', options: ['metal', 'wood', 'water', 'fire'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"上" means ___.', options: ['below', 'above/up', 'left', 'right'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"下" means ___.', options: ['up', 'down/below', 'middle', 'outside'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },
  { question: '"好" means ___.', options: ['bad', 'good', 'many', 'few'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 1 },

  // ── Mother Tongue · Primary 2 ──
  { question: '"学校" means ___.', options: ['home', 'school', 'market', 'hospital'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"朋友" means ___.', options: ['teacher', 'friend', 'family', 'classmate only'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"谢谢" means ___.', options: ['hello', 'goodbye', 'thank you', 'sorry'], correct: 2, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"吃饭" means ___.', options: ['drink water', 'eat a meal', 'go to sleep', 'read books'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"今天" means ___.', options: ['yesterday', 'today', 'tomorrow', 'weekend'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"爸爸" means ___.', options: ['mother', 'father', 'brother', 'sister'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"妈妈" means ___.', options: ['father', 'mother', 'aunt', 'grandmother'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"看书" means ___.', options: ['watch TV', 'read books', 'play games', 'write homework only'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 2 },
  { question: '"天气" means ___.', options: ['season', 'weather', 'temperature only', 'climate only'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 2 },
  { question: '"高兴" means ___.', options: ['sad', 'happy', 'angry', 'tired'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 2 },
  { question: '"名字" means ___.', options: ['age', 'name', 'address', 'birthday'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },
  { question: '"学生" means ___.', options: ['teacher', 'student', 'doctor', 'driver'], correct: 1, difficulty: 1, subject: 'Mother Tongue', level: 2 },

  // ── Mother Tongue · Primary 3 ──
  { question: '"因为…所以…" is used to show ___.', options: ['contrast', 'cause and effect', 'question', 'command'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"虽然…但是…" shows ___.', options: ['similarity', 'contrast', 'time order', 'location'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"环境" means ___.', options: ['environment', 'equipment', 'experiment', 'entertainment'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"健康" means ___.', options: ['wealth', 'health', 'happiness', 'knowledge'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"努力" means ___.', options: ['lazy', 'hardworking/diligent', 'careless', 'proud'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"帮助" means ___.', options: ['help', 'harm', 'hide', 'hurry'], correct: 0, difficulty: 1, subject: 'Mother Tongue', level: 3 },
  { question: '"文化" means ___.', options: ['culture', 'science', 'history only', 'language only'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"节日" means ___.', options: ['weekday', 'festival/holiday', 'season', 'weekend'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"习惯" means ___.', options: ['hobby', 'habit', 'holiday', 'hope'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"认真" means ___.', options: ['careless', 'serious/conscientious', 'lazy', 'noisy'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"保护" means ___.', options: ['protect', 'pollute', 'destroy', 'ignore'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 3 },
  { question: '"进步" means ___.', options: ['progress', 'problem', 'process', 'promise'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 3 },

  // ── Mother Tongue · Primary 4 ──
  { question: '"不仅…而且…" emphasises ___.', options: ['one thing only', 'two related points', 'opposite ideas', 'time sequence'], correct: 1, difficulty: 3, subject: 'Mother Tongue', level: 4 },
  { question: '"传统" means ___.', options: ['tradition', 'transport', 'translation', 'transaction'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"责任" means ___.', options: ['freedom', 'responsibility', 'reason', 'resource'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"经验" means ___.', options: ['experiment', 'experience', 'explanation', 'expression'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"影响" means ___.', options: ['influence/affect', 'insect', 'inside', 'instead'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"发展" means ___.', options: ['development', 'department', 'delivery', 'decision'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"机会" means ___.', options: ['office', 'opportunity', 'operation', 'opinion'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"讨论" means ___.', options: ['discuss', 'disturb', 'distribute', 'discount'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"态度" means ___.', options: ['altitude', 'attitude', 'attribute', 'attempt'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"坚持" means ___.', options: ['give up', 'persist/persevere', 'forget', 'avoid'], correct: 1, difficulty: 2, subject: 'Mother Tongue', level: 4 },
  { question: '"成功" means ___.', options: ['success', 'failure', 'process', 'progress'], correct: 0, difficulty: 1, subject: 'Mother Tongue', level: 4 },
  { question: '"困难" means ___.', options: ['difficulty', 'difference', 'different', 'differently'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 4 },

  // ── Mother Tongue · Primary 5 ──
  { question: '"成语" refers to ___.', options: ['a single character', 'a fixed idiomatic expression', 'a grammar rule', 'a poem only'], correct: 1, difficulty: 3, subject: 'Mother Tongue', level: 5 },
  { question: '"矛盾" means ___.', options: ['agreement', 'contradiction', 'connection', 'collection'], correct: 1, difficulty: 3, subject: 'Mother Tongue', level: 5 },
  { question: '"社会" means ___.', options: ['society', 'science', 'season', 'section'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 5 },
  { question: '"经济" means ___.', options: ['economy', 'ecology', 'education', 'emotion'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 5 },
  { question: '"创新" means ___.', options: ['innovation', 'invitation', 'investigation', 'information'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 5 },
  { question: '"尊重" means ___.', options: ['respect', 'reject', 'reduce', 'replace'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 5 },
  { question: '"沟通" means ___.', options: ['communicate', 'complicate', 'compete', 'complete'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 5 },
  { question: '"挑战" means ___.', options: ['challenge', 'change', 'chance', 'channel'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 5 },
  { question: '"价值" means ___.', options: ['value', 'volume', 'village', 'variety'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 5 },
  { question: '"贡献" means ___.', options: ['contribution', 'contamination', 'contest', 'content'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 5 },
  { question: '"团结" means ___.', options: ['unity', 'unit', 'uniform', 'unique'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 5 },
  { question: '"素质" in education context means ___.', options: ['quality/character', 'quantity', 'quarrel', 'quest'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 5 },

  // ── Mother Tongue · Primary 6 ──
  { question: '"修辞" refers to ___.', options: ['grammar rules only', 'literary devices/rhetoric', 'spelling', 'handwriting'], correct: 1, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"寓意" means ___.', options: ['moral/implied meaning', 'grammar', 'pronunciation', 'stroke order'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"概括" means ___.', options: ['summarise', 'expand', 'copy', 'ignore'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 6 },
  { question: '"论证" means ___.', options: ['argumentation/proof', 'announcement', 'entertainment', 'description only'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"传承" means ___.', options: ['pass down/preserve heritage', 'destroy', 'forget', 'replace'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"全球化" means ___.', options: ['globalisation', 'localisation', 'isolation', 'urbanisation only'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"批判性思维" means ___.', options: ['critical thinking', 'creative writing only', 'memorisation', 'copying'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"语境" means ___.', options: ['context', 'content', 'contact', 'conflict'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 6 },
  { question: '"表达" means ___.', options: ['express', 'explain only', 'expand', 'explore'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 6 },
  { question: '"深化" means ___.', options: ['deepen', 'delay', 'delete', 'deliver'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"多元文化" means ___.', options: ['multicultural', 'monoculture', 'agriculture', 'architecture'], correct: 0, difficulty: 3, subject: 'Mother Tongue', level: 6 },
  { question: '"综合" means ___.', options: ['comprehensive/integrate', 'compete', 'complain', 'complete only'], correct: 0, difficulty: 2, subject: 'Mother Tongue', level: 6 },
];

// ----- Game State -----
const state = {
  score: 0,
  coins: 0,
  correctCount: 0,
  currentIndex: 0,
  gameQuestions: [],
  totalQuestionsThisGame: QUESTIONS_PER_GAME,
  answered: false,
  doubleActive: false,
  coinsEarnedThisGame: 0,
  previousScreen: 'start',
  selectedSubject: null,
  selectedLevel: null,
  selectedTopic: 'all',
  gameMode: 'classic',       // 'classic', 'boss', 'evolution', or 'pizza'
  // Evolution mode state (only active when gameMode === 'evolution')
  evolutionForm: 'base',
  evolutionPath: ['🐾 Small Animal'],
  evolutionStage: 0,
  evolutionCorrectCount: 0,  // Correct answers since last evolution
  evolutionFinalForm: false,
  // Boss battle state
  playerHp: 100,
  playerMaxHp: 100,
  bossHp: 0,
  bossMaxHp: 0,
  bossPhase: 1,
  correctStreak: 0,
  battleEnded: false,
  questionsAnswered: 0,
  currentBossQuestion: null,
  // AI Adaptive Teacher & Mastery Tracking
  conceptStats: {},
  consecutiveErrors: 0,
};

// Battle Pass State
let battlePassState = {
  xp: 0,
  level: 1,
  premiumUnlocked: false,
  claimedRewards: [], // Array of level numbers
};

let previousLevel = 1;

// Slot Machine State
let slotMachineState = {
  lastSpinDate: null,
};

// Persistent inventory (survives between games)
let inventory = { double: 0, skip: 0 };

// Persistent Avatar State
let avatarInventory = {
  bases: ['human'],
  faces: ['smile'],
  accessories: ['none']
};

let avatarEquipped = {
  base: 'human',
  face: 'smile',
  accessory: 'none'
};

let currentCustomTab = 'bases';

// ----- DOM References -----
const screens = {
  start:        document.getElementById('start-screen'),
  subject:      document.getElementById('subject-screen'),
  level:        document.getElementById('level-screen'),
  topic:        document.getElementById('topic-screen'),
  evolution:    document.getElementById('evolution-screen'),
  question:     document.getElementById('question-screen'),
  end:          document.getElementById('end-screen'),
  shop:         document.getElementById('shop-screen'),
  settings:     document.getElementById('settings-screen'),
  pizza:        document.getElementById('pizza-screen'),
  avatarCustom: document.getElementById('avatar-custom-screen'),
  battlepass:   document.getElementById('battlepass-screen'),
  slots:        document.getElementById('slots-screen'),
};

const els = {
  appContainer:          document.querySelector('.app'),
  highScoreDisplay:      document.getElementById('high-score-display'),
  coinsStart:            document.getElementById('coins-display-start'),
  coinsGame:             document.getElementById('coins-display-game'),
  scoreDisplay:          document.getElementById('score-display'),
  progressDisplay:       document.getElementById('progress-display'),
  topicDisplay:          document.getElementById('topic-display'),
  progressFill:          document.getElementById('progress-fill'),
  questionText:          document.getElementById('question-text'),
  optionsGrid:           document.getElementById('options-grid'),
  feedbackText:          document.getElementById('feedback-text'),
  questionContainer:     document.getElementById('question-container'),
  doubleCount:           document.getElementById('double-count'),
  skipCount:             document.getElementById('skip-count'),
  useDoubleBtn:          document.getElementById('use-double-btn'),
  useSkipBtn:            document.getElementById('use-skip-btn'),
  toggleCalcBtn:         document.getElementById('toggle-calc-btn'),
  finalScore:            document.getElementById('final-score'),
  finalCorrect:          document.getElementById('final-correct'),
  finalCoins:            document.getElementById('final-coins'),
  newHighScore:          document.getElementById('new-high-score'),
  endTopicLabel:         document.getElementById('end-topic-label'),
  shopCoins:             document.getElementById('shop-coins'),
  invDouble:             document.getElementById('inv-double'),
  invSkip:               document.getElementById('inv-skip'),
  levelGrid:             document.getElementById('level-grid'),
  levelSubjectLabel:     document.getElementById('level-subject-label'),
  levelError:            document.getElementById('level-error'),
  topicGrid:             document.getElementById('topic-grid'),
  topicLevelLabel:       document.getElementById('topic-level-label'),
  topicError:            document.getElementById('topic-error'),
  topicBackBtn:          document.getElementById('topic-back-btn'),
  changeSubjectBtn:      document.getElementById('change-subject-btn'),
  // Boss battle elements
  battleCard:            document.getElementById('battle-card'),
  bossArena:             document.getElementById('boss-arena'),
  bossAvatar:            document.getElementById('boss-avatar'),
  bossName:              document.getElementById('boss-name'),
  bossPhaseLabel:        document.getElementById('boss-phase-label'),
  bossHpFill:            document.getElementById('boss-hp-fill'),
  bossHpText:            document.getElementById('boss-hp-text'),
  playerHpFill:          document.getElementById('player-hp-fill'),
  playerHpText:          document.getElementById('player-hp-text'),
  playerHealthRow:       document.getElementById('player-health-row'),
  floatingContainer:     document.getElementById('floating-text-container'),
  classicProgress:       document.getElementById('classic-progress'),
  endTitle:              document.getElementById('end-title'),
  endScoreRow:           document.getElementById('end-score-row'),
  endCorrectRow:         document.getElementById('end-correct-row'),
  endBossRow:            document.getElementById('end-boss-row'),
  finalBossResult:       document.getElementById('final-boss-result'),
  // Calculator elements
  calcWidget:            document.getElementById('calculator-widget'),
  calcCloseBtn:          document.getElementById('calc-close-btn'),
  calcDisplay:           document.getElementById('calc-display'),
  calcEquation:          document.getElementById('calc-equation'),
  // AI Teacher elements
  aiTeacherBox:          document.getElementById('ai-teacher-box'),
  aiTeacherTag:          document.getElementById('ai-teacher-tag'),
  aiExplanation:         document.getElementById('ai-explanation'),
  aiSteps:               document.getElementById('ai-steps'),
  aiTip:                 document.getElementById('ai-tip'),
  // AI Learning Report elements
  aiLearningReport:      document.getElementById('ai-learning-report'),
  aiReportSummary:       document.getElementById('ai-report-summary'),
  aiMasteryList:         document.getElementById('ai-mastery-list'),
  aiAdviceBox:           document.getElementById('ai-advice-box'),
  // Evolution mode elements
  evolutionScreen:       document.getElementById('evolution-screen'),
  evolutionGrid:         document.getElementById('evolution-grid'),
  evolutionFormLabel:    document.getElementById('evolution-form-label'),
  evolutionMessage:      document.getElementById('evolution-message'),
  evolutionContinueBtn:  document.getElementById('evolution-continue-btn'),
  evolutionFormHud:      document.getElementById('evolution-form-hud'),
  evolutionFormDisplay:  document.getElementById('evolution-form-display'),
  evolutionPathBanner:   document.getElementById('evolution-path-banner'),
  evolutionPathDisplay:  document.getElementById('evolution-path-display'),
  // Mode selection modal
  modeSelectModal:       document.getElementById('mode-select-modal'),
  normalQuizModeBtn:     document.getElementById('normal-quiz-mode-btn'),
  evolutionModeStartBtn: document.getElementById('evolution-mode-start-btn'),
  modeSelectCancelBtn:   document.getElementById('mode-select-cancel-btn'),
  // Settings elements
  settingsBtn:           document.getElementById('settings-btn'),
  settingsBackBtn:       document.getElementById('settings-back-btn'),
  // Fractions & Pizza Mode elements
  fractionsModeModal:    document.getElementById('fractions-mode-modal'),
  fractionsQuizModeBtn:  document.getElementById('fractions-quiz-mode-btn'),
  pizzaModeStartBtn:     document.getElementById('pizza-mode-start-btn'),
  fractionsModeCancelBtn: document.getElementById('fractions-mode-cancel-btn'),
  pizzaScoreDisplay:     document.getElementById('pizza-score-display'),
  pizzaProgressDisplay:  document.getElementById('pizza-progress-display'),
  pizzaCoinsDisplay:     document.getElementById('pizza-coins-display'),
  pizzaProgressFill:     document.getElementById('pizza-progress-fill'),
  pizzaCustomerAvatar:   document.getElementById('pizza-customer-avatar'),
  pizzaCustomerName:     document.getElementById('pizza-customer-name'),
  pizzaOrderText:        document.getElementById('pizza-order-text'),
  pizzaOrderSubtext:     document.getElementById('pizza-order-subtext'),
  pizzaContainer:        document.getElementById('pizza-container'),
  pizzaCoinPop:          document.getElementById('pizza-coin-pop'),
  pizzaClearBtn:         document.getElementById('pizza-clear-btn'),
  pizzaServeBtn:         document.getElementById('pizza-serve-btn'),
  pizzaFeedbackBox:      document.getElementById('pizza-feedback-box'),
  pizzaReactionAvatar:   document.getElementById('pizza-reaction-avatar'),
  pizzaReactionText:     document.getElementById('pizza-reaction-text'),
  pizzaSolutionBox:      document.getElementById('pizza-solution-box'),
  pizzaNextBtn:          document.getElementById('pizza-next-btn'),
  // Battle Pass elements
  battlepassBtnStart:    document.getElementById('battlepass-btn-start'),
  battlepassBackBtn:     document.getElementById('battlepass-back-btn'),
  bpLevelDisplay:        document.getElementById('bp-level-display'),
  bpXpCurrent:           document.getElementById('bp-xp-current'),
  bpXpNeeded:            document.getElementById('bp-xp-needed'),
  bpXpFill:              document.getElementById('bp-xp-fill'),
  unlockPremiumBtn:      document.getElementById('unlock-premium-btn'),
  bpLevelsContainer:     document.getElementById('bp-levels-container'),
  // Slot Machine elements
  slotsBtnStart:         document.getElementById('slots-btn-start'),
  slotsBackBtn:          document.getElementById('slots-back-btn'),
  spinStatusText:        document.getElementById('spin-status-text'),
  spinTimer:             document.getElementById('spin-timer'),
  spinBtn:               document.getElementById('spin-btn'),
  slot1:                 document.getElementById('slot-1'),
  slot2:                 document.getElementById('slot-2'),
  slot3:                 document.getElementById('slot-3'),
  slotResult:            document.getElementById('slot-result'),
  slotResultText:        document.getElementById('slot-result-text'),
  // Avatar & Crate UI elements
  startAvatarContainer:  document.getElementById('start-avatar-container'),
  avatarCustomBtnStart:  document.getElementById('avatar-custom-btn-start'),
  hudAvatarContainer:    document.getElementById('hud-avatar-container'),
  endAvatarContainer:    document.getElementById('end-avatar-container'),
  shopTabPowerups:       document.getElementById('shop-tab-powerups'),
  shopTabCrates:         document.getElementById('shop-tab-crates'),
  powerupsSection:       document.getElementById('powerups-section'),
  cratesSection:         document.getElementById('crates-section'),
  avatarCustomBtnShop:   document.getElementById('avatar-custom-btn-shop'),
  customAvatarPreview:   document.getElementById('custom-avatar-preview'),
  customAvatarName:      document.getElementById('custom-avatar-name'),
  customAvatarStats:     document.getElementById('custom-avatar-stats'),
  avatarItemsGrid:       document.getElementById('avatar-items-grid'),
  avatarCustomBackBtn:   document.getElementById('avatar-custom-back-btn'),
  openCratesBtnCustom:   document.getElementById('open-crates-btn-custom'),
  crateModal:            document.getElementById('crate-modal'),
  crateModalTitle:       document.getElementById('crate-modal-title'),
  crateSpinnerBox:       document.getElementById('crate-spinner-box'),
  crateSpinnerIcon:      document.getElementById('crate-spinner-icon'),
  crateRevealCard:       document.getElementById('crate-reveal-card'),
  crateItemGlow:         document.getElementById('crate-item-glow'),
  crateItemIcon:         document.getElementById('crate-item-icon'),
  crateItemName:         document.getElementById('crate-item-name'),
  crateItemRarity:       document.getElementById('crate-item-rarity'),
  crateDuplicateMsg:     document.getElementById('crate-duplicate-msg'),
  crateDuplicateCoins:   document.getElementById('crate-duplicate-coins'),
  crateClaimBtn:         document.getElementById('crate-claim-btn'),
};

// ----- Sound Effects (Web Audio — no external files) -----
const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

function playSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'correct') {
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.setValueAtTime(659, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'incorrect') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'coin') {
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1100, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'powerup') {
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.05);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'evolution') {
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.1);
    osc.frequency.setValueAtTime(659.25, now + 0.2);
    osc.frequency.setValueAtTime(880, now + 0.3);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.start(now);
    osc.stop(now + 0.45);
  }
}

// ----- Persistence (localStorage) -----
function loadPersistentData() {
  state.coins = parseInt(localStorage.getItem(STORAGE_KEYS.coins) || '0', 10);
  const saved = localStorage.getItem(STORAGE_KEYS.inventory);
  if (saved) {
    try { inventory = JSON.parse(saved); } catch { inventory = { double: 0, skip: 0 }; }
  }
  els.highScoreDisplay.textContent = localStorage.getItem(STORAGE_KEYS.highScore) || '0';
  loadAvatarData();
  updateCoinsDisplay();
  updateAllAvatarDisplays();
}

function saveCoins() {
  localStorage.setItem(STORAGE_KEYS.coins, state.coins);
  updateCoinsDisplay();
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
}

function saveHighScore(score) {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0', 10);
  if (score > current) {
    localStorage.setItem(STORAGE_KEYS.highScore, score);
    return true;
  }
  return false;
}

// ----- Avatar & Skin Crates Logic -----

function loadAvatarData() {
  const savedInv = localStorage.getItem(STORAGE_KEYS.avatarInventory);
  if (savedInv) {
    try {
      const parsed = JSON.parse(savedInv);
      if (parsed.bases && parsed.faces && parsed.accessories) {
        avatarInventory = parsed;
      }
    } catch (e) {
      console.error('Error loading avatar inventory', e);
    }
  }
  // Ensure default items exist
  if (!avatarInventory.bases.includes('human')) avatarInventory.bases.push('human');
  if (!avatarInventory.faces.includes('smile')) avatarInventory.faces.push('smile');
  if (!avatarInventory.accessories.includes('none')) avatarInventory.accessories.push('none');

  const savedEq = localStorage.getItem(STORAGE_KEYS.avatarEquipped);
  if (savedEq) {
    try {
      const parsed = JSON.parse(savedEq);
      if (parsed.base && parsed.face && parsed.accessory) {
        avatarEquipped = parsed;
      }
    } catch (e) {
      console.error('Error loading equipped avatar', e);
    }
  }
}

function saveAvatarData() {
  localStorage.setItem(STORAGE_KEYS.avatarInventory, JSON.stringify(avatarInventory));
  localStorage.setItem(STORAGE_KEYS.avatarEquipped, JSON.stringify(avatarEquipped));
  updateAllAvatarDisplays();
}

function getAvatarHtml(equipped = avatarEquipped, sizeClass = 'medium') {
  const baseItem = AVATAR_CATALOG.bases.find(b => b.id === equipped.base) || AVATAR_CATALOG.bases[0];
  const faceItem = AVATAR_CATALOG.faces.find(f => f.id === equipped.face) || AVATAR_CATALOG.faces[0];
  const accItem = AVATAR_CATALOG.accessories.find(a => a.id === equipped.accessory) || AVATAR_CATALOG.accessories[0];

  let html = `<div class="avatar-badge avatar-badge-${sizeClass}">`;
  html += `<span class="avatar-layer avatar-layer-base">${baseItem.icon}</span>`;

  if (faceItem && faceItem.id !== 'smile') {
    html += `<span class="avatar-layer avatar-layer-face">${faceItem.icon}</span>`;
  }

  if (accItem && accItem.id !== 'none') {
    html += `<span class="avatar-layer avatar-layer-accessory">${accItem.icon}</span>`;
  }

  html += `</div>`;
  return html;
}

function updateCoinsDisplay() {
  const coinsText = `🪙 ${state.coins}`;
  if (els.coinsStart) els.coinsStart.textContent = coinsText;
  if (els.coinsGame) els.coinsGame.textContent = coinsText;
  if (els.shopCoins) els.shopCoins.textContent = coinsText;
  if (els.pizzaCoinsDisplay) els.pizzaCoinsDisplay.textContent = coinsText;
}

function updateAllAvatarDisplays() {
  const htmlSmall = getAvatarHtml(avatarEquipped, 'small');
  const htmlMed = getAvatarHtml(avatarEquipped, 'medium');
  const htmlLarge = getAvatarHtml(avatarEquipped, 'large');
  const htmlXl = getAvatarHtml(avatarEquipped, 'xl');

  if (els.startAvatarContainer) els.startAvatarContainer.innerHTML = htmlMed;
  if (els.hudAvatarContainer) els.hudAvatarContainer.innerHTML = htmlSmall;
  if (els.endAvatarContainer) els.endAvatarContainer.innerHTML = htmlLarge;
  if (els.customAvatarPreview) els.customAvatarPreview.innerHTML = htmlXl;

  if (els.customAvatarName) {
    const baseObj = AVATAR_CATALOG.bases.find(b => b.id === avatarEquipped.base);
    const faceObj = AVATAR_CATALOG.faces.find(f => f.id === avatarEquipped.face);
    const accObj = AVATAR_CATALOG.accessories.find(a => a.id === avatarEquipped.accessory);
    
    let nameStr = baseObj ? baseObj.name : 'Hero';
    if (faceObj && faceObj.id !== 'smile') nameStr += ` · ${faceObj.name}`;
    if (accObj && accObj.id !== 'none') nameStr += ` · ${accObj.name}`;
    els.customAvatarName.textContent = nameStr;
  }

  if (els.customAvatarStats) {
    const totalUnlocked = avatarInventory.bases.length + avatarInventory.faces.length + avatarInventory.accessories.length;
    const totalCatalog = AVATAR_CATALOG.bases.length + AVATAR_CATALOG.faces.length + AVATAR_CATALOG.accessories.length;
    els.customAvatarStats.textContent = `Unlocked: ${totalUnlocked} / ${totalCatalog} Parts`;
  }
}

// ----- Avatar Customization UI -----

function openAvatarCustomization() {
  renderAvatarPicker();
  updateAllAvatarDisplays();
  showScreen('avatarCustom');
}

function renderAvatarPicker() {
  if (!els.avatarItemsGrid) return;
  els.avatarItemsGrid.innerHTML = '';

  const category = currentCustomTab; // 'bases', 'faces', or 'accessories'
  const catalogList = AVATAR_CATALOG[category] || [];
  const ownedIds = avatarInventory[category] || [];
  const currentEquippedId = avatarEquipped[category === 'bases' ? 'base' : category === 'faces' ? 'face' : 'accessory'];

  // Update Tab buttons active status
  document.querySelectorAll('.avatar-tab').forEach(tabBtn => {
    tabBtn.classList.toggle('active', tabBtn.dataset.tab === category);
  });

  catalogList.forEach(item => {
    const isOwned = ownedIds.includes(item.id);
    if (!isOwned) return; // Prompt specifies: "Show owned items only"

    const isEquipped = currentEquippedId === item.id;
    const card = document.createElement('div');
    card.className = `avatar-item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''}`;

    card.innerHTML = `
      <span class="avatar-item-icon">${item.icon}</span>
      <span class="avatar-item-name">${item.name}</span>
      ${isEquipped ? '<span class="avatar-equipped-badge">EQUIPPED</span>' : ''}
    `;

    card.addEventListener('click', () => {
      equipAvatarItem(category, item.id);
    });

    els.avatarItemsGrid.appendChild(card);
  });
}

function equipAvatarItem(category, itemId) {
  const slotKey = category === 'bases' ? 'base' : category === 'faces' ? 'face' : 'accessory';
  avatarEquipped[slotKey] = itemId;
  saveAvatarData();
  renderAvatarPicker();
  playSound('coin');
}

// ----- Skin Crates & Opening Logic -----

function openSkinCrate(crateType) {
  const cost = crateType === 'rare' ? 300 : 100;
  if (state.coins < cost) {
    playSound('incorrect');
    alert(`You need ${cost} coins to open a ${crateType === 'rare' ? 'Rare' : 'Basic'} Crate!`);
    return;
  }

  // Deduct coins
  state.coins -= cost;
  saveCoins();
  updateCoinsDisplay();

  // Determine rarity
  const roll = Math.random();
  let selectedRarity = 'common';
  if (crateType === 'basic') {
    if (roll > 0.90) selectedRarity = 'epic';
    else if (roll > 0.60) selectedRarity = 'rare';
    else selectedRarity = 'common';
  } else {
    // Rare Crate
    if (roll > 0.80) selectedRarity = 'epic';
    else if (roll > 0.30) selectedRarity = 'rare';
    else selectedRarity = 'common';
  }

  // Pool all items matching rarity (excluding 'none')
  const candidateItems = [];
  ['bases', 'faces', 'accessories'].forEach(cat => {
    AVATAR_CATALOG[cat].forEach(item => {
      if (item.id !== 'none' && item.rarity === selectedRarity) {
        candidateItems.push({ ...item, categoryKey: cat });
      }
    });
  });

  // Fallback to any non-none item if candidate is empty
  let rewardedItem = candidateItems[Math.floor(Math.random() * candidateItems.length)];
  if (!rewardedItem) {
    const fallbackList = AVATAR_CATALOG.bases.slice(1);
    rewardedItem = { ...fallbackList[0], categoryKey: 'bases' };
  }

  // Check if duplicate
  const ownedArray = avatarInventory[rewardedItem.categoryKey] || [];
  const isDuplicate = ownedArray.includes(rewardedItem.id);

  if (isDuplicate) {
    // Convert to coins
    const coinBonus = rewardedItem.duplicateCoins || 20;
    state.coins += coinBonus;
    saveCoins();
    updateCoinsDisplay();
  } else {
    // Add to inventory
    avatarInventory[rewardedItem.categoryKey].push(rewardedItem.id);
    saveAvatarData();
  }

  // Setup Crate Modal UI
  if (!els.crateModal) return;
  els.crateModalTitle.textContent = `Opening ${crateType === 'rare' ? 'Rare' : 'Basic'} Crate...`;
  els.crateSpinnerBox.hidden = false;
  els.crateRevealCard.hidden = true;
  els.crateClaimBtn.hidden = true;
  els.crateModal.hidden = false;

  playSound('powerup');

  // Animation delay
  setTimeout(() => {
    els.crateSpinnerBox.hidden = true;
    els.crateRevealCard.hidden = false;
    els.crateClaimBtn.hidden = false;
    els.crateModalTitle.textContent = '🎉 Item Unlocked!';

    els.crateItemIcon.textContent = rewardedItem.icon;
    els.crateItemName.textContent = rewardedItem.name;
    els.crateItemRarity.textContent = rewardedItem.rarity.toUpperCase();
    els.crateItemRarity.className = `crate-item-rarity-badge rarity-${rewardedItem.rarity}`;
    els.crateItemGlow.className = `crate-item-glow rarity-${rewardedItem.rarity}`;

    if (isDuplicate) {
      els.crateDuplicateMsg.hidden = false;
      if (els.crateDuplicateCoins) els.crateDuplicateCoins.textContent = `+${rewardedItem.duplicateCoins || 20} 🪙 converted`;
    } else {
      els.crateDuplicateMsg.hidden = true;
    }

    playSound('evolution');
  }, 1600);
}

// ----- Screen Navigation -----
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ----- Subject & Level Selection (MOE flow) -----

function goToSubjectSelect() {
  // Reset game mode so a previous Evolution session doesn't carry over
  state.gameMode = 'classic';
  showScreen('subject');
}

function selectSubject(subject) {
  state.selectedSubject = subject;
  els.levelSubjectLabel.textContent = subject;
  els.levelError.hidden = true;
  renderLevelButtons();
  showScreen('level');
}

// Build level buttons — Science only shows Primary 3–6
function renderLevelButtons() {
  const config = SUBJECT_CONFIG[state.selectedSubject];
  els.levelGrid.innerHTML = '';

  for (let lvl = config.minLevel; lvl <= config.maxLevel; lvl++) {
    const btn = document.createElement('button');
    btn.className = 'select-btn';
    btn.innerHTML = `
      <span class="select-icon">P${lvl}</span>
      <span class="select-label">Primary ${lvl}</span>
    `;
    btn.addEventListener('click', () => selectLevel(lvl));
    els.levelGrid.appendChild(btn);
  }
}

function selectLevel(level) {
  state.selectedLevel = level;
  els.topicLevelLabel.textContent = `${state.selectedSubject} · Primary ${level}`;
  els.topicError.hidden = true;
  renderTopicButtons();
  showScreen('topic');
}

// ----- Evolution Mode Functions -----

function startEvolutionMode() {
  state.gameMode = 'evolution';
  state.evolutionForm = 'base';
  state.evolutionStage = 0;
  state.evolutionCorrectCount = 0;
  state.evolutionFinalForm = false;
  goToSubjectSelect();
}

function showEvolutionChoice() {
  const currentForm = EVOLUTIONS[state.evolutionForm];
  if (!currentForm || currentForm.final) {
    // Already at final form, continue to next question
    scheduleNextQuestion(false);
    return;
  }

  els.evolutionFormLabel.textContent = `Current Form: ${currentForm.emoji} ${currentForm.name}`;
  els.evolutionMessage.textContent = 'Correct! Choose an adaptation to evolve:';
  els.evolutionGrid.innerHTML = '';
  els.evolutionContinueBtn.hidden = true;

  currentForm.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'select-btn';
    btn.innerHTML = `
      <span class="select-icon">${choice.emoji}</span>
      <span class="select-label">${choice.name}</span>
      <span class="select-note">${choice.description}</span>
    `;
    btn.addEventListener('click', () => selectEvolution(choice));
    els.evolutionGrid.appendChild(btn);
  });

  // Ensure question container is visible/reset before switching screen
  if (els.questionContainer) {
    els.questionContainer.classList.remove('slide-out-left');
    els.questionContainer.classList.remove('slide-in-right');
  }

  showScreen('evolution');
}

function selectEvolution(choice) {
  state.evolutionForm = choice.id;
  state.evolutionStage++;
  state.evolutionCorrectCount = 0;  // Reset counter after evolution

  const newForm = EVOLUTIONS[choice.id];
  state.evolutionPath.push(`${newForm.emoji} ${newForm.name}`);

  if (newForm.final) {
    state.evolutionFinalForm = true;
  }

  // Show evolution result with animation
  els.evolutionFormLabel.textContent = `Current Form: ${newForm.emoji} ${newForm.name}`;
  els.evolutionMessage.textContent = `You evolved into: ${newForm.emoji} ${newForm.name}! 🧬`;
  els.evolutionMessage.classList.remove('evolution-pop');
  void els.evolutionMessage.offsetWidth;
  els.evolutionMessage.classList.add('evolution-pop');
  els.evolutionGrid.innerHTML = '';
  els.evolutionContinueBtn.hidden = false;

  playSound('evolution');
}

function updateEvolutionDisplay() {
  // Always hide evolution UI if not in evolution mode
  if (state.gameMode !== 'evolution') {
    if (els.evolutionFormHud) els.evolutionFormHud.hidden = true;
    if (els.evolutionPathBanner) els.evolutionPathBanner.hidden = true;
    return;
  }

  const currentForm = EVOLUTIONS[state.evolutionForm];
  if (currentForm) {
    els.evolutionFormDisplay.textContent = `${currentForm.emoji} ${currentForm.name}`;
    els.evolutionFormHud.hidden = false;
  }
  if (els.evolutionPathBanner && els.evolutionPathDisplay) {
    els.evolutionPathDisplay.textContent = state.evolutionPath.join(' → ');
    els.evolutionPathBanner.hidden = false;
  }
}

function goToTopicSelect() {
  state.selectedTopic = 'all';
  els.topicLevelLabel.textContent = `${state.selectedSubject} · Primary ${state.selectedLevel}`;
  if (els.topicError) els.topicError.hidden = true;
  // Ensure modal is hidden when entering topic screen
  if (els.modeSelectModal) {
    els.modeSelectModal.hidden = true;
  }
  renderTopicButtons();
  showScreen('topic');
}

function renderTopicButtons() {
  const topics = SUBJECT_TOPICS[state.selectedSubject]?.[state.selectedLevel] || [];
  els.topicGrid.innerHTML = '';

  // Option 1: All Topics (Full Revision)
  const allBtn = document.createElement('button');
  allBtn.className = 'select-btn';
  allBtn.innerHTML = `
    <span class="select-icon">🌟</span>
    <span class="select-label">All Topics</span>
    <span class="select-note">Full syllabus revision</span>
  `;
  allBtn.addEventListener('click', () => selectTopic('all'));
  els.topicGrid.appendChild(allBtn);

  // Individual Topics
  topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'select-btn';

    let extraBadge = '';
    // Yellow label ONLY for Science P6 Adaptations topic
    if (state.selectedSubject === 'Science' && state.selectedLevel === 6 && topic === 'Adaptations') {
      extraBadge = `<span class="evolution-badge-label">NEWLY IMPROVED — Evolution Game Mode 🧬</span>`;
    } else if (topic.toLowerCase().includes('fraction')) {
      extraBadge = `<span class="evolution-badge-label">NEW — Pizza Shop Mode 🍕</span>`;
    }

    btn.innerHTML = `
      <span class="select-icon">📚</span>
      <span class="select-label">${topic}</span>
      ${extraBadge}
      <span class="select-note">Targeted revision</span>
    `;
    btn.addEventListener('click', () => selectTopic(topic));
    els.topicGrid.appendChild(btn);
  });
}

function selectTopic(topic) {
  state.selectedTopic = topic;
  if (els.topicError) els.topicError.hidden = true;

  // CORE RULE: Mode choice modal ONLY for Science P6 Adaptations
  if (state.selectedSubject === 'Science' && state.selectedLevel === 6 && topic === 'Adaptations') {
    if (els.modeSelectModal) {
      els.modeSelectModal.hidden = false;
      return;
    }
  }

  // Pizza Shop Mode choice modal for Fractions topics
  if (topic.toLowerCase().includes('fraction')) {
    if (els.fractionsModeModal) {
      els.fractionsModeModal.hidden = false;
      return;
    }
  }

  // For all other topics: force classic/boss mode, never evolution or pizza
  state.gameMode = topic === 'all' ? 'boss' : 'classic';

  // Ensure modals are hidden for non-modal topics
  if (els.modeSelectModal) {
    els.modeSelectModal.hidden = true;
  }
  if (els.fractionsModeModal) {
    els.fractionsModeModal.hidden = true;
  }

  const pool = getFilteredQuestions();
  if (state.selectedSubject !== 'Mathematics' && pool.length === 0) {
    if (els.topicError) {
      els.topicError.textContent = `No questions available for ${topic} yet.`;
      els.topicError.hidden = false;
    }
    playSound('incorrect');
    return;
  }

  startGame();
}

function getTopicLabel() {
  const short = SUBJECT_CONFIG[state.selectedSubject]?.short || state.selectedSubject;
  const topicName = state.selectedTopic && state.selectedTopic !== 'all' ? state.selectedTopic : 'All Topics';
  return `P${state.selectedLevel} ${short} · ${topicName}`;
}

// ----- Side Calculator Module -----
let calcState = {
  display: '0',
  equation: '',
  evaluated: false
};

function updateCalcUI() {
  if (els.calcDisplay) els.calcDisplay.textContent = calcState.display;
  if (els.calcEquation) els.calcEquation.textContent = calcState.equation;
}

function handleCalcInput(action, value) {
  if (action === 'num') {
    if (calcState.evaluated) {
      calcState.display = value === '.' ? '0.' : value;
      calcState.equation = '';
      calcState.evaluated = false;
    } else {
      if (value === '.') {
        if (!calcState.display.includes('.')) {
          calcState.display += '.';
        }
      } else {
        if (calcState.display === '0') {
          calcState.display = value;
        } else {
          calcState.display += value;
        }
      }
    }
  } else if (action === 'op') {
    calcState.evaluated = false;
    calcState.equation = `${calcState.display} ${value} `;
    calcState.display = '0';
  } else if (action === 'clear') {
    calcState.display = '0';
    calcState.equation = '';
    calcState.evaluated = false;
  } else if (action === 'delete') {
    if (!calcState.evaluated && calcState.display.length > 1) {
      calcState.display = calcState.display.slice(0, -1);
    } else {
      calcState.display = '0';
    }
  } else if (action === 'equals') {
    if (!calcState.equation) return;
    const fullExpr = calcState.equation + calcState.display;
    try {
      const tokens = fullExpr.split(' ').filter(Boolean);
      let result = parseFloat(tokens[0]);
      for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i];
        const nextVal = parseFloat(tokens[i + 1]);
        if (isNaN(nextVal)) continue;
        if (op === '+') result += nextVal;
        else if (op === '-') result -= nextVal;
        else if (op === '*') result *= nextVal;
        else if (op === '/') result = nextVal !== 0 ? result / nextVal : 0;
      }
      calcState.equation = `${fullExpr} =`;
      calcState.display = Number.isInteger(result) ? result.toString() : result.toFixed(2).replace(/\.?0+$/, '');
      calcState.evaluated = true;
    } catch {
      calcState.display = 'Error';
      calcState.evaluated = true;
    }
  }
  updateCalcUI();
}

function toggleCalculator(forceShow) {
  if (!els.calcWidget) return;
  const isHidden = els.calcWidget.hidden;
  const show = forceShow !== undefined ? forceShow : isHidden;
  els.calcWidget.hidden = !show;
  if (show) {
    els.appContainer.classList.add('calc-active');
  } else {
    els.appContainer.classList.remove('calc-active');
  }
}

// ----- Procedural AI Math Question Generator (Singapore MOE Primary Syllabus) -----
function generateAiMathQuestion(level, difficulty) {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let questionText = '';
  let correctVal = 0;
  let unit = '';
  let concept = 'General Math';
  let steps = [];
  let tip = '';

  if (level === 1) {
    if (Math.random() < 0.5) {
      const a = randInt(2, 10);
      const b = randInt(2, 10);
      correctVal = a + b;
      concept = 'Addition';
      questionText = `What is ${a} + ${b}?`;
      steps = [`Start with ${a}`, `Count up ${b} more: ${a} + ${b} = ${correctVal}`];
      tip = '💡 Use your fingers or number bonds to count up!';
    } else {
      const a = randInt(6, 18);
      const b = randInt(2, a - 1);
      correctVal = a - b;
      concept = 'Subtraction';
      questionText = `What is ${a} − ${b}?`;
      steps = [`Start at ${a}`, `Take away ${b}: ${a} − ${b} = ${correctVal}`];
      tip = '💡 Subtraction means taking away or counting backwards!';
    }
  } else if (level === 2) {
    const mode = pickRandom(['mult', 'money', 'frac']);
    if (mode === 'mult') {
      const table = pickRandom([2, 3, 4, 5, 10]);
      const multiplier = randInt(2, 9);
      correctVal = table * multiplier;
      concept = 'Multiplication';
      questionText = `What is ${table} × ${multiplier}?`;
      steps = [`${table} × ${multiplier} means ${multiplier} groups of ${table}`, `Skip count by ${table}: ${correctVal}`];
      tip = `💡 Practice your ${table} times table to multiply faster!`;
    } else if (mode === 'money') {
      const coinVal = pickRandom([10, 20, 50]);
      correctVal = 100 / coinVal;
      concept = 'Money';
      questionText = `How many ${coinVal}¢ coins make $1.00 (100 cents)?`;
      steps = [`$1.00 is equal to 100 cents`, `Divide 100 cents by ${coinVal} cents = ${correctVal}`];
      tip = '💡 Remember: 100 cents = $1.00!';
    } else {
      const factor = pickRandom([2, 4]);
      const n = randInt(2, 8) * factor;
      correctVal = n / factor;
      concept = 'Fractions';
      questionText = `What is 1/${factor} of ${n}?`;
      steps = [`To find 1/${factor} of ${n}, divide ${n} into ${factor} equal parts`, `${n} ÷ ${factor} = ${correctVal}`];
      tip = `💡 A fraction 1/${factor} means dividing the total into ${factor} equal parts!`;
    }
  } else if (level === 3) {
    const mode = pickRandom(['table', 'perimeter', 'division']);
    if (mode === 'table') {
      const table = pickRandom([6, 7, 8, 9]);
      const multiplier = randInt(3, 9);
      correctVal = table * multiplier;
      concept = 'Multiplication';
      questionText = `What is ${table} × ${multiplier}?`;
      steps = [`Calculate ${table} groups of ${multiplier}`, `${table} × ${multiplier} = ${correctVal}`];
      tip = `💡 Break it down if needed: e.g. 7×6 is (5×6) + (2×6) = 30 + 12 = 42.`;
    } else if (mode === 'perimeter') {
      const side = randInt(3, 12);
      correctVal = side * 4;
      unit = ' cm';
      concept = 'Perimeter & Area';
      questionText = `What is the perimeter of a square with a side length of ${side} cm?`;
      steps = [`A square has 4 equal sides`, `Perimeter = 4 × ${side} cm = ${correctVal} cm`];
      tip = '💡 Perimeter is the total distance around the outside of a 2D shape!';
    } else {
      const div = randInt(3, 9);
      const mult = randInt(4, 12);
      const dividend = div * mult;
      correctVal = mult;
      concept = 'Division';
      questionText = `What is ${dividend} ÷ ${div}?`;
      steps = [`Think: what number multiplied by ${div} equals ${dividend}?`, `${dividend} ÷ ${div} = ${correctVal}`];
      tip = '💡 Division is the inverse (opposite) of multiplication!';
    }
  } else if (level === 4) {
    const mode = pickRandom(['area', 'decimal', 'factors', 'angles']);
    if (mode === 'area') {
      const l = randInt(4, 12);
      const w = randInt(3, 9);
      correctVal = l * w;
      unit = ' cm²';
      concept = 'Perimeter & Area';
      questionText = `What is the area of a rectangle measuring ${l} cm by ${w} cm?`;
      steps = [`Area of rectangle = Length × Width`, `${l} cm × ${w} cm = ${correctVal} cm²`];
      tip = '💡 Area is Length × Width. Don\'t confuse it with perimeter!';
    } else if (mode === 'decimal') {
      const a = (randInt(10, 50) / 10).toFixed(1);
      const b = (randInt(10, 50) / 10).toFixed(1);
      correctVal = parseFloat((parseFloat(a) + parseFloat(b)).toFixed(1));
      concept = 'Decimals';
      questionText = `What is ${a} + ${b}?`;
      steps = [`Align decimal points: ${a} + ${b} = ${correctVal}`];
      tip = '💡 Always align decimal points vertically before adding or subtracting!';
    } else if (mode === 'angles') {
      const a1 = randInt(30, 80);
      const a2 = randInt(30, 80);
      correctVal = 180 - a1 - a2;
      unit = '°';
      concept = 'Angles';
      questionText = `In a triangle, two angles are ${a1}° and ${a2}°. What is the third angle?`;
      steps = [`Angles in any triangle add up to 180°`, `180° − (${a1}° + ${a2}°) = ${correctVal}°`];
      tip = '💡 Remember: the sum of angles inside any triangle is always 180°!';
    } else {
      const num = pickRandom([12, 18, 20, 24, 30, 36]);
      const factor = pickRandom([2, 3, 4, 6]);
      correctVal = factor;
      concept = 'Factors & Multiples';
      questionText = `Which of the following is a factor of ${num}?`;
      steps = [`A factor divides a number completely with no remainder`, `${num} ÷ ${factor} = ${num / factor}`];
      tip = '💡 Factors are whole numbers you multiply together to get a target number!';
    }
  } else if (level === 5) {
    const mode = pickRandom(['percentage', 'ratio', 'volume', 'tri_area']);
    if (mode === 'percentage') {
      const pct = pickRandom([10, 20, 25, 50]);
      const base = randInt(4, 20) * 20;
      correctVal = (pct / 100) * base;
      concept = 'Percentages';
      questionText = `What is ${pct}% of ${base}?`;
      steps = [`${pct}% = ${pct}/100`, `(${pct}/100) × ${base} = ${correctVal}`];
      tip = `💡 Shortcut: 10% is dividing by 10, 25% is dividing by 4, 50% is dividing by 2!`;
    } else if (mode === 'ratio') {
      const mult = randInt(2, 6);
      const r1 = randInt(2, 5);
      const r2 = randInt(2, 5);
      correctVal = r1 * mult;
      concept = 'Ratios';
      questionText = `The ratio of boys to girls is ${r1} : ${r2}. If there are ${r2 * mult} girls, how many boys are there?`;
      steps = [`${r2} units = ${r2 * mult} girls $\\implies$ 1 unit = ${mult}`, `${r1} units for boys = ${r1} × ${mult} = ${correctVal}`];
      tip = '💡 Find the value of 1 ratio unit first by dividing the known total!';
    } else if (mode === 'volume') {
      const l = randInt(2, 6);
      const w = randInt(2, 5);
      const h = randInt(2, 5);
      correctVal = l * w * h;
      unit = ' cm³';
      concept = 'Volume';
      questionText = `What is the volume of a cuboid measuring ${l} cm by ${w} cm by ${h} cm?`;
      steps = [`Volume of cuboid = Length × Width × Height`, `${l} × ${w} × ${h} = ${correctVal} cm³`];
      tip = '💡 Volume measures 3D space: Length × Width × Height!';
    } else {
      const b = randInt(3, 10) * 2;
      const h = randInt(3, 8);
      correctVal = 0.5 * b * h;
      unit = ' cm²';
      concept = 'Perimeter & Area';
      questionText = `What is the area of a right-angled triangle with base ${b} cm and height ${h} cm?`;
      steps = [`Area of triangle = ½ × base × height`, `½ × ${b} × ${h} = ${correctVal} cm²`];
      tip = '💡 Don\'t forget the ½! Area of triangle is half of base × height!';
    }
  } else {
    // Level 6
    const mode = pickRandom(['speed', 'algebra', 'circle', 'discount']);
    if (mode === 'speed') {
      const t = randInt(2, 5);
      const s = pickRandom([40, 50, 60, 70, 80]);
      const dist = s * t;
      correctVal = s;
      unit = ' km/h';
      concept = 'Speed';
      questionText = `A car travels ${dist} km in ${t} hours. What is its average speed?`;
      steps = [`Speed = Distance ÷ Time`, `${dist} km ÷ ${t} h = ${correctVal} km/h`];
      tip = '💡 Remember the Speed triangle: Speed = Distance ÷ Time!';
    } else if (mode === 'algebra') {
      const a = randInt(2, 5);
      const x = randInt(3, 12);
      const b = randInt(2, 10);
      const total = a * x + b;
      correctVal = x;
      concept = 'Algebra';
      questionText = `Solve for x: ${a}x + ${b} = ${total}`;
      steps = [`Subtract ${b} from both sides: ${a}x = ${total - b}`, `Divide by ${a}: x = ${total - b} ÷ ${a} = ${correctVal}`];
      tip = '💡 Isolate x step-by-step: undo addition/subtraction first, then division!';
    } else if (mode === 'circle') {
      const d = pickRandom([10, 20, 30]);
      correctVal = parseFloat((3.14 * d).toFixed(1));
      unit = ' cm';
      concept = 'Circles';
      questionText = `Using π = 3.14, calculate the circumference of a circle with diameter ${d} cm.`;
      steps = [`Circumference = π × diameter`, `3.14 × ${d} cm = ${correctVal} cm`];
      tip = '💡 Circumference is perimeter of a circle: π × d (or 2 × π × r)!';
    } else {
      const original = randInt(4, 20) * 10;
      const pct = pickRandom([10, 20, 25, 30]);
      correctVal = (pct / 100) * original;
      unit = ' $';
      concept = 'Percentages';
      questionText = `A ${pct}% discount is offered on a $${original} jacket. How much money do you save?`;
      steps = [`Discount Amount = (${pct}/100) × $${original}`, `(${pct}/100) × $${original} = $${correctVal}`];
      tip = '💡 Discount savings = Percentage Discount × Original Price!';
    }
  }

  const correctStr = `${correctVal}${unit}`;
  const distractors = new Set();
  
  const addDistractor = (val) => {
    if (val !== correctVal && val > 0 && !isNaN(val)) {
      distractors.add(`${val}${unit}`);
    }
  };

  addDistractor(correctVal + 2);
  addDistractor(correctVal - 2);
  addDistractor(correctVal * 2);
  addDistractor(Math.max(1, Math.floor(correctVal / 2)));
  addDistractor(correctVal + 10);
  addDistractor(correctVal - 5);

  const optionsArr = [correctStr, ...Array.from(distractors).slice(0, 3)];
  shuffle(optionsArr);
  const correctIdx = optionsArr.indexOf(correctStr);

  return {
    question: questionText,
    options: optionsArr,
    correct: correctIdx,
    difficulty: difficulty || randInt(1, 3),
    subject: 'Mathematics',
    level: level,
    concept: concept,
    steps: steps,
    tip: tip
  };
}

// ----- Adaptive AI Teacher Advice Module -----
function showAiTeacherAdvice(q, chosenIdx) {
  if (!els.aiTeacherBox) return;

  const chosenText = q.options[chosenIdx];
  const correctText = q.options[q.correct];
  const concept = q.concept || 'General Concept';

  els.aiTeacherTag.textContent = `Concept: ${concept}`;

  let misconceptionText = `You selected "${chosenText}", but the correct answer is "${correctText}".`;
  if (concept === 'Perimeter & Area') {
    misconceptionText = `⚠️ **Misconception Check**: Are you confusing **Area** (length × width) with **Perimeter** (distance around the outer boundary)?`;
  } else if (concept === 'Fractions') {
    misconceptionText = `⚠️ **Concept Tip**: A fraction represents equal parts of a whole value.`;
  } else if (concept === 'Ratios') {
    misconceptionText = `⚠️ **Ratio Order Warning**: In ratios, the order of numbers directly matches the order of terms in the question!`;
  } else if (concept === 'Speed') {
    misconceptionText = `⚠️ **Formula Check**: Average Speed = Distance ÷ Time. Divide distance by travel time!`;
  } else if (concept === 'Algebra') {
    misconceptionText = `⚠️ **Algebraic Step**: Undo addition/subtraction first, then divide by the coefficient to isolate x!`;
  } else if (concept === 'Decimals') {
    misconceptionText = `⚠️ **Decimal Alignment**: Align decimal points vertically before adding or subtracting!`;
  }

  els.aiExplanation.innerHTML = misconceptionText;

  if (q.steps && q.steps.length > 0) {
    els.aiSteps.innerHTML = q.steps.map((s, idx) => `<p><strong>Step ${idx + 1}:</strong> ${s}</p>`).join('');
    els.aiSteps.hidden = false;
  } else {
    els.aiSteps.innerHTML = `<p><strong>Solution:</strong> ${correctText} is the correct answer according to the MOE syllabus.</p>`;
    els.aiSteps.hidden = false;
  }

  if (q.tip) {
    els.aiTip.textContent = q.tip;
    els.aiTip.hidden = false;
  } else {
    els.aiTip.textContent = `💡 AI Teacher Tip: Pay close attention to key keywords and formula rules!`;
    els.aiTip.hidden = false;
  }

  els.aiTeacherBox.hidden = false;
}

function hideAiTeacherAdvice() {
  if (els.aiTeacherBox) els.aiTeacherBox.hidden = true;
}

// ----- End Screen AI Learning Report Module -----
function renderAiLearningReport() {
  if (!els.aiLearningReport) return;

  const stats = state.conceptStats;
  const concepts = Object.keys(stats);

  if (concepts.length === 0) {
    els.aiLearningReport.hidden = true;
    return;
  }

  let totalCorrect = 0;
  let totalAttempted = 0;
  let masteryHtml = '';

  concepts.forEach(c => {
    const { correct, total } = stats[c];
    totalCorrect += correct;
    totalAttempted += total;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    masteryHtml += `
      <div class="mastery-item">
        <div class="mastery-meta">
          <span>${c}</span>
          <span>${correct}/${total} (${pct}%)</span>
        </div>
        <div class="mastery-bar-bg">
          <div class="mastery-bar-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  });

  const overallPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  let summaryMsg = '';
  let adviceMsg = '';

  if (overallPct >= 80) {
    summaryMsg = `🌟 **Outstanding Mastery (${overallPct}%)!** You demonstrated strong understanding across ${state.selectedSubject} Primary ${state.selectedLevel}.`;
    adviceMsg = `🤖 **AI Recommendation:** You are ready for **Boss Battle Mode** to test your knowledge under pressure!`;
  } else if (overallPct >= 50) {
    summaryMsg = `👍 **Solid Progress (${overallPct}%)!** You have a good grasp of core concepts, with room to refine key calculations.`;
    adviceMsg = `🤖 **AI Recommendation:** Use the **Side Calculator** to double check arithmetic and review step-by-step hints whenever you get stuck!`;
  } else {
    summaryMsg = `💪 **Keep Practicing (${overallPct}%)!** Consistent practice will build your confidence.`;
    adviceMsg = `🤖 **AI Recommendation:** Read the **AI Teacher Advice** box carefully on missed questions to master formulas and rules!`;
  }

  els.aiReportSummary.innerHTML = summaryMsg;
  els.aiMasteryList.innerHTML = masteryHtml;
  els.aiAdviceBox.innerHTML = adviceMsg;
  els.aiLearningReport.hidden = false;
}

// Filter questions by the player's chosen subject, level, and topic.
// Questions with a `topic` tag (e.g. Adaptations) are ONLY included when
// that specific topic is selected, or when "all" topics is chosen.
function getFilteredQuestions() {
  // Determine whether the selected topic uses tagged questions
  const topicHasTaggedQuestions = (topic) =>
    topic !== 'all' &&
    QUESTIONS.some(q =>
      q.subject === state.selectedSubject &&
      q.level   === state.selectedLevel   &&
      q.topic   === topic
    );

  const topic = state.selectedTopic;
  const isTaggedTopic = topic !== 'all' && topicHasTaggedQuestions(topic);

  return QUESTIONS.filter(q => {
    if (q.subject !== state.selectedSubject) return false;
    if (q.level   !== state.selectedLevel)   return false;

    if (topic === 'all') {
      // "All Topics" mode: include everything regardless of topic tag
      return true;
    }

    if (q.topic) {
      // Tagged question — only include if it matches the selected topic
      return q.topic === topic;
    }

    // Untagged question:
    // If the selected topic relies on tagged questions (e.g. Adaptations),
    // exclude untagged questions so they don't pollute the pool.
    // Otherwise (generic topic with no tags) include all untagged questions.
    return !isTaggedTopic;
  });
}

// ----- Question Selection with Difficulty Scaling -----
function buildQuestionSet() {
  const set = [];
  const count = QUESTIONS_PER_GAME;

  if (state.selectedSubject === 'Mathematics') {
    for (let i = 0; i < count; i++) {
      const diff = i < 3 ? 1 : (i < 7 ? 2 : 3);
      set.push(generateAiMathQuestion(state.selectedLevel, diff));
    }
    return set;
  }

  const pool = getFilteredQuestions();
  const poolCount = Math.min(count, pool.length);

  const easy   = shuffle(pool.filter(q => q.difficulty === 1));
  const medium = shuffle(pool.filter(q => q.difficulty === 2));
  const hard   = shuffle(pool.filter(q => q.difficulty === 3));

  const third = Math.ceil(poolCount / 3);

  set.push(...easy.slice(0, third));
  set.push(...medium.slice(0, third));
  set.push(...hard.slice(0, poolCount - set.length));

  const remaining = shuffle(pool.filter(q => !set.includes(q)));
  while (set.length < poolCount && remaining.length) {
    set.push(remaining.pop());
  }

  set.forEach(q => {
    if (!q.concept) q.concept = `${q.subject} P${q.level}`;
  });

  return set.slice(0, poolCount);
}

// Pick a random question for boss mode (harder pool in phase 2)
function getNextBossQuestion() {
  if (state.selectedSubject === 'Mathematics') {
    const diff = state.bossPhase >= 2 ? 3 : 2;
    return generateAiMathQuestion(state.selectedLevel, diff);
  }

  let pool = getFilteredQuestions();
  if (state.bossPhase >= 2) {
    const harder = pool.filter(q => q.difficulty >= 2);
    if (harder.length) pool = harder;
  }
  const q = pool[Math.floor(Math.random() * pool.length)];
  if (q && !q.concept) q.concept = `${q.subject} P${q.level}`;
  return q;
}

// ----- Boss Battle: Setup & Combat -----
function initBossBattle() {
  const lvl = state.selectedLevel;
  const bossInfo = BOSS_NAMES[state.selectedSubject] || { name: 'Quiz Boss', avatar: '👹' };

  state.playerMaxHp = BOSS_BATTLE.playerMaxHp;
  state.playerHp = state.playerMaxHp;
  state.bossMaxHp = BOSS_BATTLE.bossHpBase + (lvl - 1) * BOSS_BATTLE.bossHpPerLevel;
  state.bossHp = state.bossMaxHp;
  state.bossPhase = 1;
  state.correctStreak = 0;
  state.battleEnded = false;
  state.questionsAnswered = 0;
  state.currentBossQuestion = null;

  els.bossName.textContent = bossInfo.name;
  els.bossAvatar.textContent = bossInfo.avatar;
  els.bossPhaseLabel.textContent = 'Phase 1';
  els.bossArena.classList.remove('phase-2');

  updateHealthBars();
  setBossUIVisible(true);
}

function setBossUIVisible(visible) {
  els.bossArena.hidden = !visible;
  // Player HP bar only visible in boss mode
  els.playerHealthRow.hidden = !visible;
  els.classicProgress.hidden = visible;
  els.progressDisplay.parentElement.hidden = visible;
}

function updateHealthBars() {
  const bossPct = state.bossMaxHp > 0 ? (state.bossHp / state.bossMaxHp) * 100 : 0;
  const playerPct = state.playerMaxHp > 0 ? (state.playerHp / state.playerMaxHp) * 100 : 0;

  els.bossHpFill.style.width = `${bossPct}%`;
  els.playerHpFill.style.width = `${playerPct}%`;
  els.bossHpText.textContent = `${Math.max(0, state.bossHp)} / ${state.bossMaxHp}`;
  els.playerHpText.textContent = `${Math.max(0, state.playerHp)} / ${state.playerMaxHp}`;
}

function dealDamage(target, amount) {
  if (state.battleEnded) return;

  if (target === 'boss') {
    state.bossHp = Math.max(0, state.bossHp - amount);
    showFloatingText(`-${amount} HP`, 'boss-hit');
    if (state.bossHp <= state.bossMaxHp * 0.5 && state.bossPhase === 1) {
      enterBossPhase2();
    }
  } else {
    state.playerHp = Math.max(0, state.playerHp - amount);
    showFloatingText(`-${amount} HP`, 'player-hit');
    triggerDamageEffects();
  }

  updateHealthBars();
  checkBattleEnd();
}

function showFloatingText(text, type) {
  const el = document.createElement('span');
  el.className = `floating-damage ${type}`;
  el.textContent = text;
  els.floatingContainer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function triggerDamageEffects() {
  els.battleCard.classList.remove('shake', 'damage-flash');
  void els.battleCard.offsetWidth;
  els.battleCard.classList.add('shake', 'damage-flash');
  setTimeout(() => els.battleCard.classList.remove('shake', 'damage-flash'), 400);
}

function enterBossPhase2() {
  state.bossPhase = 2;
  els.bossArena.classList.add('phase-2');
  els.bossPhaseLabel.textContent = 'Phase 2 — Enraged!';
  els.feedbackText.textContent = '⚠️ Boss enraged! Harder questions & more damage!';
  els.feedbackText.className = 'feedback-text incorrect';
  playSound('powerup');
}

function checkBattleEnd() {
  if (state.battleEnded) return;

  if (state.bossHp <= 0) {
    state.battleEnded = true;
    endBossBattle(true);
  } else if (state.playerHp <= 0) {
    state.battleEnded = true;
    endBossBattle(false);
  }
}

function getBossPlayerDamage() {
  return state.bossPhase >= 2 ? BOSS_BATTLE.playerDamagePhase2 : BOSS_BATTLE.playerDamage;
}

function getBossDamageToBoss(q) {
  let dmg = BOSS_BATTLE.bossDamageByDifficulty[q.difficulty] || 18;
  if (state.correctStreak >= 3) {
    dmg += BOSS_BATTLE.streakBonus * (state.correctStreak - 2);
  }
  if (state.doubleActive) dmg *= 2;
  return dmg;
}

function getFeedbackDelay(hasMistake) {
  // Evolution mode: shorter delay so screen doesn't sit blank for 3 seconds
  if (state.gameMode === 'evolution') {
    return hasMistake ? 2000 : FEEDBACK_DELAY_MS;
  }
  if (hasMistake) return 3200; // Allow student time to read AI Teacher Advice
  if (state.gameMode === 'boss' && state.bossPhase >= 2) {
    return BOSS_BATTLE.feedbackDelayPhase2;
  }
  return FEEDBACK_DELAY_MS;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ----- UI Updates -----
function updateCoinDisplays() {
  const text = `🪙 ${state.coins}`;
  els.coinsStart.textContent = text;
  els.coinsGame.textContent = text;
  els.shopCoins.textContent = text;
}

function updatePowerupButtons() {
  els.doubleCount.textContent = inventory.double;
  els.skipCount.textContent = inventory.skip;
  els.invDouble.textContent = inventory.double;
  els.invSkip.textContent = inventory.skip;

  els.useDoubleBtn.disabled = inventory.double <= 0 || state.doubleActive || state.answered;
  els.useSkipBtn.disabled = inventory.skip <= 0 || state.answered;
}

function updateProgressBar() {
  const total = state.totalQuestionsThisGame;
  const pct = total > 0 ? (state.currentIndex / total) * 100 : 0;
  els.progressFill.style.width = `${pct}%`;
}

// ----- Render Current Question -----
function renderQuestion(slideIn = true) {
  // Force hide evolution UI at the very start
  if (els.evolutionFormHud) els.evolutionFormHud.hidden = true;
  if (els.evolutionPathBanner) els.evolutionPathBanner.hidden = true;

  if (slideIn) {
    const container = els.questionContainer;
    container.classList.remove('slide-in-right', 'slide-out-left');
    void container.offsetWidth;
    container.classList.add('slide-in-right');
  }

  const q = state.gameMode === 'boss'
    ? state.currentBossQuestion
    : state.gameQuestions[state.currentIndex];

  if (!q) {
    endGame();
    return;
  }

  state.answered = false;

  // Progress display
  if (state.gameMode === 'classic') {
    const total = state.totalQuestionsThisGame;
    els.progressDisplay.textContent = `${state.currentIndex + 1} / ${total}`;
  } else if (state.gameMode === 'evolution') {
    els.progressDisplay.textContent = `Stage ${state.evolutionStage}`;
  } else {
    els.progressDisplay.textContent = `Streak ${state.correctStreak}`;
  }

  els.topicDisplay.textContent = getTopicLabel();
  els.scoreDisplay.textContent = state.score;
  updateCoinDisplays();
  updateProgressBar();
  updatePowerupButtons();

  // Show evolution form display in evolution mode
  updateEvolutionDisplay();

  els.questionText.textContent = q.question;
  els.feedbackText.textContent = '';
  els.feedbackText.className = 'feedback-text';
  els.optionsGrid.innerHTML = '';

  q.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => handleAnswer(i));
    els.optionsGrid.appendChild(btn);
  });
}

// ----- Answer Handling -----
function handleAnswer(selectedIndex) {
  if (state.answered) return;
  state.answered = true;

  const q = state.gameMode === 'boss'
    ? state.currentBossQuestion
    : state.gameQuestions[state.currentIndex];
  const isCorrect = selectedIndex === q.correct;
  const buttons = els.optionsGrid.querySelectorAll('.option-btn');
  const concept = q.concept || `${q.subject} P${q.level}`;

  if (!state.conceptStats[concept]) {
    state.conceptStats[concept] = { correct: 0, total: 0 };
  }

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === selectedIndex && !isCorrect) btn.classList.add('incorrect');
  });

  if (isCorrect) {
    state.conceptStats[concept].correct++;
    state.conceptStats[concept].total++;
    state.consecutiveErrors = 0;

    const config = DIFFICULTY_CONFIG[q.difficulty] || DIFFICULTY_CONFIG[1];
    let points = config.points;
    let coinReward = config.coins;

    if (state.doubleActive) {
      points *= 2;
      coinReward *= 2;
      state.doubleActive = false;
    }

    state.score += points;
    state.coins += coinReward;
    state.coinsEarnedThisGame += coinReward;
    state.correctCount++;

    // Earn XP for correct answer
    addXP(10 + (q.difficulty * 5));

    if (state.gameMode === 'boss') {
      state.correctStreak++;
      state.questionsAnswered++;
      const bossDmg = getBossDamageToBoss(q);
      dealDamage('boss', bossDmg);
      els.feedbackText.textContent = `Hit! -${bossDmg} boss HP · +${points} pts · +${coinReward} 🪙`;
    } else if (state.gameMode === 'evolution') {
      state.evolutionCorrectCount++;
      els.feedbackText.textContent = `Correct! +${points} pts, +${coinReward} 🪙 (${state.evolutionCorrectCount}/7)`;
    } else {
      els.feedbackText.textContent = `Correct! +${points} pts, +${coinReward} 🪙`;
    }

    els.feedbackText.className = 'feedback-text correct';
    playSound('correct');
    playSound('coin');
    hideAiTeacherAdvice();
  } else {
    state.conceptStats[concept].total++;
    state.consecutiveErrors = (state.consecutiveErrors || 0) + 1;

    showAiTeacherAdvice(q, selectedIndex);

    if (state.gameMode === 'boss') {
      state.correctStreak = 0;
      state.questionsAnswered++;
      const playerDmg = getBossPlayerDamage();
      dealDamage('player', playerDmg);
      els.feedbackText.textContent = `Wrong! -${playerDmg} HP · Answer: "${q.options[q.correct]}"`;
    } else if (state.gameMode === 'evolution') {
      els.feedbackText.textContent = `Incorrect! No evolution unlocked this round. Answer: "${q.options[q.correct]}"`;
    } else {
      els.feedbackText.textContent = `Incorrect. The answer was "${q.options[q.correct]}".`;
    }
    els.feedbackText.className = 'feedback-text incorrect';
    playSound('incorrect');
  }

  saveCoins();
  els.scoreDisplay.textContent = state.score;
  updateCoinDisplays();
  updatePowerupButtons();

  // Evolution mode: show evolution choice after 7 correct answers
  if (state.gameMode === 'evolution' && isCorrect && !state.evolutionFinalForm) {
    if (state.evolutionCorrectCount >= 7) {
      setTimeout(() => showEvolutionChoice(), getFeedbackDelay(false));
      return;
    }
  }

  // Evolution mode wrong answer: advance to next question after short delay (no slide-out)
  if (state.gameMode === 'evolution' && !isCorrect) {
    setTimeout(() => {
      state.currentIndex++;
      if (state.currentIndex >= state.totalQuestionsThisGame) {
        endEvolutionGame();
      } else {
        renderQuestion(true);
      }
    }, getFeedbackDelay(true));
    return;
  }

  // Evolution correct but already at final form — show choice screen (it will skip choices)
  if (state.gameMode === 'evolution' && isCorrect && state.evolutionFinalForm) {
    setTimeout(() => {
      state.currentIndex++;
      if (state.currentIndex >= state.totalQuestionsThisGame) {
        endEvolutionGame();
      } else {
        renderQuestion(true);
      }
    }, getFeedbackDelay(false));
    return;
  }

  if (!state.battleEnded) {
    scheduleNextQuestion(!isCorrect);
  }
}

// ----- Skip Powerup -----
function useSkipPowerup() {
  if (state.answered || inventory.skip <= 0) return;

  state.answered = true;
  inventory.skip--;
  saveInventory();

  els.feedbackText.textContent = state.gameMode === 'boss'
    ? 'Dodged! No damage taken.'
    : 'Question skipped!';
  els.feedbackText.className = 'feedback-text skipped';
  playSound('powerup');
  hideAiTeacherAdvice();

  els.optionsGrid.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('correct');
  });

  if (state.gameMode === 'boss') state.questionsAnswered++;

  updatePowerupButtons();
  if (!state.battleEnded) scheduleNextQuestion(false);
}

// ----- Double Points Powerup -----
function useDoublePowerup() {
  if (inventory.double <= 0 || state.doubleActive || state.answered) return;

  inventory.double--;
  state.doubleActive = true;
  saveInventory();

  els.feedbackText.textContent = '⚡ Double points active for next correct answer!';
  els.feedbackText.className = 'feedback-text';
  playSound('powerup');
  updatePowerupButtons();
}

// ----- Advance to Next Question -----
function scheduleNextQuestion(hasMistake) {
  const delay = getFeedbackDelay(hasMistake);

  setTimeout(() => {
    els.questionContainer.classList.add('slide-out-left');

    setTimeout(() => {
      if (state.gameMode === 'boss') {
        if (state.battleEnded) return;
        state.currentBossQuestion = getNextBossQuestion();
        renderQuestion(true);
      } else if (state.gameMode === 'evolution') {
        state.currentIndex++;
        // Evolution mode ends when reaching final form OR finishing all questions
        if (state.evolutionFinalForm || state.currentIndex >= state.totalQuestionsThisGame) {
          endEvolutionGame();
        } else {
          renderQuestion(true);
        }
      } else {
        state.currentIndex++;
        if (state.currentIndex >= state.totalQuestionsThisGame) {
          endGame();
        } else {
          renderQuestion(true);
        }
      }
    }, TRANSITION_DELAY_MS);
  }, delay);
}

// ----- End Game (Classic Mode) -----
function endGame() {
  toggleCalculator(false);
  const isNewHigh = saveHighScore(state.score);
  const total = state.totalQuestionsThisGame;

  // Earn bonus XP for completing game
  addXP(50 + (state.correctCount * 5));

  els.endTitle.textContent = 'Game Over!';
  els.endScoreRow.hidden = false;
  els.endCorrectRow.hidden = false;
  els.endBossRow.hidden = true;
  els.finalScore.textContent = state.score;
  els.finalCorrect.textContent = `${state.correctCount} / ${total}`;
  els.finalCoins.textContent = `🪙 ${state.coinsEarnedThisGame}`;
  els.endTopicLabel.textContent = `${state.selectedSubject} · Primary ${state.selectedLevel} · Classic`;
  els.newHighScore.hidden = !isNewHigh;
  els.highScoreDisplay.textContent = localStorage.getItem(STORAGE_KEYS.highScore);

  renderAiLearningReport();
  showScreen('end');
}

// ----- End Game (Evolution Mode) -----
function endEvolutionGame() {
  toggleCalculator(false);
  const isNewHigh = saveHighScore(state.score);
  const currentForm = EVOLUTIONS[state.evolutionForm];
  const victory = state.evolutionFinalForm;

  // Earn bonus XP for evolution game
  addXP(50 + (state.correctCount * 5) + (victory ? 100 : 0));

  els.endTitle.textContent = victory ? '🎉 Evolution Complete!' : '🐾 Journey Ended';
  els.endScoreRow.hidden = false;
  els.endCorrectRow.hidden = false;
  els.endBossRow.hidden = true;
  els.finalScore.textContent = state.score;
  els.finalCorrect.textContent = `${state.correctCount} / ${state.totalQuestionsThisGame}`;
  els.finalCoins.textContent = `🪙 ${state.coinsEarnedThisGame}`;
  els.endTopicLabel.textContent = `Final Form: ${currentForm.emoji} ${currentForm.name}`;
  els.newHighScore.hidden = !isNewHigh;
  els.highScoreDisplay.textContent = localStorage.getItem(STORAGE_KEYS.highScore);

  renderAiLearningReport();
  showScreen('end');
}

// ----- End Boss Battle -----
function endBossBattle(victory) {
  toggleCalculator(false);
  let bonus = 0;
  if (victory) {
    bonus = BOSS_BATTLE.winCoinBonus + state.selectedLevel * BOSS_BATTLE.winCoinPerLevel;
    state.coins += bonus;
    state.coinsEarnedThisGame += bonus;
    saveCoins();
    saveHighScore(state.score);
  }

  // Earn bonus XP for boss battle
  addXP(100 + (state.correctCount * 10) + (victory ? 200 : 0));

  els.endTitle.textContent = victory ? '🏆 Boss Defeated!' : '💀 Defeated…';
  els.endScoreRow.hidden = false;
  els.endCorrectRow.hidden = false;
  els.endBossRow.hidden = false;
  els.finalScore.textContent = state.score;
  els.finalCorrect.textContent = `${state.correctCount} / ${state.questionsAnswered}`;
  els.finalBossResult.textContent = victory ? 'Victory!' : 'Defeat';
  els.finalBossResult.style.color = victory ? 'var(--success)' : 'var(--error)';
  els.finalCoins.textContent = victory
    ? `🪙 ${state.coinsEarnedThisGame} (+${bonus} bonus!)`
    : `🪙 ${state.coinsEarnedThisGame}`;
  els.endTopicLabel.textContent = `${state.selectedSubject} · Primary ${state.selectedLevel} · Boss Battle`;
  els.newHighScore.hidden = !victory || state.score <= parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0', 10);
  els.highScoreDisplay.textContent = localStorage.getItem(STORAGE_KEYS.highScore);

  if (victory) playSound('coin');

  renderAiLearningReport();
  showScreen('end');
}

// ----- Start / Restart Game -----
function startGame() {
  state.score = 0;
  state.correctCount = 0;
  state.currentIndex = 0;
  state.answered = false;
  state.doubleActive = false;
  state.coinsEarnedThisGame = 0;
  state.battleEnded = false;
  state.conceptStats = {};
  state.consecutiveErrors = 0;

  // Reset evolution state for evolution mode
  if (state.gameMode === 'evolution') {
    state.evolutionForm = 'base';
    state.evolutionPath = ['🐾 Small Animal'];
    state.evolutionStage = 0;
    state.evolutionCorrectCount = 0;
    state.evolutionFinalForm = false;
  }

  hideAiTeacherAdvice();
  toggleCalculator(state.selectedSubject === 'Mathematics' && state.gameMode !== 'pizza');

  if (state.gameMode === 'pizza') {
    setBossUIVisible(false);
    initPizzaShopGame();
    showScreen('pizza');
    return;
  }

  if (state.gameMode === 'boss') {
    initBossBattle();
    state.currentBossQuestion = getNextBossQuestion();
    showScreen('question');
    renderQuestion(false);
    return;
  }

  if (state.gameMode === 'evolution') {
    setBossUIVisible(false);
    state.gameQuestions = buildQuestionSet();
    state.totalQuestionsThisGame = state.gameQuestions.length;

    if (state.totalQuestionsThisGame === 0) return;

    showScreen('question');
    renderQuestion(false);
    return;
  }

  setBossUIVisible(false);
  state.gameQuestions = buildQuestionSet();
  state.totalQuestionsThisGame = state.gameQuestions.length;

  if (state.totalQuestionsThisGame === 0) return;

  showScreen('question');
  renderQuestion(false);
}

// ----- Shop -----
function openShop(fromScreen) {
  state.previousScreen = fromScreen;
  updateCoinDisplays();
  updatePowerupButtons();
  showScreen('shop');
}

function buyItem(itemKey) {
  const item = SHOP_ITEMS[itemKey];
  if (!item) return;

  if (state.coins < item.cost) {
    playSound('incorrect');
    return;
  }

  state.coins -= item.cost;
  inventory[itemKey]++;
  saveCoins();
  saveInventory();
  updateCoinDisplays();
  updatePowerupButtons();
  playSound('coin');
}

function closeShop() {
  showScreen(state.previousScreen);
}

// ----- Event Listeners -----
document.getElementById('start-btn').addEventListener('click', goToSubjectSelect);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('change-topic-btn').addEventListener('click', goToSubjectSelect);
document.getElementById('subject-back-btn').addEventListener('click', () => showScreen('start'));
document.getElementById('level-back-btn').addEventListener('click', () => showScreen('subject'));
document.getElementById('topic-back-btn').addEventListener('click', () => showScreen('level'));
document.getElementById('shop-btn-start').addEventListener('click', () => openShop('start'));
document.getElementById('shop-btn-end').addEventListener('click', () => openShop('end'));
document.getElementById('shop-back-btn').addEventListener('click', closeShop);

// Battle Pass Event Listeners
if (els.battlepassBtnStart) {
  els.battlepassBtnStart.addEventListener('click', () => {
    renderBattlePass();
    showScreen('battlepass');
  });
}

if (els.battlepassBackBtn) {
  els.battlepassBackBtn.addEventListener('click', () => showScreen('start'));
}

if (els.unlockPremiumBtn) {
  els.unlockPremiumBtn.addEventListener('click', unlockPremium);
}

// Slot Machine Event Listeners
if (els.slotsBtnStart) {
  els.slotsBtnStart.addEventListener('click', () => {
    updateSlotStatus();
    showScreen('slots');
  });
}

if (els.slotsBackBtn) {
  els.slotsBackBtn.addEventListener('click', () => showScreen('start'));
}

if (els.spinBtn) {
  els.spinBtn.addEventListener('click', spinSlotMachine);
}

// Mode Selection Modal Event Listeners
if (els.normalQuizModeBtn) {
  els.normalQuizModeBtn.addEventListener('click', () => {
    if (els.modeSelectModal) els.modeSelectModal.hidden = true;
    state.gameMode = 'classic';
    startGame();
  });
}

if (els.evolutionModeStartBtn) {
  els.evolutionModeStartBtn.addEventListener('click', () => {
    if (els.modeSelectModal) els.modeSelectModal.hidden = true;
    state.gameMode = 'evolution';
    state.evolutionForm = 'base';
    state.evolutionPath = ['🐾 Small Animal'];
    state.evolutionStage = 0;
    state.evolutionCorrectCount = 0;
    state.evolutionFinalForm = false;
    startGame();
  });
}

if (els.modeSelectCancelBtn) {
  els.modeSelectCancelBtn.addEventListener('click', () => {
    if (els.modeSelectModal) els.modeSelectModal.hidden = true;
  });
}

// Settings Event Listeners
if (els.settingsBtn) {
  els.settingsBtn.addEventListener('click', () => showScreen('settings'));
}

if (els.settingsBackBtn) {
  els.settingsBackBtn.addEventListener('click', () => showScreen('start'));
}

// Avatar & Crates Event Listeners
if (els.avatarCustomBtnStart) {
  els.avatarCustomBtnStart.addEventListener('click', openAvatarCustomization);
}

if (els.avatarCustomBtnShop) {
  els.avatarCustomBtnShop.addEventListener('click', openAvatarCustomization);
}

if (els.avatarCustomBackBtn) {
  els.avatarCustomBackBtn.addEventListener('click', () => showScreen('start'));
}

if (els.openCratesBtnCustom) {
  els.openCratesBtnCustom.addEventListener('click', () => {
    if (els.shopTabCrates) els.shopTabCrates.click();
    openShop('avatarCustom');
  });
}

if (els.shopTabPowerups) {
  els.shopTabPowerups.addEventListener('click', () => {
    els.shopTabPowerups.classList.add('active');
    if (els.shopTabCrates) els.shopTabCrates.classList.remove('active');
    if (els.powerupsSection) els.powerupsSection.hidden = false;
    if (els.cratesSection) els.cratesSection.hidden = true;
  });
}

if (els.shopTabCrates) {
  els.shopTabCrates.addEventListener('click', () => {
    els.shopTabCrates.classList.add('active');
    if (els.shopTabPowerups) els.shopTabPowerups.classList.remove('active');
    if (els.powerupsSection) els.powerupsSection.hidden = true;
    if (els.cratesSection) els.cratesSection.hidden = false;
  });
}

document.querySelectorAll('.crate-buy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    openSkinCrate(btn.dataset.crate);
  });
});

document.querySelectorAll('.avatar-tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    currentCustomTab = tabBtn.dataset.tab;
    renderAvatarPicker();
  });
});

if (els.crateClaimBtn) {
  els.crateClaimBtn.addEventListener('click', () => {
    if (els.crateModal) els.crateModal.hidden = true;
  });
}

// Theme selection
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    applyTheme(theme);
    updateThemeButtons(theme);
    localStorage.setItem('revigame-theme', theme);
  });
});

// Text size selection
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    applyTextSize(size);
    updateSizeButtons(size);
    localStorage.setItem('revigame-size', size);
  });
});

// Load saved preferences on startup
function loadSettings() {
  const savedTheme = localStorage.getItem('revigame-theme') || 'dark';
  const savedSize = localStorage.getItem('revigame-size') || 'medium';
  applyTheme(savedTheme);
  applyTextSize(savedSize);
  updateThemeButtons(savedTheme);
  updateSizeButtons(savedSize);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function applyTextSize(size) {
  document.documentElement.setAttribute('data-size', size);
}

function updateThemeButtons(activeTheme) {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === activeTheme);
  });
}

function updateSizeButtons(activeSize) {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === activeSize);
  });
}

// Load settings on page load
loadSettings();
loadPersistentData();

els.evolutionContinueBtn.addEventListener('click', () => {
  // Final form reached — end the game immediately
  if (state.evolutionFinalForm) {
    endEvolutionGame();
    return;
  }
  // Clear any leftover slide-out class, advance, render next question
  if (els.questionContainer) els.questionContainer.classList.remove('slide-out-left');
  state.currentIndex++;
  if (state.currentIndex >= state.totalQuestionsThisGame) {
    endEvolutionGame();
  } else {
    showScreen('question');
    renderQuestion(true);
  }
});
els.useDoubleBtn.addEventListener('click', useDoublePowerup);
els.useSkipBtn.addEventListener('click', useSkipPowerup);

if (els.toggleCalcBtn) {
  els.toggleCalcBtn.addEventListener('click', () => toggleCalculator());
}

if (els.calcCloseBtn) {
  els.calcCloseBtn.addEventListener('click', () => toggleCalculator(false));
}

// Calculator button click delegation
document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.num) {
      handleCalcInput('num', btn.dataset.num);
    } else if (btn.dataset.op) {
      handleCalcInput('op', btn.dataset.op);
    } else if (btn.dataset.action === 'clear') {
      handleCalcInput('clear');
    } else if (btn.dataset.action === 'delete') {
      handleCalcInput('delete');
    } else if (btn.dataset.action === 'equals') {
      handleCalcInput('equals');
    }
  });
});

// Keyboard integration for Side Calculator
window.addEventListener('keydown', (e) => {
  if (screens.question.classList.contains('active') && !els.calcWidget.hidden) {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      handleCalcInput('num', e.key);
    } else if (['+', '-', '*', '/'].includes(e.key)) {
      handleCalcInput('op', e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      handleCalcInput('equals');
    } else if (e.key === 'Backspace') {
      handleCalcInput('delete');
    } else if (e.key === 'Escape') {
      handleCalcInput('clear');
    }
  }
});

document.querySelectorAll('[data-subject]').forEach(btn => {
  btn.addEventListener('click', () => selectSubject(btn.dataset.subject));
});

document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', () => buyItem(btn.dataset.item));
});

// ----- Init -----
loadPersistentData();
loadBattlePass();
loadSlotMachine();
updateCoinDisplays();
updatePowerupButtons();

// Fractions Mode Selection Modal Listeners
if (els.fractionsQuizModeBtn) {
  els.fractionsQuizModeBtn.addEventListener('click', () => {
    if (els.fractionsModeModal) els.fractionsModeModal.hidden = true;
    state.gameMode = 'classic';
    startGame();
  });
}

if (els.pizzaModeStartBtn) {
  els.pizzaModeStartBtn.addEventListener('click', () => {
    if (els.fractionsModeModal) els.fractionsModeModal.hidden = true;
    state.gameMode = 'pizza';
    startGame();
  });
}

if (els.fractionsModeCancelBtn) {
  els.fractionsModeCancelBtn.addEventListener('click', () => {
    if (els.fractionsModeModal) els.fractionsModeModal.hidden = true;
  });
}

if (els.pizzaClearBtn) {
  els.pizzaClearBtn.addEventListener('click', () => {
    if (!state.pizzaSliceToppings) return;
    state.pizzaSliceToppings.fill('cheese');
    drawInteractivePizza();
  });
}

if (els.pizzaServeBtn) {
  els.pizzaServeBtn.addEventListener('click', servePizzaOrder);
}

if (els.pizzaNextBtn) {
  els.pizzaNextBtn.addEventListener('click', nextPizzaOrder);
}

document.querySelectorAll('.topping-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.topping-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.pizzaActiveTopping = btn.dataset.topping;
  });
});

/* ============================================================
   Fraction Pizza Shop Game Mode ("Good Pizza, Great Pizza" Style)
   ============================================================ */

const PIZZA_CUSTOMERS = [
  { name: 'Chef Meow', avatar: '🐱' },
  { name: 'Robocook 3000', avatar: '🤖' },
  { name: 'Roxy the Fox', avatar: '🦊' },
  { name: 'Barnaby Bear', avatar: '🐻' },
  { name: 'Alien Pip', avatar: '👾' },
  { name: 'Sparkle Pony', avatar: '🦄' },
  { name: 'Pam Panda', avatar: '🐼' },
  { name: 'Captain Slice', avatar: '👨‍🍳' },
  { name: 'Officer Crust', avatar: '👮' },
  { name: 'Dr. Dough', avatar: '👩‍🔬' }
];

const TOPPING_META = {
  cheese:    { name: 'Cheese', icon: '🧀', color: '#fbbf24', stroke: '#d97706' },
  pepperoni: { name: 'Pepperoni', icon: '🍕', color: '#f87171', stroke: '#dc2626' },
  mushroom:  { name: 'Mushroom', icon: '🍄', color: '#d6d3d1', stroke: '#78716c' },
  pepper:    { name: 'Green Pepper', icon: '🫑', color: '#4ade80', stroke: '#16a34a' }
};

function generatePizzaOrders(level) {
  const randElement = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const customers = shuffle(PIZZA_CUSTOMERS);
  const orders = [];

  for (let i = 0; i < 10; i++) {
    const cust = customers[i % customers.length];
    let denominator = 4;
    let text = '';
    let subtext = '';
    let targets = { cheese: 0, pepperoni: 0, mushroom: 0, pepper: 0 };

    if (level <= 2) {
      // Easy: 2 or 4 slices
      const isTwoSlices = Math.random() < 0.3;
      if (isTwoSlices) {
        denominator = 2;
        const top = randElement(['pepperoni', 'mushroom', 'pepper']);
        const topMeta = TOPPING_META[top];
        targets[top] = 1;
        targets.cheese = 1;
        text = `"${cust.name} here! Can I get half cheese and half ${topMeta.name.toLowerCase()}?"`;
        subtext = `1/2 Cheese, 1/2 ${topMeta.name} (2 slices total)`;
      } else {
        denominator = 4;
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
          const top = randElement(['pepperoni', 'mushroom']);
          const topMeta = TOPPING_META[top];
          targets[top] = 3;
          targets.cheese = 1;
          text = `"Make 3/4 ${topMeta.name.toLowerCase()} and 1/4 plain cheese!"`;
          subtext = `3/4 ${topMeta.name}, 1/4 Cheese (4 slices total)`;
        } else if (type === 1) {
          const top = randElement(['pepperoni', 'mushroom', 'pepper']);
          const topMeta = TOPPING_META[top];
          targets[top] = 2;
          targets.cheese = 2;
          text = `"I want 2/4 ${topMeta.name.toLowerCase()} and 2/4 cheese!"`;
          subtext = `2/4 ${topMeta.name}, 2/4 Cheese (4 slices total)`;
        } else {
          targets.pepperoni = 1;
          targets.mushroom = 1;
          targets.cheese = 2;
          text = `"Make it 1/4 pepperoni, 1/4 mushroom, and 2/4 cheese!"`;
          subtext = `1/4 Pepperoni, 1/4 Mushroom, 2/4 Cheese`;
        }
      }
    } else if (level <= 4) {
      // Medium: 3, 4, or 6 slices
      const denOptions = [3, 4, 6];
      denominator = randElement(denOptions);
      if (denominator === 3) {
        const top = randElement(['pepperoni', 'mushroom', 'pepper']);
        const topMeta = TOPPING_META[top];
        targets[top] = 2;
        targets.cheese = 1;
        text = `"I'd like 2/3 ${topMeta.name.toLowerCase()} and 1/3 cheese!"`;
        subtext = `2/3 ${topMeta.name}, 1/3 Cheese (3 slices total)`;
      } else if (denominator === 4) {
        targets.pepperoni = 2;
        targets.mushroom = 2;
        text = `"Cut it into 4 slices: 2/4 pepperoni and 2/4 mushroom!"`;
        subtext = `2/4 Pepperoni, 2/4 Mushroom`;
      } else {
        // 6 slices
        const top = randElement(['pepperoni', 'pepper']);
        const topMeta = TOPPING_META[top];
        targets[top] = 4;
        targets.cheese = 2;
        text = `"Cut it into 6 slices and make 4/6 ${topMeta.name.toLowerCase()}!"`;
        subtext = `4/6 ${topMeta.name}, 2/6 Cheese`;
      }
    } else {
      // Hard: 8 slices
      denominator = 8;
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        targets.pepperoni = 5;
        targets.cheese = 3;
        text = `"Make 5/8 pepperoni and 3/8 cheese on an 8-slice pizza!"`;
        subtext = `5/8 Pepperoni, 3/8 Cheese (8 slices total)`;
      } else if (type === 1) {
        targets.pepperoni = 3;
        targets.mushroom = 3;
        targets.pepper = 2;
        text = `"Multi-topping order! 3/8 pepperoni, 3/8 mushroom, and 2/8 green pepper!"`;
        subtext = `3/8 Pepperoni, 3/8 Mushroom, 2/8 Pepper`;
      } else {
        targets.pepperoni = 4;
        targets.mushroom = 4;
        text = `"Cut it into 8 slices: 4/8 pepperoni and 4/8 mushroom!"`;
        subtext = `4/8 Pepperoni, 4/8 Mushroom`;
      }
    }

    orders.push({
      customer: cust,
      denominator,
      text,
      subtext,
      targets
    });
  }

  return orders;
}

function initPizzaShopGame() {
  state.pizzaCurrentOrderIndex = 0;
  state.pizzaActiveTopping = 'cheese';
  state.pizzaOrders = generatePizzaOrders(state.selectedLevel);
  state.score = 0;
  state.correctCount = 0;
  state.coinsEarnedThisGame = 0;

  // Set active topping button
  document.querySelectorAll('.topping-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.topping === 'cheese');
  });

  renderPizzaOrder();
}

function renderPizzaOrder() {
  const order = state.pizzaOrders[state.pizzaCurrentOrderIndex];
  if (!order) {
    endPizzaGame();
    return;
  }

  state.pizzaSliceToppings = new Array(order.denominator).fill('cheese');

  // Update HUD
  els.pizzaScoreDisplay.textContent = state.score;
  els.pizzaProgressDisplay.textContent = `${state.pizzaCurrentOrderIndex + 1} / 10`;
  els.pizzaCoinsDisplay.textContent = `🪙 ${state.coins}`;
  els.pizzaProgressFill.style.width = `${((state.pizzaCurrentOrderIndex) / 10) * 100}%`;

  // Update Customer Profile & Order
  els.pizzaCustomerAvatar.textContent = order.customer.avatar;
  els.pizzaCustomerName.textContent = order.customer.name;
  els.pizzaOrderText.textContent = order.text;
  els.pizzaOrderSubtext.textContent = order.subtext;

  // Hide feedback & coin pop
  if (els.pizzaFeedbackBox) els.pizzaFeedbackBox.hidden = true;
  if (els.pizzaCoinPop) els.pizzaCoinPop.hidden = true;
  if (els.pizzaServeBtn) els.pizzaServeBtn.disabled = false;

  drawInteractivePizza();
}

function drawInteractivePizza() {
  const order = state.pizzaOrders[state.pizzaCurrentOrderIndex];
  if (!order || !els.pizzaContainer) return;

  const N = order.denominator;
  const CX = 150;
  const CY = 150;
  const R = 130;

  let svgHtml = `<svg class="pizza-svg" viewBox="0 0 300 300">`;
  
  // Outer Crust
  svgHtml += `<circle cx="${CX}" cy="${CY}" r="${R + 8}" fill="#d97706" stroke="#b45309" stroke-width="4"/>`;
  // Inner Sauce Base
  svgHtml += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="#dc2626"/>`;

  for (let i = 0; i < N; i++) {
    const startAngle = (i * 360 / N) - 90;
    const endAngle = ((i + 1) * 360 / N) - 90;

    const rad1 = startAngle * Math.PI / 180;
    const rad2 = endAngle * Math.PI / 180;

    const x1 = CX + R * Math.cos(rad1);
    const y1 = CY + R * Math.sin(rad1);
    const x2 = CX + R * Math.cos(rad2);
    const y2 = CY + R * Math.sin(rad2);

    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
    const pathD = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    const toppingKey = state.pizzaSliceToppings[i] || 'cheese';
    const topMeta = TOPPING_META[toppingKey] || TOPPING_META.cheese;

    svgHtml += `<path class="pizza-slice" data-slice="${i}" d="${pathD}" fill="${topMeta.color}" stroke="#78350f" stroke-width="2.5" />`;

    // Calculate center of slice for placing topping icon
    const midAngle = (rad1 + rad2) / 2;
    const rMid = R * 0.62;
    const iconX = CX + rMid * Math.cos(midAngle);
    const iconY = CY + rMid * Math.sin(midAngle);

    svgHtml += `<text x="${iconX.toFixed(2)}" y="${(iconY + 7).toFixed(2)}" text-anchor="middle" class="pizza-slice-topping-icon">${topMeta.icon}</text>`;
  }

  svgHtml += `</svg>`;
  els.pizzaContainer.innerHTML = svgHtml;

  // Add click listener to slices
  els.pizzaContainer.querySelectorAll('.pizza-slice').forEach(sliceEl => {
    sliceEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(sliceEl.dataset.slice, 10);
      const currentTop = state.pizzaSliceToppings[idx];
      const activeTop = state.pizzaActiveTopping || 'cheese';

      // If clicked with same topping, toggle back to cheese, else set active topping
      if (currentTop === activeTop && activeTop !== 'cheese') {
        state.pizzaSliceToppings[idx] = 'cheese';
      } else {
        state.pizzaSliceToppings[idx] = activeTop;
      }
      playSound('coin');
      drawInteractivePizza();
    });
  });
}

function servePizzaOrder() {
  const order = state.pizzaOrders[state.pizzaCurrentOrderIndex];
  if (!order) return;

  if (els.pizzaServeBtn) els.pizzaServeBtn.disabled = true;

  // Calculate topping counts on pizza
  const counts = { cheese: 0, pepperoni: 0, mushroom: 0, pepper: 0 };
  state.pizzaSliceToppings.forEach(t => {
    if (counts[t] !== undefined) counts[t]++;
  });

  // Calculate difference
  let totalDiff = 0;
  Object.keys(order.targets).forEach(k => {
    const target = order.targets[k] || 0;
    const actual = counts[k] || 0;
    totalDiff += Math.abs(target - actual);
  });

  let reactionEmoji = '😄';
  let reactionMsg = '';
  let pointsAwarded = 0;
  let coinsAwarded = 0;

  if (totalDiff === 0) {
    // PERFECT!
    reactionEmoji = '😄';
    reactionMsg = `"Mmm! PERFECT fraction pizza! Thank you!"`;
    pointsAwarded = 100;
    coinsAwarded = 15;
    playSound('coin');
    state.correctCount++;

    // Show floating coin animation
    if (els.pizzaCoinPop) {
      els.pizzaCoinPop.hidden = false;
      els.pizzaCoinPop.classList.remove('pizza-coin-pop');
      void els.pizzaCoinPop.offsetWidth;
      els.pizzaCoinPop.classList.add('pizza-coin-pop');
    }
  } else if (totalDiff <= 2) {
    // Slight mistake (off by 1 slice)
    reactionEmoji = '😐';
    reactionMsg = `"Hmm... not quite exact, but I'll eat it."`;
    pointsAwarded = 50;
    coinsAwarded = 5;
    playSound('correct');
  } else {
    // Wrong
    reactionEmoji = '😡';
    reactionMsg = `"This is wrong! That's not what I ordered!"`;
    pointsAwarded = 0;
    coinsAwarded = 0;
    playSound('incorrect');
  }

  state.score += pointsAwarded;
  state.coins += coinsAwarded;
  state.coinsEarnedThisGame += coinsAwarded;
  
  // Earn XP for pizza order
  if (pointsAwarded > 0) {
    addXP(pointsAwarded / 10);
  }
  
  saveCoins();

  // Update HUD
  els.pizzaScoreDisplay.textContent = state.score;
  els.pizzaCoinsDisplay.textContent = `🪙 ${state.coins}`;

  // Show Feedback Box & Solution if wrong
  if (els.pizzaFeedbackBox) {
    els.pizzaReactionAvatar.textContent = reactionEmoji;
    els.pizzaReactionText.textContent = reactionMsg;

    if (totalDiff > 0 && els.pizzaSolutionBox) {
      const targetStr = Object.entries(order.targets)
        .filter(([_, qty]) => qty > 0)
        .map(([top, qty]) => `${qty}/${order.denominator} ${TOPPING_META[top].name}`)
        .join(', ');

      const actualStr = Object.entries(counts)
        .filter(([_, qty]) => qty > 0)
        .map(([top, qty]) => `${qty}/${order.denominator} ${TOPPING_META[top].name}`)
        .join(', ');

      els.pizzaSolutionBox.innerHTML = `<strong>Order Breakdown:</strong><br/>Target: ${targetStr}<br/>Your Pizza: ${actualStr}`;
      els.pizzaSolutionBox.hidden = false;
    } else if (els.pizzaSolutionBox) {
      els.pizzaSolutionBox.hidden = true;
    }

    els.pizzaFeedbackBox.hidden = false;
  }
}

function nextPizzaOrder() {
  state.pizzaCurrentOrderIndex++;
  if (state.pizzaCurrentOrderIndex >= 10) {
    endPizzaGame();
  } else {
    renderPizzaOrder();
  }
}

function endPizzaGame() {
  toggleCalculator(false);
  const isNewHigh = saveHighScore(state.score);

  // Earn bonus XP for completing game
  addXP(50);

  els.endTitle.textContent = '🍕 Shift Complete!';
  els.endScoreRow.hidden = false;
  els.endCorrectRow.hidden = false;
  els.endBossRow.hidden = true;
  els.finalScore.textContent = state.score;
  els.finalCorrect.textContent = `${state.correctCount} / 10 Orders`;
  els.finalCoins.textContent = `🪙 ${state.coinsEarnedThisGame}`;
  els.endTopicLabel.textContent = `Mathematics · Primary ${state.selectedLevel} · Pizza Shop Mode`;
  els.newHighScore.hidden = !isNewHigh;
  els.highScoreDisplay.textContent = localStorage.getItem(STORAGE_KEYS.highScore) || '0';

  renderAiLearningReport();
  showScreen('end');
}

// ===== BATTLE PASS SYSTEM =====

function addXP(amount) {
  battlePassState.xp += amount;
  
  const xpNeeded = BATTLE_PASS_CONFIG.getXPForLevel(battlePassState.level);
  
  while (battlePassState.xp >= xpNeeded && battlePassState.level < BATTLE_PASS_CONFIG.maxLevel) {
    battlePassState.xp -= xpNeeded;
    previousLevel = battlePassState.level;
    battlePassState.level++;
    playSound('coin');
    showLevelUpNotification(battlePassState.level);
  }
  
  saveBattlePass();
  showXPFloatText(amount);
}

function saveBattlePass() {
  localStorage.setItem(STORAGE_KEYS.battlePass, JSON.stringify(battlePassState));
}

function loadBattlePass() {
  const saved = localStorage.getItem(STORAGE_KEYS.battlePass);
  if (saved) {
    battlePassState = JSON.parse(saved);
  }
}

function renderBattlePass() {
  els.bpLevelDisplay.textContent = battlePassState.level;
  els.bpXpCurrent.textContent = Math.floor(battlePassState.xp);
  const xpNeeded = BATTLE_PASS_CONFIG.getXPForLevel(battlePassState.level);
  els.bpXpNeeded.textContent = xpNeeded;
  
  const xpPercent = Math.min((battlePassState.xp / xpNeeded) * 100, 100);
  els.bpXpFill.style.width = `${xpPercent}%`;
  
  // Update premium button
  if (battlePassState.premiumUnlocked) {
    els.unlockPremiumBtn.textContent = '✓ Premium Unlocked';
    els.unlockPremiumBtn.classList.add('unlocked');
    els.unlockPremiumBtn.disabled = true;
  }
  
  // Render levels
  els.bpLevelsContainer.innerHTML = '';
  
  BATTLE_PASS_REWARDS.forEach(reward => {
    const levelRow = document.createElement('div');
    levelRow.className = 'bp-level-row';
    
    if (reward.level === battlePassState.level) {
      levelRow.classList.add('current');
    } else if (reward.level > battlePassState.level) {
      levelRow.classList.add('locked');
    }
    
    const isClaimed = battlePassState.claimedRewards.includes(reward.level);
    const canClaim = reward.level <= battlePassState.level && !isClaimed;
    
    levelRow.innerHTML = `
      <div class="bp-level-number">${reward.level}</div>
      <div class="bp-rewards">
        <div class="bp-reward-item">
          <span class="bp-reward-icon">${getRewardIcon(reward.free)}</span>
          <span class="bp-reward-name">${getRewardName(reward.free)}</span>
          <span class="bp-reward-track free">FREE</span>
        </div>
        <div class="bp-reward-item">
          <span class="bp-reward-icon">${getRewardIcon(reward.premium)}</span>
          <span class="bp-reward-name">${getRewardName(reward.premium)}</span>
          <span class="bp-reward-track premium">PREMIUM</span>
        </div>
      </div>
      <button class="bp-claim-btn ${isClaimed ? 'claimed' : ''}" 
              ${!canClaim ? 'disabled' : ''} 
              data-level="${reward.level}">
        ${isClaimed ? 'Claimed' : 'Claim'}
      </button>
    `;
    
    els.bpLevelsContainer.appendChild(levelRow);
  });
  
  // Add claim button listeners
  els.bpLevelsContainer.querySelectorAll('.bp-claim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = parseInt(btn.dataset.level);
      claimReward(level);
    });
  });
}

function getRewardIcon(reward) {
  switch (reward.type) {
    case 'coins': return '🪙';
    case 'crate': return '🎁';
    case 'avatar': return '🎭';
    default: return '❓';
  }
}

function getRewardName(reward) {
  switch (reward.type) {
    case 'coins': return `${reward.amount} Coins`;
    case 'crate': return `${reward.rarity} Crate`;
    case 'avatar': return `${reward.category} Item`;
    default: return 'Unknown';
  }
}

function claimReward(level) {
  if (battlePassState.claimedRewards.includes(level)) return;
  if (level > battlePassState.level) return;
  
  const rewardData = BATTLE_PASS_REWARDS.find(r => r.level === level);
  if (!rewardData) return;
  
  // Determine which reward to give based on premium status
  const reward = battlePassState.premiumUnlocked ? rewardData.premium : rewardData.free;
  
  // Add claiming animation to button
  const claimBtn = document.querySelector(`.bp-claim-btn[data-level="${level}"]`);
  if (claimBtn) {
    claimBtn.classList.add('claiming');
  }
  
  // Grant reward after short delay for animation
  setTimeout(() => {
    grantBattlePassReward(reward);
    
    // Mark as claimed
    battlePassState.claimedRewards.push(level);
    saveBattlePass();
    
    // Add rewarded animation to reward items
    const levelRow = document.querySelector(`.bp-level-row:nth-child(${level})`);
    if (levelRow) {
      const rewardItems = levelRow.querySelectorAll('.bp-reward-item');
      const itemIndex = battlePassState.premiumUnlocked ? 1 : 0;
      if (rewardItems[itemIndex]) {
        rewardItems[itemIndex].classList.add('rewarded');
      }
    }
    
    // Re-render
    setTimeout(() => {
      renderBattlePass();
      playSound('coin');
    }, 300);
  }, 500);
}

function grantBattlePassReward(reward) {
  switch (reward.type) {
    case 'coins':
      state.coins += reward.amount;
      saveCoins();
      break;
    case 'crate':
      // Grant crate - add to inventory or open immediately
      openCrate(reward.rarity);
      break;
    case 'avatar':
      // Grant avatar item
      grantAvatarItem(reward.category, reward.item);
      break;
  }
}

function grantAvatarItem(category, itemId) {
  if (!avatarInventory[category].includes(itemId)) {
    avatarInventory[category].push(itemId);
    saveAvatarInventory();
  }
}

function unlockPremium() {
  battlePassState.premiumUnlocked = true;
  saveBattlePass();
  renderBattlePass();
  playSound('coin');
}

// ===== SLOT MACHINE SYSTEM =====

function saveSlotMachine() {
  localStorage.setItem(STORAGE_KEYS.slotMachine, JSON.stringify(slotMachineState));
}

function loadSlotMachine() {
  const saved = localStorage.getItem(STORAGE_KEYS.slotMachine);
  if (saved) {
    slotMachineState = JSON.parse(saved);
  }
}

function canSpinToday() {
  if (!slotMachineState.lastSpinDate) return true;
  
  const lastSpin = new Date(slotMachineState.lastSpinDate);
  const today = new Date();
  
  return lastSpin.toDateString() !== today.toDateString();
}

function updateSlotStatus() {
  if (canSpinToday()) {
    els.spinStatusText.textContent = '✨ Spin available today!';
    els.spinBtn.disabled = false;
    els.spinTimer.textContent = '';
  } else {
    els.spinStatusText.textContent = '⏰ Already spun today';
    els.spinBtn.disabled = true;
    
    // Calculate time until next spin
    const lastSpin = new Date(slotMachineState.lastSpinDate);
    const tomorrow = new Date(lastSpin);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const now = new Date();
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    els.spinTimer.textContent = `Next spin in: ${hours}h ${minutes}m`;
  }
}

function getRandomSlotSymbol() {
  const totalWeight = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const symbol of SLOT_SYMBOLS) {
    random -= symbol.weight;
    if (random <= 0) return symbol;
  }
  
  return SLOT_SYMBOLS[0];
}

function spinSlotMachine() {
  if (!canSpinToday()) return;
  
  els.spinBtn.disabled = true;
  els.slotResult.hidden = true;
  
  // Play spin start sound
  playSound('powerup');
  
  // Start spinning animation
  const slots = [els.slot1, els.slot2, els.slot3];
  const symbols = [];
  
  // Spin each reel with staggered timing
  slots.forEach((slot, index) => {
    slot.classList.remove('revealed');
    slot.classList.add('spinning');
    
    // Change symbols rapidly during spin
    const spinInterval = setInterval(() => {
      const randomSymbol = getRandomSlotSymbol();
      slot.textContent = randomSymbol.icon;
    }, 80);
    
    // Stop each reel at different times with slowdown effect
    setTimeout(() => {
      clearInterval(spinInterval);
      slot.classList.remove('spinning');
      slot.classList.add('stopping');
      
      setTimeout(() => {
        slot.classList.remove('stopping');
        
        const finalSymbol = getRandomSlotSymbol();
        slot.textContent = finalSymbol.icon;
        slot.classList.add('revealed');
        symbols.push(finalSymbol);
        
        // Play reel stop sound
        playSound('coin');
        
        // If last reel, calculate reward
        if (index === 2) {
          setTimeout(() => calculateSlotReward(symbols), 300);
        }
      }, 500);
    }, 1200 + (index * 600));
  });
}

function calculateSlotReward(symbols) {
  const types = symbols.map(s => s.type);
  const counts = {};
  
  types.forEach(type => {
    counts[type] = (counts[type] || 0) + 1;
  });
  
  let rewardKey = 'mixed';
  
  // Check for jackpots
  if (types[0] === 'jackpot' && types[1] === 'jackpot' && types[2] === 'jackpot') {
    rewardKey = 'jackpot';
    playSound('coin'); // Extra sound for jackpot
  } else if (counts.coins === 3) {
    rewardKey = '3-coins';
  } else if (counts.coins === 2) {
    rewardKey = '2-coins';
  } else if (counts.crate === 3) {
    rewardKey = '3-crate';
  } else if (counts.crate === 2) {
    rewardKey = '2-crate';
  } else if (counts.avatar_base === 1 && counts.avatar_face === 1 && counts.avatar_accessory === 1) {
    rewardKey = '3-avatar';
  }
  
  const reward = SLOT_REWARDS[rewardKey];
  
  // Grant reward
  grantSlotReward(reward);
  
  // Update spin date
  slotMachineState.lastSpinDate = new Date().toISOString();
  saveSlotMachine();
  
  // Show result
  els.slotResultText.textContent = reward.message;
  els.slotResult.hidden = false;
  
  updateSlotStatus();
  playSound('coin');
}

function grantSlotReward(reward) {
  switch (reward.type) {
    case 'coins':
      state.coins += reward.amount;
      saveCoins();
      break;
    case 'crate':
      openCrate(reward.rarity);
      break;
    case 'avatar':
      // Grant random avatar item from each category
      const categories = ['bases', 'faces', 'accessories'];
      categories.forEach(cat => {
        const items = AVATAR_CATALOG[cat];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        grantAvatarItem(cat, randomItem.id);
      });
      break;
  }
}

// ===== XP FLOATING TEXT & LEVEL UP NOTIFICATIONS =====

function showXPFloatText(amount) {
  const container = document.getElementById('xp-float-container');
  if (!container) return;
  
  const floatText = document.createElement('div');
  floatText.className = 'xp-float-text';
  floatText.textContent = `+${Math.floor(amount)} XP`;
  
  // Position near the center of the screen
  floatText.style.left = '50%';
  floatText.style.top = '40%';
  floatText.style.transform = 'translateX(-50%)';
  
  container.appendChild(floatText);
  
  // Remove after animation completes
  setTimeout(() => {
    floatText.remove();
  }, 1500);
}

function showLevelUpNotification(newLevel) {
  const notification = document.createElement('div');
  notification.className = 'level-up-notification';
  notification.innerHTML = `
    <div class="level-up-title">🎉 LEVEL UP!</div>
    <div class="level-up-text">You reached Level ${newLevel}!</div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 2 seconds
  setTimeout(() => {
    notification.remove();
  }, 2000);
}


