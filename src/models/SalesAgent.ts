import { tableNames } from "../config/constants";
import * as conn from "../config/db";
import { SalesAgent } from "../types/sales_agent";

interface ColumnValues {
  columns: string[];
  values: (number | null)[];
}

type NewSalesAgent = Omit<
  SalesAgent,
  | "id"
  | "bank_details_id"
  | "status"
  | "is_deleted"
  | "created_at"
  | "updated_at"
>;

const agentColumns: Record<keyof NewSalesAgent, string> = {
  user_id: "user_id",
  coach_id: "coach_id",
};

const isPresent = (value: number | undefined | null): boolean =>
  value !== undefined && value !== null;

const mapColumnValues = (data: NewSalesAgent): ColumnValues => {
  const columns: string[] = [];
  const values: (number | null)[] = [];

  (Object.keys(agentColumns) as (keyof NewSalesAgent)[]).forEach((key) => {
    if (isPresent(data[key])) {
      columns.push(agentColumns[key]);
      values.push(data[key]);
    }
  });

  return { columns, values };
};

export const updateSalesAgentBankDetailsId = async (
  userId: number,
  bankDetailsId: number
): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.sales_agents}
             SET bank_details_id = ?
             WHERE user_id = ?`,
      [bankDetailsId, userId]
    );
    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const CreateSalesAgent = async (
  data: NewSalesAgent
): Promise<number | null> => {
  const { columns, values } = mapColumnValues(data);
  const placeholders = Array(columns.length).fill("?").join(", ");

  const { insertId } = await conn.execute(
    `INSERT INTO ${tableNames.sales_agents} (${columns.join(", ")})
         VALUES (${placeholders})`,
    values
  );

  return insertId;
};

export const getAllSalesAgents = async (): Promise<any> => {
  try {
    const results: any = await conn.execute(
      `SELECT sa.*,
                    u.id             as user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.mobile,
                    u.role,
                    u.is_active,
                    u.created_at     as user_created_at,
                    u.updated_at     as user_updated_at,
                    coach.id         as coach_id,
                    coach.first_name as coach_first_name,
                    coach.last_name  as coach_last_name,
                    coach.email      as coach_email,
                    coach.mobile     as coach_mobile,
                    coach.role       as coach_role
             FROM ${tableNames.sales_agents} sa
                      JOIN ${tableNames.users} u ON sa.user_id = u.id
                      LEFT JOIN ${tableNames.users} coach ON sa.coach_id = coach.id
             WHERE u.role = 'sales_agent'
               AND u.is_deleted = 0
               AND sa.is_deleted = 0`
    );

    const resultsArray = Array.isArray(results) ? results : [results];

    return resultsArray.map((result) => {
      const {
        user_id,
        first_name,
        last_name,
        email,
        mobile,
        role,
        is_active,
        user_created_at,
        user_updated_at,
        coach_id,
        coach_first_name,
        coach_last_name,
        coach_email,
        coach_mobile,
        coach_role,
        ...salesAgentData
      } = result;

      return {
        ...salesAgentData,
        first_name,
        last_name,
        email,
        mobile,
        is_active,
        coach_id,
        coach_name: `${coach_first_name} ${coach_last_name}`,
        coach_first_name,
        coach_last_name,
        coach_email,
        coach_mobile,
        coach_role,
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const updateSalesAgentDetails = async (
  id: number,
  coachId: number | null
): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.sales_agents}
             SET coach_id = ?
             WHERE id = ?`,
      [coachId, id]
    );
    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const SoftDeleteSalesAgent = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.sales_agents}
             SET is_deleted = 1
             WHERE id = ?`,
      [id]
    );
    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const findUserIdBySalesAgentId = async (
  salesAgentId: number
): Promise<number | null> => {
  try {
    const result: any = await conn.execute(
      `SELECT user_id
             FROM ${tableNames.sales_agents}
             WHERE id = ?`,
      [salesAgentId]
    );

    if (Array.isArray(result) && result.length > 0) {
      return result[0].user_id;
    }

    return null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const getCoachSalesAgents = async (coachId: number): Promise<any> => {
  try {
    const results: any = await conn.execute(
      `SELECT sa.*,
                    u.id             as user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.mobile,
                    u.role,
                    u.is_active,
                    u.created_at     as user_created_at,
                    u.updated_at     as user_updated_at
             FROM ${tableNames.sales_agents} sa
                      JOIN ${tableNames.users} u ON sa.user_id = u.id
             WHERE u.role = 'sales_agent'
               AND u.is_deleted = 0
               AND sa.is_deleted = 0
               AND sa.coach_id = ?`,
      [coachId]
    );

    const resultsArray = Array.isArray(results) ? results : [results];

    return resultsArray.map((result) => {
      const {
        user_id,
        first_name,
        last_name,
        email,
        mobile,
        role,
        is_active,
        user_created_at,
        user_updated_at,
        coach_id,
        coach_first_name,
        coach_last_name,
        coach_email,
        coach_mobile,
        coach_role,
        ...salesAgentData
      } = result;

      return {
        ...salesAgentData,
        first_name,
        last_name,
        email,
        mobile,
        is_active,
        coach_id,
        coach_name: `${coach_first_name} ${coach_last_name}`,
        coach_first_name,
        coach_last_name,
        coach_email,
        coach_mobile,
        coach_role,
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const getTotalSalesAgents = async (): Promise<number> => {
  try {
    const [result] = await conn.execute(
      `SELECT COUNT(*) as total FROM ${tableNames.sales_agents} 
           WHERE is_deleted = false`
    );
    console.log("getTotalSalesAgents result:", result);
    return (result as any)?.total || 0;
  } catch (error) {
    console.error("Error in getTotalSalesAgents:", error);
    return 0;
  }
};
