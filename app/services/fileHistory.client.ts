export type FileHistoryItem = {
  id: string;
  title: string;
  type: 'file' | 'url';
  createdAt: string;
  lastAccessed: string;
  size?: number;
  preview?: string; // First few characters of the JSON for preview
};

const STORAGE_KEY = 'anyformat_file_history';
const MAX_HISTORY_ITEMS = 50;

export class FileHistoryService {
  static getHistory(): FileHistoryItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const history = JSON.parse(stored) as FileHistoryItem[];
      return history.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
    } catch (error) {
      console.error('Failed to load file history:', error);
      return [];
    }
  }

  static addToHistory(item: Omit<FileHistoryItem, 'createdAt' | 'lastAccessed'>): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getHistory();
      const now = new Date().toISOString();
      
      // Remove existing item if it exists
      const filteredHistory = history.filter(h => h.id !== item.id);
      
      // Limit preview size for large files to prevent localStorage issues
      const preview = item.preview && item.preview.length > 2000 
        ? item.preview.substring(0, 2000) + '...'
        : item.preview;
      
      // Add new item at the beginning
      const newItem: FileHistoryItem = {
        ...item,
        preview,
        createdAt: now,
        lastAccessed: now,
      };
      
      const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      
      // Check if the data is too large for localStorage - increased for large files
      const dataToStore = JSON.stringify(updatedHistory);
      if (dataToStore.length > 50 * 1024 * 1024) { // 50MB localStorage limit (most browsers support this)
        console.warn('File history too large, removing oldest items');
        const reducedHistory = updatedHistory.slice(0, Math.floor(MAX_HISTORY_ITEMS / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedHistory));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to save to file history:', error);
      // If localStorage is full, try to clear some space
      try {
        const history = this.getHistory();
        const reducedHistory = history.slice(0, 10); // Keep only 10 most recent
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedHistory));
      } catch (clearError) {
        console.error('Failed to clear file history:', clearError);
      }
    }
  }

  static updateLastAccessed(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getHistory();
      const itemIndex = history.findIndex(h => h.id === id);
      
      if (itemIndex !== -1) {
        history[itemIndex].lastAccessed = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Failed to update last accessed:', error);
    }
  }

  static removeFromHistory(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(h => h.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to remove from file history:', error);
    }
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear file history:', error);
    }
  }

  static generatePreview(jsonContent: string): string {
    try {
      const parsed = JSON.parse(jsonContent);
      const preview = JSON.stringify(parsed, null, 2);
      return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
    } catch {
      return jsonContent.length > 100 ? jsonContent.substring(0, 100) + '...' : jsonContent;
    }
  }

  static estimateSize(content: string): number {
    return new Blob([content]).size;
  }
}
