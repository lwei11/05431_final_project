import { Task } from './Task';

export interface TeamMember {
    id: string;
    name: string;
    tasks: Task[];
}

export class TeamMemberManager {
    private teamMembers: TeamMember[] = [];

    addTeamMember(name: string): TeamMember {
        const newMember: TeamMember = { id: crypto.randomUUID(), name, tasks: [] };
        this.teamMembers.push(newMember);
        return newMember;
    }

    removeTeamMember(memberId: string): void {
        this.teamMembers = this.teamMembers.filter(member => member.id !== memberId);
    }

    assignTaskToMember(memberId: string, task: Task): void {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (member) {
            member.tasks.push(task);
        }
    }

    removeTaskFromMember(memberId: string, taskId: string): void {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (member) {
            member.tasks = member.tasks.filter(task => task.id !== taskId);
        }
    }

    getTeamMembers(): TeamMember[] {
        return [...this.teamMembers];
    }
}
