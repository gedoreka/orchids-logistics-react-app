import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv1687.hstgr.io',
  user: process.env.DB_USER || 'u464748164_zoolsys_main',
  password: process.env.DB_PASSWORD || 'Info@92009',
  database: process.env.DB_NAME || 'u464748164_zoolsys_main',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  try {
    console.log(`[DB] Executing: ${queryStr} | Params: ${JSON.stringify(params)}`);
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
