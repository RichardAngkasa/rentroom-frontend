import { createFileRoute } from "@tanstack/react-router";
import { TicketLayout } from "../components/layout/Layout/TicketLayout";
import { TbTicketOff } from "react-icons/tb";

const RouteComponent: React.FC = () => {
	return (
		<TicketLayout>
			<div className="h-full flex justify-center items-center flex-col">
				<TbTicketOff className="text-gray-600" size={72} />
				<h1 className="text-4xl font-semibold text-gray-600">
					Select a ticket
				</h1>
				<p className="muted font-semibold">You haven't selected any ticket.</p>
			</div>
		</TicketLayout>
	);
};

export const Route = createFileRoute("/")({
	component: RouteComponent,
});
