import { tableNames } from "../config/constants";
import * as conn from "../config/db";
import { Commission } from "../types/commissions";

interface ColumnValues {
  columns: string[];
  values: (number | string | boolean)[];
}

type NewCommission = Omit<
  Commission,
  "id" | "is_deleted" | "created_at" | "updated_at"
>;

const commissionColumns: Record<keyof NewCommission, string> = {
  sales_agent_id: "sales_agent_id",
  amount: "amount",
  status: "status",
};

const isPresent = (value: number | string | boolean | undefined): boolean =>
  value !== undefined;

const mapColumnValues = (data: NewCommission): ColumnValues => {
  const columns: string[] = [];
  const values: (number | string | boolean)[] = [];

  (Object.keys(commissionColumns) as (keyof NewCommission)[]).forEach((key) => {
    if (isPresent(data[key])) {
      columns.push(commissionColumns[key]);
      values.push(data[key]);
    }
  });

  return { columns, values };
};

export const CreateCommission = async (
  commission: NewCommission
): Promise<number | null> => {
  const { columns, values } = mapColumnValues(commission);
  const placeholders = Array(columns.length).fill("?").join(", ");

  const { insertId } = await conn.execute(
    `INSERT INTO ${tableNames.commissions} (${columns.join(", ")})
         VALUES (${placeholders})`,
    values
  );

  return insertId;
};

export const GetAllCommissions = async (): Promise<Commission[]> => {
  try {
    const result = await conn.execute(
      `SELECT c.id, c.sales_agent_id, c.amount, c.status AS commission_status, 
              c.created_at, c.updated_at,
              sa.user_id, sa.coach_id, sa.status AS sales_agent_status,
              CONCAT(agent_user.first_name, ' ', agent_user.last_name) AS agent_name, 
              agent_user.email AS agent_email, 
              CONCAT(coach_user.first_name, ' ', coach_user.last_name) AS coach_name, 
              coach_user.email AS coach_email
       FROM ${tableNames.commissions} c
       JOIN ${tableNames.sales_agents} sa ON c.sales_agent_id = sa.id
       JOIN ${tableNames.users} agent_user ON sa.user_id = agent_user.id
       LEFT JOIN ${tableNames.users} coach_user ON sa.coach_id = coach_user.id
       WHERE sa.is_deleted = 0 AND c.is_deleted = 0`
    );

    if (result && !Array.isArray(result)) {
      return [result as Commission];
    }

    if (Array.isArray(result) && result.length > 0) {
      return result as Commission[];
    }

    return [];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const GetCommissions = async (id: number): Promise<Commission[]> => {
  try {
    const result = await conn.execute(
      `SELECT c.id, c.sales_agent_id, c.amount, c.status AS commission_status, 
              c.created_at, c.updated_at,
              sa.user_id, sa.coach_id, sa.status AS sales_agent_status,
              CONCAT(agent_user.first_name, ' ', agent_user.last_name) AS agent_name, 
              agent_user.email AS agent_email, 
              CONCAT(coach_user.first_name, ' ', coach_user.last_name) AS coach_name, 
              coach_user.email AS coach_email
       FROM ${tableNames.commissions} c
       JOIN ${tableNames.sales_agents} sa ON c.sales_agent_id = sa.id
       JOIN ${tableNames.users} agent_user ON sa.user_id = agent_user.id
       LEFT JOIN ${tableNames.users} coach_user ON sa.coach_id = coach_user.id
       WHERE sa.is_deleted = 0 AND c.is_deleted = 0 AND sa.coach_id = ?`,
      [id]
    );

    if (result && !Array.isArray(result)) {
      return [result as Commission];
    }

    if (Array.isArray(result) && result.length > 0) {
      return result as Commission[];
    }

    return [];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const GetCommissionById = async (
  id: number
): Promise<Commission | null> => {
  try {
    const [result] = await conn.execute(
      `SELECT * FROM ${tableNames.commissions} WHERE id = ? AND is_deleted = false`,
      [id]
    );

    if (Array.isArray(result) && result.length > 0) {
      return result[0] as Commission;
    }

    return null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const UpdateCommission = async (
  id: number,
  commission: NewCommission
): Promise<boolean> => {
  try {
    const { columns, values } = mapColumnValues(commission);
    const setString = columns.map((col) => `${col} = ?`).join(", ");
    values.push(id);

    await conn.execute(
      `UPDATE ${tableNames.commissions}
             SET ${setString}
             WHERE id = ?`,
      values
    );

    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const DeleteCommission = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.commissions}
             SET is_deleted = true
             WHERE id = ?`,
      [id]
    );

    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const markCommissionAsPaid = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.commissions}
             SET status = 'paid'
             WHERE id = ?`,
      [id]
    );

    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const markCommissionAsDue = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.commissions}
             SET status = 'due'
             WHERE id = ?`,
      [id]
    );

    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};
