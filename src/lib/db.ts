import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database connection', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'EPIPE' || err.code === 'ECONNRESET') {
    console.log('Database connection lost. Pool will handle reconnection.');
  }
});

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  const normalizedParams = params.map(p => p === undefined ? null : p);
  try {
    const [rows] = await pool.execute(queryStr, normalizedParams);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function execute(queryStr: string, params: any[] = []): Promise<any> {
  const normalizedParams = params.map(p => p === undefined ? null : p);
  try {
    const [result] = await pool.execute(queryStr, normalizedParams);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

export default pool;
