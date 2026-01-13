import mysql from 'mysql2/promise';

// Use environment variables for connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u464748164_zoolsys_main',
  password: process.env.DB_PASSWORD || 'Info@92009',
  database: process.env.DB_NAME || 'u464748164_zoolsys_main',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  try {
    // MySQL uses '?' for placeholders, which is what we expect
    const [rows] = await pool.execute(queryStr, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
