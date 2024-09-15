import * as console from "node:console";
import { BankDetails } from "types/bank_details";
import { tableNames } from "../config/constants";
import * as conn from "../config/db";

interface ColumnValues {
  columns: string[];
  values: (string | number | null)[];
}

type NewBankDetails = Omit<BankDetails, "id" | "created_at" | "updated_at">;

const bankDetailsColumns: Record<keyof NewBankDetails, string> = {
  account_number: "account_number",
  bank_name: "bank_name",
  iban: "iban",
};

const isPresent = (
  value: string | number | boolean | Date | undefined | null
): boolean => value !== undefined && value !== null;

const mapColumnValues = (data: NewBankDetails): ColumnValues => {
  const columns: string[] = [];
  const values: (string | number | null)[] = [];

  (Object.keys(bankDetailsColumns) as (keyof NewBankDetails)[]).forEach(
    (key) => {
      if (isPresent(data[key])) {
        columns.push(bankDetailsColumns[key]);
        values.push(data[key]);
      }
    }
  );

  return { columns, values };
};

export const CreateBankDetails = async (
  bankDetails: NewBankDetails
): Promise<number | null> => {
  const { columns, values } = mapColumnValues(bankDetails);
  const placeholders = Array(columns.length).fill("?").join(", ");

  const { insertId } = await conn.execute(
    `INSERT INTO ${tableNames.bank_details} (${columns.join(", ")})
         VALUES (${placeholders})`,
    values
  );

  return insertId;
};

export const UpdateBankDetails = async (
  id: number,
  bankDetails: BankDetails
): Promise<boolean> => {
  try {
    const { columns, values } = mapColumnValues(bankDetails);
    const setString = columns.map((col) => `${col} = ?`).join(", ");
    values.push(id);

    await conn.execute(
      `UPDATE ${tableNames.bank_details}
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

export const DeleteBankDetails = async (id: number): Promise<boolean> => {
  try {
    await conn.execute(
      `DELETE FROM ${tableNames.bank_details}
             WHERE id = ?`,
      [id]
    );

    return true;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

export const GetBankDetails = async (
  id: number
): Promise<BankDetails | null> => {
  try {
    const [result] = await conn.execute(
      `SELECT * FROM ${tableNames.bank_details}
             WHERE id = ?`,
      [id]
    );

    if (result && !Array.isArray(result)) {
      return result as BankDetails;
    }

    if (Array.isArray(result) && result.length > 0) {
      return result[0] as BankDetails;
    }

    return null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};
