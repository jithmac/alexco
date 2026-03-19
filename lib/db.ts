import mysql from 'mysql2/promise';

// DATABASE_URL format: mysql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL;

// Don't throw at module evaluation - just warn (allows Next.js build to succeed)
if (!connectionString) {
    console.warn('WARNING: DATABASE_URL is not defined. Database queries will fail.');
}

export const pool = connectionString ? mysql.createPool(connectionString) : null as any;

export const query = async (sql: string, params?: any[]) => {
    if (!pool) throw new Error('DATABASE_URL is not defined');
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
};

export const getClient = async () => {
    if (!pool) throw new Error('DATABASE_URL is not defined');
    return await pool.getConnection();
};
