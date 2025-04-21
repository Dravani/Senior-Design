import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sensor_data',
  password: process.env.DB_PASSWORD || 'adminpassword',
  port: process.env.DB_PORT || 5432,
});

// Initialize database with TimescaleDB extension and tables
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create TimescaleDB extension
    await client.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;');
    
    // Create sensor_readings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        time TIMESTAMPTZ NOT NULL,
        sensor_id TEXT NOT NULL,
        temperature DOUBLE PRECISION,
        humidity DOUBLE PRECISION,
        pressure DOUBLE PRECISION
      );
    `);
    
    // Create hypertable
    await client.query(`
      SELECT create_hypertable('sensor_readings', 'time', if_not_exists => TRUE);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export { pool, initDatabase }; 