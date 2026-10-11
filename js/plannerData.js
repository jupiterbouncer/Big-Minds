/**
 * Big Minds — Service Project Planner Initial Data State
 * Leadership Seminar IV: Leadership as Service
 */

const INITIAL_PLANNER_DATA = {
  projectMeta: {
    status: "Draft — Awaiting School Confirmation",
    schoolName: "Crown Prince Academy",
    location: "Lapaz, Ghana",
    lastUpdated: new Date().toISOString().split('T')[0]
  },

  targetClass: {
    targetGrade: "Grade 5 / Grade 6 (To Be Confirmed)",
    classIdentifier: "Provisional - Section A",
    expectedStudents: 25,
    confirmedStudents: 0,
    approvalStatus: "Draft - Pending School Consultation",
    needsAssessmentNotes: "Initial assumption based on typical CPA class sizes (20–30 students). Final class allocation and schedule to be confirmed during Visit 1 with Crown Prince Academy management."
  },

  mentorshipAreas: [
    {
      id: "area-1",
      name: "Programming and Web",
      utility: "Introduces digital literacy, logical problem-solving, and foundational understanding of how websites work.",
      concepts: "HTML tags, simple CSS styling, logic loops, interactive page elements.",
      handsOnActivity: "Students modify button colors and text live on a simplified web page snippet to see cause and effect.",
      learningOutcome: "Understand that web pages are created using code instructions and build confidence in digital creation.",
      linkedPathwayNodeId: "1", // Coding & Logic
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
      linkedPathwayNodeId: "2", // Visual Arts & Design
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
      handsOnActivity: "Allocate a mock weekly budget across personal savings, snacks, and school stationery.",
      learningOutcome: "Differentiate between essential expenses and optional spending.",
      linkedPathwayNodeId: "4", // Money & Markets
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Printed budget worksheets, play money coins/notes.",
      status: "Proposed"
    },
    {
      id: "area-4",
      name: "Entrepreneurship",
      utility: "Encourages creative problem-solving, value creation, and basic business planning.",
      concepts: "Identifying community problems, product ideas, cost price, selling price, simple profit.",
      handsOnActivity: "Develop a mini business idea to solve a schoolyard problem and calculate production costs vs profit.",
      learningOutcome: "Formulate a basic business proposition and understand how costs affect profitability.",
      linkedPathwayNodeId: "3", // Innovation & Business
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Idea generation sheets, cost calculation cards.",
      status: "Proposed"
    },
    {
      id: "area-5",
      name: "Public Speaking",
      utility: "Fosters self-confidence, clear articulation, structured thinking, and effective presentation skills.",
      concepts: "Eye contact, voice projection, speech structure (Introduction, Body, Conclusion).",
      handsOnActivity: "Deliver a 1-minute pitch introducing oneself or explaining an idea created in an earlier session.",
      learningOutcome: "Present ideas clearly and confidently in front of peers.",
      linkedPathwayNodeId: "5", // Public Speaking & Storytelling
      sessionLead: "",
      supportingMembers: "",
      requiredMaterials: "Cue cards, timer, prompt wheel.",
      status: "Proposed"
    }
  ],

  visitSchedule: [
    {
      id: "visit-1",
      visitNumber: 1,
      title: "School Consultation & Needs Assessment",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "CPA Administration Office / Staff Room",
      mainObjective: "Engage school leadership, confirm target class, conduct needs assessment, and establish baseline.",
      activitiesAgenda: "1. Introduce Ashesi team & project scope.\n2. Review Grade 5/6 curriculum needs with teachers.\n3. Administer baseline curiosity & interest survey.\n4. Finalize session calendar.",
      relatedAreas: ["Target Class Assessment"],
      leadFacilitator: "",
      supportingMembers: "",
      requiredMaterials: "Printed proposal, baseline survey forms, notebook.",
      expectedOutputs: "Confirmed student count, approved visit schedule, teacher feedback.",
      status: "Draft",
      notes: "Awaiting confirmed meeting date with CPA headteacher."
    },
    {
      id: "visit-2",
      visitNumber: 2,
      title: "Technology & Visual Creativity Workshop",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "CPA Computer Lab / Classroom",
      mainObjective: "Deliver introductory Programming & Web logic alongside Graphic Design principles.",
      activitiesAgenda: "1. Icebreaker & Big Minds digital map demo.\n2. Interactive Web coding activity.\n3. Poster layout & visual design task.\n4. Group showcase.",
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
      location: "CPA Classroom",
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
      location: "CPA Assembly Hall / Main Classroom",
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
      title: "Reflection, Evaluation & Program Handover",
      proposedDate: "",
      startTime: "",
      endTime: "",
      location: "CPA Classroom",
      mainObjective: "Conduct final outcome assessment, celebrate student growth, and hand over reusable resources to teachers.",
      activitiesAgenda: "1. Post-program student feedback survey.\n2. Pathway reflection session.\n3. Presentation of student participation certificates.\n4. Official handover of Big Minds starter guide to CPA liaison teacher.",
      relatedAreas: ["All Mentorship Areas"],
      leadFacilitator: "",
      supportingMembers: "",
      requiredMaterials: "Post-surveys, printed certificates, teacher guide bundle.",
      expectedOutputs: "Completed outcome evaluations, handed-over teaching resource kit.",
      status: "Draft",
      notes: ""
    }
  ],

  workshops: [
    {
      id: "ws-1",
      areaId: "area-1",
      title: "Introductory Web Page Logic",
      objective: "Understand how instructions control digital content on web pages.",
      introduction: "Compare a webpage to a recipe: instructions tell the computer what color, text, or image to display.",
      practicalActivity: "Interactive Button Styling: Students change heading text and background colors by editing simple values.",
      materials: "Laptops or printed code-matching cards.",
      facilitationApproach: "Pair students with varied digital experience; step-by-step guidance.",
      expectedOutcome: "Students successfully change live web elements and explain the edit.",
      reflectionQuestion: "What kind of website or app would you like to build in the future?"
    },
    {
      id: "ws-2",
      areaId: "area-2",
      title: "Poster Layout & Visual Communication",
      objective: "Learn to arrange text and graphics so key messages stand out.",
      introduction: "Show two posters—one cluttered and one clear—and ask which is easier to read from across the room.",
      practicalActivity: "Create an announcement poster for a school event focusing on title size, contrast, and layout.",
      materials: "A3/A4 paper, felt pens, rulers, cut-out shapes.",
      facilitationApproach: "Encourage experimentation with bold headings before adding minor details.",
      expectedOutcome: "Students produce legible, structured posters.",
      reflectionQuestion: "Why did you choose your main colors for the title?"
    },
    {
      id: "ws-3",
      areaId: "area-3",
      title: "Smart Budgeting & Saving Goals",
      objective: "Differentiate between essential needs and optional wants while creating a personal savings target.",
      introduction: "Discuss what happens when money runs out before buying school supplies.",
      practicalActivity: "Weekly Allowance Challenge: Allocate 20 GHS across food, stationery, savings, and entertainment.",
      materials: "Budget worksheets, play money.",
      facilitationApproach: "Walk through realistic local examples (e.g., buying exercise books vs. extra sweets).",
      expectedOutcome: "Balanced budget sheets with at least 10% allocated to savings.",
      reflectionQuestion: "What is one item you would save up to buy over three months?"
    },
    {
      id: "ws-4",
      areaId: "area-4",
      title: "Mini Business Idea & Profit Logic",
      objective: "Identify a simple community need, define a product, and calculate total cost vs profit.",
      introduction: "Explain how a local store buys items wholesale and adds value to earn a living.",
      practicalActivity: "Calculate total cost for making fresh fruit juice (fruit + cup + ice = Cost) and set a selling price.",
      materials: "Business planning templates, calculators.",
      facilitationApproach: "Guide small groups through basic addition/subtraction for unit economics.",
      expectedOutcome: "Clear statement of business idea, cost per unit, and calculated profit margin.",
      reflectionQuestion: "How does your business idea help people in your school or neighborhood?"
    },
    {
      id: "ws-5",
      areaId: "area-5",
      title: "Confident Public Pitching",
      objective: "Organize thoughts into a clear 3-part structure and present with eye contact and clear tone.",
      introduction: "Demonstrate a nervous whisper vs a confident posture and clear speaking voice.",
      practicalActivity: "1-Minute Pitch: Present your business or design project using the 'Hook, Idea, Conclusion' structure.",
      materials: "Cue card outlines, timer.",
      facilitationApproach: "Maintain a supportive, encouraging environment with enthusiastic applause.",
      expectedOutcome: "Each student stands and presents briefly to the group.",
      reflectionQuestion: "How did you feel before speaking, and what helped you feel more confident?"
    }
  ],

  teamRoles: [
    { id: "role-1", title: "Overall Project Coordinator", assignedTo: "", status: "Unassigned" },
    { id: "role-2", title: "Crown Prince Academy Liaison", assignedTo: "", status: "Unassigned" },
    { id: "role-3", title: "Lead Facilitator: Programming & Web", assignedTo: "", status: "Unassigned" },
    { id: "role-4", title: "Lead Facilitator: Graphic Design", assignedTo: "", status: "Unassigned" },
    { id: "role-5", title: "Lead Facilitator: Financial Literacy", assignedTo: "", status: "Unassigned" },
    { id: "role-6", title: "Lead Facilitator: Entrepreneurship", assignedTo: "", status: "Unassigned" },
    { id: "role-7", title: "Lead Facilitator: Public Speaking", assignedTo: "", status: "Unassigned" },
    { id: "role-8", title: "Logistics & Material Preparation", assignedTo: "", status: "Unassigned" },
    { id: "role-9", title: "Budget & Finance Manager", assignedTo: "", status: "Unassigned" },
    { id: "role-10", title: "Assessment & Impact Documentation", assignedTo: "", status: "Unassigned" },
    { id: "role-11", title: "Handover & Sustainability Lead", assignedTo: "", status: "Unassigned" }
  ],

  budgetItems: [
    {
      id: "bg-1",
      description: "Transport to Crown Prince Academy (Lapaz) - 5 visits",
      category: "Transportation",
      quantity: 5,
      unitCostGHS: 0,
      essential: true,
      source: "Estimated trotro/ride fare quote",
      status: "Estimated",
      notes: "To be calculated based on team departure point."
    },
    {
      id: "bg-2",
      description: "Printing activity worksheets & baseline surveys",
      category: "Printing",
      quantity: 150,
      unitCostGHS: 0,
      essential: true,
      source: "Local printing shop rate",
      status: "Estimated",
      notes: "Worksheets for ~25 students across 5 visits."
    },
    {
      id: "bg-3",
      description: "Stationery kit (Markers, A3 paper, glue, scissors)",
      category: "Stationery",
      quantity: 1,
      unitCostGHS: 0,
      essential: true,
      source: "Stationery vendor quote",
      status: "Estimated",
      notes: "Reusable kit for Graphic Design & Business workshops."
    },
    {
      id: "bg-4",
      description: "Mobile data bundle for interactive web demo",
      category: "Data & Internet",
      quantity: 2,
      unitCostGHS: 0,
      essential: false,
      source: "Telco package rate",
      status: "Estimated",
      notes: "Backup hotspot data for facilitator devices."
    },
    {
      id: "bg-5",
      description: "Student participation certificates & printed guides",
      category: "Printing",
      quantity: 30,
      unitCostGHS: 0,
      essential: true,
      source: "Local press rate",
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
    teacherFeedbackSummary: "Awaiting initial consultation visit."
  },

  handoverChecklist: [
    { id: "hk-1", task: "Compile reusable lesson plans & activity guides", completed: false, notes: "Ready in digital planner" },
    { id: "hk-2", task: "Inventory required physical materials & supplier list", completed: false, notes: "" },
    { id: "hk-3", task: "Prepare teacher facilitator reference guide", completed: false, notes: "" },
    { id: "hk-4", task: "Confirm CPA Teacher Representative for program continuation", completed: false, notes: "To confirm on Visit 1" },
    { id: "hk-5", task: "Deliver certificate bundle & printed starter package", completed: false, notes: "Scheduled for Visit 5" }
  ],

  sustainability: {
    targetHandoverDate: "",
    handoverStatus: "In Progress",
    cpaTeacherLiaison: "To Be Confirmed",
    recommendations: "1. Establish a bi-weekly student curiosity club using Big Minds digital map.\n2. Encourage Grade 6 peer leaders to assist Grade 5 students."
  }
};