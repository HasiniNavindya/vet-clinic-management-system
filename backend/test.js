const pool = require("./db");

async function testDB() {
  const res = await pool.query("SELECT * FROM users");
  console.log(res.rows);
}

testDB();
