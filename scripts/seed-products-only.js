
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const PRODUCTS = [
    // Solar Panels
    {
        sku: 'SOL-PNL-450W',
        long_desc: 'The Jinko Solar Tiger Neo 450W module adopts N-type HOT 2.0 technology with better reliability and lower LID/LETID. Equipped with SMBB technology to improve light trapping and current collection, this module is designed for maximum energy yield even in low-light conditions.',
        features: ['N-Type Technology', 'SMBB Technology', 'Anti-PID', 'Durability against extreme environments', 'High Efficiency 22.5%'],
        specs: { "Cell Type": "N-Type Monocrystalline", "Weight": "22kg", "Dimensions": "1903x1134x30mm", "Max Power": "450W", "Efficiency": "22.5%", "Junction Box": "IP68" },
        warranty: '25 Years Product, 30 Years Power',
        included: ['1x Solar Panel', '1x User Manual', '1x Warranty Card']
    },
    {
        sku: 'SOL-PNL-550W',
        long_desc: 'Jinko Solar Tiger Pro 550W is a high-power module designed for utility-scale and commercial projects. Featuring Multi-Busbar technology, it ensures better light trapping and current collection to improve module power output and reliability.',
        features: ['Multi Busbar Technology', 'Reduced Hot Spot Loss', 'Longer Lifetime Power Yield', 'Enhanced Mechanical Load'],
        specs: { "Cell Type": "P-Type Monocrystalline", "Weight": "28kg", "Dimensions": "2278x1134x35mm", "Max Power": "550W", "Efficiency": "21.5%" },
        warranty: '12 Years Product, 25 Years Power',
        included: ['1x Solar Panel', '1x Manual']
    },
    // Inverters
    {
        sku: 'INV-HUA-5K',
        long_desc: 'The Huawei SUN2000-5KTL-L1 is a smart hybrid inverter that supports both grid-tied and off-grid operations with battery backup. It offers AI-powered arcing protection (AFCI) and is compatible with Huawei LUNA2000 batteries for a complete energy storage solution.',
        features: ['AI Powered Arcing Protection', 'Battery Ready', 'Higher Efficiency', 'Quiet Operation (Fanless)', 'WLAN Included'],
        specs: { "Power": "5kW", "Phase": "Single", "Max Input Voltage": "600V", "IP Rating": "IP65", "Weight": "12kg", "Comm": "RS485, WLAN" },
        warranty: '10 Years Manufacturer Warranty',
        included: ['1x Inverter', '1x Wall Mount Bracket', '1x WiFi Dongle', '1x AC Connector', '1x DC Connector Set']
    },
    {
        sku: 'INV-HUA-10K',
        long_desc: 'Huawei SUN2000-10KTL-M1 is a three-phase smart inverter ideal for residential and small commercial systems. It features high efficiency up to 98.6% and compact design.',
        features: ['Three Phase', 'High Efficiency 98.6%', 'Integrated PID Recovery', 'Battery Interface'],
        specs: { "Power": "10kW", "Phase": "Three", "Max Efficiency": "98.6%", "Weight": "17kg" },
        warranty: '10 Years Manufacturer Warranty',
        included: ['1x Inverter', '1x Wall Mount', 'Connectors']
    },
    // Batteries
    {
        sku: 'BAT-LFP-5K',
        long_desc: 'Huawei LUNA2000-5-E0 is a modular 5kWh lithium battery module that can be stacked up to 15kWh. It features 100% depth of discharge and optimization at the module level, ensuring safety and longevity.',
        features: ['Modular Design (5kWh-30kWh)', '100% Depth of Discharge', 'Lithium Iron Phosphate (LFP)', 'Easy Installation', 'Auto-App Discovery'],
        specs: { "Capacity": "5kWh", "Technology": "LiFePO4", "Weight": "50kg", "Cycle Life": "6000+", "Voltage": "350-560V" },
        warranty: '10 Years Performance Warranty',
        included: ['1x Battery Module', '1x Power Module', 'Cables', 'Base']
    },
    // Electrical with Variations
    {
        sku: 'SMART-SW-1G',
        long_desc: 'Control your lights from anywhere with the Tuya Smart Switch. Compatible with Alexa and Google Home, this switch requires no neutral wire, making it perfect for older homes with traditional wiring.',
        features: ['Voice Control', 'App Control (Tuya/Smart Life)', 'Timer/Schedule', 'Share Control', 'No Neutral Required'],
        specs: { "Gang": "1", "Wireless": "WiFi 2.4GHz", "Max Load": "800W", "Material": "Tempered Glass Panel", "Voltage": "110-240V" },
        warranty: '1 Year Warranty',
        included: ['1x Switch', '1x Capacitor', '2x Screws', '1x Manual'],
        variations: { "Color": ["White", "Black", "Gold"] }
    },
    {
        sku: 'CABLE-PV-4MM',
        long_desc: 'High-quality 4mm PV Solar Cable designed for connecting photovoltaic power supply systems. UV resistant, robust, and durable for outdoor use.',
        features: ['TUV Certified', 'UV Resistant', 'Double Insulated', 'Halogen Free'],
        specs: { "Cross Section": "4mm²", "Conductor": "Tinned Copper", "Voltage": "1500V DC", "Temp Range": "-40°C to +90°C" },
        warranty: '25 Years Service Life',
        included: ['Cable Reel'],
        variations: { "Color": ["Red", "Black"], "Length": ["100m Roll", "500m Roll"] }
    },
    {
        sku: 'SVC-INSTALL-5KW',
        long_desc: 'Complete turnkey installation service for a 5kW Solar System. Includes site inspection, engineering design, installation by SLSEA certified technicians, and CEB/LECO grid connection coordination.',
        features: ['SLSEA Certified Engineering', 'Premium Installation Materials', 'Grid Connection Handling', 'Commissioning & Training'],
        specs: { "Capacity": "Up to 5kW", "Duration": "2-3 Days", "Team Size": "3 Technicians" },
        warranty: '2 Years Workmanship Warranty',
        included: ['Labor', 'Transport', 'Mounting Accessories', 'Conduit/Casing']
    }
];

async function seed() {
    console.log('Enriching Product Details with Variations (JS)...');

    if (!process.env.DATABASE_URL) process.exit(1);

    const pool = mysql.createPool(process.env.DATABASE_URL);

    try {
        for (const p of PRODUCTS) {
            console.log(`Updating ${p.sku}...`);
            await pool.query(`
                UPDATE products 
                SET 
                    long_description = ?,
                    specifications = ?,
                    features = ?,
                    warranty_period = ?,
                    whats_included = ?,
                    variations = ?
                WHERE sku = ?
            `, [
                p.long_desc,
                JSON.stringify(p.specs || {}),
                JSON.stringify(p.features || []),
                p.warranty,
                JSON.stringify(p.included || []),
                JSON.stringify(p.variations || {}),
                p.sku
            ]);
        }
        console.log('Enrichment Done.');
    } catch (e) {
        console.error(e);
    }
    await pool.end();
}

seed();
