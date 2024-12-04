import { TaskManager } from './Task.js';
import { TeamMemberManager } from './TeamMember.js';

export class UIManager {
  private taskManager: TaskManager;
  private teamMemberManager: TeamMemberManager;

  constructor(taskManager: TaskManager, teamMemberManager: TeamMemberManager) {
    this.taskManager = taskManager;
    this.teamMemberManager = teamMemberManager;
    this.initializeUI();
  }

  private initializeUI(): void {
    const app = document.getElementById('app');
    if (!app) throw new Error('App container not found');

    const leftPanel = this.createDiv('left-panel');
    const rightPanel = this.createDiv('right-panel');
    const divider = this.createDiv('divider');

    this.addDragToResize(leftPanel, rightPanel, divider);

    app.append(leftPanel, divider, rightPanel);

    this.renderTeamMembers(leftPanel);
    this.renderTasks(rightPanel);
  }

  private createDiv(className: string): HTMLElement {
    const div = document.createElement('div');
    div.className = className;
    return div;
  }

  private renderTeamMembers(container: HTMLElement): void {
    let membersContainer = container.querySelector('.members-container') as HTMLElement;
    let buttonContainer = container.querySelector('.button-container') as HTMLElement;

    if (!membersContainer) {
        membersContainer = this.createDiv('members-container');
        container.appendChild(membersContainer);
    }

    if (!buttonContainer) {
        buttonContainer = this.createDiv('button-container');
        this.addAddTeamMemberButton(buttonContainer);
        container.appendChild(buttonContainer);
    }

    // Clear previous members and render new ones
    membersContainer.innerHTML = '';
    const members = this.teamMemberManager.getTeamMembers();
    members.forEach(member => {
        const memberDiv = this.createDiv('member');
        memberDiv.textContent = member.name;
        memberDiv.dataset.id = member.id;

        // Add drop listener for tasks
        memberDiv.addEventListener('drop', e => this.handleDropTask(e, member.id));
        memberDiv.addEventListener('dragover', e => e.preventDefault());

        // Add task list inside the member box
        const taskList = this.createDiv('task-list');
        member.tasks.forEach(task => {
            const taskDiv = this.createDiv('task');
            taskDiv.textContent = task.title;

            // Apply "completed" style
            if (task.isCompleted) {
                taskDiv.style.textDecoration = 'line-through';
            }

            // Add complete and delete buttons
            const completeButton = document.createElement('button');
            completeButton.textContent = '✅';
            completeButton.addEventListener('click', () => {
                task.isCompleted = !task.isCompleted;
                this.renderTeamMembers(container); // Re-render to update the UI
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '❌';
            deleteButton.addEventListener('click', () => {
                this.teamMemberManager.removeTaskFromMember(member.id, task.id);
                this.renderTeamMembers(container);
            });

            taskDiv.appendChild(completeButton);
            taskDiv.appendChild(deleteButton);
            taskList.appendChild(taskDiv);
        });

        // Add scrolling to task list if needed
        taskList.style.overflowY = 'auto';
        taskList.style.maxHeight = '100px';

        memberDiv.appendChild(taskList);

        // Add delete button for the member
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'delete';
        deleteButton.addEventListener('click', () => {
            this.teamMemberManager.removeTeamMember(member.id);
            this.renderTeamMembers(container);
        });

        memberDiv.appendChild(deleteButton);
        membersContainer.appendChild(memberDiv);
    });
  }

  private renderTasks(container: HTMLElement): void {
    let tasksContainer = container.querySelector('.tasks-container') as HTMLElement;
    let buttonContainer = container.querySelector('.button-container') as HTMLElement;

    if (!tasksContainer) {
      tasksContainer = this.createDiv('tasks-container');
      container.appendChild(tasksContainer);
    }

    if (!buttonContainer) {
      buttonContainer = this.createDiv('button-container');
      this.addAddTaskButton(buttonContainer);
      container.appendChild(buttonContainer);
    }

    // Clear previous tasks and render new ones
    tasksContainer.innerHTML = '';
    const tasks = this.taskManager.getTasks();
    tasks.forEach(task => {
      const taskDiv = this.createDiv('task');
      taskDiv.textContent = task.title;
      taskDiv.draggable = true;
      taskDiv.dataset.id = task.id;

      // Add dragstart listener
      taskDiv.addEventListener('dragstart', e => this.handleDragStartTask(e, task.id));

      // Add delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'delete';
      deleteButton.addEventListener('click', () => {
        this.taskManager.deleteTask(task.id);
        this.renderTasks(container);
      });

      taskDiv.appendChild(deleteButton);
      tasksContainer.appendChild(taskDiv);
    });
  }

  private addAddTaskButton(container: HTMLElement): void {
    const addButton = document.createElement('button');
    addButton.textContent = '➕';
    addButton.addEventListener('click', () => {
      const taskTitle = prompt('Enter task title:');
      if (taskTitle) {
        this.taskManager.addTask(taskTitle);
        this.renderTasks(container.parentElement as HTMLElement);
      }
    });
    container.appendChild(addButton);
  }

  private addAddTeamMemberButton(container: HTMLElement): void {
    const addButton = document.createElement('button');
    addButton.textContent = '➕';
    addButton.addEventListener('click', () => {
      const memberName = prompt('Enter team member name:');
      if (memberName) {
        this.teamMemberManager.addTeamMember(memberName);
        this.renderTeamMembers(container.parentElement as HTMLElement);
      }
    });
    container.appendChild(addButton);
  }

  private handleDragStartTask(e: DragEvent, taskId: string): void {
    e.dataTransfer?.setData('text/plain', taskId);
  }

  private handleDropTask(e: DragEvent, memberId: string): void {
    e.preventDefault();
    const taskId = e.dataTransfer?.getData('text/plain');
    if (taskId) {
      const task = this.taskManager.getTasks().find(t => t.id === taskId);
      if (task) {
        this.teamMemberManager.assignTaskToMember(memberId, task);
        this.taskManager.deleteTask(task.id);
        this.renderTasks(document.querySelector('.right-panel')!); // Update the right panel
        this.renderTeamMembers(document.querySelector('.left-panel')!); // Update the left panel
      }
    }
  }
  
  private addDragToResize(leftPanel: HTMLElement, rightPanel: HTMLElement, divider: HTMLElement): void {
    let isDragging = false;

    divider.addEventListener('mousedown', () => (isDragging = true));
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const appWidth = document.getElementById('app')?.offsetWidth || 0;
      const leftWidth = Math.max(100, e.clientX);
      leftPanel.style.width = `${leftWidth}px`;
      rightPanel.style.width = `${appWidth - leftWidth - 10}px`;
    });
    document.addEventListener('mouseup', () => (isDragging = false));
  }
}
