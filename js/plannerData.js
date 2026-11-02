/**
 * Big Minds 2.0 — Service Project Planner Initial Data State
 * Configurable, school-independent programme plan defaults.
 */

const INITIAL_PLANNER_DATA = {
  projectMeta: {
    status: "Draft — Awaiting Partner Confirmation",
    schoolName: "Partner School / Cohort",
    location: "Accra / Lagos",
    lastUpdated: new Date().toISOString().split('T')[0]
  },

  targetClass: {
    targetGrade: "Senior Secondary (SS3 / Grade 11-12)",
    classIdentifier: "Cohort 1",
    expectedStudents: 30,
    confirmedStudents: 0,
    approvalStatus: "Draft - Pending Consultation",
    needsAssessmentNotes: "Learner cohort, schedule, and facilities are to be confirmed with partner leadership."
  },

  mentorshipAreas: [
    {
      id: "area-1",
      name: "Programming and Web",
      utility: "Introduces digital literacy, logical problem-solving, and foundational understanding of how websites work.",
      concepts: "HTML tags, simple CSS styling, logic loops, interactive page elements.",
      handsOnActivity: "Students modify button colors and text live on a simplified web page snippet to see cause and effect.",
      learningOutcome: "Understand that web pages are created using code instructions and build confidence in digital creation.",
      linkedPathwayNodeId: "web-foundations",
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Laptops/tablets or printed code block cards.",
      status: "Proposed"
    },
    {
      id: "area-2",
      name: "Graphic Design",
      utility: "Develops visual communication, aesthetic awareness, and clear design principles for posters and presentations.",
      concepts: "Color balance, typography hierarchy, visual clarity, layout design.",
      handsOnActivity: "Design a simple event poster using paper cutouts or digital templates prioritizing readability.",
      learningOutcome: "Identify effective design choices and communicate an idea visually.",
      linkedPathwayNodeId: "brand-identity",
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Drawing paper, markers, colored pencils, sample posters.",
      status: "Proposed"
    },
    {
      id: "area-3",
      name: "Financial Literacy",
      utility: "Builds healthy money habits, understanding of savings, and practical budgeting concepts.",
      concepts: "Needs vs. wants, earning, saving goals, basic budgeting.",
      handsOnActivity: "Allocate a student monthly budget across personal savings, food, data, and academic supplies.",
      learningOutcome: "Differentiate between essential expenses and optional spending.",
      linkedPathwayNodeId: "student-budgeting",
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Printed budget worksheets, digital budget calculator.",
      status: "Proposed"
    },
    {
      id: "area-4",
      name: "Entrepreneurship",
      utility: "Encourages creative problem-solving, value creation, and basic business planning.",
      concepts: "Identifying community problems, product ideas, cost price, selling price, simple profit.",
      handsOnActivity: "Develop a mini business idea to solve a community challenge and calculate unit economics vs profit.",
      learningOutcome: "Formulate a basic business proposition and understand how costs affect profitability.",
      linkedPathwayNodeId: "problem-discovery",
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Idea generation sheets, cost calculation cards.",
      status: "Proposed"
    },
    {
      id: "area-5",
      name: "Public Speaking",
      utility: "Fosters self-confidence, clear articulation, structured thinking, and effective presentation skills.",
      concepts: "Eye contact, voice projection, speech structure (Hook, Value, Proof, Call to Action).",
      handsOnActivity: "Deliver a 1-minute pitch introducing oneself or defending an idea created in an earlier session.",
      learningOutcome: "Present ideas clearly and confidently in front of peers and evaluators.",
      linkedPathwayNodeId: "persuasive-speaking",
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Cue cards, timer, prompt cards.",
      status: "Proposed"
    }
  ],

  visitSchedule: [
    {
      id: "visit-1",
      visitNumber: 1,
      title: "Partner Consultation & Needs Assessment",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "To be confirmed with partner leadership",
      mainObjective: "Meet school/cohort leadership, confirm the learner group, conduct a needs assessment, and establish baseline.",
      activitiesAgenda: "1. Introduce programme scope.\n2. Review learner needs with educators.\n3. Administer baseline curiosity pre-survey.\n4. Agree provisional session calendar.",
      relatedAreas: ["Learner Group Assessment"],
      leadFacilitator: "",
      supportingMembers: "",
      requiredMaterials: "Proposal brief, baseline pre-survey forms, digital device.",
      expectedOutputs: "Confirmed student count, approved visit schedule, educator feedback.",
      status: "Draft",
      notes: "Awaiting confirmed consultation date."
    },
    {
      id: "visit-2",
      visitNumber: 2,
      title: "Technology & Visual Creativity Workshop",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "To be confirmed",
      mainObjective: "Deliver introductory Programming & Web logic alongside Graphic Design principles.",
      activitiesAgenda: "1. Icebreaker & Big Minds digital map demo.\n2. Interactive Web coding activity.\n3. Poster layout & visual branding task.\n4. Group showcase.",
      relatedAreas: ["Programming and Web", "Graphic Design"],
      leadFacilitator: "",
      supportingMembers: "",
      requiredMaterials: "Demonstration laptop/projector, design paper, markers.",
      expectedOutputs: "Completed mini poster designs, student web interaction.",
      status: "Draft",
      notes: ""
    },
    {
      id: "visit-3",
      visitNumber: 3,
      title: "Financial Literacy & Business Ideas",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "To be confirmed",
      mainObjective: "Engage students in practical budgeting, savings goals, and mini business concepts.",
      activitiesAgenda: "1. Money story discussion.\n2. Needs vs Wants budget simulation game.\n3. Mini-business idea pitching in small groups.\n4. Cost/profit activity.",
      relatedAreas: ["Financial Literacy", "Entrepreneurship"],
      leadFacilitator: "",
      supportingMembers: "",
      requiredMaterials: "Budgeting worksheets, play currency, business planning cards.",
      expectedOutputs: "Completed budget sheets, mini business ideas created.",
      status: "Draft",
      notes: ""
    },
    {
      id: "visit-4",
      visitNumber: 4,
      title: "Public Speaking & Integrated Showcase",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "To be confirmed",
      mainObjective: "Develop communication skills and enable students to present their work confidently.",
      activitiesAgenda: "1. Public speaking tips & vocal warmups.\n2. 1-minute presentation preparation.\n3. Peer presentations of earlier designs/business ideas.\n4. Peer feedback & encouragement.",
      relatedAreas: ["Public Speaking"],
      leadFacilitator: "",
      supportingMembers: "",
      requiredMaterials: "Cue cards, microphone/speaker (if available), certificates.",
      expectedOutputs: "Every participating student delivers a short presentation.",
      status: "Draft",
      notes: ""
    },
    {
      id: "visit-5",
      visitNumber: 5,
      title: "Reflection, Evaluation & Programme Handover",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "To be confirmed",
      mainObjective: "Conduct final outcome assessment, celebrate student growth, and hand over reusable resources to educators.",
      activitiesAgenda: "1. Post-programme aggregate feedback survey.\n2. Pathway reflection session.\n3. Presentation of student participation certificates.\n4. Proposed handover of Big Minds starter guide to partner liaison.",
      relatedAreas: ["All Mentorship Areas"],
      leadFacilitator: "",
      supportingMembers: "",
      requiredMaterials: "Post-surveys, printed certificates, educator guide bundle.",
      expectedOutputs: "Completed outcome evaluations, handed-over teaching resource kit.",
      status: "Draft",
      notes: ""
    }
  ],

  workshops: [
    {
      id: "ws-1",
      areaId: "area-1",
      title: "Web Page Architecture & Logic",
      objective: "Understand how instructions control digital content and user interaction on modern web pages.",
      introduction: "Deconstruct how modern websites are structured: HTML content skeleton, CSS presentation layer, and JS interactive logic.",
      practicalActivity: "Interactive Button & Card Styling: Students change live CSS attributes and button actions to observe cause and effect.",
      materials: "Laptops, tablets, or printed code-matching cards.",
      facilitationApproach: "Pair students with varied digital experience; step-by-step guidance.",
      expectedOutcome: "Students successfully modify live web components and understand digital product fundamentals.",
      reflectionQuestion: "What kind of web tool or service would you like to build to solve a problem you care about?"
    },
    {
      id: "ws-2",
      areaId: "area-2",
      title: "Visual Communication & Brand Identity",
      objective: "Learn to arrange visual elements, hierarchy, and typography so key messages resonate clearly.",
      introduction: "Analyze real visual brand campaigns: what makes a poster legible from 5 meters away?",
      practicalActivity: "Design a visual announcement or brand concept focusing on title hierarchy, contrast ratio, and layout balance.",
      materials: "A3/A4 paper, felt pens, rulers, digital design templates.",
      facilitationApproach: "Encourage experimentation with bold headings before adding minor details.",
      expectedOutcome: "Students produce legible, structured brand visual mockups.",
      reflectionQuestion: "Why did you choose your primary accent colors for your visual piece?"
    },
    {
      id: "ws-3",
      areaId: "area-3",
      title: "Student Budgeting & Financial Discipline",
      objective: "Manage personal student living expenses, differentiate needs vs wants, and build savings discipline.",
      introduction: "Discuss realistic tertiary student living allowances: accommodation, mobile data, food, and emergency reserves.",
      practicalActivity: "Monthly Budget Challenge: Allocate a student allowance across categories while maintaining at least a 20% savings cushion.",
      materials: "Budget worksheets, digital budget calculator.",
      facilitationApproach: "Walk through realistic local scenarios (e.g., managing data bundles vs discretionary spending).",
      expectedOutcome: "Balanced monthly budget sheets with healthy emergency savings reserves.",
      reflectionQuestion: "What financial discipline rule will help you most when managing your own living expenses?"
    },
    {
      id: "ws-4",
      areaId: "area-4",
      title: "Community Problem Discovery & Unit Economics",
      objective: "Identify a verified community need, formulate a solution, and calculate cost price, selling price, and profit margin.",
      introduction: "Explain how viable enterprises must deliver more value than they consume in costs.",
      practicalActivity: "Calculate unit economics for a student service: material cost + packaging + delivery = Unit Cost; compute breakeven volume.",
      materials: "Business planning templates, cost-profit cards.",
      facilitationApproach: "Guide small groups through basic addition/subtraction for unit economics.",
      expectedOutcome: "Clear statement of business idea, cost per unit, and calculated profit margin.",
      reflectionQuestion: "How does your proposed venture solve a real community problem?"
    },
    {
      id: "ws-5",
      areaId: "area-5",
      title: "Persuasive Pitching & Interview Composure",
      objective: "Organize ideas into the Hook-Solution-Call to Action structure and present with composure and eye contact.",
      introduction: "Demonstrate nervous rushed speaking vs confident vocal cadence and assertive posture.",
      practicalActivity: "1-Minute Pitch: Present a venture or portfolio project using the Hook-Problem-Solution-Call to Action framework.",
      materials: "Cue cards, digital countdown timer.",
      facilitationApproach: "Maintain an encouraging, supportive environment with constructive peer feedback.",
      expectedOutcome: "Every participating student delivers a confident short presentation.",
      reflectionQuestion: "How did you feel before speaking, and what technique helped you feel most poised?"
    }
  ],

  teamRoles: [
    { id: "role-1", title: "Overall Programme Coordinator", assignedTo: "", status: "Unassigned" },
    { id: "role-2", title: "Institutional Liaison", assignedTo: "", status: "Unassigned" },
    { id: "role-3", title: "Lead Facilitator: Programming & Web", assignedTo: "", status: "Unassigned" },
    { id: "role-4", title: "Lead Facilitator: Graphic Design", assignedTo: "", status: "Unassigned" },
    { id: "role-5", title: "Lead Facilitator: Financial Literacy", assignedTo: "", status: "Unassigned" },
    { id: "role-6", title: "Lead Facilitator: Entrepreneurship", assignedTo: "", status: "Unassigned" },
    { id: "role-7", title: "Lead Facilitator: Public Speaking", assignedTo: "", status: "Unassigned" },
    { id: "role-8", title: "Logistics & Material Preparation", assignedTo: "", status: "Unassigned" },
    { id: "role-9", title: "Budget & Resource Manager", assignedTo: "", status: "Unassigned" },
    { id: "role-10", title: "Assessment & Data Lead", assignedTo: "", status: "Unassigned" },
    { id: "role-11", title: "Handover & Sustainability Lead", assignedTo: "", status: "Unassigned" }
  ],

  budgetItems: [
    {
      id: "bg-1",
      description: "Local transport for facilitation visits",
      category: "Transportation",
      quantity: 5,
      unitCost: 0,
      essential: true,
      source: "Local transit estimate",
      status: "Estimated",
      notes: "Calculated based on team transit routes."
    },
    {
      id: "bg-2",
      description: "Printing activity worksheets & curriculum handouts",
      category: "Printing",
      quantity: 150,
      unitCost: 0,
      essential: true,
      source: "Local printing vendor rate",
      status: "Estimated",
      notes: "Quantity based on student cohort size."
    },
    {
      id: "bg-3",
      description: "Workshop stationery materials (Chart paper, markers, pens)",
      category: "Stationery",
      quantity: 1,
      unitCost: 0,
      essential: true,
      source: "Vendor quote",
      status: "Estimated",
      notes: "Reusable materials for visual and business workshops."
    },
    {
      id: "bg-4",
      description: "Mobile data connectivity bundle for digital interactive map",
      category: "Data & Internet",
      quantity: 2,
      unitCost: 0,
      essential: false,
      source: "Telco package rate",
      status: "Estimated",
      notes: "Backup hotspot data for facilitator devices."
    },
    {
      id: "bg-5",
      description: "Student participation certificates & starter guide printing",
      category: "Printing",
      quantity: 35,
      unitCost: 0,
      essential: true,
      source: "Printing press rate",
      status: "Estimated",
      notes: "Awarded during Visit 5 handover."
    }
  ],

  assessment: {
    baselineStudents: 0,
    finalStudents: 0,
    attendanceRatePercent: 0,
    sessionsDelivered: 0,
    mentorsParticipated: 0,
    plannedActivitiesCompleted: 0,
    preSkillAwarenessPercent: 0,
    postSkillAwarenessPercent: 0,
    studentSatisfactionScore: "Pending Delivery",
    teacherFeedbackSummary: "Awaiting initial consultation session."
  },

  handoverChecklist: [
    { id: "hk-1", task: "Compile reusable lesson plans & digital activity guides", completed: false, notes: "Ready in digital planner" },
    { id: "hk-2", task: "Inventory required physical workshop materials & suppliers", completed: false, notes: "" },
    { id: "hk-3", task: "Prepare educator facilitator reference guide", completed: false, notes: "" },
    { id: "hk-4", task: "Confirm partner representative for programme continuation", completed: false, notes: "To confirm during consultation" },
    { id: "hk-5", task: "Deliver certificate bundle & printed starter package", completed: false, notes: "Scheduled for Visit 5" }
  ],

  sustainability: {
    targetHandoverDate: "",
    handoverStatus: "In Progress",
    partnerTeacherLiaison: "To Be Confirmed",
    recommendations: "1. Maintain an ongoing student curiosity club using the Big Minds digital platform.\n2. Establish peer-support arrangements where experienced students mentor junior classmates."
  }
};
