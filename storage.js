// Storage.js - Local Storage Management

class TodoStorage {
    constructor(key = 'todolist_tasks') {
        this.key = key;
        this.initializeStorage();
    }

    /**
     * Initialize storage if it doesn't exist
     */
    initializeStorage() {
        if (!localStorage.getItem(this.key)) {
            localStorage.setItem(this.key, JSON.stringify([]));
        }
    }

    /**
     * Save tasks to local storage
     * @param {Array} tasks - Array of task objects
     */
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.key, JSON.stringify(tasks));
            console.log(`✅ ${tasks.length} tasks saved to local storage`);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                alert('Local storage quota exceeded! Please delete some tasks.');
            } else {
                console.error('Error saving tasks:', error);
            }
        }
    }

    /**
     * Load tasks from local storage
     * @returns {Array} Array of task objects
     */
    loadTasks() {
        try {
            const tasks = JSON.parse(localStorage.getItem(this.key) || '[]');
            console.log(`✅ ${tasks.length} tasks loaded from local storage`);
            return tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    /**
     * Clear all tasks from local storage
     */
    clearAll() {
        try {
            localStorage.removeItem(this.key);
            this.initializeStorage();
            console.log('✅ All tasks cleared');
        } catch (error) {
            console.error('Error clearing tasks:', error);
        }
    }

    /**
     * Export tasks as JSON file
     */
    exportTasks() {
        const tasks = this.loadTasks();
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        console.log('✅ Tasks exported');
    }

    /**
     * Import tasks from JSON file
     */
    importTasks(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedTasks = JSON.parse(event.target.result);
                    if (Array.isArray(importedTasks)) {
                        this.saveTasks(importedTasks);
                        console.log(`✅ ${importedTasks.length} tasks imported`);
                        resolve(importedTasks);
                    } else {
                        reject(new Error('Invalid file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    /**
     * Get storage statistics
     */
    getStorageInfo() {
        const tasks = this.loadTasks();
        const dataStr = JSON.stringify(tasks);
        const bytes = new Blob([dataStr]).size;
        const kb = (bytes / 1024).toFixed(2);

        return {
            taskCount: tasks.length,
            sizeBytes: bytes,
            sizeKB: kb,
            sizePercentage: ((bytes / (5 * 1024 * 1024)) * 100).toFixed(2)
        };
    }

    /**
     * Create a backup
     */
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            tasks: this.loadTasks(),
            version: '1.0'
        };
        sessionStorage.setItem('todolist_backup', JSON.stringify(backup));
        console.log('✅ Backup created');
        return backup;
    }

    /**
     * Restore from backup
     */
    restoreBackup() {
        const backup = sessionStorage.getItem('todolist_backup');
        if (backup) {
            try {
                const parsed = JSON.parse(backup);
                this.saveTasks(parsed.tasks);
                console.log('✅ Backup restored');
                return parsed.tasks;
            } catch (error) {
                console.error('Error restoring backup:', error);
                return null;
            }
        }
        return null;
    }
}