// src/types/map.ts

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface CellChatRequest {
  message: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface CellChatResponse {
  reply: string;
  cellId: string;
  areaLabel: string | null;
  compositeScore: number;
  trend: 'up' | 'down' | 'flat';
}
