/**
 * Initializes the database: creates tables, runs migrations, then seeds.
 * Run: node scripts/initDb.js
 */
require('dotenv').config()
const fs   = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

async function run() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  console.log('Connected to MySQL')

  const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8')
  await conn.query(schema)
  console.log('✓ Schema applied')

  const migrations = fs.readFileSync(path.join(__dirname, '../database/migrations.sql'), 'utf8')
  await conn.query(migrations)
  console.log('✓ Migrations applied')

  await conn.end()

  await require('./seed').run()
}

run().catch(err => { console.error(err); process.exit(1) })
