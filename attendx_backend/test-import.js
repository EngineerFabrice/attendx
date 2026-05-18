const mysql = require("mysql2/promise");
require("dotenv").config(".env");

async function testImport() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Connected to database:", process.env.DB_NAME);

    // Get all tables
    const [tables] = await conn.query("SHOW TABLES");
    console.log("\n📊 Tables in database:");
    tables.forEach((t) => console.log(`   - ${Object.values(t)[0]}`));

    // Check table structures
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [columns] = await conn.query(`DESCRIBE ${tableName}`);
      console.log(`\n📋 Table: ${tableName} (${columns.length} columns)`);
    }

    await conn.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testImport();
