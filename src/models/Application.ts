import { RowDataPacket } from "mysql2/promise";
import * as console from "node:console";
import { Application } from "types/application";
import { tableNames } from "../config/constants";
import * as conn from "../config/db";

interface ColumnValues {
  columns: string[];
  values: (string | number | null)[];
}

type NewApplication = Omit<
  Application,
  "id" | "date_submitted" | "is_deleted" | "created_at" | "updated_at"
>;

const applicationColumns: Record<keyof NewApplication, string> = {
  sales_agent_id: "sales_agent_id",
  first_name: "first_name",
  last_name: "last_name",
  mobile: "mobile",
  cpr: "cpr",
  application_status: "application_status",
};

const isPresent = (
  value: string | number | boolean | Date | undefined | null
): boolean => value !== undefined && value !== null;

const mapColumnValues = (data: NewApplication): ColumnValues => {
  const columns: string[] = [];
  const values: (string | number | null)[] = [];

  (Object.keys(applicationColumns) as (keyof NewApplication)[]).forEach(
    (key) => {
      if (isPresent(data[key])) {
        columns.push(applicationColumns[key]);
        values.push(data[key]);
      }
    }
  );

  return { columns, values };
};

export const CreateApplication = async (
  application: NewApplication
): Promise<number | null> => {
  const { columns, values } = mapColumnValues(application);
  const placeholders = Array(columns.length).fill("?").join(", ");

  const { insertId } = await conn.execute(
    `INSERT INTO ${tableNames.applications} (${columns.join(", ")})
         VALUES (${placeholders})`,
    values
  );

  return insertId;
};

