import { TaskManager } from './Task.js';
import { TeamMemberManager } from './TeamMember.js';
import { UIManager } from './UIManager.js';

// Initialize TaskManager and TeamMemberManager
const taskManager = new TaskManager();
const teamMemberManager = new TeamMemberManager();

// Prepopulate some data
taskManager.addTask('Fix bugs');
taskManager.addTask('Design UI');
taskManager.addTask('Arrive at Office');
taskManager.addTask('Breakfast');
taskManager.addTask('Clean the table');
taskManager.addTask('Eat snacks');
taskManager.addTask('Get lunch');
teamMemberManager.addTeamMember('Alice');
teamMemberManager.addTeamMember('Bob');
teamMemberManager.addTeamMember('Cindy');
teamMemberManager.addTeamMember('David');

// Initialize UI
new UIManager(taskManager, teamMemberManager);