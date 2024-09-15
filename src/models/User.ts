import { RowDataPacket } from "mysql2/promise";
import { SalesAgent } from "types/sales_agent";
import { tableNames } from "../config/constants";
import * as conn from "../config/db";
import { User } from "../types/user";

interface ColumnValues {
  columns: string[];
  values: (string | number | boolean | undefined)[];
}

type NewUser = Omit<User, "id" | "is_deleted" | "created_at" | "updated_at">;

const userColumns: Record<keyof NewUser, string> = {
  first_name: "first_name",
  last_name: "last_name",
  email: "email",
  mobile: "mobile",
  password: "password",
  role: "role",
  is_active: "is_active",
};

const isPresent = (value: string | number | boolean | undefined): boolean =>
  value !== undefined;

const mapUserColumnValues = (data: NewUser): ColumnValues => {
  const columns: string[] = [];
  const values: (string | number | boolean | undefined)[] = [];

  (Object.keys(userColumns) as (keyof NewUser)[]).forEach((key) => {
    if (isPresent(data[key])) {
      columns.push(userColumns[key]);
      values.push(data[key]);
    }
  });

  return { columns, values };
};

export const CreateUser = async (user: NewUser): Promise<number | null> => {
  const { columns, values } = mapUserColumnValues(user);
  const placeholders = Array(columns.length).fill("?").join(", ");

  const { insertId } = await conn.execute(
    `INSERT INTO ${tableNames.users} (${columns.join(", ")})
         VALUES (${placeholders})`,
    values
  );

  return insertId;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const [result]: [RowDataPacket[] | User, any] = await conn.execute(
      `SELECT *
             FROM ${tableNames.users}
             WHERE email = ?`,
      [email]
    );

    if (result && !Array.isArray(result)) {
      return result as User;
    }

    if (Array.isArray(result) && result.length > 0) {
      return result[0] as User;
    }

    return null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const findUserById = async (id: number): Promise<User | null> => {
  try {
    const [result]: [RowDataPacket[] | User, any] = await conn.execute(
      `SELECT *
             FROM ${tableNames.users}
             WHERE id = ?`,
      [id]
    );

    if (result && !Array.isArray(result)) {
      return result as User;
    }

    if (Array.isArray(result) && result.length > 0) {
      return result[0] as User;
    }

    return null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const GetAllSalesCoaches = async (): Promise<User[] | null> => {
  try {
    const result: [RowDataPacket[] | User[], any] = await conn.execute(
      `SELECT *
             FROM ${tableNames.users}
             WHERE role = 'sales_coach'`
    );

    if (result && !Array.isArray(result)) {
      return [result as User];
    }

    if (Array.isArray(result) && result.length > 0) {
      return result as User[];
    }

    return [];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const findSalesAgentByUserId = async (
  userId: number
): Promise<SalesAgent | null> => {
  try {
    const [result]: [RowDataPacket[] | SalesAgent[], any] = await conn.execute(
      `SELECT *
             FROM ${tableNames.sales_agents}
             WHERE user_id = ?`,
      [userId]
    );

    if (result && !Array.isArray(result)) {
      return result as SalesAgent;
    }

    if (Array.isArray(result) && result.length > 0) {
      return result[0] as SalesAgent;
    }

    return null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const UpdateUser = async (id: number, user: any): Promise<boolean> => {
  try {
    const { columns, values } = mapUserColumnValues(user);
    const setString = columns.map((col) => `${col} = ?`).join(", ");
    values.push(id);

    await conn.execute(
      `UPDATE ${tableNames.users}
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

export const DeleteUser = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `DELETE FROM ${tableNames.users}
             WHERE id = ?`,
      [id]
    );
    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const SoftDeleteUser = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.users}
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

export const getTotalSalesCoaches = async (): Promise<number> => {
  try {
    const [result] = await conn.execute(
      `SELECT COUNT(*) as total FROM ${tableNames.users} 
           WHERE role = 'sales_coach' AND is_deleted = false`
    );
    console.log("getTotalSalesCoaches result:", result);
    return Number((result as any)?.total) || 0;
  } catch (error) {
    console.error("Error in getTotalSalesCoaches:", error);
    return 0;
  }
};

export const GetAllSalesAgents = async (): Promise<User[] | null> => {
  try {
    const result: [RowDataPacket[] | User[], any] = await conn.execute(
      `SELECT *
       FROM ${tableNames.users}
       WHERE role = 'sales_agent' AND is_deleted = false`
    );

    if (result && !Array.isArray(result)) {
      return [result as User];
    }

    if (Array.isArray(result) && result.length > 0) {
      return result as User[];
    }

    return [];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const GetAllSalesAgentsWithCoach = async (): Promise<any[]> => {
  try {
    const result: [RowDataPacket[], any] = await conn.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.mobile, u.is_active,
              c.first_name AS coach_first_name, c.last_name AS coach_last_name
       FROM ${tableNames.users} u
       JOIN ${tableNames.sales_agents} sa ON u.id = sa.user_id
       LEFT JOIN ${tableNames.users} c ON sa.coach_id = c.id
       WHERE u.role = 'sales_agent' AND u.is_deleted = false`
    );

    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};
