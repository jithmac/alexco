import { getTicketDetails } from "@/server-actions/admin/tickets";
import TicketPrintout from "@/components/admin/tickets/TicketPrintout";

export default async function TicketPrintPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { type?: string }
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams; // Next 15 might treat this as promise too in some configs, safe to await

    const ticketId = resolvedParams.id;
    const type = (resolvedSearchParams?.type as any) || 'job-card';

    const ticket = await getTicketDetails(ticketId);

    if (!ticket) {
        return <div>Ticket not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center print:bg-white print:block p-4">
            <TicketPrintout ticket={ticket} type={type} />
        </div>
    );
}
