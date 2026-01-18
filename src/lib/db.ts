import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
});

/**
 * Helper to convert MySQL query syntax to PostgreSQL syntax
 * 1. Replaces '?' placeholders with '$1', '$2', etc.
 * 2. Replaces MySQL CURDATE() with CURRENT_DATE
 * 3. Replaces MySQL NOW() with NOW() (compatible)
 */
function transformQuery(queryStr: string, params: any[]): { transformedQuery: string, transformedParams: any[] } {
  let count = 1;
  let transformedQuery = queryStr.replace(/\?/g, () => `$${count++}`);
  
  // Replace common MySQL functions with PostgreSQL equivalents
  transformedQuery = transformedQuery.replace(/CURDATE\(\)/gi, 'CURRENT_DATE');
  transformedQuery = transformedQuery.replace(/IFNULL\s*\(/gi, 'COALESCE(');
  
  // Basic DATEDIFF transformation: DATEDIFF(a, b) -> (a::date - b::date)
  transformedQuery = transformedQuery.replace(/DATEDIFF\s*\(\s*([^,]+)\s*,\s*([^)]+)\)/gi, '($1::date - $2::date)');
  
  return { transformedQuery, transformedParams: params };
}

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  try {
    const { transformedQuery, transformedParams } = transformQuery(queryStr, params);
    const result = await sql.unsafe(transformedQuery, transformedParams);
    return result as unknown as T[];
  } catch (error) {
    console.error('Database query error (Supabase/Postgres):', error);
    // If it's a specific missing table error, we might want to log more info
    throw error;
  }
}

export async function execute(queryStr: string, params: any[] = []): Promise<any> {
  try {
    const { transformedQuery, transformedParams } = transformQuery(queryStr, params);
    const result = await sql.unsafe(transformedQuery, transformedParams);
    return result;
  } catch (error) {
    console.error('Database execute error (Supabase/Postgres):', error);
    throw error;
  }
}

export default sql;
