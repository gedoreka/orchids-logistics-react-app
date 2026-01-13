import postgres from 'postgres';

const connectionString = 'postgresql://postgres.xaexoopjqkrzhbochbef:FQtpzJwraLTrb3gHEX7R2oaAnJPAsyhVntIFiAvsA20kivkFYiKnfpwxQP7iCsiB@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
});

async function test() {
  try {
    const email = 'admin@zoolspeed.com';
    console.log('Testing sql.unsafe with $1...');
    const result = await sql.unsafe('SELECT id, email FROM public.users WHERE email = $1', [email]);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

test();
