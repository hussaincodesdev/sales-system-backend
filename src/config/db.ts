import mysql, { Pool, PoolConnection, Connection, PoolOptions } from 'mysql2';
import logger from '../logger';
import dotenv from 'dotenv';

dotenv.config();

// Create a MySQL connection pool
let pool: Pool | Connection | null = null;

interface MySQLCredentials {
  username: string | undefined;
  password: string | undefined;
}

// Initialize MySQL connection pool
function initMySQL(): void {
  const start = Date.now();

  // Get connection settings from environment variables
  const mysql_credentials: MySQLCredentials = {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  };

  const mysql_host: string | undefined = process.env.MYSQL_HOST;
  const mysql_port: number = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const mysql_database: string | undefined = process.env.MYSQL_DATABASE;
  const useSSL: boolean = false;  // Boolean to decide if SSL should be used
  const sslOption: string | undefined = useSSL ? 'Amazon RDS' : undefined; // Assuming SSL option or undefined
  const connectionLimit: number = 10;
  const queueLimit: number = 0;

  // Try to create pool connection
  try {
    logger.info("Creating DB connection in Pool Mode", Date.now() - start);

    pool = mysql.createPool({
      host: mysql_host,
      port: mysql_port,
      user: mysql_credentials.username,
      database: mysql_database,
      password: mysql_credentials.password,
      waitForConnections: true,
      connectionLimit: connectionLimit,
      queueLimit: queueLimit,
      multipleStatements: true,
      ssl: sslOption, // Use the correct ssl option type
    } as PoolOptions); // Cast to PoolOptions to ensure type safety
  } catch (e) {
    // Fallback to unpooled connection
    logger.warning(
        "Unable to create pooled MySQL connection",
        Date.now() - start,
    );

    logger.info(
        "Creating DB connection in Non-Pooled Mode",
        Date.now() - start,
    );

    pool = mysql.createConnection({
      host: mysql_host,
      port: mysql_port,
      user: mysql_credentials.username,
      database: mysql_database,
      password: mysql_credentials.password,
      multipleStatements: true,
      waitForConnections: true,
      ssl: sslOption,
    });
  }
}

// Function to execute a SQL statement
export function execute(sql: string, values?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    if (pool === null) {
      logger.info(
          `Database connection not present. Running init.`,
          Date.now() - start,
      );
      initMySQL();
    }

    (pool as Pool).getConnection((err: NodeJS.ErrnoException | null, connection: PoolConnection) => {
      if (err) {
        logger.error(
            `Database connection error: ${err.message}`,
            Date.now() - start,
        );
        return reject(err);
      }

      connection.execute(sql, values, (queryError: Error | null, results: any) => {
        connection.release();
        if (queryError) {
          logger.error(
              `Database query error: ${queryError.message}`,
              Date.now() - start,
          );
          return reject(queryError);
        }
        resolve(results);
      });
    });
  });
}

// Function to perform a query without parameters
export function query(sql: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    if (pool === null) {
      logger.info(
          `Database connection not present. Running init.`,
          Date.now() - start,
      );
      initMySQL();
    }

    (pool as Pool).getConnection((err: NodeJS.ErrnoException | null, connection: PoolConnection) => {
      if (err) {
        logger.error(
            `Database connection error: ${err.message}`,
            Date.now() - start,
        );
        return reject(err);
      }

      connection.query(sql, (queryError: Error | null, results: any) => {
        connection.release();
        if (queryError) {
          logger.error(
              `Database query error: ${queryError.message}`,
              Date.now() - start,
          );
          return reject(queryError);
        }
        resolve(results);
      });
    });
  });
}

// Function to check if system_meta table exists
export async function checkIfSystemMetaTableExists(): Promise<boolean> {
  const startTime = Date.now();
  try {
    const tableName = "system_meta";
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = ?;
    `;

    const results = await execute(query, [tableName]);
    return results?.length > 0;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error({
      filename: "config/db.ts",
      message: `check if system meta table exists error: ${error.message}`,
      duration: duration,
    });
    throw error;
  }
}

// Function to create system_meta table
export async function createSystemMetaTable(): Promise<void> {
  const startTime = Date.now();
  try {
    const query = `
      CREATE TABLE system_meta (
        id varchar(45) PRIMARY KEY,
        value varchar(512) NULL
      );
    `;

    const insertQuery = `
      INSERT INTO system_meta (id, value) VALUES (?, ?);
    `;

    const values = ["schema_version", 0];

    await execute(query);
    await execute(insertQuery, values);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error({
      filename: "config/db.ts",
      message: `create system meta table error: ${error.message}`,
      duration: duration,
    });
    throw error;
  }
}

// Function to get the current database version
export async function getCurrentDatabaseVersion(): Promise<number> {
  const startTime = Date.now();
  try {
    const id = "schema_version";
    const query = "SELECT value FROM system_meta WHERE id = ?;";

    const [results] = await execute(query, [id]);

    if (results?.value > 0) {
      return results.value;
    } else {
      return 0;
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error({
      filename: "config/db.ts",
      message: `get current database version error: ${error.message}`,
      duration: duration,
    });
    throw error;
  }
}

// Function to get a database connection
export async function getConnection(): Promise<PoolConnection> {
  const startTime = Date.now();
  if (pool === null) {
    logger.info(
        `Database connection not present. Running init.`,
        Date.now() - startTime,
    );
    initMySQL();
  }

  return new Promise((resolve, reject) => {
    (pool as Pool).getConnection((err: NodeJS.ErrnoException | null, connection: PoolConnection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}