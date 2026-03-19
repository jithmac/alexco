import { createRxDatabase, RxDatabase, RxCollection, RxJsonSchema, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { v4 as uuidv4 } from 'uuid';
import { getPosProducts } from '@/server-actions/pos/products';
import { syncPosOrder } from '@/server-actions/pos/orders';

// Add the migration plugin
addRxPlugin(RxDBMigrationSchemaPlugin);

// --- Types ---
export type ProductDoc = {
    id: string;
    name: string;
    price: number;
    category: string;
    sku: string;
    stock: number;
    variations?: Record<string, string[]>;
    variation_prices?: Record<string, number>;
    variation_sale_prices?: Record<string, number>;
};

export type OrderDoc = {
    id: string;
    items: { productId: string; quantity: number; price: number; variations?: Record<string, string> }[];
    total: number;
    timestamp: number;
    synced: boolean;
};

// --- Schemas ---
const productSchema: RxJsonSchema<ProductDoc> = {
    version: 3,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        sku: { type: 'string' },
        stock: { type: 'number' },
        variations: { type: 'object', additionalProperties: true },
        variation_prices: { type: 'object', additionalProperties: true },
        variation_sale_prices: { type: 'object', additionalProperties: true }
    },
    required: ['id', 'name', 'price']
};

const orderSchema: RxJsonSchema<OrderDoc> = {
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'number' },
                    price: { type: 'number' },
                    variations: { type: 'object', additionalProperties: true }
                }
            }
        },
        total: { type: 'number' },
        timestamp: { type: 'number' },
        synced: { type: 'boolean' }
    },
    required: ['id', 'items', 'total']
};

// --- Database ---
type MyDatabaseCollections = {
    products: RxCollection<ProductDoc>;
    orders: RxCollection<OrderDoc>;
};

export type MyDatabase = RxDatabase<MyDatabaseCollections>;

let dbPromise: Promise<MyDatabase> | null = null;

/**
 * Fallback hash function for non-secure contexts (HTTP)
 * where crypto.subtle is unavailable.
 */
async function fallbackHashFunction(input: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const data = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Simple DJB2-based hash as fallback
    let hash1 = 5381;
    let hash2 = 52711;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash1 = (hash1 * 33) ^ char;
        hash2 = (hash2 * 33) ^ char;
    }
    return (hash1 >>> 0).toString(16).padStart(8, '0') + (hash2 >>> 0).toString(16).padStart(8, '0');
}

const _createDatabase = async (): Promise<MyDatabase> => {
    console.log("Database creating...");
    const db = await createRxDatabase<MyDatabaseCollections>({
        name: 'alexcoposdb',
        storage: getRxStorageDexie(),
        hashFunction: fallbackHashFunction
    });

    await db.addCollections({
        products: {
            schema: productSchema,
            migrationStrategies: {
                1: function (oldDoc: any) {
                    return oldDoc;
                },
                2: function (oldDoc: any) {
                    // Add variation_prices field if missing
                    oldDoc.variation_prices = oldDoc.variation_prices || {};
                    return oldDoc;
                },
                3: function (oldDoc: any) {
                    oldDoc.variation_sale_prices = oldDoc.variation_sale_prices || {};
                    return oldDoc;
                }
            }
        },
        orders: {
            schema: orderSchema,
            migrationStrategies: {
                1: function (oldDoc: any) {
                    return oldDoc;
                }
            }
        }
    });

    console.log("Database created");
    return db;
};

export const getDatabase = (): Promise<MyDatabase> => {
    if (!dbPromise) dbPromise = _createDatabase();
    return dbPromise;
};

// --- Sync Logic ---
export const syncProducts = async () => {
    const db = await getDatabase();

    // FETCH FROM SERVER
    console.log("Syncing Products from Server...");
    try {
        const serverProducts = await getPosProducts();

        // Bulk Upsert
        if (serverProducts.length > 0) {
            // Ensure variation_prices and variation_sale_prices are always objects
            const safeProducts = serverProducts.map(p => ({
                ...p,
                variation_prices: p.variation_prices || {},
                variation_sale_prices: p.variation_sale_prices || {}
            }));
            await db.products.bulkUpsert(safeProducts);
            console.log(`Synced ${safeProducts.length} products`);
        }
    } catch (error) {
        console.error("Sync Failed (Optimistic Offline Mode)", error);
    }
};

export const syncOrdersOutbox = async () => {
    const db = await getDatabase();

    // Find unsynced orders
    const unsynced = await db.orders.find({
        selector: { synced: false }
    }).exec();

    console.log(`Found ${unsynced.length} unsynced orders`);

    for (const orderDoc of unsynced) {
        const orderData = orderDoc.toJSON();

        // PUSH TO SERVER
        const result = await syncPosOrder(orderData);

        if (result.success) {
            await orderDoc.patch({ synced: true });
            console.log(`Order ${orderData.id} synced successfully`);
        } else {
            console.error(`Order ${orderData.id} failed to sync`);
        }
    }
};
