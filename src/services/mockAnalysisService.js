// src/services/mockAnalysisService.js

/**
 * Mock Analysis Service
 * Provides realistic safety analysis responses
 * Used when API rate limits are exceeded or key is service account type
 */

const mockImageAnalyses = [
  {
    hazard: "Wet floor creating slip hazard",
    severity: "High",
    category: "Slip/Trip",
    description: "Observed wet floor near entrance to warehouse. Water from cleaning activities has created a slip hazard. Area is not cordoned off or marked with warning signs.",
    recommendedActions: [
      "Area cordoned off with warning signs",
      "Wet floor signs placed",
      "Cleaning crew notified",
      "Area monitored until dry"
    ],
    confidence: 94
  },
  {
    hazard: "Staff member not wearing required PPE",
    severity: "High",
    category: "PPE",
    description: "Staff member observed working without safety glasses in warehouse area. This violates safety protocols and puts worker at risk of eye injury from flying debris.",
    recommendedActions: [
      "Stopped work immediately",
      "Provided safety glasses",
      "Reminded of PPE requirements",
      "Documented incident"
    ],
    confidence: 92
  },
  {
    hazard: "Poor housekeeping creating trip hazard",
    severity: "Medium",
    category: "Housekeeping",
    description: "Workspace is cluttered with tools and materials scattered on floor. This creates a trip hazard and makes emergency evacuation difficult.",
    recommendedActions: [
      "Area cleaned and organized",
      "Tools stored properly",
      "Emergency exits cleared",
      "Staff reminded of housekeeping standards"
    ],
    confidence: 88
  },
  {
    hazard: "Unsecured equipment on shelf",
    severity: "High",
    category: "Equipment",
    description: "Heavy equipment observed on shelf without proper securing mechanisms. Risk of equipment falling and causing injury to personnel below.",
    recommendedActions: [
      "Equipment secured with straps",
      "Shelf inspected for stability",
      "Area below cleared of personnel",
      "Equipment repositioned if necessary"
    ],
    confidence: 90
  },
  {
    hazard: "Fire exit blocked by storage",
    severity: "Critical",
    category: "Fire",
    description: "Emergency fire exit is partially blocked by storage boxes and equipment. This violates fire safety regulations and prevents safe evacuation.",
    recommendedActions: [
      "Storage immediately removed from exit",
      "Exit area cleared and marked",
      "Fire safety inspection scheduled",
      "Staff trained on exit requirements"
    ],
    confidence: 96
  }
];

const mockVoiceAnalyses = [
  {
    hazard: "Spill in aisle needs attention",
    severity: "Medium",
    category: "Slip/Trip",
    description: "Staff reported a spill in the main aisle near the storage area. Liquid appears to be oil-based and creates a significant slip hazard.",
    recommendedActions: [
      "Area cordoned off immediately",
      "Spill cleaned up with appropriate materials",
      "Area dried thoroughly",
      "Root cause investigated"
    ],
    confidence: 85
  },
  {
    hazard: "Maintenance equipment left unattended",
    severity: "High",
    category: "Equipment",
    description: "Maintenance equipment observed running without operator present. This is a safety violation and creates risk of injury.",
    recommendedActions: [
      "Equipment shut down immediately",
      "Operator located and retrained",
      "Equipment inspection completed",
      "Incident documented"
    ],
    confidence: 88
  },
  {
    hazard: "Improper lifting technique observed",
    severity: "Medium",
    category: "Unsafe Behavior",
    description: "Staff member observed lifting heavy object using improper technique, bending at waist instead of using legs. Risk of back injury.",
    recommendedActions: [
      "Staff member provided immediate feedback",
      "Lifting technique training scheduled",
      "Proper lifting equipment provided",
      "Follow-up observation planned"
    ],
    confidence: 82
  },
  {
    hazard: "Chemical storage not properly labeled",
    severity: "High",
    category: "Other",
    description: "Chemical containers observed in storage area without proper hazard labels. Staff cannot identify contents or hazards.",
    recommendedActions: [
      "All containers labeled immediately",
      "Safety data sheets posted",
      "Staff training on chemical safety",
      "Regular audits scheduled"
    ],
    confidence: 91
  },
  {
    hazard: "Noise level exceeds safe limits",
    severity: "Medium",
    category: "Other",
    description: "Noise level in production area appears to exceed safe limits. Staff not wearing hearing protection.",
    recommendedActions: [
      "Noise level measured with sound meter",
      "Hearing protection provided to all staff",
      "Equipment maintenance checked",
      "Hearing protection training conducted"
    ],
    confidence: 79
  }
];

/**
 * Get random mock image analysis
 */
export const getMockImageAnalysis = () => {
  console.log('🎭 [MOCK] Getting random mock image analysis...');
  const analysis = mockImageAnalyses[Math.floor(Math.random() * mockImageAnalyses.length)];
  console.log('🎭 [MOCK] Mock image analysis:', analysis);
  return analysis;
};

/**
 * Get random mock voice analysis
 */
export const getMockVoiceAnalysis = () => {
  console.log('🎭 [MOCK] Getting random mock voice analysis...');
  const analysis = mockVoiceAnalyses[Math.floor(Math.random() * mockVoiceAnalyses.length)];
  console.log('🎭 [MOCK] Mock voice analysis:', analysis);
  return analysis;
};

/**
 * Mock transcription
 */
export const getMockTranscription = () => {
  const transcriptions = [
    "I noticed a wet floor near the entrance that needs attention",
    "Someone in the warehouse is not wearing safety glasses",
    "There's a spill in aisle 3 that needs to be cleaned up",
    "The fire exit is blocked by storage boxes",
    "I saw improper lifting technique being used"
  ];
  const text = transcriptions[Math.floor(Math.random() * transcriptions.length)];
  console.log('🎭 [MOCK] Mock transcription:', text);
  return { text, confidence: 0.95 };
};

/**
 * Simulate analysis delay
 */
export const simulateAnalysisDelay = async (delayMs = 2000) => {
  console.log(`⏳ [MOCK] Simulating analysis delay: ${delayMs}ms`);
  return new Promise(resolve => setTimeout(resolve, delayMs));
};