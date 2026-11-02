/**
 * Big Minds 2.0 — Pathway Graph Dataset, Curriculum Nodes & Curiosity Quiz
 * Geared towards older secondary students exploring career possibilities, practical skills,
 * and higher-education pathways across the 5 core mentorship areas:
 * 1. Programming and Web Development
 * 2. Graphic Design
 * 3. Financial Literacy
 * 4. Public Speaking
 * 5. Entrepreneurship
 */

const CATEGORY_COLORS = {
  'Programming and Web': { bg: 'bg-indigo-100', text: 'text-indigo-950', hex: '#6366F1' },
  'Graphic Design':      { bg: 'bg-pink-100',   text: 'text-pink-950',   hex: '#EC4899' },
  'Financial Literacy':  { bg: 'bg-emerald-100',text: 'text-emerald-950',hex: '#10B981' },
  'Public Speaking':     { bg: 'bg-amber-100',  text: 'text-amber-950',  hex: '#F59E0B' },
  'Entrepreneurship':    { bg: 'bg-purple-100', text: 'text-purple-950', hex: '#8B5CF6' },
  // Compatibility fallbacks
  Technology:            { bg: 'bg-indigo-100', text: 'text-indigo-950', hex: '#6366F1' },
  'Art & Design':        { bg: 'bg-pink-100',   text: 'text-pink-950',   hex: '#EC4899' },
  Business:              { bg: 'bg-emerald-100',text: 'text-emerald-950',hex: '#10B981' },
  Leadership:            { bg: 'bg-amber-100',  text: 'text-amber-950',  hex: '#F59E0B' }
};

