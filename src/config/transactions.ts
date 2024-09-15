import { PoolConnection } from 'mysql2';

// Function to begin a transaction
export const beginTransaction = async function (connection: PoolConnection): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Function to commit a transaction
export const commitTransaction = async function (connection: PoolConnection): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.commit((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Function to rollback a transaction
export const rollbackTransaction = async function (connection: PoolConnection): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.rollback((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};