import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import {
  checkIfSystemMetaTableExists,
  createSystemMetaTable,
  execute,
  getConnection,
  getCurrentDatabaseVersion,
  query
} from './config/db';
import logger from './logger';
import {beginTransaction, commitTransaction, rollbackTransaction} from './config/transactions';


// Define the function to remove comments from SQL statements
function removeComments(sql: string): string {
  // Regular expression to remove single-line comments (e.g., -- comment)
  sql = sql.replace(/--.+/g, "");

  // Regular expression to remove multi-line comments (/* ... */)
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, "");

  // Trim any extra whitespace at the beginning and end of the string
  sql = sql.trim();

  return sql;
}

// Define the function to perform the migration
async function migrate(): Promise<void> {
  const startTime = new Date();

  logger.info(`Migrate: Starting Schema Migration`, Date.now() - startTime.getTime());

  const connection = await getConnection();

  try {
    const schemaDir = path.join(__dirname, "./managed_data", "schema");
    const sqlFiles = fs
        .readdirSync(schemaDir)
        .filter((file) => file.endsWith(".sql") && !file.endsWith(".rollback.sql"))  // Exclude rollback files
        .map((file) => ({
          filename: file,
          version: parseInt(file.replace(".sql", ""), 10),
        }))
        .sort((a, b) => a.version - b.version);

    logger.info(
        "List of SQL files to be migrated: " + JSON.stringify(sqlFiles),
        Date.now() - startTime.getTime()
    );

    let currentVersion = 0;

    const systemMetaTableExists = await checkIfSystemMetaTableExists();

    if (systemMetaTableExists) {
      currentVersion = await getCurrentDatabaseVersion();
    } else {
      await createSystemMetaTable();
    }

    async function executeMigration(index: number): Promise<void> {
      if (index < sqlFiles.length) {
        const sqlFile = sqlFiles[index];
        if (sqlFile.version > currentVersion) {
          const filePath = path.join(schemaDir, sqlFile.filename);
          const sqlContent = fs.readFileSync(filePath, "utf8");
          const cleanSql = removeComments(sqlContent);

          try {
            logger.info(
                `Starting Migration for: ${sqlFile.filename}`,
                Date.now() - startTime.getTime()
            );
            await beginTransaction(connection);
            await checkIfSystemMetaTableExists();

            const semicolonRegex = /;(?=(?:[^"]*"[^"]*")*[^"]*$)/;
            const statements = cleanSql
                .split(semicolonRegex)
                .map((statement) => statement.trim())
                .filter(Boolean);

            for (const statement of statements) {
              try {
                logger.info(
                    `EXECUTING SQL: ${statement}`,
                    Date.now() - startTime.getTime()
                );
                await query(statement);
              } catch (e: any) {
                logger.error(
                    `Migration failed for ${sqlFile.filename}: ${statement}`,
                    Date.now() - startTime.getTime()
                );
                throw new Error(e);
              }
            }

            const updateVersionQuery =
                "UPDATE system_meta SET value = ? WHERE id = ?;";
            await execute(updateVersionQuery, [
              sqlFile.version,
              "schema_version",
            ]);

            await commitTransaction(connection);

            logger.info(
                `Migrated to version ${sqlFile.version} - ${sqlFile.filename}`,
                Date.now() - startTime.getTime()
            );
          } catch (error: any) {
            logger.error(
                `Migration failed for ${sqlFile.filename}: ${error.message}`,
                Date.now() - startTime.getTime()
            );
            await rollbackTransaction(connection);
            process.exit(1);
          }

          await executeMigration(index + 1);
        } else {
          logger.verbose(
              `Skipped migration for version ${sqlFile.version} - ${sqlFile.filename}`,
              Date.now() - startTime.getTime()
          );

          await executeMigration(index + 1);
        }
      } else {
        logger.info(
            "Database migration completed successfully.",
            Date.now() - startTime.getTime()
        );
      }
    }

    await executeMigration(0);
    await commitTransaction(connection);
  } catch (error: any) {
    logger.error(
        `Database migration failed: ${error.message}`,
        Date.now() - startTime.getTime()
    );

    await rollbackTransaction(connection);
    process.exit(1);
  }

  logger.info(`Migrate: Finished Schema Migration`, Date.now() - startTime.getTime());

  logger.info(
      `Migrate: Starting Load of JSON Controlled Data`,
      Date.now() - startTime.getTime()
  );

  // Example call to loadJSONData - uncomment and modify as needed
  // await loadJSONData(
  //   "./managed_data/business_meta/currencies.json",
  //   "currencies",
  //   "id",
  //   ["name", "currency_code", "active"]
  // );

  logger.info(
      `Migrate: Finished Load of JSON Controlled Data`,
      Date.now() - startTime.getTime()
  );

  process.exit(0);
}

// Execute the migration function
migrate();