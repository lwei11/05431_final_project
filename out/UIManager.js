export class UIManager {
    constructor(taskManager, teamMemberManager) {
        this.taskManager = taskManager;
        this.teamMemberManager = teamMemberManager;
        this.initializeUI();
    }
    initializeUI() {
        const app = document.getElementById('app');
        if (!app)
            throw new Error('App container not found');
        const leftPanel = this.createDiv('left-panel');
        const rightPanel = this.createDiv('right-panel');
        const divider = this.createDiv('divider');
        this.addDragToResize(leftPanel, rightPanel, divider);
        app.append(leftPanel, divider, rightPanel);
        this.renderTeamMembers(leftPanel);
        this.renderTasks(rightPanel);
    }
    createDiv(className) {
        const div = document.createElement('div');
        div.className = className;
        return div;
    }
    renderTeamMembers(container) {
        let membersContainer = container.querySelector('.members-container');
        let buttonContainer = container.querySelector('.button-container');
        if (!membersContainer) {
            membersContainer = this.createDiv('members-container');
            container.appendChild(membersContainer);
        }
        if (!buttonContainer) {
            buttonContainer = this.createDiv('button-container');
            this.addAddTeamMemberButton(buttonContainer);
            container.appendChild(buttonContainer);
        }
        membersContainer.innerHTML = ''; // Clear previous members
        const members = this.teamMemberManager.getTeamMembers()
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort members alphabetically
        members.forEach(member => {
            const memberDiv = this.createDiv('member');
            const memberHeader = this.createDiv('member-header');
            // Member name and delete button
            const nameSpan = document.createElement('span');
            nameSpan.textContent = member.name;
            nameSpan.style.fontWeight = 'bold';
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '❌';
            deleteButton.style.marginLeft = '10px';
            deleteButton.addEventListener('click', () => {
                this.teamMemberManager.removeTeamMember(member.id);
                this.renderTeamMembers(container);
            });
            memberHeader.appendChild(nameSpan);
            memberHeader.appendChild(deleteButton);
            // Task counts
            const incompleteCount = member.tasks.filter(task => !task.isCompleted).length;
            const completeCount = member.tasks.filter(task => task.isCompleted).length;
            const taskCountDiv = this.createDiv('task-count');
            taskCountDiv.innerHTML = `
                <div>Incomplete Tasks: ${incompleteCount}</div>
                <div>Completed Tasks: ${completeCount}</div>
            `;
            // Separate task lists
            const incompleteList = this.createTaskList(member, false);
            const completeList = this.createTaskList(member, true);
            // Add resizing capability
            this.addDragToResizeList(incompleteList);
            this.addDragToResizeList(completeList);
            // Append elements
            memberDiv.appendChild(memberHeader);
            memberDiv.appendChild(taskCountDiv);
            memberDiv.appendChild(incompleteList);
            memberDiv.appendChild(completeList);
            membersContainer.appendChild(memberDiv);
            // Drop functionality for tasks
            memberDiv.addEventListener('drop', e => this.handleDropTask(e, member.id));
            memberDiv.addEventListener('dragover', e => e.preventDefault());
        });
    }
    createTaskList(member, isCompleted) {
        const taskList = this.createDiv('task-list');
        taskList.style.overflowY = 'auto';
        taskList.style.maxHeight = '150px';
        taskList.style.border = '1px solid #ddd';
        taskList.style.marginTop = '10px';
        const header = this.createDiv('list-header');
        header.textContent = isCompleted ? 'Completed Tasks' : 'Incomplete Tasks';
        taskList.appendChild(header);
        const sortedTasks = member.tasks
            .filter((task) => task.isCompleted === isCompleted)
            .sort((a, b) => a.title.localeCompare(b.title));
        sortedTasks.forEach((task) => {
            const taskDiv = this.createDiv('task');
            taskDiv.textContent = task.title;
            if (isCompleted) {
                taskDiv.style.textDecoration = 'line-through';
            }
            else {
                // Add slider for incomplete tasks
                const sliderContainer = this.createDiv('slider-container');
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = '0';
                slider.max = '100';
                slider.value = task.progress ? task.progress.toString() : '0';
                slider.style.width = '80%';
                const sliderValue = document.createElement('span');
                sliderValue.textContent = `${slider.value}%`;
                slider.addEventListener('input', () => {
                    sliderValue.textContent = `${slider.value}%`;
                });
                slider.addEventListener('change', () => {
                    const progress = parseInt(slider.value, 10);
                    task.progress = progress;
                    if (progress === 100) {
                        task.isCompleted = true;
                        this.renderTeamMembers(document.querySelector('.left-panel'));
                    }
                });
                sliderContainer.appendChild(slider);
                sliderContainer.appendChild(sliderValue);
                taskDiv.appendChild(sliderContainer);
            }
            // Create a container for the task buttons
            const taskButtons = this.createDiv('task-buttons');
            // Complete Button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = isCompleted ? '⬅️' : '✅';
            toggleButton.addEventListener('click', () => {
                task.isCompleted = !task.isCompleted;
                if (!task.isCompleted) {
                    task.progress = 0; // Reset progress when marked incomplete
                }
                this.renderTeamMembers(document.querySelector('.left-panel'));
            });
            taskButtons.appendChild(toggleButton);
            // Delete Button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '❌';
            deleteButton.addEventListener('click', () => {
                this.teamMemberManager.removeTaskFromMember(member.id, task.id);
                this.renderTeamMembers(document.querySelector('.left-panel'));
            });
            taskButtons.appendChild(deleteButton);
            // Duplicate Button (only for incomplete tasks)
            if (!isCompleted) {
                const duplicateButton = document.createElement('button');
                duplicateButton.textContent = '🔁';
                duplicateButton.addEventListener('click', () => {
                    const newTask = Object.assign(Object.assign({}, task), { id: crypto.randomUUID(), title: `${task.title} (Copy)` });
                    member.tasks.push(newTask); // Add duplicate to the same member
                    this.renderTeamMembers(document.querySelector('.left-panel'));
                });
                taskButtons.appendChild(duplicateButton);
            }
            // Append the buttons container to the task div
            taskDiv.appendChild(taskButtons);
            // Append the task to the task list
            taskList.appendChild(taskDiv);
        });
        return taskList;
    }
    renderTasks(container) {
        let tasksContainer = container.querySelector('.tasks-container');
        let buttonContainer = container.querySelector('.button-container');
        if (!tasksContainer) {
            tasksContainer = this.createDiv('tasks-container');
            container.appendChild(tasksContainer);
        }
        if (!buttonContainer) {
            buttonContainer = this.createDiv('button-container');
            this.addAddTaskButton(buttonContainer);
            container.appendChild(buttonContainer);
        }
        tasksContainer.innerHTML = ''; // Clear previous tasks
        const tasks = this.taskManager.getTasks()
            .sort((a, b) => a.title.localeCompare(b.title)); // Sort tasks alphabetically
        tasks.forEach(task => {
            const taskDiv = this.createDiv('task');
            taskDiv.textContent = task.title;
            taskDiv.draggable = true;
            taskDiv.dataset.id = task.id;
            // Add dragstart listener
            taskDiv.addEventListener('dragstart', e => this.handleDragStartTask(e, task.id));
            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '❌';
            deleteButton.addEventListener('click', () => {
                this.taskManager.deleteTask(task.id);
                this.renderTasks(container); // Refresh the task list
            });
            // Add duplicate button
            const duplicateButton = document.createElement('button');
            duplicateButton.textContent = '🔁';
            duplicateButton.addEventListener('click', () => {
                this.taskManager.addTask(`${task.title} (Copy)`); // Duplicate the task
                this.renderTasks(container); // Refresh the task list
            });
            // Append buttons
            taskDiv.appendChild(duplicateButton);
            taskDiv.appendChild(deleteButton);
            tasksContainer.appendChild(taskDiv);
        });
    }
    addDragToResize(leftPanel, rightPanel, divider) {
        let isDragging = false;
        divider.addEventListener('mousedown', () => (isDragging = true));
        document.addEventListener('mousemove', e => {
            var _a;
            if (!isDragging)
                return;
            const appWidth = ((_a = document.getElementById('app')) === null || _a === void 0 ? void 0 : _a.offsetWidth) || 0;
            const leftWidth = Math.max(100, e.clientX);
            leftPanel.style.width = `${leftWidth}px`;
            rightPanel.style.width = `${appWidth - leftWidth - 10}px`;
        });
        document.addEventListener('mouseup', () => (isDragging = false));
    }
    addDragToResizeList(taskList) {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.style.height = '5px';
        resizer.style.cursor = 'ns-resize';
        resizer.style.background = '#000';
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;
        resizer.addEventListener('mousedown', e => {
            isResizing = true;
            startY = e.clientY;
            startHeight = taskList.offsetHeight;
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', e => {
            if (!isResizing)
                return;
            const newHeight = Math.max(50, startHeight + (e.clientY - startY));
            taskList.style.maxHeight = `${newHeight}px`;
        });
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
        taskList.appendChild(resizer);
    }
    handleDragStartTask(e, taskId) {
        var _a;
        (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', taskId);
    }
    handleDropTask(e, memberId) {
        var _a;
        e.preventDefault();
        const taskId = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
        if (taskId) {
            const task = this.taskManager.getTasks().find(t => t.id === taskId);
            if (task) {
                this.teamMemberManager.assignTaskToMember(memberId, task);
                this.taskManager.deleteTask(task.id); // Remove task from unassigned list
                this.renderTasks(document.querySelector('.right-panel'));
                this.renderTeamMembers(document.querySelector('.left-panel'));
            }
        }
    }
    addAddTaskButton(container) {
        const addButton = document.createElement('button');
        addButton.textContent = 'Add Task';
        addButton.addEventListener('click', () => {
            const taskTitle = prompt('Enter task title:');
            if (taskTitle) {
                this.taskManager.addTask(taskTitle);
                this.renderTasks(container.parentElement);
            }
        });
        container.appendChild(addButton);
    }
    addAddTeamMemberButton(container) {
        const addButton = document.createElement('button');
        addButton.textContent = 'Add Team Member';
        addButton.addEventListener('click', () => {
            const memberName = prompt('Enter team member name:');
            if (memberName) {
                this.teamMemberManager.addTeamMember(memberName);
                this.renderTeamMembers(container.parentElement);
            }
        });
        container.appendChild(addButton);
    }
}
