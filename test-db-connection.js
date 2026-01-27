const mysql = require('mysql2/promise');
const fs = require('fs');

function getEnv() {
  const env = {};
  const content = fs.readFileSync('.env', 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.join('=').trim();
    }
  });
  return env;
}

async function run() {
  const env = getEnv();
  console.log('Connecting to:', env.DB_HOST);
  try {
    const connection = await mysql.createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      connectTimeout: 10000
    });
    console.log('✅ Connection successful!');
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log('Test query result:', rows);
    await connection.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}
run();
