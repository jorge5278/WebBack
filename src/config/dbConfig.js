// src/config/dbConfig.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,            // para Azure
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = sql.connect(config)
  .then(pool => {
    console.log("Conectado a Azure SQL");
    return pool;
  })
  .catch(err => {
    console.error("Error al conectar a Azure SQL:", err);
    throw err;
  });

export { sql, poolPromise };
