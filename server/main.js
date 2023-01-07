require('dotenv').config();
const { Client } = require("pg");
// process.env.DATABASEURL = "postgresql://googleuser:mAfOMffg6lS1XcK3_SOR2Q@worthy-bat-1947.7s5.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";
const client = new Client(process.env.DATABASEURL);

// mAfOMffg6lS1XcK3_SOR2Q
console.log(process.env.DATABASEURL)

const { Pool } = require("pg");




const pool = new Pool({
    connectionString:process.env.DATABASEURL
  })
  
  //
  // EXECUTE QUERY
  //
  pool.query('SELECT * FROM accounts;', (err, res) => {
    console.log(err, res.rows)
    pool.end()
  })