const PATHWAY_NODES = [
  /* ── 1. PROGRAMMING AND WEB DEVELOPMENT ── */
  {
    id: 'web-foundations',
    title: 'Web Dev & Digital Architecture',
    shortDescription: 'Build modern interactive websites and web apps using structured HTML5, CSS3, and JavaScript logic.',
    interestTags: ['Programming and Web'],
    x: 60, y: 100,
    explore: 'Learn how the modern web functions from the ground up: how browsers parse documents, structure content with semantic HTML, style responsive layouts, and bring pages to life using JavaScript DOM manipulation.',
    whyItMatters: 'Almost every modern business, service, and creator depends on a digital presence. Knowing how to create websites gives you immediate autonomy to launch ideas and build real solutions.',
    skillsInvolved: 'Semantic markup, responsive layout grids, DOM manipulation, asynchronous fetching, and web hosting basics.',
    realWorldApplications: 'Creating corporate websites, online portfolios, e-commerce storefronts, student portals, and web utilities.',
    tryIt: 'Use the interactive code playground below to update real HTML structure and style live interactive elements.',
    possibleDirections: 'Frontend Developer, Full-Stack Engineer, Web Architect, Digital Product Specialist.',
    nextStep: 'Build a one-page personal portfolio or digital project showcase and deploy it free on GitHub Pages.',
    activity: {
      type: 'interactive-code',
      title: 'Live Web Page Builder',
      description: 'Edit real HTML and CSS attributes below to customize a live digital product showcase button and banner.',
      deliverable: 'A customized, styled digital product card ready for production.'
    },
    archetype: {
      title: 'Full-Stack Web Architect',
      story: 'You architect high-performance digital platforms and web applications that connect millions of users across Africa and globally.',
      roleModels: [
        { name: 'Iyinoluwa Aboyeji', detail: 'Co-founder of Andela and Flutterwave, pioneering African tech infrastructure.' },
        { name: 'Tim Berners-Lee', detail: 'Inventor of the World Wide Web and advocate for an open, accessible internet.' }
      ]
    },
    nextPathways: ['software-logic', 'ui-ux-design']
  },
  {
    id: 'software-logic',
    title: 'Software Engineering & Algorithms',
    shortDescription: 'Develop computational problem-solving, structured algorithms, API data handling, and automation scripts.',
    interestTags: ['Programming and Web'],
    x: 420, y: 80,
    explore: 'Move beyond visual templates to write modular code, structure data, interact with databases and REST APIs, and build algorithmic solutions that automate repetitive tasks.',
    whyItMatters: 'Software engineering is the foundation of digital innovation. Complex systems—from payment gateways to transportation logistics—rely on sound algorithmic logic and reliable error handling.',
    skillsInvolved: 'Algorithms, data structures, conditional control flow, API integration, debugging, and software version control (Git).',
    realWorldApplications: 'Fintech payment processing, medical record systems, automated notifications, data processing pipelines, and AI integration.',
    tryIt: 'Test an algorithm simulator that validates incoming data transactions and handles edge-case errors.',
    possibleDirections: 'Software Engineer, Systems Programmer, Cloud Architect, Cybersecurity Analyst.',
    nextStep: 'Learn Python or JavaScript on free platforms like freeCodeCamp and solve algorithmic challenges.',
    activity: {
      type: 'algorithm-test',
      title: 'Transaction Validation Logic',
      description: 'Run through an algorithmic test case verifying data security and validation before committing a transaction.',
      deliverable: 'A verified data processing function with edge-case test pass.'
    },
    archetype: {
      title: 'Scalable Systems Engineer',
      story: 'You engineer resilient cloud microservices and automated data infrastructure that power essential public and private services.',
      roleModels: [
        { name: 'Joy Buolamwini', detail: 'Computer scientist, AI researcher, and founder of the Algorithmic Justice League.' },
        { name: 'Mitchell Baker', detail: 'Executive Chairwoman of Mozilla, driving open-source software sustainability.' }
      ]
    },
    nextPathways: ['ui-ux-design', 'venture-economics']
  },

  /* ── 2. GRAPHIC DESIGN ── */
  {
    id: 'brand-identity',
    title: 'Visual Communication & Branding',
    shortDescription: 'Master color theory, visual hierarchy, typography contrast, and memorable brand identity design.',
    interestTags: ['Graphic Design'],
    x: 60, y: 440,
    explore: 'Discover how visual communication directs human attention, conveys emotional tone, and creates instant brand recognition across printed and digital media.',
    whyItMatters: 'Even the most groundbreaking idea goes unnoticed if people cannot understand or connect with its visual presentation. Design is visual problem-solving, not just aesthetics.',
    skillsInvolved: 'Typography hierarchy, color harmony, contrast ratios, vector layout, branding guidelines, and digital asset production.',
    realWorldApplications: 'Brand visual identities, event posters, marketing collateral, social media campaigns, packaging, and company logos.',
    tryIt: 'Select color harmonies and test contrast ratios in the brand palette mixer to ensure legibility and visual punch.',
    possibleDirections: 'Brand Identity Designer, Creative Director, Art Director, Visual Strategist.',
    nextStep: 'Create a brand style guide (color palette, typography pairings, and logo concept) for a community initiative.',
    activity: {
      type: 'brand-palette',
      title: 'Brand Palette & Contrast Tester',
      description: 'Pair primary, secondary, and accent colors to achieve AA accessibility contrast and strong visual impact.',
      deliverable: 'A cohesive 4-color branding palette with verified contrast scores.'
    },
    archetype: {
      title: 'Creative Brand Strategist',
      story: 'Your visual designs shape how multinational initiatives and leading social enterprises communicate their mission to the world.',
      roleModels: [
        { name: 'Paula Scher', detail: 'Iconic graphic designer, partner at Pentagram, and creator of renowned public brand identities.' },
        { name: 'Lemi Ghariokwu', detail: 'Legendary Nigerian visual artist and illustrator behind iconic cultural album designs.' }
      ]
    },
    nextPathways: ['ui-ux-design', 'persuasive-speaking']
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design & Product Strategy',
    shortDescription: 'Craft intuitive user interfaces, wireframes, user journeys, and human-centered digital experiences.',
    interestTags: ['Graphic Design', 'Programming and Web'],
    x: 420, y: 360,
    explore: 'Investigate how humans interact with digital tools. Map user flows, design interactive wireframes, and test usability to make software effortless and intuitive.',
    whyItMatters: 'A digital product is only as good as its usability. Excellent UX reduces friction, empowers diverse users, and drives adoption in everything from healthcare apps to educational tools.',
    skillsInvolved: 'User journey mapping, wireframing, component design systems, accessibility (WCAG), usability testing, and interactive prototyping.',
    realWorldApplications: 'Mobile banking applications, e-learning dashboards, ride-hailing interfaces, and public health portals.',
    tryIt: 'Optimize a high-friction student onboarding flow to reduce clicks and clarify primary actions.',
    possibleDirections: 'UI/UX Designer, Product Designer, Usability Researcher, Interaction Designer.',
    nextStep: 'Download Figma and design a 3-screen mobile application prototype solving a daily challenge at your school.',
    activity: {
      type: 'ux-wireframe',
      title: 'Interface Usability Optimizer',
      description: 'Arrange UI components with proper visual hierarchy, primary CTA placement, and clear touch targets.',
      deliverable: 'An optimized mobile screen layout with user-tested navigation hierarchy.'
    },
    archetype: {
      title: 'Principal Product Designer',
      story: 'You design intuitive digital interfaces that simplify critical services for tens of millions of first-time digital users.',
      roleModels: [
        { name: 'Don Norman', detail: 'Author of The Design of Everyday Things and pioneer of human-centered design.' },
        { name: 'Simi Adeagbo', detail: 'Trailblazing Olympian and advocate for human-centered technology and youth leadership.' }
      ]
    },
    nextPathways: ['mvp-creation', 'web-foundations']
  },

  /* ── 3. FINANCIAL LITERACY ── */
  {
    id: 'student-budgeting',
    title: 'Personal Finance & Student Budgeting',
    shortDescription: 'Manage tertiary education living costs, structure personal savings, and build responsible financial discipline.',
    interestTags: ['Financial Literacy'],
    x: 60, y: 760,
    explore: 'Prepare for independent adult life by mastering the fundamentals of money management: tracking cash inflows, categorizing essential versus discretionary costs, and building emergency cushions.',
    whyItMatters: 'Transitioning to tertiary education or work requires managing your own resources. Financial discipline protects you from stress, debt traps, and empowers you to invest in your own goals.',
    skillsInvolved: 'Expense tracking, needs vs. wants categorization, percentage budgeting (50/30/20), emergency savings, and digital payment safety.',
    realWorldApplications: 'Managing university allowances, budgeting for rent and food, setting up recurring savings, and digital banking security.',
    tryIt: 'Build a realistic monthly student budget allocating funds across accommodation, data, food, transport, and personal savings.',
    possibleDirections: 'Financial Analyst, Personal Wealth Advisor, Investment Consultant, Forensic Accountant.',
    nextStep: 'Open a personal student bank or digital wallet account and maintain an expense tracker for two consecutive weeks.',
    activity: {
      type: 'student-budget',
      title: 'Interactive Student Monthly Budget',
      description: 'Allocate your monthly funds across essential living categories using your selected currency.',
      deliverable: 'A balanced monthly budget demonstrating savings discipline and expense allocation.'
    },
    archetype: {
      title: 'Chief Financial Officer',
      story: 'You manage strategic resource allocation, financial modeling, and wealth sustainability for international growth organizations.',
      roleModels: [
        { name: 'Ngozi Okonjo-Iweala', detail: 'Director-General of the World Trade Organization and former Finance Minister.' },
        { name: 'Bola Adesola', detail: 'Prominent banker and international trade leader advocating for financial inclusion.' }
      ]
    },
    nextPathways: ['venture-economics', 'problem-discovery']
  },
  {
    id: 'venture-economics',
    title: 'Venture Economics & Cost Modeling',
    shortDescription: 'Calculate unit costs, gross margins, breakeven points, and sustainable pricing for commercial and social ventures.',
    interestTags: ['Financial Literacy', 'Entrepreneurship'],
    x: 420, y: 720,
    explore: 'Understand the mathematical engine of any enterprise: calculate what it actually costs to deliver one unit of value, determine healthy profit margins, and project when a venture reaches sustainability.',
    whyItMatters: 'Many ambitious ideas fail because their unit economics do not work. Knowing your numbers allows you to price products fairly, ensure profitability, and attract partners or investors.',
    skillsInvolved: 'Cost of Goods Sold (COGS), fixed vs variable expenses, gross and net margin calculation, breakeven analysis, and cash flow projections.',
    realWorldApplications: 'Pricing goods in local markets, forecasting small business cash flows, pitching financial models to micro-grants or investors.',
    tryIt: 'Calculate unit economics for a student-run printing or digital design service to determine breakeven volume.',
    possibleDirections: 'Venture Capital Analyst, Financial Modeler, Commercial Strategist, Enterprise Auditor.',
    nextStep: 'Pick an everyday local business (e.g. food cart, printing shop) and model their estimated daily costs, revenue, and profit.',
    activity: {
      type: 'venture-pricing',
      title: 'Unit Economics & Breakeven Calculator',
      description: 'Set raw material costs, production time, and markup to calculate breakeven volume and net margin.',
      deliverable: 'A realistic unit cost model and margin projection.'
    },
    archetype: {
      title: 'Impact Investment Strategist',
      story: 'You structure high-impact investment funds that channel capital into sustainable, high-growth African enterprises.',
      roleModels: [
        { name: 'Tony Elumelu', detail: 'Chairman of Heirs Holdings and founder of the Tony Elumelu Foundation empowering young African entrepreneurs.' },
        { name: 'Kofo Akinkugbe', detail: 'Founder and CEO of SecureID, pioneering high-security smartcard manufacturing in Africa.' }
      ]
    },
    nextPathways: ['mvp-creation', 'persuasive-speaking']
  },

  /* ── 4. PUBLIC SPEAKING ── */
  {
    id: 'persuasive-speaking',
    title: 'Persuasive Speaking & Pitching',
    shortDescription: 'Structure compelling speeches, master vocal control, engage audiences, and deliver high-impact presentations.',
    interestTags: ['Public Speaking'],
    x: 820, y: 220,
    explore: 'Develop the art and science of persuasive spoken communication. Learn how to structure ideas into memorable narrative arcs, modulate tone and pace, and speak with authentic presence.',
    whyItMatters: 'The best ideas in the world accomplish nothing if you cannot convince others to believe in them. Confidence in public speaking unlocks leadership opportunities and career advancement.',
    skillsInvolved: 'Speech structuring (Hook-Point-Proof-Call to Action), vocal resonance and modulation, body language, audience connection, and stage presence.',
    realWorldApplications: 'Delivering keynote presentations, school assemblies, project defenses, student council debates, and community town halls.',
    tryIt: 'Draft and rehearse a 60-second persuasive pitch using the proven Hook-Problem-Solution-Call to Action framework.',
    possibleDirections: 'Corporate Communications Director, Keynote Speaker, Media Broadcaster, Policy Advocate, Trial Lawyer.',
    nextStep: 'Record a 2-minute video on your phone explaining an idea you care deeply about, then review your body language and clarity.',
    activity: {
      type: 'pitch-builder',
      title: '60-Second Elevator Pitch Architect',
      description: 'Craft a punchy 4-stage pitch structure and test delivery timing with the interactive pace counter.',
      deliverable: 'A timed, structured 60-second persuasive script ready for delivery.'
    },
    archetype: {
      title: 'Global Communications Leader',
      story: 'You deliver keynote addresses at international forums and guide public narrative for transformative social movements.',
      roleModels: [
        { name: 'Chimamanda Ngozi Adichie', detail: 'Acclaimed author and speaker whose TED talks on storytelling and identity have inspired millions worldwide.' },
        { name: 'Barack Obama', detail: '44th U.S. President renowned for rhetorical precision, cadence, and unifying storytelling.' }
      ]
    },
    nextPathways: ['professional-comm', 'mvp-creation']
  },
  {
    id: 'professional-comm',
    title: 'Professional Communication & Interviews',
    shortDescription: 'Excel in university admissions, scholarship interviews, workplace networking, and structured Q&A under pressure.',
    interestTags: ['Public Speaking'],
    x: 820, y: 440,
    explore: 'Master one-on-one and panel communication for high-stakes settings: articulating your background concisely, answering behavioral questions with the STAR method, and handling unexpected questions calmly.',
    whyItMatters: 'Whether interviewing for a university scholarship, an internship, or defending an academic project, professional communication determines how your capabilities are perceived and rewarded.',
    skillsInvolved: 'The STAR interview technique (Situation, Task, Action, Result), concise personal introductions, active listening, and composure under pressure.',
    realWorldApplications: 'University admissions interviews, Mastercard Foundation scholarship panels, corporate internship interviews, and executive networking.',
    tryIt: 'Structure a response to "Tell me about a time you overcame a difficult setback" using the STAR technique.',
    possibleDirections: 'Human Resources Director, Executive Coach, diplomat, Talent Acquisition Specialist.',
    nextStep: 'Practice answering 3 common interview questions with a friend or in front of a mirror using the STAR method.',
    activity: {
      type: 'interview-star',
      title: 'STAR Method Interview Simulator',
      description: 'Fill in the Situation, Task, Action, and Result components for a compelling interview answer.',
      deliverable: 'A structured, professional answer ready for competitive scholarship or admissions interviews.'
    },
    archetype: {
      title: 'Diplomatic Envoy & Executive Negotiator',
      story: 'You represent high-level delegations in cross-border negotiations, building bridges across complex global interests.',
      roleModels: [
        { name: 'Kofi Annan', detail: 'Former UN Secretary-General and Nobel Peace Prize laureate celebrated for calm, principled diplomacy.' },
        { name: 'Amina J. Mohammed', detail: 'Deputy Secretary-General of the United Nations, championing the Sustainable Development Goals.' }
      ]
    },
    nextPathways: ['problem-discovery']
  },

  /* ── 5. ENTREPRENEURSHIP ── */
  {
    id: 'problem-discovery',
    title: 'Problem Discovery & Market Empathy',
    shortDescription: 'Identify real community bottlenecks, interview potential users, validate assumptions, and uncover genuine market demand.',
    interestTags: ['Entrepreneurship'],
    x: 820, y: 680,
    explore: 'Successful ventures start with deep curiosity about unmet human needs. Learn how to conduct customer empathy interviews, differentiate symptoms from root problems, and spot market opportunities.',
    whyItMatters: 'Building something nobody wants is the number one waste of time and resources. Grounding your project in verified human problems ensures your solutions actually matter.',
    skillsInvolved: 'Root-cause analysis (The 5 Whys), user interview techniques, assumption validation, and problem statement synthesis.',
    realWorldApplications: 'Investigating local waste management challenges, student transport difficulties, access to clean drinking water, or digital literacy gaps.',
    tryIt: 'Apply the "5 Whys" root-cause breakdown to a local challenge in your school or neighborhood.',
    possibleDirections: 'Venture Builder, Management Consultant, Social Enterprise Lead, Innovation Strategist.',
    nextStep: 'Interview 3 people in your neighborhood about a daily hassle they face and document the root causes.',
    activity: {
      type: 'five-whys',
      title: '5 Whys Root-Cause Analyzer',
      description: 'Drill down from a surface-level complaint to discover the systemic problem worth solving.',
      deliverable: 'A verified problem statement targeting a root community bottleneck.'
    },
    archetype: {
      title: 'Social Innovation Pioneer',
      story: 'You identify pressing community bottlenecks and build enduring social ventures that transform education and public infrastructure.',
      roleModels: [
        { name: 'Fred Swaniker', detail: 'Founder of the African Leadership Academy, African Leadership University, and ALX.' },
        { name: 'Tara Fela-Durotoye', detail: 'Pioneering entrepreneur and founder of House of Tara, transforming the African beauty industry.' }
      ]
    },
    nextPathways: ['mvp-creation']
  },
  {
    id: 'mvp-creation',
    title: 'MVP Building & Venture Launch',
    shortDescription: 'Build Minimum Viable Products, test value propositions with real users, gather feedback, and iterate rapidly.',
    interestTags: ['Entrepreneurship', 'Programming and Web', 'Financial Literacy'],
    x: 820, y: 920,
    explore: 'Turn validated ideas into tangible reality. Learn how to craft a Minimum Viable Product (MVP)—the simplest version of a product that delivers real value—and test it with users before investing heavy capital.',
    whyItMatters: 'Ideas are cheap; execution is everything. Building an MVP lets you test whether your proposed solution works, learn from real user feedback, and refine your approach without catastrophic risk.',
    skillsInvolved: 'Lean startup methodology, MVP scoping, feedback loop design, rapid prototyping, and value proposition articulation.',
    realWorldApplications: 'Testing a student tutoring service with a simple WhatsApp group before building an app; testing handmade products before bulk manufacturing.',
    tryIt: 'Define the core feature set of an MVP while discarding non-essential bells and whistles.',
    possibleDirections: 'Startup Founder, Tech Product Lead, Incubator Director, Commercial General Manager.',
    nextStep: 'Draft a one-page Lean Canvas outlining problem, solution, target audience, costs, and revenue streams.',
    activity: {
      type: 'mvp-scope',
      title: 'Lean MVP Scoping Canvas',
      description: 'Separate Must-Have core features from Nice-to-Have distractions to launch a working test in 48 hours.',
      deliverable: 'A scoped MVP launch plan with primary validation metrics.'
    },
    archetype: {
      title: 'Tech Founder & Venture Catalyst',
      story: 'You launch and scale high-growth ventures that solve continental challenges and create thousands of quality youth jobs.',
      roleModels: [
        { name: 'Olugbenga Agboola', detail: 'Founder and CEO of Flutterwave, enabling global digital commerce across Africa.' },
        { name: 'Strive Masiyiwa', detail: 'Telecom and tech pioneer, founder of Econet Global, and philanthropist supporting African tech education.' }
      ]
    },
    nextPathways: ['web-foundations', 'student-budgeting']
  }
];

