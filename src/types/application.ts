export type ApplicationStatus = 'completed' | 'incomplete';

export interface Application {
    id: number;
    sales_agent_id: number | null;
    first_name: string;
    last_name: string;
    mobile: string;
    cpr: string;
    application_status: ApplicationStatus;
    date_submitted: Date;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
}