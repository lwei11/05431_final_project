import { TaskManager } from './Task.js';
import { TeamMemberManager } from './TeamMember.js';
import { UIManager } from './UIManager.js';
// Initialize TaskManager and TeamMemberManager
const taskManager = new TaskManager();
const teamMemberManager = new TeamMemberManager();
// Prepopulate some data
taskManager.addTask('Fix bugs');
taskManager.addTask('Design UI');
teamMemberManager.addTeamMember('Alice');
teamMemberManager.addTeamMember('Bob');
// Initialize UI
new UIManager(taskManager, teamMemberManager);
