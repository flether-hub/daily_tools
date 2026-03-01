export type Tool = 'image' | 'markdown' | 'compare';

export interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'error';
  timestamp: Date;
}
