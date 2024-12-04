export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
}

export class TaskManager {
  private tasks: Task[] = [];

  addTask(title: string): Task {
    const newTask: Task = { id: crypto.randomUUID(), title, isCompleted: false };
    this.tasks.push(newTask);
    return newTask;
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }

  toggleTaskCompletion(id: string): void {
    const task = this.tasks.find(task => task.id === id);
    if (task) task.isCompleted = !task.isCompleted;
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }
}
