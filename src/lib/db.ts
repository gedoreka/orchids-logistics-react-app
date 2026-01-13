import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xaexoopjqkrzhbochbef:FQtpzJwraLTrb3gHEX7R2oaAnJPAsyhVntIFiAvsA20kivkFYiKnfpwxQP7iCsiB@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
});

export async function query<T>(queryStr: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql.unsafe(queryStr, params);
    return result as unknown as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function execute(queryStr: string, params: any[] = []): Promise<any> {
  try {
    const result = await sql.unsafe(queryStr, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

export default sql;
