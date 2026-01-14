import mysql from 'mysql2/promise';

const createPool = () => mysql.createPool({
  host: process.env.DB_HOST || 'srv1687.hstgr.io',
  user: process.env.DB_USER || 'u464748164_zoolsys_main',
  password: process.env.DB_PASSWORD || 'Info@92009',
  database: process.env.DB_NAME || 'u464748164_zoolsys_main',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
});

let pool = createPool();

async function getConnection() {
  try {
    const conn = await pool.getConnection();
    return conn;
  } catch (error: any) {
    if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
      pool = createPool();
      return pool.getConnection();
    }
    throw error;
  }
}

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(queryStr, params);
    return rows as T[];
  } catch (error: any) {
    if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
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
    if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
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
