export interface InstructionVideoConfig {
  imageUrl: string;
  videoUrl?: string;
  title: string;
  description: string;
  duration: string;
  theme: 'purple' | 'green' | 'blue' | 'orange';
}

export const instructionVideosConfig: Record<string, InstructionVideoConfig> = {
  phase1: {
    imageUrl: "/videoexample.png",
    title: "Watch the instruction",
    description: "Step-by-step guide",
    duration: "5:32",
    theme: "purple"
  },
  phase2: {
    imageUrl: "/videoexample.png",
    title: "Watch the instruction", 
    description: "Character training guide",
    duration: "8:15",
    theme: "green"
  },
  phase3: {
    imageUrl: "/videoexample.png",
    title: "Watch the instruction",
    description: "Content creation guide", 
    duration: "12:45",
    theme: "blue"
  },
  phase4: {
    imageUrl: "/videoexample.png",
    title: "Watch the instruction",
    description: "Monetization guide",
    duration: "15:20", 
    theme: "orange"
  }
};

// Helper function to get config for a specific phase
export const getInstructionVideoConfig = (phase: string): InstructionVideoConfig => {
  return instructionVideosConfig[phase] || instructionVideosConfig.phase1;
}; 