"use server";

import { sql } from "@vercel/postgres";

type User = {
  id: string;
  created_at: Date;
};

export const getOrCreateUser = async (id: string): Promise<User> => {
  try {
    const getUserResult = await sql<User>`
      SELECT * FROM users WHERE id = ${id}
    `;

    if (getUserResult.rows.length > 0) {
      return getUserResult.rows[0];
    }

    const insertUserResult = await sql<User>`
      INSERT INTO users (id)
      VALUES (${id})
      RETURNING *
    `;

    return insertUserResult.rows[0];
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw new Error("Failed to get or create user");
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await sql<User>`
    SELECT * FROM users
  `;
  return result.rows;
};

const initDb = async () => {
  try {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw new Error("Failed to initialize database");
  }
};

const resetDb = async () => {
  try {
    await sql`DROP TABLE IF EXISTS users`;
    await initDb();
    console.log("Database reset successfully");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw new Error("Failed to reset database");
  }
};
