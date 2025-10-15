
export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: {
    uri: string;
    title: string;
  }[];
  suggestions?: string[];
}