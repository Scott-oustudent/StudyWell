import { AuditLogEntry } from '../types';

export const logAction = (actor: string, action: string, details: Record<string, any> = {}) => {
    try {
        const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem('auditLog') || '[]');
        
        const newLog: AuditLogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            actor,
            action,
            details
        };

        logs.push(newLog);

        // To prevent the log from growing indefinitely in a real scenario,
        // you might want to cap its size. For this app, we'll let it grow.
        localStorage.setItem('auditLog', JSON.stringify(logs));

    } catch (error) {
        console.error("Failed to write to audit log:", error);
    }
};
