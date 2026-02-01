
export interface DmgConfig {
  background: string | null;
  windowSize: { width: number; height: number };
  appPosition: { x: number; y: number };
  applicationFolderPosition: { x: number; y: number };
  iconSize: number;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string;
}
