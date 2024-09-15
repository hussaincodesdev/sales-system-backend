export interface SalesAgent {
    id: number;
    user_id: number;
    bank_details_id: number | null;
    coach_id: number | null;
    status: 'active' | 'freeze' | 'deleted';
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
}