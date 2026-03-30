import mysql from 'mysql2/promise';

// Use global singleton in dev to prevent HMR from creating multiple pools
// which exhausts Hostinger's max_connections_per_hour (500) limit
const globalForDb = globalThis as unknown as { 
  mysqlPool: mysql.Pool | undefined;
  queryCache: Map<string, { data: any; expiry: number }> | undefined;
};

// In-memory cache to reduce DB hits
const queryCache = globalForDb.queryCache ?? new Map<string, { data: any; expiry: number }>();
if (process.env.NODE_ENV !== 'production') {
  globalForDb.queryCache = queryCache;
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST === 'localhost' ? '127.0.0.1' : (process.env.DB_HOST || '127.0.0.1'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    idleTimeout: 300000,
    maxIdle: 2,
    connectTimeout: 20000,
  });
}

const pool = globalForDb.mysqlPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPool = pool;
}

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
        // Don't retry on max_connections_per_hour - retries make it worse
        const isResourceLimit = error?.message?.includes('max_connections_per_hour') || error?.errno === 1226;
        if (isResourceLimit) {
          console.error('DB max_connections_per_hour exceeded. Skipping retries.');
          throw error;
        }

        const isNetworkError = 
          error.code === 'PROTOCOL_CONNECTION_LOST' || 
          error.code === 'EPIPE' || 
          error.code === 'ECONNRESET' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.fatal === true;
        
        if (error.code === 'ECONNREFUSED' && (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1')) {
        console.error('\n' + '='.repeat(50));
        console.error('CRITICAL: Local MySQL Connection Refused');
        console.error('You are running locally but DB_HOST is set to localhost.');
        console.error('If you want to connect to the remote database, update DB_HOST in .env');
        console.error('to your server IP (e.g., 92.113.18.38) and whitelist your IP.');
        console.error('='.repeat(50) + '\n');
      }

      console.error(`DB Operation failed (attempt ${i + 1}/${retries}):`, {
        code: error?.code || 'UNKNOWN',
        message: error?.message || String(error),
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        errno: error?.errno,
        sqlState: error?.sqlState
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
  // Auto-cache SELECT queries for 10s to reduce connection count
  const isSelect = queryStr.trimStart().toUpperCase().startsWith('SELECT');
  if (isSelect) {
    const cacheKey = JSON.stringify({ q: queryStr, p: normalizedParams });
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T[];
    }
    const result = await withRetry(async () => {
      const [rows] = await pool.execute(queryStr, normalizedParams);
      return rows as T[];
    });
    queryCache.set(cacheKey, { data: result, expiry: Date.now() + 10000 });
    return result;
  }
  return withRetry(async () => {
    const [rows] = await pool.execute(queryStr, normalizedParams);
    return rows as T[];
  });
}

// Cached query - reuses results for cacheDuration ms (default 60s)
export async function cachedQuery<T>(queryStr: string, params: any[] = [], cacheDuration = 60000): Promise<T[]> {
  const cacheKey = JSON.stringify({ q: queryStr, p: params });
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.data as T[];
  }
  const result = await query<T>(queryStr, params);
  queryCache.set(cacheKey, { data: result, expiry: Date.now() + cacheDuration });
  // Clean old entries periodically
  if (queryCache.size > 200) {
    const now = Date.now();
    for (const [key, val] of queryCache) {
      if (now > val.expiry) queryCache.delete(key);
    }
  }
  return result;
}

export function clearCache() {
  queryCache.clear();
}

export async function execute(queryStr: string, params: any[] = []): Promise<any> {
  const normalizedParams = params.map(p => p === undefined ? null : p);
  // Clear cache on write operations to ensure fresh data
  const isWrite = /^\s*(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|TRUNCATE)/i.test(queryStr);
  if (isWrite) {
    queryCache.clear();
  }
  return withRetry(async () => {
    const [result] = await pool.execute(queryStr, normalizedParams);
    return result;
  });
}

export default pool;
