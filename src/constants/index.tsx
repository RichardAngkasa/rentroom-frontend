import type { JSX } from "react";
import { twMerge } from "tailwind-merge";

export const ticketPriority = {
	3: "Low",
	2: "Normal",
	1: "High",
} as const;

export const ticketStatus = {
	1: "Open",
	2: "In Progress",
	3: "Done",
	4: "Skipped",
} as const;

export const ticketPriorityPill = (
	priority: keyof typeof ticketPriority
): JSX.Element => {
	return (
		<span
			className={twMerge(
				"text-xs font-semibold rounded-full border px-3 py-1",
				priority === 1 && "bg-red-200 text-red-800 border-red-300",
				priority === 2 && "bg-blue-200 text-blue-800 border-blue-300",
				priority === 3 && "bg-gray-200 text-gray-800 border-gray-300"
			)}
		>
			{ticketPriority[priority]}
		</span>
	);
};

export const ticketStatusPill = (
	status: keyof typeof ticketStatus,
	dense?: boolean
): JSX.Element => {
	return (
		<span
			className={twMerge(
				"text-xs border border-gay-400 font-semibold rounded-full px-2 py-1",
				dense && "py-0 rounded",
				status === 1 && "text-gray-500 border-gray-500",
				status === 2 && "text-blue-500 border-blue-500",
				status === 3 && "text-green-500 border-green-500",
				status === 4 && "text-red-500 border-red-500"
			)}
		>
			{ticketStatus[status]}
		</span>
	);
};
