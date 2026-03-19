export default function WarrantyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Warranty Policy</h1>
            <div className="prose prose-slate max-w-none text-slate-700">
                <h3>1. General Warranty Terms</h3>
                <p>Alexco Electronics warrants that the products sold are free from defects in material and workmanship under normal use and service for the warranty period designated on the product page or invoice.</p>

                <h3>2. Warranty Period</h3>
                <p>The warranty period generally varies by product category:</p>
                <ul>
                    <li><strong>Solar Panels:</strong> 25 Years Performance Warranty</li>
                    <li><strong>Inverters:</strong> 5-10 Years Manufacturer Warranty</li>
                    <li><strong>Electronics:</strong> 1 Year Standard Warranty</li>
                </ul>
                <p>Please refer to your specific invoice for the exact warranty period applicable to your purchase.</p>

                <h3>3. Exclusions</h3>
                <p>This warranty does not cover:</p>
                <ul>
                    <li>Damage resulting from misuse, abuse, accident, modification, or improper installation.</li>
                    <li>Physical damage, water damage, or electrical surges (unless specifically covered).</li>
                    <li>Consumable parts such as batteries (unless manufacturing defect).</li>
                </ul>

                <h3>4. Claim Process</h3>
                <p>To make a warranty claim, please contact our support team with your proof of purchase and a description of the issue. Use our Contact Us page or email support@alexco.lk.</p>
            </div>
        </div>
    );
}
