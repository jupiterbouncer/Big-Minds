/**
 * Big Minds — Structured Five Mentorship Modules Dataset
 * Standardized six-stage configuration for:
 * 1. Programming and Web Development (`programming`)
 * 2. Graphic Design (`graphic-design`)
 * 3. Financial Literacy (`financial-literacy`)
 * 4. Public Speaking (`public-speaking`)
 * 5. Entrepreneurship (`entrepreneurship`)
 *
 * Adding new videos, presentations, handouts, or resources simply requires updating
 * the `watch.videos` or `learn.resources` arrays below without duplicating HTML.
 */

(function (window) {
  'use strict';

  const MENTORSHIP_STAGES = [
    { id: 'discover', number: 1, label: 'Discover', shortLabel: 'Discover', icon: '🔍' },
    { id: 'watch', number: 2, label: 'Watch', shortLabel: 'Watch', icon: '🎬' },
    { id: 'learn', number: 3, label: 'Learn', shortLabel: 'Learn', icon: '📖' },
    { id: 'practise', number: 4, label: 'Practise', shortLabel: 'Practise', icon: '🛠️' },
    { id: 'reflect', number: 5, label: 'Reflect', shortLabel: 'Reflect', icon: '💭' },
    { id: 'explore-further', number: 6, label: 'Explore Further', shortLabel: 'Explore', icon: '🚀' }
  ];

  const MENTORSHIP_MODULES = [
    /* ========================================================================
       1. PROGRAMMING AND WEB DEVELOPMENT
       ======================================================================== */
    {
      slug: 'programming',
      id: 'area-1',
      title: 'Programming and Web Development',
      shortTitle: 'Programming & Web',
      interestTag: 'Programming and Web',
      badgeId: 'web-architect',
      pathwayNodeIds: ['web-foundations', 'software-logic'],
      icon: '💻',
      estimatedDuration: '35–45 mins',
      theme: {
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-950',
        softBg: 'bg-indigo-50',
        accentBg: 'bg-indigo-600',
        border: 'border-indigo-300',
        hex: '#6366F1'
      },
      summary: 'Learn how websites and software products are built from scratch using HTML structure, CSS styling, and logical problem-solving.',
      skills: [
        'HTML Document Structure',
        'CSS Styling & Responsive Layout',
        'DOM & Interactive Logic',
        'Algorithmic Thinking & Debugging'
      ],
      outcomes: [
        'Understand how browsers turn HTML, CSS, and JavaScript into interactive pages.',
        'Modify live code to build and style a basic personal webpage.',
        'Spot how digital platforms solve everyday problems locally and globally.'
      ],

      discover: {
        whatItInvolves: 'Programming and web development is the craft of turning ideas into working digital tools using structured instructions called code. On the web, HTML provides the skeleton (headings, text, links, images), CSS controls the visual styling and layout, and JavaScript handles interactive behaviour and logic.',
        whyItMatters: 'Almost every organisation, school, business, and creator now relies on digital tools. Knowing how software and websites work gives you the ability to build solutions yourself—whether a portfolio, a school noticeboard, or an online service—instead of only consuming technology.',
        realWorldApplications: [
          'Building school portals, student clubs, or personal portfolio websites.',
          'Powering mobile-friendly payment and logistics platforms (like Paystack or Flutterwave).',
          'Automating repetitive tasks such as attendance tracking or quiz scoring.',
          'Creating online storefronts so small local businesses can reach customers anywhere.'
        ],
        careerPathways: [
          'Frontend Web Developer',
          'Full-Stack Software Engineer',
          'Mobile App Developer',
          'Product / Cloud Architect',
          'Cybersecurity & Systems Analyst'
        ],
        expectToLearn: [
          'How semantic HTML tags organise content clearly on a screen.',
          'How colours, padding, and borders make interfaces easy to read on phones and laptops.',
          'How conditional logic validates user inputs before an action runs.'
        ],
        roleModels: [
          { name: 'Iyinoluwa Aboyeji', detail: 'Co-founder of Andela and Flutterwave, helping build digital payment and engineering talent infrastructure across Africa.' },
          { name: 'Joy Buolamwini', detail: 'Computer scientist and founder of the Algorithmic Justice League researching fairer software systems.' }
        ]
      },

      watch: {
        intro: 'Short guided video walkthroughs showing how a webpage comes together and how logic drives digital tools.',
        videos: [
          {
            id: 'prog-vid-1',
            title: 'How the Web Works: HTML, CSS & JavaScript in Action',
            duration: '5–8 mins (Planned)',
            description: 'A visual introduction comparing a webpage to a building: HTML as structure, CSS as interior design, and JavaScript as electricity.',
            type: 'pending',
            url: '',
            statusNote: 'Facilitator video recording is pending upload. You can move straight to Learn and build a live webpage in Practise!'
          },
          {
            id: 'prog-vid-2',
            title: 'Code Along: Creating Your First Personal Bio Card',
            duration: '6–10 mins (Planned)',
            description: 'Step-by-step demonstration of writing headings, paragraphs, links, and button styles for a personal webpage.',
            type: 'pending',
            url: '',
            statusNote: 'Code-along screencast will appear here once uploaded.'
          }
        ]
      },

      learn: {
        intro: 'Work through these bite-sized web development building blocks at your own pace.',
        sections: [
          {
            title: '1. The Three Layers of Every Website',
            summary: 'Webpages separate content, visual appearance, and interactive behaviour into three clear layers.',
            keyPoints: [
              'HTML (Structure): Uses tags like <h1>, <p>, <img>, and <a> to define headings, text, photos, and links.',
              'CSS (Presentation): Controls colours, spacing, fonts, borders, and how cards rearrange on mobile vs desktop screens.',
              'JavaScript (Behaviour): Responds when someone clicks a button, checks form inputs, or updates content live.'
            ],
            tip: 'Keep HTML focused on meaning first—clean structure makes mobile styling much easier.'
          },
          {
            title: '2. Anatomy of a Clean Personal Webpage',
            summary: 'A strong beginner personal webpage only needs four intentional parts.',
            keyPoints: [
              'Header & Name: Clearly state who you are and what interests you.',
              'Short Bio: 2–3 lines sharing your curiosity areas or current goals.',
              'Skills or Projects List: Highlight 2–3 things you are learning or proud of.',
              'Call to Action: A clear button or link (such as a project showcase or contact note).'
            ],
            tip: 'Clarity beats clutter: visitors usually decide within seconds what your page is about.'
          },
          {
            title: '3. Thinking Like a Programmer: Inputs, Conditions & Outputs',
            summary: 'Beyond HTML and CSS, software uses clear rules to avoid errors.',
            keyPoints: [
              'Input validation checks whether a user entered valid data (for example, checking that a transfer amount is not negative or bigger than a balance).',
              'If/Else conditions let a program choose the right response automatically.',
              'Testing edge cases early saves real users from confusing bugs.'
            ],
            tip: 'Whenever a program fails, read the exact error condition first rather than guessing.'
          }
        ],
        resources: [
          {
            title: 'Web Architecture & HTML/CSS Quick Reference Slides',
            format: 'PPTX',
            description: 'Workshop presentation covering core HTML tags, CSS styling properties, and mobile layout basics.',
            url: '',
            status: 'pending'
          },
          {
            title: 'First Personal Webpage Worksheet & Tag Cheat Sheet',
            format: 'PDF',
            description: 'Printable guide with starter HTML templates for offline practice.',
            url: '',
            status: 'pending'
          }
        ]
      },

      practise: {
        title: 'Build a Basic Personal Webpage',
        objective: 'Customise real HTML/CSS fields to generate and preview your own starter personal webpage card.',
        whatYouNeed: [
          'Your display name or nickname',
          'A short personal tagline or interest statement',
          'Two or three skills or topics you want to highlight',
          'A theme colour that keeps text easy to read'
        ],
        steps: [
          'Enter your preferred display name and a short 1-sentence bio in the builder below.',
          'Add 2–3 skills or interests separated by commas (e.g. "HTML, Graphic Design, Problem Solving").',
          'Pick a button label and background theme colour, then inspect both the generated HTML snippet and Live Webpage Preview.',
          'Check that your text contrasts clearly against the card background before marking your challenge complete.'
        ],
        expectedOutcome: 'A customised personal bio webpage preview alongside readable starter HTML you could copy into an `.html` file.',
        sandboxType: 'personal-webpage',
        reflectionPrompt: 'Optional note: What section would you add next if you published this webpage?'
      },

      reflect: {
        intro: 'Check your understanding and note one next step for your coding curiosity.',
        knowledgeChecks: [
          {
            id: 'prog-kc-1',
            question: 'Which web technology is mainly responsible for defining the structure of headings, paragraphs, and links on a page?',
            options: [
              'HTML',
              'CSS',
              'A printer driver',
              'Only image files'
            ],
            correctIndex: 0,
            explanation: 'HTML defines semantic structure (headings, paragraphs, lists, links), while CSS handles styling and JavaScript powers interactivity.'
          },
          {
            id: 'prog-kc-2',
            question: 'Why should software check user inputs (like an empty field or a number below zero) before running an action?',
            options: [
              'To make the webpage load slower',
              'To prevent errors and give users clear, safe feedback',
              'To hide the page navigation',
              'Because CSS cannot colour buttons without it'
            ],
            correctIndex: 1,
            explanation: 'Input validation protects logic from invalid values and ensures users know what needs fixing.'
          }
        ],
        writtenPrompt: 'What kind of simple web tool or personal project would be useful in your school or community?',
        selfAssessmentPrompt: 'How confident do you feel explaining how HTML and CSS work together?'
      },

      exploreFurther: {
        tools: [
          { name: 'MDN Web Docs (Learn Web Development)', description: 'Free, industry-standard reference and beginner tutorials for HTML, CSS, and JavaScript.', note: 'Great for looking up tags and properties.' },
          { name: 'freeCodeCamp', description: 'Hands-on browser coding challenges in Responsive Web Design and JavaScript.', note: 'Works completely in a browser without paid software.' },
          { name: 'Visual Studio Code (VS Code) & GitHub Pages', description: 'Free code editor and free static website hosting to publish your own HTML pages online.', note: 'Recommended once you build a local `.html` file.' }
        ],
        educationAndCareers: [
          'Computer Science, Software Engineering, or Information Technology pathways',
          'Frontend / Full-Stack Engineering internships & open-source fellowships',
          'Building digital tools alongside Graphic Design (UI/UX) or Entrepreneurship'
        ],
        nextSteps: [
          'Copy your generated HTML snippet from Practise into a file named `my-page.html` and open it in any browser.',
          'Visit the Graphic Design module to sharpen how your websites look and feel.'
        ],
        relatedSlugs: ['graphic-design', 'entrepreneurship']
      }
    },

    /* ========================================================================
       2. GRAPHIC DESIGN
       ======================================================================== */
    {
      slug: 'graphic-design',
      id: 'area-2',
      title: 'Graphic Design',
      shortTitle: 'Graphic Design',
      interestTag: 'Graphic Design',
      badgeId: 'design-innovator',
      pathwayNodeIds: ['brand-identity', 'ui-ux-design'],
      icon: '🎨',
      estimatedDuration: '30–40 mins',
      theme: {
        badgeBg: 'bg-pink-100',
        badgeText: 'text-pink-950',
        softBg: 'bg-pink-50',
        accentBg: 'bg-pink-600',
        border: 'border-pink-300',
        hex: '#EC4899'
      },
      summary: 'Master visual hierarchy, typography, colour contrast, and layout thinking to communicate ideas clearly through posters and digital interfaces.',
      skills: [
        'Visual Hierarchy & Focal Points',
        'Colour Contrast & Accessibility',
        'Typography Pairing',
        'Poster & Interface Layout'
      ],
      outcomes: [
        'Explain why visual hierarchy determines what a viewer notices first, second, and third.',
        'Design a readable promotional poster using intentional contrast and spacing.',
        'Evaluate visual layouts for clarity across phones and printed materials.'
      ],

      discover: {
        whatItInvolves: 'Graphic design is visual problem-solving. It uses layout, typography (font choices and sizes), colour contrast, and imagery so that an audience immediately grasps your message—whether on a school event poster, product label, presentation slide, or mobile app screen.',
        whyItMatters: 'Even a brilliant event, product, or campaign gets ignored if people cannot read it cleanly or understand what action to take. Strong design builds instant trust and clarity without needing extra explanation.',
        realWorldApplications: [
          'Designing clear event posters, school club flyers, and awareness infographics.',
          'Creating visual brand identities (logos, colour palettes, packaging) for local startups.',
          'Designing intuitive mobile screens (UI/UX Design) for banking, health, or study apps.',
          'Structuring presentation decks so teachers, judges, or customers stay engaged.'
        ],
        careerPathways: [
          'Brand Identity & Graphic Designer',
          'UI/UX & Product Designer',
          'Art & Creative Director',
          'Motion & Visual Content Specialist'
        ],
        expectToLearn: [
          'The 3-level visual hierarchy rule for headlines, supporting details, and calls to action.',
          'How foreground/background contrast makes designs readable from across a room or on bright screens.',
          'How spacing ("white space") makes posters look polished rather than crowded.'
        ],
        roleModels: [
          { name: 'Lemi Ghariokwu', detail: 'Celebrated Nigerian visual artist and designer renowned for bold, storytelling album and editorial covers.' },
          { name: 'Paula Scher', detail: 'Graphic designer and Pentagram partner known for expressive typography and public brand systems.' }
        ]
      },

      watch: {
        intro: 'Visual walkthroughs breaking down poster hierarchy, colour contrast, and clean mobile layouts.',
        videos: [
          {
            id: 'design-vid-1',
            title: 'What Makes a Poster Readable From 5 Metres Away?',
            duration: '5–7 mins (Planned)',
            description: 'Before-and-after breakdown turning a cluttered flyer into a clean, structured poster using size contrast and spacing.',
            type: 'pending',
            url: '',
            statusNote: 'Facilitator design breakdown video is pending upload. Explore the Learn guide and Poster Builder below!'
          }
        ]
      },

      learn: {
        intro: 'Use these core visual design principles whenever you make a poster, slide deck, or flyer.',
        sections: [
          {
            title: '1. Visual Hierarchy: Guide the Viewer’s Eye',
            summary: 'Never make every piece of text the same size. A viewer should spot three layers in order.',
            keyPoints: [
              'Primary (Biggest & Boldest): What is this about? (Event name or headline).',
              'Secondary (Medium): Key facts—Who, When, Where, or Why it matters.',
              'Action / Details (Clear & Focused): What should the reader do next?'
            ],
            tip: 'Step back from your screen or squint lightly: whatever stands out first is your true focal point.'
          },
          {
            title: '2. Colour Contrast & Restraint',
            summary: 'Using too many bright colours competes for attention and reduces legibility.',
            keyPoints: [
              'Stick to 1 main background tone, 1 strong dark/light text colour, and 1 accent colour for emphasis.',
              'Light text on dark indigo or dark text on warm cream creates strong contrast (easy to read for everyone).',
              'Avoid placing neon yellow text directly on white, or dark blue text on black.'
            ],
            tip: 'A maximum of 2–3 intentional colours almost always beats 6 random colours.'
          },
          {
            title: '3. Breathing Room (Whitespace) & Alignment',
            summary: 'Empty space is not wasted space—it gives the reader’s eyes room to focus.',
            keyPoints: [
              'Leave consistent margins around the edges of your poster or card.',
              'Align text blocks cleanly (all left-aligned or purposefully centred—never half-and-half by accident).',
              'Limit fonts to 2 complementary styles: one bold display font for headings, one clean font for body details.'
            ],
            tip: 'If a layout feels messy, try removing one box or increasing padding before adding anything new.'
          }
        ],
        resources: [
          {
            title: 'Visual Communication & Brand Identity Deck',
            format: 'PPTX',
            description: 'Slide examples demonstrating poster contrast, typography pairings, and layout grids.',
            url: '',
            status: 'pending'
          },
          {
            title: 'Poster Grid & Colour Contrast Checklist',
            format: 'PDF',
            description: 'Printable 1-page reference card for student design reviews.',
            url: '',
            status: 'pending'
          }
        ]
      },

      practise: {
        title: 'Design a Simple Promotional Poster',
        objective: 'Create a high-contrast, legible promotional poster layout with a clear headline, event details, and call to action.',
        whatYouNeed: [
          'An event, school club, or initiative name',
          'Date, time, or key highlight line',
          'A short Call to Action (e.g. "Join This Friday")',
          'A colour scheme with strong contrast'
        ],
        steps: [
          'Write a short, punchy Poster Headline (4–6 words works best) in the builder below.',
          'Add concise supporting details (Who / When / Where) and a clear Call to Action badge.',
          'Test the different high-contrast colour palettes and alignment options to see how legibility changes.',
          'Inspect the live Poster Preview on screen and check that the headline reads first at a glance.'
        ],
        expectedOutcome: 'A balanced, high-contrast promotional poster composition applying visual hierarchy.',
        sandboxType: 'promo-poster',
        reflectionPrompt: 'Optional note: Why did you choose that palette and headline wording for your audience?'
      },

      reflect: {
        intro: 'Test your design instincts and reflect on how visual communication improves ideas.',
        knowledgeChecks: [
          {
            id: 'design-kc-1',
            question: 'If a poster puts the event date, long paragraph, venue address, and title in the exact same font size, what problem happens?',
            options: [
              'Lack of visual hierarchy makes it hard to know what matters most at a glance',
              'The poster becomes too high-contrast',
              'Too much whitespace wastes ink',
              'It uses fewer than three colours'
            ],
            correctIndex: 0,
            explanation: 'Visual hierarchy uses size, weight, and spacing contrast so viewers immediately spot the title first and key details next.'
          },
          {
            id: 'design-kc-2',
            question: 'Which colour rule generally creates cleaner, easier-to-read designs?',
            options: [
              'Use at least 7 unrelated bright colours on every slide',
              'Use a disciplined 2–3 colour palette with strong text-to-background contrast',
              'Place light grey text on a white background',
              'Fill every pixel edge-to-edge with text'
            ],
            correctIndex: 1,
            explanation: 'A focused 2–3 colour palette with strong contrast and generous margins keeps layouts clear and professional.'
          }
        ],
        writtenPrompt: 'Think of a poster, sign, or app you saw recently—what made it easy or hard to read?',
        selfAssessmentPrompt: 'How confident do you feel organising text and colours on a poster or presentation slide?'
      },

      exploreFurther: {
        tools: [
          { name: 'Figma (Free Starter Plan)', description: 'Browser-based collaborative design tool used worldwide for UI/UX, social graphics, and wireframes.', note: 'Works on laptops without heavy installation.' },
          { name: 'Canva', description: 'Accessible layout tool for creating posters, slides, and infographics cleanly.', note: 'Great for quickly testing typography and hierarchy.' },
          { name: 'Coolors / WebAIM Contrast Checker', description: 'Free tools for picking balanced palettes and verifying text readability.', note: 'Helpful when testing colour accessibility.' }
        ],
        educationAndCareers: [
          'Visual Communication, Graphic Design, Industrial Design, or Digital Media studies',
          'UI/UX Product Design (pairs closely with Programming & Web)',
          'Creative Entrepreneurship & Brand Strategy'
        ],
        nextSteps: [
          'Recreate a real school or community notice using the 3-level hierarchy rule.',
          'Check out Programming & Web to turn visual designs into live interactive websites.'
        ],
        relatedSlugs: ['programming', 'entrepreneurship']
      }
    },

    /* ========================================================================
       3. FINANCIAL LITERACY
       ======================================================================== */
    {
      slug: 'financial-literacy',
      id: 'area-3',
      title: 'Financial Literacy',
      shortTitle: 'Financial Literacy',
      interestTag: 'Financial Literacy',
      badgeId: 'money-smart',
      pathwayNodeIds: ['student-budgeting', 'venture-economics'],
      icon: '💰',
      estimatedDuration: '30–40 mins',
      theme: {
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-950',
        softBg: 'bg-emerald-50',
        accentBg: 'bg-emerald-600',
        border: 'border-emerald-300',
        hex: '#10B981'
      },
      summary: 'Build practical money habits—separating needs from wants, structuring a realistic weekly student budget, protecting savings, and understanding unit costs.',
      skills: [
        'Needs vs Wants Prioritisation',
        'Weekly & Monthly Budgeting',
        'Savings Cushion Discipline',
        'Basic Cost & Profit Awareness'
      ],
      outcomes: [
        'Distinguish essential student expenses from flexible wants.',
        'Allocate a weekly allowance across essentials, transport/data, wants, and savings without overspending.',
        'Understand how consistent small savings protect against unexpected costs.'
      ],

      discover: {
        whatItInvolves: 'Financial literacy is the practical ability to understand how money comes in, where it goes, and how to make intentional decisions before you spend. For secondary students preparing for university, vocational training, or work, it starts with budgeting allowances, avoiding debt traps, and tracking cash flow.',
        whyItMatters: 'Managing money poorly creates avoidable stress even when income grows. Building simple tracking and saving habits early gives you independence, protects you during emergencies, and equips you to evaluate business or education opportunities wisely.',
        realWorldApplications: [
          'Stretching a weekly or monthly pocket allowance across food, transport, data bundles, and books.',
          'Comparing mobile banking options, transfer fees, and protecting PIN/OTP security.',
          'Saving gradually toward exam fees, a laptop, or a starter business kit.',
          'Calculating whether a student side hustle actually makes profit after transport and data costs.'
        ],
        careerPathways: [
          'Financial Analyst & Planner',
          'Chartered Accountant / Auditor',
          'Investment & Development Finance Specialist',
          'Fintech Product Strategist'
        ],
        expectToLearn: [
          'How the 50 / 30 / 20 guideline adapts to real student life.',
          'Why "paying your savings first" works better than saving whatever happens to be left over.',
          'How hidden small daily expenses add up over a month.'
        ],
        roleModels: [
          { name: 'Ngozi Okonjo-Iweala', detail: 'Director-General of the World Trade Organization and former Finance Minister celebrated for fiscal reform and public finance leadership.' },
          { name: 'Bola Adesola', detail: 'Banking executive and advocate for financial inclusion and disciplined economic stewardship.' }
        ]
      },

      watch: {
        intro: 'Practical video guides explaining student cash flow, Needs vs Wants, and avoiding common spending leaks.',
        videos: [
          {
            id: 'fin-vid-1',
            title: 'Where Does Pocket Money Disappear? The Weekly Budget Reset',
            duration: '5–7 mins (Planned)',
            description: 'Walking through a relatable student week (transport, snacks, mobile data, emergencies) and building a stress-free savings habit.',
            type: 'pending',
            url: '',
            statusNote: 'Video lesson is awaiting recording/upload. Dive into the structured guide and Weekly Budget Builder below!'
          }
        ]
      },

      learn: {
        intro: 'Clear, practical rules you can apply immediately to pocket money, stipends, or part-time earnings.',
        sections: [
          {
            title: '1. Know Your Real Cash Inflow vs Expenses',
            summary: 'A budget is simply a plan made before money is spent—not a punishment.',
            keyPoints: [
              'Start with your exact guaranteed weekly or monthly inflow (never count money you only hope to get).',
              'Group spending into three buckets: Essentials (food, transport, school/study data), Flexible Wants (snacks, outings), and Savings.',
              'Track every small cash or mobile transfer for just 7 days—most people discover one surprising leak.'
            ],
            tip: 'Saving even 10–20% automatically on day one builds an emergency buffer before wants eat into it.'
          },
          {
            title: '2. Needs vs Wants Under Real Pressure',
            summary: 'Smart budgeting is mostly about honest trade-offs, not zero fun.',
            keyPoints: [
              'Need: Essential meals, transport to school/work, mandatory study materials or core data.',
              'Want: Upgrading a meal, extra entertainment bundles, impulse purchases when peers are buying.',
              'Ask before an unplanned spend: "What goal will this delay if I buy it right now?"'
            ],
            tip: 'Wait 24 hours before buying non-essential items—if you still need it tomorrow, plan it into next week.'
          },
          {
            title: '3. Digital Money Safety & Unit Awareness',
            summary: 'With mobile banking and fintech transfers everywhere, protecting money also means protecting your account.',
            keyPoints: [
              'Never share your PIN, banking password, or SMS One-Time Passcodes (OTPs) with anyone—no real bank staff will ever ask.',
              'Notice transfer charges and recurring subscriptions that silently drain balances.',
              'If running a small hustle, separate personal spending money from business restocking money.'
            ],
            tip: 'Two separate wallets (or envelopes) for "Spend" and "Save" prevent accidental overspending.'
          }
        ],
        resources: [
          {
            title: 'Student Budgeting & Financial Discipline Slides',
            format: 'PPTX',
            description: 'Session deck walking through needs vs wants, savings targets, and student scenarios.',
            url: '',
            status: 'pending'
          },
          {
            title: '7-Day Personal Cash Flow Tracker Sheet',
            format: 'PDF',
            description: 'Printable weekly tracker table for logging daily expenses and savings progress.',
            url: '',
            status: 'pending'
          }
        ]
      },

      practise: {
        title: 'Develop a Personal Weekly Budget',
        objective: 'Plan a balanced 7-day student budget in your preferred currency while protecting a realistic savings cushion.',
        whatYouNeed: [
          'Your chosen currency (switchable inside the builder or profile)',
          'An estimated weekly allowance or stipend amount',
          'Realistic estimates for food, transport/data, and personal wants'
        ],
        steps: [
          'Set a realistic Weekly Allowance / Income amount in the calculator below.',
          'Adjust your planned allocations for Essentials (Food & Study), Transport & Mobile Data, and Flexible Wants.',
          'Watch your Remaining Savings Cushion update automatically—aim for at least 15–20% saved without going negative.',
          'Review the instant budget health feedback and note one spending habit you would adjust.'
        ],
        expectedOutcome: 'A balanced weekly budget plan showing exact amounts, percentages, and healthy savings protection.',
        sandboxType: 'weekly-budget',
        reflectionPrompt: 'Optional note: What was the hardest trade-off when balancing your weekly budget?'
      },

      reflect: {
        intro: 'Check your financial reasoning with two realistic scenarios.',
        knowledgeChecks: [
          {
            id: 'fin-kc-1',
            question: 'You receive a weekly allowance and want to build an emergency cushion. When is the most effective time to set savings aside?',
            options: [
              'Wait until Sunday night and save whatever happens to be left over',
              'Set aside your savings target right when you receive the allowance, then budget the remainder',
              'Borrow from a friend whenever an emergency occurs',
              'Spend wants first and skip transport later'
            ],
            correctIndex: 1,
            explanation: 'Paying your savings target first ensures unexpected small wants do not quietly absorb your entire allowance.'
          },
          {
            id: 'fin-kc-2',
            question: 'Which item belongs strictly under "Business Costs" rather than pure profit for a student selling snacks at break time?',
            options: [
              'Total cash received from customers',
              'Ingredients, packaging bags, and transport paid to buy supplies',
              'Compliments from classmates',
              'The sticker price printed on the wrapper alone'
            ],
            correctIndex: 1,
            explanation: 'True profit equals revenue minus all costs (materials, packaging, and transport). Forgetting small costs leads to hidden losses.'
          }
        ],
        writtenPrompt: 'What is one financial rule or weekly tracking habit you plan to practise over the next two weeks?',
        selfAssessmentPrompt: 'How confident do you feel creating and sticking to a personal weekly budget?'
      },

      exploreFurther: {
        tools: [
          { name: 'Spreadsheet Budget Template (Google Sheets / Excel)', description: 'Build a simple 4-column tracker (Date, Item, Category, Amount) using free spreadsheet tools.', note: 'Great digital skill that carries into university and work.' },
          { name: 'Junior Achievement / Financial Education Guides', description: 'Accessible youth resources on saving, compound growth, and smart borrowing.', note: 'Focus on foundational concepts before complex investing.' }
        ],
        educationAndCareers: [
          'Accounting, Economics, Finance, Actuarial Science, or Business Administration',
          'Personal Wealth Advisory & Corporate Finance',
          'Entrepreneurship & Venture Economics'
        ],
        nextSteps: [
          'Track every expense for the next 7 days in a small notebook or phone notes app.',
          'Explore Entrepreneurship next to see how personal budgeting scales up to pricing a real business.'
        ],
        relatedSlugs: ['entrepreneurship', 'programming']
      }
    },

    /* ========================================================================
       4. PUBLIC SPEAKING
       ======================================================================== */
    {
      slug: 'public-speaking',
      id: 'area-4',
      title: 'Public Speaking',
      shortTitle: 'Public Speaking',
      interestTag: 'Public Speaking',
      badgeId: 'public-speaker',
      pathwayNodeIds: ['persuasive-speaking', 'professional-comm'],
      icon: '🎤',
      estimatedDuration: '30–40 mins',
      theme: {
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-950',
        softBg: 'bg-amber-50',
        accentBg: 'bg-amber-500',
        border: 'border-amber-300',
        hex: '#F59E0B'
      },
      summary: 'Learn to structure compelling ideas, manage stage nerves, project your voice with clarity, and deliver memorable speeches and interview responses.',
      skills: [
        'Speech Structuring (Hook-Point-Proof-CTA)',
        'Vocal Pace & Projection',
        'Stage Presence & Eye Contact',
        'STAR Interview Storytelling'
      ],
      outcomes: [
        'Structure a clear, persuasive 60-second speech around one focused message.',
        'Use breathing, pacing, and pauses to manage speaking nerves.',
        'Apply clear storytelling in school presentations, debates, and scholarship interviews.'
      ],

      discover: {
        whatItInvolves: 'Public speaking is the skill of organising your thoughts clearly and sharing them out loud so listeners understand, remember, and care about your message—whether speaking to a class of 30, defending a science project, pitching a business, or answering an admissions interview panel.',
        whyItMatters: 'Good ideas often go unheard when the speaker rushes, mumbles, or lacks structure. Confidence in speaking does not mean never feeling nervous; it means having a reliable structure and practice routine that carries your voice through.',
        realWorldApplications: [
          'Presenting capstone projects, debates, or assembly speeches with calm authority.',
          'Excelling in university admissions, scholarship interviews (such as Mastercard Foundation or national competitions), and job interviews.',
          'Pitching an idea to teachers, sponsors, or early customers in under a minute.',
          'Leading student clubs and team meetings smoothly.'
        ],
        careerPathways: [
          'Communications & Public Relations Lead',
          'Legal Advocate / Policy Analyst',
          'Educator, Host, or Broadcast Journalist',
          'Team Manager & Entrepreneur'
        ],
        expectToLearn: [
          'The 4-step 60-Second Speech blueprint (Hook, Main Point, Proof/Example, Call to Action).',
          'Practical physical resets to steady fast breathing and rushed speech.',
          'How the STAR method simplifies tough interview questions.'
        ],
        roleModels: [
          { name: 'Chimamanda Ngozi Adichie', detail: 'Acclaimed Nigerian author and speaker whose globally watched talks demonstrate storytelling power, calm cadence, and clarity.' },
          { name: 'Amina J. Mohammed', detail: 'Deputy Secretary-General of the United Nations, modelling composed high-stakes international communication.' }
        ]
      },

      watch: {
        intro: 'Short demonstrations on voice pacing, posture, and building a punchy 60-second speech.',
        videos: [
          {
            id: 'speak-vid-1',
            title: 'From Nervous to Clear: Controlling Pace, Posture & Pauses',
            duration: '5–7 mins (Planned)',
            description: 'Side-by-side comparison of rushing through cue cards vs anchoring your feet, breathing, and landing each sentence.',
            type: 'pending',
            url: '',
            statusNote: 'Coaching video is pending upload. Use the structured speech guide and live 60-second timer in Practise!'
          }
        ]
      },

      learn: {
        intro: 'Three reliable communication frameworks you can use immediately.',
        sections: [
          {
            title: '1. The 60-Second Speech Blueprint',
            summary: 'One minute passes fast—so focus on ONE clear idea delivered in four tidy beats (~130–140 words total).',
            keyPoints: [
              '1. Hook (10s): Open with a relatable question, short scene, or surprising fact.',
              '2. Core Message (20s): State your central idea or problem in plain language.',
              '3. Example or Proof (20s): Share one real example or reason why it matters.',
              '4. Closing / Call to Action (10s): End cleanly on a memorable sentence—never trail off with "so yeah, thank you."'
            ],
            tip: 'Short sentences sound far more confident aloud than long, complicated paragraphs.'
          },
          {
            title: '2. Managing Nerves & Delivery Mechanics',
            summary: 'Adrenaline makes speakers talk faster without noticing. Use physical cues to slow down.',
            keyPoints: [
              'Pause for 2 silent seconds before your first word while making eye contact across the room.',
              'Pause briefly after key points—silence gives listeners time to absorb what you just said.',
              'Aim your voice toward the back row instead of staring down at your paper.'
            ],
            tip: 'Keep cue cards to 4–5 bullet keywords rather than reading a full script word-for-word.'
          },
          {
            title: '3. Bonus: STAR Method for Interviews',
            summary: 'When an interviewer asks "Tell me about a time you solved a problem", avoid rambling by following S-T-A-R.',
            keyPoints: [
              'S — Situation: Briefly set the scene (where & when).',
              'T — Task: What challenge or responsibility did you face?',
              'A — Action: What specific steps did YOU take?',
              'R — Result: What happened, and what did you learn?'
            ],
            tip: 'Spend half your answer on Action and Result—that shows maturity and initiative.'
          }
        ],
        resources: [
          {
            title: 'Persuasive Speaking & Pitch Architecture Slides',
            format: 'PPTX',
            description: 'Workshop slides covering Hook-Point-Proof-CTA and vocal delivery drills.',
            url: '',
            status: 'pending'
          },
          {
            title: '60-Second Speech Cue Card Template',
            format: 'PDF',
            description: 'Printable outline template for rehearsals and peer feedback.',
            url: '',
            status: 'pending'
          }
        ]
      },

      practise: {
        title: 'Prepare and Deliver a 60-Second Speech',
        objective: 'Draft a structured 4-part speech on a topic you care about, check your word count for pacing, and rehearse aloud using the 60-second timer.',
        whatYouNeed: [
          'A topic you care about (e.g. a community issue, hobby, book, or project idea)',
          'About 60 seconds of quiet space to speak aloud',
          'The interactive speech builder and countdown timer below'
        ],
        steps: [
          'Pick a clear topic and fill in all 4 speech boxes: Hook, Core Message, Real Example/Proof, and Closing Call to Action.',
          'Check the automatic Spoken Time & Word Count guide—aim for roughly 110–145 words for a comfortable 60-second pace.',
          'Stand up (or sit upright), tap "Start 60s Rehearsal Timer", and deliver your speech out loud cleanly.',
          'Note one thing that went smoothly and one pause or sentence you want to tighten.'
        ],
        expectedOutcome: 'A structured 4-beat 60-second speech script rehearsed aloud against a live timer.',
        sandboxType: 'speech-rehearsal',
        reflectionPrompt: 'Optional note: Which part felt easiest to deliver—your opening Hook or your closing sentence?'
      },

      reflect: {
        intro: 'Review what makes spoken communication effective and note your personal speaking goal.',
        knowledgeChecks: [
          {
            id: 'speak-kc-1',
            question: 'When a speaker notices they are rushing due to stage nerves, what is one immediate physical fix?',
            options: [
              'Read twice as fast to finish early',
              'Look down at the floor so nobody makes eye contact',
              'Take a calm breath and insert a 1–2 second pause after important points',
              'Apologise three times before starting'
            ],
            correctIndex: 2,
            explanation: 'Pauses let you breathe, reset your pacing, and signal confidence to the audience.'
          },
          {
            id: 'speak-kc-2',
            question: 'In a 60-second speech, what is the main job of the opening "Hook"?',
            options: [
              'To list every detail of your biography',
              'To capture listeners’ curiosity within the first 10 seconds',
              'To replace the conclusion completely',
              'To apologise for taking people’s time'
            ],
            correctIndex: 1,
            explanation: 'A strong Hook gives your audience an immediate reason to lean in and listen to your core message.'
          }
        ],
        writtenPrompt: 'What upcoming moment (a class talk, club pitch, or interview) could you practise your 60-second structure for?',
        selfAssessmentPrompt: 'How comfortable do you feel organising and delivering a short 1-minute talk?'
      },

      exploreFurther: {
        tools: [
          { name: 'Phone Voice Recorder / Camera Self-Review', description: 'Recording a 60-second practice take and watching it once with sound on (and once muted) quickly reveals pacing and posture habits.', note: 'Free and available on almost any smartphone.' },
          { name: 'TED-Ed & Toastmasters Youth Tips', description: 'Short talks and open public-speaking guides showing how varied speakers open and close stories.', note: 'Study the first 30 seconds of talks you admire.' }
        ],
        educationAndCareers: [
          'Law, Journalism, Political Science, International Relations, or Education',
          'Debate Societies, Model UN, & Campus Leadership',
          'Venture Pitching & Sales Leadership (pairs with Entrepreneurship)'
        ],
        nextSteps: [
          'Rehearse your 60-second script once in front of a mirror or with one supportive friend.',
          'Try the Entrepreneurship module next to pitch a business solution using your new speaking structure!'
        ],
        relatedSlugs: ['entrepreneurship', 'graphic-design']
      }
    },

    /* ========================================================================
       5. ENTREPRENEURSHIP
       ======================================================================== */
    {
      slug: 'entrepreneurship',
      id: 'area-5',
      title: 'Entrepreneurship',
      shortTitle: 'Entrepreneurship',
      interestTag: 'Entrepreneurship',
      badgeId: 'future-entrepreneur',
      pathwayNodeIds: ['problem-discovery', 'mvp-creation'],
      icon: '🚀',
      estimatedDuration: '35–45 mins',
      theme: {
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-950',
        softBg: 'bg-purple-50',
        accentBg: 'bg-purple-600',
        border: 'border-purple-300',
        hex: '#8B5CF6'
      },
      summary: 'Learn how entrepreneurs spot real everyday problems, design simple Minimum Viable Products (MVPs), test unit pricing, and pitch a compelling idea.',
      skills: [
        'Customer Problem Discovery',
        'Lean MVP Scoping',
        'Value Proposition & Pricing',
        '1-Minute Venture Pitching'
      ],
      outcomes: [
        'Pinpoint a specific community or student problem worth solving.',
        'Scope a realistic small first test (MVP) instead of waiting for huge capital.',
        'Formulate a clear business idea and structured pitch explaining customer, solution, and revenue.'
      ],

      discover: {
        whatItInvolves: 'Entrepreneurship is spotting an unmet human need and organising resources creatively to build a solution that creates value—either as a profitable business or a sustainable social enterprise. It blends customer empathy, simple testing, financial discipline, and persuasive communication.',
        whyItMatters: 'You do not need millions in funding or a polished mobile app on day one to solve problems in your community. Learning how to test ideas small, listen to real users, and check basic costs equips you to create opportunities anywhere.',
        realWorldApplications: [
          'Starting a focused exam-prep tutoring service, healthy snack pack delivery, or uniform/book swap.',
          'Building digital freelance services (web setup, graphic posters, slide design) for local businesses.',
          'Addressing neighbourhood challenges like clean water access, recycling collection, or reliable study spaces.',
          'Intrapreneurship—bringing proactive problem-solving inside organisations and universities.'
        ],
        careerPathways: [
          'Startup Founder / Social Entrepreneur',
          'Product Manager & Venture Builder',
          'Business Strategist / Management Consultant',
          'Small Business & Operations Lead'
        ],
        expectToLearn: [
          'How the "5 Whys" uncovers root problems instead of shallow guesses.',
          'How Minimum Viable Products (MVPs) let you test demand within days.',
          'How to turn problem + customer + pricing into a clear 45-second venture pitch.'
        ],
        roleModels: [
          { name: 'Tara Fela-Durotoye', detail: 'Founder of House of Tara, pioneering modern beauty entrepreneurship and mentoring thousands of young founders across Nigeria.' },
          { name: 'Fred Swaniker', detail: 'Entrepreneur and founder of the African Leadership Academy, African Leadership University, and ALX.' }
        ]
      },

      watch: {
        intro: 'Short guides on spotting real customer needs and launching a simple test before spending big.',
        videos: [
          {
            id: 'ent-vid-1',
            title: 'Start Small, Test Real: From Everyday Frustration to Lean MVP',
            duration: '6–8 mins (Planned)',
            description: 'Real examples of young founders validating demand with a WhatsApp form or sample batch before investing heavily.',
            type: 'pending',
            url: '',
            statusNote: 'Founder case-study video is pending upload. Continue straight to Learn and the Venture Idea Pitch Builder!'
          }
        ]
      },

      learn: {
        intro: 'Practical frameworks used by modern founders to move from idea to real traction.',
        sections: [
          {
            title: '1. Fall in Love With the Problem First',
            summary: 'The most common startup mistake is building something nobody asked for.',
            keyPoints: [
              'Talk to 3–5 real people experiencing the inconvenience before creating your product.',
              'Ask "Tell me about the last time this happened" rather than "Would you buy my idea?" (people are polite and say yes too easily).',
              'Use the 5 Whys: ask "Why?" repeatedly to reach the real root cause.'
            ],
            tip: 'A painful, frequent problem for 50 people nearby is better than a vague idea for "everyone in the world."'
          },
          {
            title: '2. Build a Minimum Viable Product (MVP)',
            summary: 'An MVP is the smallest working version that delivers real value and tests whether customers will actually use or pay for it.',
            keyPoints: [
              'Must-Have (Test Now): Direct way to order/book, clear price, and reliable delivery.',
              'Post-MVP (Wait): Custom mobile apps, fancy printed boxes, automated bots, or big offices.',
              'Example: Test a peer study-notes service using a shared PDF and simple sign-up link before coding a custom platform.'
            ],
            tip: 'If your first test takes less than one week and almost zero upfront cash, you are thinking lean!'
          },
          {
            title: '3. Check Basic Unit Economics & Craft Your Pitch',
            summary: 'A sustainable business delivers value at a price higher than what each unit costs to produce.',
            keyPoints: [
              'Selling Price − Unit Cost (materials + packaging + delivery) = Gross Profit per unit.',
              'Your venture pitch needs 4 answers: Who is the customer? What hurts today? How does your solution help? How do you earn or sustain it?'
            ],
            tip: 'Clear numbers make people take student founders seriously immediately.'
          }
        ],
        resources: [
          {
            title: 'Problem Discovery & Lean MVP Slides',
            format: 'PPTX',
            description: 'Workshop slides on empathy interviews, 5 Whys, MVP scoping, and unit profit checks.',
            url: '',
            status: 'pending'
          },
          {
            title: 'One-Page Lean Business Idea Canvas',
            format: 'PDF',
            description: 'Printable worksheet to sketch customer segment, cost structure, and MVP test.',
            url: '',
            status: 'pending'
          }
        ]
      },

      practise: {
        title: 'Develop a Business Idea and Deliver a Short Pitch',
        objective: 'Define a concrete venture concept—customer problem, MVP solution, and quick unit price check—and assemble a ready-to-deliver pitch.',
        whatYouNeed: [
          'An everyday problem you have noticed at school, home, or in your neighbourhood',
          'A clear target customer group',
          'Estimated unit cost and selling price to test profitability'
        ],
        steps: [
          'Name your venture idea and describe the exact customer & root problem in the Venture Builder below.',
          'Define your 48-hour MVP (the simplest test you could try right away without expensive equipment).',
          'Enter an estimated Cost per Unit and Selling Price to verify your Gross Profit and Margin automatically.',
          'Generate your formatted Short Venture Pitch and read it aloud once as if pitching to a mentor or customer!'
        ],
        expectedOutcome: 'A verified mini business concept, margin check, and concise 1-minute founder pitch.',
        sandboxType: 'venture-pitch',
        reflectionPrompt: 'Optional note: What is the first small test or customer conversation you could run this week?'
      },

      reflect: {
        intro: 'Check your entrepreneurial judgement and capture your biggest takeaway.',
        knowledgeChecks: [
          {
            id: 'ent-kc-1',
            question: 'A student wants to launch an affordable lunch pre-order service at school. Which approach follows the Lean MVP principle?',
            options: [
              'Spend six months paying someone to build a complex native mobile app before asking students anything',
              'Test taking orders from 15 classmates for one week using a simple form and tracking real feedback',
              'Print 5,000 branded T-shirts before delivering the first meal',
              'Set the price below ingredient cost indefinitely'
            ],
            correctIndex: 1,
            explanation: 'An MVP validates genuine demand quickly and cheaply before committing major time or money.'
          },
          {
            id: 'ent-kc-2',
            question: 'If it costs you 1,200 to produce and deliver one item and you sell it for 2,000, what is your gross profit per unit?',
            options: [
              '3,200',
              '800',
              '1,200',
              '2,000'
            ],
            correctIndex: 1,
            explanation: 'Gross profit per unit is Selling Price (2,000) minus Unit Cost (1,200) = 800 (a 40% margin).'
          }
        ],
        writtenPrompt: 'Describe one unmet need around you that you noticed recently—who experiences it and how could someone test a fix simply?',
        selfAssessmentPrompt: 'How confident do you feel turning an everyday problem into a realistic business or service test?'
      },

      exploreFurther: {
        tools: [
          { name: 'One-Page Lean Canvas', description: 'A 9-box single-page business plan framework replacing 30-page rigid documents.', note: 'Focuses on Problem, Solution, Customer, Costs, and Revenue.' },
          { name: 'Tony Elumelu Foundation / Youth Innovation Challenges', description: 'Explore regional and international entrepreneurship programmes once you test an initial venture.', note: 'Great goal after running a small pilot.' }
        ],
        educationAndCareers: [
          'Entrepreneurship, Business Management, Economics, or Product Innovation',
          'Launching a Micro-Service combining Programming, Design, or Communication',
          'Social Impact & Community Venture Leadership'
        ],
        nextSteps: [
          'Ask 3 people from your target customer group about the problem you chose in Practise.',
          'Visit Public Speaking to refine how you deliver your venture pitch, or Financial Literacy to strengthen your numbers.'
        ],
        relatedSlugs: ['financial-literacy', 'public-speaking']
      }
    }
  ];

  function getMentorshipModuleBySlug(slug) {
    if (!slug) return null;
    const clean = String(slug).trim().toLowerCase();
    const aliasMap = {
      'programming-and-web': 'programming',
      'programming-web': 'programming',
      'web': 'programming',
      'design': 'graphic-design',
      'finance': 'financial-literacy',
      'speaking': 'public-speaking',
      'enterprise': 'entrepreneurship'
    };
    const resolved = aliasMap[clean] || clean;
    return MENTORSHIP_MODULES.find((m) => m.slug === resolved) || null;
  }

  function getMentorshipSlugByInterestTag(tag) {
    if (!tag) return 'programming';
    const norm = String(tag).trim().toLowerCase();
    const match = MENTORSHIP_MODULES.find(
      (m) =>
        m.interestTag.toLowerCase() === norm ||
        m.title.toLowerCase() === norm ||
        m.shortTitle.toLowerCase() === norm
    );
    return match ? match.slug : 'programming';
  }

  window.MENTORSHIP_STAGES = MENTORSHIP_STAGES;
  window.MENTORSHIP_MODULES = MENTORSHIP_MODULES;
  window.getMentorshipModuleBySlug = getMentorshipModuleBySlug;
  window.getMentorshipSlugByInterestTag = getMentorshipSlugByInterestTag;
})(window);
