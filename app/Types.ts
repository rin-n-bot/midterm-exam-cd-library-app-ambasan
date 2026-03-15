export interface CD { id: string; title: string; artist: string; copies: number; }
export interface BorrowRecord { id: string; cdId: string; title: string; dueDate: string; }