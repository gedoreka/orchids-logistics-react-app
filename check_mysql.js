const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
  });
  try {
    const [rows] = await connection.execute("SHOW COLUMNS FROM employee_commissions");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
run();