export const UpdateApplication = async (
  id: number,
  application: Application
): Promise<boolean> => {
  try {
    const { columns, values } = mapColumnValues(application);
    const setString = columns.map((col) => `${col} = ?`).join(", ");
    values.push(id);

    await conn.execute(
      `UPDATE ${tableNames.applications}
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

export const GetApplications = async (
  userId: number
): Promise<Application[] | null> => {
  try {
    const result: [RowDataPacket[] | Application[], any] = await conn.execute(
      `SELECT applications.*
             FROM ${tableNames.applications}
                      JOIN ${tableNames.sales_agents} ON applications.sales_agent_id = sales_agents.id
             WHERE sales_agents.user_id = ? AND applications.is_deleted = false`,
      [userId]
    );

    if (result && !Array.isArray(result)) {
      return [result as Application];
    }

    if (Array.isArray(result) && result.length > 0) {
      return result as Application[];
    }

    return [];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const GetAllApplications = async (): Promise<Application[] | null> => {
  const result: [RowDataPacket[] | Application[], any] = await conn.execute(
    `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) AS sales_agent_name
     FROM ${tableNames.applications} a
     LEFT JOIN ${tableNames.sales_agents} sa ON a.sales_agent_id = sa.id
     LEFT JOIN ${tableNames.users} u ON sa.user_id = u.id
     WHERE a.is_deleted = false`
  );

  if (result && !Array.isArray(result)) {
    return [result as Application];
  }

  if (Array.isArray(result) && result.length > 0) {
    return result as Application[];
  }

  return [];
};

export const GetCoachApplications = async (
  userId: number
): Promise<Application[] | null> => {
  const result: [RowDataPacket[] | Application[], any] = await conn.execute(
    `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) AS sales_agent_name, u.email AS sales_agent_email
     FROM ${tableNames.applications} a
     JOIN ${tableNames.sales_agents} sa ON a.sales_agent_id = sa.id
     JOIN ${tableNames.users} u ON sa.user_id = u.id
     WHERE sa.coach_id = ? AND a.is_deleted = FALSE`,
    [userId]
  );

  if (result && !Array.isArray(result)) {
    return [result as Application];
  }

  if (Array.isArray(result) && result.length > 0) {
    return result as Application[];
  }

  return [];
};

export const DeleteApplication = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `UPDATE ${tableNames.applications}
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

export const getTotalApplications = async (): Promise<number> => {
  try {
    const [result] = await conn.execute(
      `SELECT COUNT(*) as total FROM ${tableNames.applications} 
           WHERE is_deleted = false`
    );
    console.log("getTotalApplications result:", result);
    return Number((result as any)?.total) || 0;
  } catch (error) {
    console.error("Error in getTotalApplications:", error);
    return 0;
  }
};

export const getIncompleteApplicationsThisWeek = async (): Promise<
  Application[]
> => {
  const results = await conn.execute(
    `SELECT * FROM ${tableNames.applications}
         WHERE application_status = 'incomplete'
         AND date_submitted >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND is_deleted = false`
  );
  return results as Application[];
};

export const GetCoachApplicationsForExport = async (
  coachId: number
): Promise<any[]> => {
  try {
    const results = await conn.execute(
      `SELECT 
        a.first_name, 
        a.last_name, 
        a.mobile, 
        a.cpr, 
        a.date_submitted, 
        a.application_status,
        u.first_name AS agent_first_name,
        u.last_name AS agent_last_name
      FROM ${tableNames.applications} a
      JOIN ${tableNames.sales_agents} sa ON a.sales_agent_id = sa.id
      JOIN ${tableNames.users} u ON sa.user_id = u.id
      WHERE sa.coach_id = ? AND a.is_deleted = FALSE`,
      [coachId]
    );

    return results.map((app: any) => ({
      ...app,
      date_submitted: new Date(app.date_submitted).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const GetAllApplicationsForExport = async (): Promise<any[]> => {
  try {
    const results = await conn.execute(
      `SELECT 
        a.first_name, 
        a.last_name, 
        a.mobile, 
        a.cpr, 
        a.date_submitted, 
        a.application_status,
        u_agent.first_name AS agent_first_name,
        u_agent.last_name AS agent_last_name,
        u_coach.first_name AS coach_first_name,
        u_coach.last_name AS coach_last_name
      FROM ${tableNames.applications} a
      JOIN ${tableNames.sales_agents} sa ON a.sales_agent_id = sa.id
      JOIN ${tableNames.users} u_agent ON sa.user_id = u_agent.id
      LEFT JOIN ${tableNames.users} u_coach ON sa.coach_id = u_coach.id
      WHERE a.is_deleted = FALSE`
    );

    return results.map((app: any) => ({
      ...app,
      date_submitted: new Date(app.date_submitted).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const completeApplication = async (
  applicationId: number
): Promise<void> => {
  const query = `
    UPDATE ${tableNames.applications}
    SET application_status = 'completed'
    WHERE id = ?;
  `;

  const checkCommissionQuery = `
    SELECT id, status, amount FROM ${tableNames.commissions}
    WHERE sales_agent_id = (SELECT sales_agent_id FROM ${tableNames.applications} WHERE id = ?)
    AND status = 'due' AND is_deleted = false
    LIMIT 1; 
  `;

  const insertCommissionQuery = `
    INSERT INTO ${tableNames.commissions} (sales_agent_id, amount, status)
    SELECT sales_agent_id, 4, 'due'
    FROM ${tableNames.applications}
    WHERE id = ?;
  `;

  const updateCommissionQuery = `
    UPDATE ${tableNames.commissions}
    SET amount = amount + 4
    WHERE id = ? AND status = 'due';
  `;

  await conn.execute(query, [applicationId]);

  const commissionResult = await conn.execute(checkCommissionQuery, [
    applicationId,
  ]);

  if (Array.isArray(commissionResult) && commissionResult.length > 0) {
    const commission = commissionResult[0] as {
      id: number;
      status: string;
      amount: number;
    };
    if (commission.status === "due") {
      await conn.execute(updateCommissionQuery, [commission.id]);
    }
  } else {
    await conn.execute(insertCommissionQuery, [applicationId]);
  }
};

export const incompleteApplication = async (
  applicationId: number
): Promise<void> => {
  const query = `
    UPDATE ${tableNames.applications}
    SET application_status = 'incomplete'
    WHERE id = ?;
  `;

  const checkCommissionQuery = `
    SELECT id, status, amount FROM ${tableNames.commissions}
    WHERE sales_agent_id = (SELECT sales_agent_id FROM ${tableNames.applications} WHERE id = ?)
    AND status = 'due' AND is_deleted = false
    LIMIT 1;
  `;

  const updateCommissionQuery = `
    UPDATE ${tableNames.commissions}
    SET amount = GREATEST(amount - 4, 0)
    WHERE id = ? AND status = 'due';
  `;

  await conn.execute(query, [applicationId]);

  const commissionResult = await conn.execute(checkCommissionQuery, [
    applicationId,
  ]);

  if (Array.isArray(commissionResult) && commissionResult.length > 0) {
    const commission = commissionResult[0] as {
      id: number;
      status: string;
      amount: number;
    };
    if (commission.status === "due") {
      await conn.execute(updateCommissionQuery, [commission.id]);
    }
  }
};
