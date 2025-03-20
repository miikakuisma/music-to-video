// Audio storage module using IndexedDB
class AudioStorage {
  constructor() {
    this.dbPromise = this.openDB();
  }

  // Open IndexedDB connection
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WaveSurferDB', 1);
      
      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(event);
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('audioFiles')) {
          db.createObjectStore('audioFiles', { keyPath: 'id' });
        }
      };
    });
  }

  // Save audio file to IndexedDB
  async saveAudioFile(file) {
    try {
      const db = await this.dbPromise;
      const tx = db.transaction('audioFiles', 'readwrite');
      const store = tx.objectStore('audioFiles');
      
      const data = {
        id: 'latest',
        file: file,
        timestamp: Date.now()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error saving audio file:', error);
      throw error;
    }
  }

  // Get the stored audio file
  async getAudioFile() {
    try {
      const db = await this.dbPromise;
      const tx = db.transaction('audioFiles', 'readonly');
      const store = tx.objectStore('audioFiles');
      
      return new Promise((resolve, reject) => {
        const request = store.get('latest');
        request.onsuccess = (event) => {
          const result = event.target.result;
          resolve(result ? result.file : null);
        };
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error getting audio file:', error);
      throw error;
    }
  }

  // Clear stored audio file
  async clearAudioFile() {
    try {
      const db = await this.dbPromise;
      const tx = db.transaction('audioFiles', 'readwrite');
      const store = tx.objectStore('audioFiles');
      
      return new Promise((resolve, reject) => {
        const request = store.delete('latest');
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error clearing audio file:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new AudioStorage(); 