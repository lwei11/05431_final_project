export class TeamMemberManager {
    constructor() {
        this.teamMembers = [];
    }
    addTeamMember(name) {
        const newMember = { id: crypto.randomUUID(), name, tasks: [] };
        this.teamMembers.push(newMember);
        return newMember;
    }
    removeTeamMember(memberId) {
        this.teamMembers = this.teamMembers.filter(member => member.id !== memberId);
    }
    assignTaskToMember(memberId, task) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (member) {
            member.tasks.push(task);
        }
    }
    removeTaskFromMember(memberId, taskId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (member) {
            member.tasks = member.tasks.filter(task => task.id !== taskId);
        }
    }
    getTeamMembers() {
        return [...this.teamMembers];
    }
}
