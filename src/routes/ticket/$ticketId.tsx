import { createFileRoute, useParams } from "@tanstack/react-router";
import { TicketLayout } from "../../components/layout/Layout/TicketLayout";
import { TicketDetail } from "../../pages/ticket/TicketDetail";
import { useState } from "react";
import type { Ticket } from "../../api/ticket";

const RouteComponent: React.FC = () => {
	const { ticketId } = useParams({ from: "/ticket/$ticketId" });
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

	const handleStatusUpdate = (newStatus: number): void => {
		if (selectedTicket) {
			setSelectedTicket({
				...selectedTicket,
				status: newStatus as 1 | 2 | 3 | 4,
				updatedAt: new Date(),
			});
		}
	};

	return (
		<TicketLayout
			selectedTicketId={ticketId}
			onTicketSelect={setSelectedTicket}
		>
			<TicketDetail
				ticket={selectedTicket}
				onStatusUpdate={handleStatusUpdate}
			/>
		</TicketLayout>
	);
};

export const Route = createFileRoute("/ticket/$ticketId")({
	component: RouteComponent,
});
