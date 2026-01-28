import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST === 'localhost' ? '127.0.0.1' : process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  idleTimeout: 60000, // 60 seconds
  maxIdle: 10,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database connection', err);
});

async function withRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isNetworkError = 
        error.code === 'PROTOCOL_CONNECTION_LOST' || 
        error.code === 'EPIPE' || 
        error.code === 'ECONNRESET' ||
        error.code === 'ECONNREFUSED' ||
        error.fatal === true;
      
      console.error(`DB Operation failed (attempt ${i + 1}/${retries}):`, {
        code: error.code,
        message: error.message,
        errno: error.errno,
        sqlState: error.sqlState
      });
      
      if (isNetworkError && i < retries - 1) {
        const delay = Math.pow(2, i) * 500; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  const normalizedParams = params.map(p => p === undefined ? null : p);
  return withRetry(async () => {
    const [rows] = await pool.execute(queryStr, normalizedParams);
    return rows as T[];
  });
}

export async function execute(queryStr: string, params: any[] = []): Promise<any> {
  const normalizedParams = params.map(p => p === undefined ? null : p);
  return withRetry(async () => {
    const [result] = await pool.execute(queryStr, normalizedParams);
    return result;
  });
}

export default pool;
