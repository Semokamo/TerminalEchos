
export enum Sender {
  User = 'User',
  Lily = 'Lily',
  System = 'System', // Used for kidnapper's messages (displayed as "Terminal") or actual system errors
  RelocationUnit = 'RelocationUnit',
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  imageUrl?: string;
  timestamp: Date;
  isLoading?: boolean; 
  isError?: boolean; 
}

export type ChatTargetId = 'lily' | 'relocation' | 'subject32' | 'subject33';

export interface ChatContact {
  id: ChatTargetId;
  name: string; 
  avatarInitial: string;
  isResponsive: boolean;
  description?: string; 
}

// Define the View type here so it can be imported by App.tsx and other components if needed
export type View = 
  | 'game_start' 
  | 'intro' 
  | 'system_initiating' 
  | 'initial_load' 
  | 'home' 
  | 'chat' 
  | 'gallery_locked' 
  | 'gallery_unlocked' // Added new view for unlocked gallery
  | 'browser' 
  | 'calculator';
