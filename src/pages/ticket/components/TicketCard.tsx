import { Link } from "@tanstack/react-router";
import { ticketPriorityPill, ticketStatusPill } from "../../../constants";
import { twMerge } from "tailwind-merge";

interface Props {
	isSelected?: boolean;
	ticketId: number;
}

export const TicketCard: React.FC<Props> = ({ isSelected, ticketId }) => {
	return (
		<Link
			className="block"
			params={{ ticketId: ticketId.toString() }}
			to="/ticket/$ticketId"
		>
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
							ticket name #{ticketId} {ticketStatusPill(1, true)}
						</p>
						<span className="text-sm muted">speed-merchant-6</span>
					</div>
					<span className="border rounded-full border-gray-400 px-2 py-1 text-sm">
						6d
					</span>
				</div>
				<div className="px-4 flex gap-2 mt-1">
					<div>{ticketPriorityPill(2)}</div>
					<div>
						<span className="text-xs border border-gray-400 rounded-full px-2 py-1">
							Improvement
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
};
