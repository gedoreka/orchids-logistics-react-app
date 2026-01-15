import mysql from 'mysql2/promise';

const createPool = () => mysql.createPool({
  host: process.env.DB_HOST || 'srv1687.hstgr.io',
  user: process.env.DB_USER || 'u464748164_zoolsys_main',
  password: process.env.DB_PASSWORD || 'Info@92009',
  database: process.env.DB_NAME || 'u464748164_zoolsys_main',
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  idleTimeout: 30000,
});

let pool = createPool();

const RETRY_ERRORS = ['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'EPIPE', 'ECONNREFUSED', 'ETIMEDOUT'];

async function getConnection(retries = 3): Promise<mysql.PoolConnection> {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      return conn;
    } catch (error: any) {
      if (RETRY_ERRORS.includes(error.code) && i < retries - 1) {
        pool = createPool();
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to get database connection after retries');
}

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(queryStr, params);
    return rows as T[];
  } catch (error: any) {
    if (RETRY_ERRORS.includes(error.code)) {
      pool = createPool();
      conn = await getConnection();
      const [rows] = await conn.execute(queryStr, params);
      return rows as T[];
    }
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

export async function execute(queryStr: string, params: any[] = []): Promise<any> {
  let conn;
  try {
    conn = await getConnection();
    const [result] = await conn.execute(queryStr, params);
    return result;
  } catch (error: any) {
    if (RETRY_ERRORS.includes(error.code)) {
      pool = createPool();
      conn = await getConnection();
      const [result] = await conn.execute(queryStr, params);
      return result;
    }
    console.error('Database execute error:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

export default pool;
