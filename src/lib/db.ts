import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await pool.execute(queryStr, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function execute(queryStr: string, params: any[] = []): Promise<any> {
  try {
    const [result] = await pool.execute(queryStr, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

export default pool;
