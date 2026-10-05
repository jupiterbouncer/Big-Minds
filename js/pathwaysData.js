/**
 * Big Minds — Pathway graph data, interest categories, quiz questions.
 */

const CATEGORY_COLORS = {
  Technology:         { bg: 'bg-indigo-200', text: 'text-indigo-950', hex: '#818CF8' },
  'Art & Design':     { bg: 'bg-pink-200',   text: 'text-pink-950',   hex: '#F472B6' },
  'AI & Data':        { bg: 'bg-purple-200', text: 'text-purple-950', hex: '#C084FC' },
  Engineering:        { bg: 'bg-amber-200',  text: 'text-amber-950',  hex: '#FBBF24' },
  'Medicine & Health':{ bg: 'bg-rose-200',   text: 'text-rose-950',   hex: '#FB7185' },
  Environment:        { bg: 'bg-emerald-200',text: 'text-emerald-950',hex: '#34D399' },
  Business:           { bg: 'bg-sky-200',    text: 'text-sky-950',    hex: '#38BDF8' },
  Leadership:         { bg: 'bg-orange-200', text: 'text-orange-950', hex: '#FB923C' },
  Science:            { bg: 'bg-teal-200',   text: 'text-teal-950',   hex: '#2DD4BF' }
};

const PATHWAY_NODES = [
  /* ── TECHNOLOGY & AI ── */
  {
    id: 'scratch',
    title: 'Scratch Coding',
    shortDescription: 'Combine logic blocks to build games, interactive stories, and creative animations.',
    interestTags: ['Technology'],
    x: 60, y: 180,
    activity: { type: 'scratch-block', title: 'Move Command', description: 'Click to test a logic loop that moves a character forward.' },
    archetype: {
      title: 'Creative Software Architect',
      story: 'In 2042, you design interactive virtual worlds that help kids around the world learn complex ideas through play.',
      roleModels: [{ name: 'Mitch Resnick', detail: 'Creator of Scratch at MIT Media Lab.' }]
    },
    nextPathways: ['programming', 'graphic-design', 'space-science']
  },
  {
    id: 'programming',
    title: 'Programming Logic',
    shortDescription: 'Write step-by-step code — algorithms, variables, and automated bot scripts.',
    interestTags: ['Technology', 'AI & Data'],
    x: 420, y: 120,
    activity: { type: 'python-greet', title: 'Bot Greeting Command', description: 'Complete the string command to make your bot greet a classmate.' },
    archetype: {
      title: 'Autonomous System Developer',
      story: 'In 2042, you write code powering self-driving aid vehicles that deliver medical supplies to remote clinics.',
      roleModels: [{ name: 'Joy Buolamwini', detail: 'Computer scientist and founder of the Algorithmic Justice League.' }]
    },
    nextPathways: ['ai-ethics', 'robotics']
  },
  {
    id: 'ai-ethics',
    title: 'AI & Smart Systems',
    shortDescription: 'Train machine learning models and ensure artificial intelligence treats all humans fairly.',
    interestTags: ['AI & Data', 'Technology', 'Leadership'],
    x: 820, y: 60,
    activity: { type: 'ai-trainer', title: 'Model Bias Tester', description: 'Sort training images to make sure an image recognition AI recognizes all faces equally.' },
    archetype: {
      title: 'Ethical AI Guardian',
      story: 'In 2042, you audit global AI assistants to make sure they are helpful, truthful, and free of bias.',
      roleModels: [{ name: 'Fei-Fei Li', detail: 'Co-Director of Stanford Human-Centered AI Institute.' }]
    },
    nextPathways: []
  },

  /* ── SCIENCE ── */
  {
    id: 'space-science',
    title: 'Space & Nature Science',
    shortDescription: 'Investigate planets, ecosystems, and the scientific method through observation and experiments.',
    interestTags: ['Science', 'Environment'],
    x: 420, y: 330,
    activity: { type: 'planet-sort', title: 'Planet Size Challenge', description: 'Tap planets in order from smallest to largest.' },
    archetype: {
      title: 'Planetary Research Scientist',
      story: 'In 2042, you lead a team analysing data from Mars soil samples to understand how life could survive on other planets.',
      roleModels: [{ name: 'Mae Jemison', detail: 'First African-American woman astronaut and physician.' }]
    },
    nextPathways: ['eco-engineering', 'bio-tech']
  },

  /* ── ENGINEERING & ENVIRONMENT ── */
  {
    id: 'robotics',
    title: 'Robotics & Hardware',
    shortDescription: 'Connect software instructions with physical motors, sensors, and mechanical gears.',
    interestTags: ['Engineering', 'Technology'],
    x: 420, y: 520,
    activity: { type: 'sensor-quiz', title: 'Obstacle Avoidance', description: 'Pick the right sonar sensor to prevent a rover from bumping into obstacles.' },
    archetype: {
      title: 'Bionic Exploration Engineer',
      story: 'In 2042, you build robotic ocean probes that clean plastics from deep undersea trenches automatically.',
      roleModels: [{ name: 'Lonnie Johnson', detail: 'NASA Engineer & prolific inventor of mechanical toys and solar tech.' }]
    },
    nextPathways: ['bio-tech', 'eco-engineering']
  },
  {
    id: 'eco-engineering',
    title: 'Clean Energy & Environment',
    shortDescription: 'Harness solar, wind, and smart micro-grids to protect natural ecosystems.',
    interestTags: ['Environment', 'Engineering', 'Science'],
    x: 820, y: 420,
    activity: { type: 'solar-align', title: 'Solar Array Optimiser', description: 'Angle solar panels toward the sun to generate maximum clean kilowatt-hours.' },
    archetype: {
      title: 'Climate Tech Pioneer',
      story: 'In 2042, your zero-carbon power grids keep entire cities illuminated cleanly without fossil fuels.',
      roleModels: [{ name: 'Boyan Slat', detail: 'Founder of The Ocean Cleanup.' }]
    },
    nextPathways: []
  },

  /* ── MEDICINE & HEALTH ── */
  {
    id: 'bio-tech',
    title: 'Biomedical Innovation',
    shortDescription: 'Use digital sensors, genetics, and health tech to cure illnesses and design prosthetics.',
    interestTags: ['Medicine & Health', 'Engineering', 'Science'],
    x: 820, y: 600,
    activity: { type: 'health-pulse', title: 'Heart Monitor Graph', description: 'Adjust pulse rates to simulate normal resting heartbeats.' },
    archetype: {
      title: 'Nanotech Medical Specialist',
      story: 'In 2042, you program smart micro-capsules that deliver medicine directly to sick cells without surgery.',
      roleModels: [{ name: 'Dr. Patricia Bath', detail: 'Pioneering laser eye surgeon and inventor.' }]
    },
    nextPathways: []
  },

  /* ── ART & DESIGN ── */
  {
    id: 'graphic-design',
    title: 'Digital Graphic Design',
    shortDescription: 'Master colour theory, visual hierarchy, and branding contrast for modern media.',
    interestTags: ['Art & Design', 'Business'],
    x: 420, y: 780,
    activity: { type: 'color-picker', title: 'Brand Palette Mixer', description: 'Pick complementary high-contrast colours for a youth movement brand.' },
    archetype: {
      title: 'Global Brand Visionary',
      story: 'In 2042, your design studio shapes how worldwide space-tourism initiatives communicate with the public.',
      roleModels: [{ name: 'Paula Scher', detail: 'Iconic graphic designer and partner at Pentagram.' }]
    },
    nextPathways: ['animation']
  },
  {
    id: 'animation',
    title: '3D & Motion Animation',
    shortDescription: 'Bring vector characters to life through frame intervals, movement physics, and lighting.',
    interestTags: ['Art & Design', 'Technology'],
    x: 820, y: 780,
    activity: { type: 'fps-slider', title: 'Frame Rate Adjuster', description: 'Slide frame rates to see how smooth motion keyframes become.' },
    archetype: {
      title: 'Immersive Movie Director',
      story: 'In 2042, you direct interactive 3D holographic movies that viewers can walk inside of.',
      roleModels: [{ name: 'Ed Catmull', detail: 'Co-founder of Pixar and computer graphics pioneer.' }]
    },
    nextPathways: []
  },

  /* ── BUSINESS & LEADERSHIP ── */
  {
    id: 'entrepreneurs',
    title: 'Young Entrepreneurs',
    shortDescription: 'Turn ideas into action with basic business planning, budgeting, and creative problem-solving.',
    interestTags: ['Business', 'Leadership'],
    x: 60, y: 650,
    activity: { type: 'budget-calc', title: 'Budget Splitter', description: 'You have GHS 100. Decide how much to save, spend, and invest.' },
    archetype: {
      title: 'Social Enterprise Founder',
      story: 'In 2042, you run a company that turns recycled ocean plastic into affordable school supplies for communities worldwide.',
      roleModels: [{ name: 'Fred Swaniker', detail: 'Ghanaian entrepreneur and founder of African Leadership Group.' }]
    },
    nextPathways: ['graphic-design']
  }
];

