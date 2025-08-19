import { createFileRoute, useParams } from "@tanstack/react-router";
import { TicketLayout } from "../../components/layout/Layout/TicketLayout";
import { TicketDetail } from "../../pages/ticket/TicketDetail";

const RouteComponent: React.FC = () => {
	const { ticketId } = useParams({ from: "/ticket/$ticketId" });

	return (
		<TicketLayout selectedTicketId={ticketId}>
			<TicketDetail />
		</TicketLayout>
	);
};

export const Route = createFileRoute("/ticket/$ticketId")({
	component: RouteComponent,
});
