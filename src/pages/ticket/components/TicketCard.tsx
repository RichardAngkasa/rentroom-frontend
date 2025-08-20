import { Link } from "@tanstack/react-router";
import { ticketPriorityPill, ticketStatusPill } from "../../../constants";
import { twMerge } from "tailwind-merge";
import type { Ticket } from "../../../api/ticket";

interface Props {
	isSelected?: boolean;
	ticket: Ticket;
}

export const TicketCard: React.FC<Props> = ({ isSelected, ticket }) => {
	const { id, title, status, whitelabel, category, priority } = ticket;

	return (
		<Link className="block" params={{ ticketId: id }} to="/ticket/$ticketId">
			<div
				className={twMerge(
					"py-4 border-b border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer",
					isSelected && "bg-sky-50 border-l-4 border-l-sky-500"
				)}
			>
				<div className="px-4 flex justify-between items-center">
					<div>
						<p
							className={twMerge("font-semibold", isSelected && "text-sky-700")}
						>
							{title.slice(0, 30) + "..."} {ticketStatusPill(status, true)}
						</p>
						<span className="text-sm muted">{whitelabel.name}</span>
					</div>
					{/* <span className="border rounded-full border-gray-400 px-2 py-1 text-sm">
						3d
					</span> */}
				</div>
				<div className="px-4 flex gap-2 mt-1">
					<div>{ticketPriorityPill(priority)}</div>
					<div>
						<span className="text-xs border border-gray-400 rounded px-2">
							{category.name}
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
};
