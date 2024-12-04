export class TaskManager {
    constructor() {
        this.tasks = [];
    }
    addTask(title) {
        const newTask = { id: crypto.randomUUID(), title, isCompleted: false, progress: 0 };
        this.tasks.push(newTask);
        return newTask;
    }
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }
    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task)
            task.isCompleted = !task.isCompleted;
    }
    getTasks() {
        return [...this.tasks];
    }
}
