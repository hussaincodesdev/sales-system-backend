import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import {
    execute,
    getConnection,
    getCurrentDatabaseVersion,
    query
} from './config/db';
import logger from './logger';
import {beginTransaction, commitTransaction, rollbackTransaction} from './config/transactions';

async function rollback(targetVersion: number): Promise<void> {
    const startTime = new Date();

    logger.info(`Rollback: Starting Schema Rollback`, Date.now() - startTime.getTime());

    const connection = await getConnection();

    try {
        const schemaDir = path.join(__dirname, "./managed_data", "schema");
        const sqlFiles = fs
            .readdirSync(schemaDir)
            .filter((file) => file.endsWith(".rollback.sql"))  // Only include rollback files
            .map((file) => ({
                filename: file,
                version: parseInt(file.replace(".rollback.sql", ""), 10),
            }))
            .sort((a, b) => b.version - a.version); // Sort in descending order for rollback

        logger.info(
            "List of SQL files to be rolled back: " + JSON.stringify(sqlFiles),
            Date.now() - startTime.getTime()
        );

        let currentVersion = await getCurrentDatabaseVersion();

        if (currentVersion <= targetVersion) {
            logger.info(`Current version (${currentVersion}) is less than or equal to target version (${targetVersion}). No rollback needed.`);
            return;
        }

        async function executeRollback(index: number): Promise<void> {
            if (index < sqlFiles.length) {
                const sqlFile = sqlFiles[index];
                if (sqlFile.version > targetVersion && sqlFile.version <= currentVersion) {
                    const filePath = path.join(schemaDir, sqlFile.filename);

                    if (fs.existsSync(filePath)) {
                        const sqlContent = fs.readFileSync(filePath, "utf8");

                        try {
                            logger.info(
                                `Starting Rollback for: ${sqlFile.filename}`,
                                Date.now() - startTime.getTime()
                            );
                            await beginTransaction(connection);

                            const semicolonRegex = /;(?=(?:[^"]*"[^"]*")*[^"]*$)/;
                            const statements = sqlContent
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
                                        `Rollback failed for ${sqlFile.filename}: ${statement}`,
                                        Date.now() - startTime.getTime()
                                    );
                                    throw new Error(e);
                                }
                            }

                            const updateVersionQuery =
                                "UPDATE system_meta SET value = ? WHERE id = ?;";
                            await execute(updateVersionQuery, [
                                sqlFile.version - 1,
                                "schema_version",
                            ]);

                            await commitTransaction(connection);

                            logger.info(
                                `Rolled back to version ${sqlFile.version - 1} - ${sqlFile.filename}`,
                                Date.now() - startTime.getTime()
                            );
                        } catch (error: any) {
                            logger.error(
                                `Rollback failed for ${sqlFile.filename}: ${error.message}`,
                                Date.now() - startTime.getTime()
                            );
                            await rollbackTransaction(connection);
                            process.exit(1);
                        }

                        await executeRollback(index + 1);
                    } else {
                        logger.warning(`No rollback file found for ${sqlFile.filename}`);
                        await executeRollback(index + 1);
                    }
                } else {
                    await executeRollback(index + 1);
                }
            } else {
                logger.info(
                    "Database rollback completed successfully.",
                    Date.now() - startTime.getTime()
                );
            }
        }

        await executeRollback(0);
        await commitTransaction(connection);
    } catch (error: any) {
        logger.error(
            `Database rollback failed: ${error.message}`,
            Date.now() - startTime.getTime()
        );

        await rollbackTransaction(connection);
        process.exit(1);
    }

    logger.info(`Rollback: Finished Schema Rollback`, Date.now() - startTime.getTime());
    process.exit(0);
}

// Execute the rollback function with the target version
const targetVersion = parseInt(process.argv[2], 10);
rollback(targetVersion);