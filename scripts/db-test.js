const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing connection...');
    const config = {
        host: '127.0.0.1',
        user: 'u624100610_alexco2',
        password: 'ZXas1234za',
        database: 'u624100610_alexco2',
        port: 3306
    };

    console.log('Config:', { ...config, password: '***' });

    try {
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected to database!');

        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables:', rows.map(r => Object.values(r)[0]));

        // Count users if users table exists
        if (rows.some(r => Object.values(r)[0] === 'users')) {
            const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
            console.log('User count:', users[0].count);
        }

        // Count products if products table exists
        if (rows.some(r => Object.values(r)[0] === 'products')) {
            const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
            console.log('Product count:', products[0].count);
        }

        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();
