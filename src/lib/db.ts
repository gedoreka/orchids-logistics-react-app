import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL!;

// Configure the connection
const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
});

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  try {
    // Convert MySQL-style '?' to PostgreSQL-style '$1, $2, ...'
    let pgSql = queryStr;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex++}`);
    }

    // Convert common MySQL functions to PostgreSQL if necessary
    // Example: NOW() - INTERVAL 15 MINUTE
    pgSql = pgSql.replace(/INTERVAL (\d+) MINUTE/gi, "INTERVAL '$1 minutes'");
    
    // Some MySQL specific syntax fixes
    pgSql = pgSql.replace(/`([^`]+)`/g, '"$1"'); // Backticks to double quotes

    // Execute the query using the postgres library
    const result = await sql.unsafe(pgSql, params);
    
    return result as unknown as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default sql;