const PATHWAY_EDGES = [
  { source: 'web-foundations',    target: 'software-logic' },
  { source: 'web-foundations',    target: 'ui-ux-design' },
  { source: 'software-logic',     target: 'venture-economics' },
  { source: 'brand-identity',     target: 'ui-ux-design' },
  { source: 'brand-identity',     target: 'persuasive-speaking' },
  { source: 'ui-ux-design',       target: 'mvp-creation' },
  { source: 'student-budgeting',  target: 'venture-economics' },
  { source: 'venture-economics',  target: 'mvp-creation' },
  { source: 'persuasive-speaking',target: 'professional-comm' },
  { source: 'professional-comm',  target: 'problem-discovery' },
  { source: 'problem-discovery',  target: 'mvp-creation' },
  { source: 'mvp-creation',       target: 'web-foundations' }
];

/* ─────────────────────────────────────────────────────────────
   CURIOSITY QUIZ QUESTIONS (Matured for Senior Secondary Students)
   Mapped strictly to the 5 core mentorship areas:
   - Programming and Web
   - Graphic Design
   - Financial Literacy
   - Public Speaking
   - Entrepreneurship
───────────────────────────────────────────────────────────── */

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'When faced with an open weekend to work on an independent project, what sounds most exciting to you?',
    options: [
      { text: 'Building an interactive website or writing an automation script', tags: ['Programming and Web'] },
      { text: 'Designing a compelling visual brand identity, poster, or digital prototype', tags: ['Graphic Design'] },
      { text: 'Auditing personal spending, setting up a budget, or researching investments', tags: ['Financial Literacy'] },
      { text: 'Rehearsing a speech, debate presentation, or podcast discussion', tags: ['Public Speaking'] },
      { text: 'Brainstorming a small business idea to solve a daily community need', tags: ['Entrepreneurship'] }
    ]
  },
  {
    id: 'q2',
    question: 'Think about a major problem in your community (e.g. transport bottlenecks, power, waste, access to learning). What is your first instinct?',
    options: [
      { text: 'Build a digital software app or platform to connect people with solutions', tags: ['Programming and Web'] },
      { text: 'Create clear infographic campaigns and visual signage to shift public awareness', tags: ['Graphic Design'] },
      { text: 'Analyze the costs, revenue models, and economic feasibility of solving it', tags: ['Financial Literacy', 'Entrepreneurship'] },
      { text: 'Rally people together through public advocacy, town halls, and persuasive presentations', tags: ['Public Speaking'] },
      { text: 'Launch a self-sustaining venture or pilot service to address the root problem', tags: ['Entrepreneurship'] }
    ]
  },
  {
    id: 'q3',
    question: 'In a collaborative team working on a capstone project, which role do you naturally gravitate toward?',
    options: [
      { text: 'The Technical Architect: Designing the digital tools, data logic, and systems', tags: ['Programming and Web'] },
      { text: 'The Visual Designer: Ensuring the slide deck, product layout, and visuals look polished and clear', tags: ['Graphic Design'] },
      { text: 'The Financial Strategist: Tracking the budget, managing funds, and calculating project ROI', tags: ['Financial Literacy'] },
      { text: 'The Team Pitcher: Presenting the findings, defending ideas during Q&A, and inspiring the judges', tags: ['Public Speaking'] },
      { text: 'The Venture Lead: Keeping the overall vision sharp, coordinating members, and validating with users', tags: ['Entrepreneurship'] }
    ]
  },
  {
    id: 'q4',
    question: 'Which practical skill would you most like to feel highly confident in before entering tertiary education or employment?',
    options: [
      { text: 'Building full-stack web applications and writing clean, scalable software', tags: ['Programming and Web'] },
      { text: 'Mastering digital design tools (like Figma) and creating professional portfolios', tags: ['Graphic Design'] },
      { text: 'Managing a monthly living allowance, investing wisely, and avoiding debt traps', tags: ['Financial Literacy'] },
      { text: 'Acing competitive scholarship and university admissions interviews with composure', tags: ['Public Speaking'] },
      { text: 'Validating a business proposition and launching a Minimum Viable Product with low capital', tags: ['Entrepreneurship'] }
    ]
  },
  {
    id: 'q5',
    question: 'If you had one month of dedicated mentorship from an accomplished industry leader, whose shadow would you want to be in?',
    options: [
      { text: 'A Lead Software Engineer building high-traffic digital platforms across Africa', tags: ['Programming and Web'] },
      { text: 'A Creative Director shaping global brand identities and digital product experiences', tags: ['Graphic Design'] },
      { text: 'A Chief Financial Officer or Wealth Strategist managing large-scale capital allocation', tags: ['Financial Literacy'] },
      { text: 'An International Diplomat or Keynote Advocate communicating ideas at the United Nations', tags: ['Public Speaking'] },
      { text: 'A Serial Startup Founder building scalable ventures that create thousands of jobs', tags: ['Entrepreneurship'] }
    ]
  },
  {
    id: 'q6',
    question: 'What kind of practical achievement would make you feel most proud over the next 6 months?',
    options: [
      { text: 'Deploying a live, working web application that real people visit and use', tags: ['Programming and Web'] },
      { text: 'Publishing a creative design portfolio containing brand concepts and interface wireframes', tags: ['Graphic Design'] },
      { text: 'Balancing a personal budget, growing my savings cushion, and mastering financial tools', tags: ['Financial Literacy'] },
      { text: 'Delivering a memorable public speech or winning an interview for an opportunity I care about', tags: ['Public Speaking'] },
      { text: 'Generating my first customer revenue or pilot traction from a service I created', tags: ['Entrepreneurship', 'Financial Literacy'] }
    ]
  }
];
