/**
 * Local database of pathway graph nodes, cross-branch relationships, and quiz definitions.
 */

const CATEGORY_COLORS = {
  Technology: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', hex: '#6366F1' },
  'Art & Design': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', hex: '#EC4899' },
  Business: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', hex: '#F59E0B' },
  Communication: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', hex: '#F97316' },
  Science: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', hex: '#10B981' },
  Leadership: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', hex: '#06B6D4' }
};

const PATHWAY_NODES = [
  // Technology Core Branch
  {
    id: 'scratch',
    title: 'Scratch Coding',
    shortDescription: 'Drag and drop colorful blocks to create games, interactive stories, and simple logic.',
    interestTags: ['Technology'],
    x: 80,
    y: 180,
    activity: {
      type: 'scratch-block',
      title: 'Logic Block Order',
      description: 'Reorder the blocks so the sprite moves forward when green flag is clicked.'
    },
    nextPathways: ['programming', 'graphic-design']
  },
  {
    id: 'programming',
    title: 'Programming Foundations',
    shortDescription: 'Learn how computers use step-by-step instructions, loops, and variables.',
    interestTags: ['Technology', 'Science'],
    x: 420,
    y: 120,
    activity: {
      type: 'python-greet',
      title: 'Write Your First Command',
      description: 'Complete the string command to make your bot greet a classmate.'
    },
    nextPathways: ['web-design', 'cybersecurity']
  },
  {
    id: 'web-design',
    title: 'Web Design & Layout',
    shortDescription: 'Combine styling, page structure, and interactive components to build web apps.',
    interestTags: ['Technology', 'Art & Design'],
    x: 800,
    y: 80,
    activity: {
      type: 'css-stylist',
      title: 'Interactive Card Stylist',
      description: 'Toggle CSS properties to style a youth portfolio card live.'
    },
    nextPathways: ['robotics']
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Puzzles',
    shortDescription: 'Discover how to protect systems, inspect code safely, and solve digital detective puzzles.',
    interestTags: ['Technology', 'Business'],
    x: 800,
    y: 280,
    activity: {
      type: 'password-tester',
      title: 'Password Strength Lab',
      description: 'Test password combinations to see how fast a security key degrades.'
    },
    nextPathways: []
  },
  {
    id: 'robotics',
    title: 'Robotics & Hardware',
    shortDescription: 'Connect software instructions with physical motors, light sensors, and robotics micro-controllers.',
    interestTags: ['Technology', 'Science', 'Leadership'],
    x: 1180,
    y: 160,
    activity: {
      type: 'sensor-quiz',
      title: 'Obstacle Sensor Pick',
      description: 'Select which sensor unit prevents a mini rover from hitting a obstacle.'
    },
    nextPathways: []
  },

  // Creativity Core Branch
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    shortDescription: 'Master color harmony, typography contrast, and icon layouts for media design.',
    interestTags: ['Art & Design', 'Communication'],
    x: 420,
    y: 450,
    activity: {
      type: 'color-picker',
      title: 'Brand Color Palette',
      description: 'Select complementary high-contrast colors for a student club logo.'
    },
    nextPathways: ['animation', 'photography']
  },
  {
    id: 'photography',
    title: 'Digital Photography',
    shortDescription: 'Explore framing, lighting, and composition techniques to tell visual stories.',
    interestTags: ['Art & Design', 'Communication'],
    x: 800,
    y: 480,
    activity: {
      type: 'framing-quiz',
      title: 'Rule of Thirds Alignment',
      description: 'Pick the composition frame that correctly highlights the focal subject.'
    },
    nextPathways: []
  },
  {
    id: 'animation',
    title: '2D Animation & Motion',
    shortDescription: 'Animate character motion and vector assets through frame timing and keyframing.',
    interestTags: ['Art & Design', 'Technology'],
    x: 800,
    y: 680,
    activity: {
      type: 'fps-slider',
      title: 'Frame Rate Adjuster',
      description: 'Change frames-per-second to see how smooth motion transitions become.'
    },
    nextPathways: []
  }
];

const PATHWAY_EDGES = [
  { source: 'scratch', target: 'programming' },
  { source: 'scratch', target: 'graphic-design' },
  { source: 'programming', target: 'web-design' },
  { source: 'programming', target: 'cybersecurity' },
  { source: 'web-design', target: 'robotics' },
  { source: 'graphic-design', target: 'photography' },
  { source: 'graphic-design', target: 'animation' }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'When you have free time on a computer, what do you enjoy doing most?',
    options: [
      { text: 'Building games or customizing web pages', tags: ['Technology'] },
      { text: 'Drawing, editing images, or making videos', tags: ['Art & Design'] },
      { text: 'Organizing projects or sharing ideas with friends', tags: ['Leadership', 'Communication'] }
    ]
  },
  {
    id: 'q2',
    question: 'How do you like solving tough problems?',
    options: [
      { text: 'Testing step-by-step logic and code scripts', tags: ['Technology', 'Science'] },
      { text: 'Designing visual diagrams and creative layouts', tags: ['Art & Design'] },
      { text: 'Discussing options and leading team decisions', tags: ['Leadership', 'Business'] }
    ]
  },
  {
    id: 'q3',
    question: 'What kind of project would you present to your class?',
    options: [
      { text: 'A interactive mini-app or automated robot demo', tags: ['Technology', 'Science'] },
      { text: 'A digital graphic storybook or animated video', tags: ['Art & Design', 'Communication'] },
      { text: 'A student enterprise pitch or team event plan', tags: ['Business', 'Leadership'] }
    ]
  }
];