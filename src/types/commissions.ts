export type CommissionStatus = "due" | "paid";

export interface Commission {
  id: number;
  sales_agent_id: number;
  amount: number;
  status: CommissionStatus;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
