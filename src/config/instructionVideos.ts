export interface InstructionVideoConfig {
  imageUrl: string;
  videoUrl?: string;
  youtubeUrl?: string;
  title: string;
  description: string;
  theme: 'purple' | 'green' | 'blue' | 'orange';
}

export const instructionVideosConfig: Record<string, InstructionVideoConfig> = {
  start: {
    imageUrl: "/videoexample.png",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Watch the instruction",
    description: "Get started with your AI influencer journey",
    theme: "purple"
  },
  phase1: {
    imageUrl: "/videoexample.png",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Watch the instruction",
    description: "Step-by-step guide",
    theme: "purple"
  },
  phase2: {
    imageUrl: "/videoexample.png",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
    title: "Watch the instruction", 
    description: "Character training guide",
    theme: "green"
  },
  phase3: {
    imageUrl: "/videoexample.png",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Watch the instruction",
    description: "Content creation guide", 
    theme: "blue"
  },
  phase4: {
    imageUrl: "/videoexample.png",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Watch the instruction",
    description: "Monetization guide",
    theme: "orange"
  }
};

// Helper function to get config for a specific phase
export const getInstructionVideoConfig = (phase: string): InstructionVideoConfig => {
  return instructionVideosConfig[phase] || instructionVideosConfig.phase1;
}; 