export function Field({ label, field, value, onChange, editing, type = 'text', options = [] }: any) {
    if (!editing) {
        return (
            <div>
                <label className="text-xs text-slate-400">{label}</label>
                <p className="text-slate-900">{value || '-'}</p>
            </div>
        );
    }

    if (type === 'select') {
        return (
            <div>
                <label className="text-xs text-slate-500">{label}</label>
                <select
                    value={value || ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                    <option value="">Select</option>
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        );
    }

    return (
        <div>
            <label className="text-xs text-slate-500">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(field, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
            />
        </div>
    );
}
