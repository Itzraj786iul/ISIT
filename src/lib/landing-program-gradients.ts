export const LANDING_PROGRAM_GRADIENTS = {
  robotics: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 42%, #22d3ee 100%)',
  digital: 'linear-gradient(145deg, #0f766e 0%, #14b8a6 42%, #6ee7b7 100%)',
  marketing: 'linear-gradient(145deg, #c026d3 0%, #f43f5e 45%, #fbbf24 100%)',
  entrepreneurship: 'linear-gradient(145deg, #7c3aed 0%, #d946ef 48%, #ec4899 100%)',
  academic: 'linear-gradient(145deg, #1d4ed8 0%, #4f46e5 48%, #8b5cf6 100%)',
  creativity: 'linear-gradient(145deg, #eab308 0%, #f97316 38%, #ec4899 72%, #db2777 100%)',
} as const;

export type LandingProgramGradientKey = keyof typeof LANDING_PROGRAM_GRADIENTS;