const PATHWAY_EDGES = [
  { source: 'scratch',       target: 'programming' },
  { source: 'scratch',       target: 'graphic-design' },
  { source: 'scratch',       target: 'space-science' },
  { source: 'programming',   target: 'ai-ethics' },
  { source: 'programming',   target: 'robotics' },
  { source: 'space-science',  target: 'eco-engineering' },
  { source: 'space-science',  target: 'bio-tech' },
  { source: 'robotics',      target: 'eco-engineering' },
  { source: 'robotics',      target: 'bio-tech' },
  { source: 'graphic-design', target: 'animation' },
  { source: 'entrepreneurs',  target: 'graphic-design' }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'When you get free time on a computer or tablet, what sounds most exciting?',
    options: [
      { text: 'Building games or writing code logic', tags: ['Technology', 'AI & Data'] },
      { text: 'Drawing, making animations, or editing photos', tags: ['Art & Design'] },
      { text: 'Tinkering with gadgets or fixing physical objects', tags: ['Engineering'] },
      { text: 'Learning about animals, nature, or space science', tags: ['Environment', 'Medicine & Health', 'Science'] }
    ]
  },
  {
    id: 'q2',
    question: 'How do you prefer solving big challenges with friends?',
    options: [
      { text: 'Testing step-by-step solutions until the code works', tags: ['Technology', 'Engineering'] },
      { text: 'Brainstorming unique artistic layouts and visual logos', tags: ['Art & Design'] },
      { text: 'Leading the team strategy and organising tasks', tags: ['Leadership', 'Business'] },
      { text: 'Finding eco-friendly ways to protect people & nature', tags: ['Environment', 'Medicine & Health', 'Science'] }
    ]
  },
  {
    id: 'q3',
    question: 'What kind of weekend project sounds most fun?',
    options: [
      { text: 'Building a small robot or gadget from old parts', tags: ['Engineering', 'Technology'] },
      { text: 'Making a short movie, comic, or designing logos', tags: ['Art & Design'] },
      { text: 'Organising a neighbourhood cleanup or food drive', tags: ['Environment', 'Leadership'] },
      { text: 'Researching how the human body fights diseases', tags: ['Medicine & Health', 'Science'] }
    ]
  },
  {
    id: 'q4',
    question: 'If you could have any superpower, which would you pick?',
    options: [
      { text: 'Understanding any computer code at a glance', tags: ['Technology', 'AI & Data'] },
      { text: 'Making anything you sketch come to life', tags: ['Art & Design'] },
      { text: 'Healing anyone just by touching them', tags: ['Medicine & Health', 'Science'] },
      { text: 'Controlling weather to prevent natural disasters', tags: ['Environment', 'Engineering'] }
    ]
  },
  {
    id: 'q5',
    question: 'Your class is choosing a field trip. Which gets your vote?',
    options: [
      { text: 'A tech company or university coding lab', tags: ['Technology', 'AI & Data'] },
      { text: 'A film studio, art gallery, or design workshop', tags: ['Art & Design', 'Business'] },
      { text: 'A hospital or medical research centre', tags: ['Medicine & Health', 'Science'] },
      { text: 'A solar farm or nature conservation reserve', tags: ['Environment', 'Engineering'] }
    ]
  },
  {
    id: 'q6',
    question: 'Which after-school club would you join first?',
    options: [
      { text: 'Robotics or coding club', tags: ['Engineering', 'Technology'] },
      { text: 'Student council, debate, or young entrepreneurs', tags: ['Leadership', 'Business'] },
      { text: 'Art, photography, or film-making club', tags: ['Art & Design'] },
      { text: 'Science experiments or nature exploration club', tags: ['Environment', 'Science', 'Medicine & Health'] }
    ]
  }
];