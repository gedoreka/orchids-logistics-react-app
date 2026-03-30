#!/usr/bin/env node
const mysql = require('mysql2/promise');
const fs = require('fs');
// load .env.local then .env if present
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
  dotenv.config({ path: '.env' });
} catch (e) {}

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || undefined,
  waitForConnections: true,
  connectionLimit: 1,
};

(async () => {
  console.log('Using DB config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database ? 'provided' : 'not-provided',
  });

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Connected to MySQL server.');

    const [ping] = await conn.query('SELECT 1 AS ok');
    console.log('SELECT 1 =>', ping);

    // Use a temporary table to test write/read/update/delete safely
    await conn.query('CREATE TEMPORARY TABLE IF NOT EXISTS test_conn (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100))');
    const [ins] = await conn.query('INSERT INTO test_conn (name) VALUES (?)', ['initial']);
    console.log('Inserted row id:', ins.insertId);

    const [rowsAfterInsert] = await conn.query('SELECT * FROM test_conn WHERE id = ?', [ins.insertId]);
    console.log('Row after insert:', rowsAfterInsert);

    await conn.query('UPDATE test_conn SET name = ? WHERE id = ?', ['updated', ins.insertId]);
    const [rowsAfterUpdate] = await conn.query('SELECT * FROM test_conn WHERE id = ?', [ins.insertId]);
    console.log('Row after update:', rowsAfterUpdate);

    await conn.query('DELETE FROM test_conn WHERE id = ?', [ins.insertId]);
    const [rowsAfterDelete] = await conn.query('SELECT * FROM test_conn WHERE id = ?', [ins.insertId]);
    console.log('Row after delete (should be empty):', rowsAfterDelete);

    await conn.end();
    console.log('All checks passed. Connection accepts read/write operations.');
    process.exit(0);
  } catch (err) {
    console.error('MySQL connection/test failed:', err && err.message ? err.message : err);
    if (conn) try { await conn.end(); } catch (e) {}
    process.exit(1);
  }
})();
