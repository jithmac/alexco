export default function ReturnsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Returns & Refunds Policy</h1>
            <div className="prose prose-slate max-w-none text-slate-700">
                <h3>1. Return Eligibility</h3>
                <p>We accept returns/exchanges of products within 7 days of purchase if:</p>
                <ul>
                    <li>The item is defective or damaged upon receipt.</li>
                    <li>The incorrect item was shipped.</li>
                    <li>The item is unopened, unused, and in its original packaging (for change of mind).</li>
                </ul>

                <h3>2. Non-Returnable Items</h3>
                <p>Certain items cannot be returned, including:</p>
                <ul>
                    <li>Customized or special-order items.</li>
                    <li>Items marked as "Final Sale" or "Clearance".</li>
                    <li>Software or digital downloads.</li>
                </ul>

                <h3>3. Refund Process</h3>
                <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original method of payment within 5-7 business days.</p>

                <h3>4. Shipping Returns</h3>
                <p>You will be responsible for paying for your own shipping costs for returning your item, unless the return is due to our error (defective or wrong item).</p>
            </div>
        </div>
    );
}
