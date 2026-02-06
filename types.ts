export enum Category {
  POLITICS = 'Politics',
  TECHNOLOGY = 'Technology',
  SPORTS = 'Sports',
  CURRENT_EVENTS = 'Current Events'
}

export interface Resource {
  name: string;
  url: string;
  description: string;
}

export interface StripPanel {
  id: string;
  caption: string;
  imagePrompt: string;
  imageUrl?: string;
  isLoading: boolean;
}

export interface ComicPanel {
  id: string;
  title: string;
  category: Category;
  imageUrl?: string;
  imagePrompt: string; // Internal: used for generation
  article: string;     // External: displayed to user
  date: string;
  isLoading: boolean;
  strip?: StripPanel[]; // The elaborate story
  resources?: Resource[]; // Related programs and links
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
