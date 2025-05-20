import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Export a promise-like interface for compatibility
const poolPromise = Promise.resolve(pool);

export default pool;
export { poolPromise };
