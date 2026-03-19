import { query } from "../lib/db";

async function checkLocations() {
    try {
        const locations = await query("SELECT * FROM locations") as any[];
        console.log("Locations found:", locations.length);
        if (locations.length > 0) {
            console.log(locations);
        } else {
            console.log("⚠️ No locations found in local database.");
        }
    } catch (error) {
        console.error("Query failed:", error);
    }
}

checkLocations();
