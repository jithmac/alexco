
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function audit() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const [perms] = await connection.execute('SELECT * FROM permissions ORDER BY group_name, code');

        let report = "# Permissions Audit\n\n";
        let currentGroup = "";

        perms.forEach(p => {
            if (p.group_name !== currentGroup) {
                currentGroup = p.group_name;
                report += `\n## ${currentGroup}\n`;
            }
            report += `- **${p.code}**: ${p.description}\n`;
        });

        fs.writeFileSync('permissions_audit.md', report);
        console.log('Audit report generated in permissions_audit.md');
        await connection.end();
    } catch (e) { console.error(e); }
}
audit();
