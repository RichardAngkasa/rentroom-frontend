import { Input, MultiSelect, Pill, Select } from "@mantine/core";
import { useParams } from "@tanstack/react-router";
import React, { type PropsWithChildren, useEffect, useRef } from "react";
import { TicketCard } from "../../../pages/ticket/components/TicketCard";
import type { Ticket } from "../../../api/ticket";
import { useTicketData } from "../../../hooks/useTickets";
import { twMerge } from "tailwind-merge";

interface TicketLayoutProps extends PropsWithChildren {
	selectedTicketId?: string;
	onTicketSelect?: (ticket: Ticket | null) => void;
}

export const TicketLayout: React.FC<TicketLayoutProps> = ({
	children,
	selectedTicketId,
	onTicketSelect,
}) => {
	const parameters = useParams({ strict: false });
	const currentTicketId = parameters?.ticketId || selectedTicketId;

	const {
		allTickets,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		isConnected,
		whitelabels,
	} = useTicketData();

	const loadMoreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.5 }
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return (): void => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const selectedTicket = React.useMemo(() => {
		return allTickets.find((ticket) => ticket.id === currentTicketId) || null;
	}, [allTickets, currentTicketId]);

	useEffect(() => {
		onTicketSelect?.(selectedTicket);
	}, [selectedTicket, onTicketSelect]);

	console.log("TicketLayout rendered with tickets:", allTickets.length);

	return (
		<div className="h-screen">
			<nav className="absolute w-screen">
				<div className="text-right text-xs p-2">
					SSE Status:{" "}
					<span
						className={twMerge(isConnected ? "text-green-600" : "text-red-600")}
					>
						{isConnected ? "Connected" : "Disconnected"}
					</span>{" "}
					| Fetched Tickets: {allTickets.length}
				</div>
			</nav>
			<div className="flex h-full">
				<div className="w-1/3 flex flex-col border-r border-gray-300">
					<div className="p-4 border-b border-gray-300 overflow-x-hidden">
						<Input placeholder="Search Ticket..." />
						<div className="flex gap-x-4 mb-4">
							<div className="w-2/3">
								<MultiSelect
									searchable
									data={whitelabels?.data.map((wl) => `${wl.id} - ${wl.name}`)}
									label="Filter Whitelabel"
									placeholder="Pick value"
								/>
							</div>
							<div className="w-1/3">
								<Select
									clearable
									data={["On Progress", "Done", "Skipped", "Open"]}
									label="Status"
									placeholder="All"
								/>
							</div>
						</div>
						<div className="flex gap-2 overflow-x-scroll">
							<Pill>Issue</Pill>
							<Pill>Improvement</Pill>
							<Pill>Other</Pill>
						</div>
					</div>
					<div className="overflow-y-scroll" style={{ flex: 1 }}>
						{isLoading && (
							<div className="p-4 text-center">Loading tickets...</div>
						)}

						{isError && (
							<div className="p-4 text-center text-red-500">
								Error loading tickets: {error?.message}
							</div>
						)}

						{allTickets.map((ticket) => {
							const isSelected = currentTicketId === ticket.id;
							return (
								<TicketCard
									key={ticket.id}
									isSelected={isSelected}
									ticket={ticket}
								/>
							);
						})}

						{isFetchingNextPage && (
							<div className="p-4 text-center">Loading more tickets...</div>
						)}

						<div ref={loadMoreRef} className="h-4" />

						{!hasNextPage && allTickets.length > 0 && (
							<div className="p-4 text-center text-gray-500">
								No more tickets to load
							</div>
						)}
					</div>
				</div>
				<div className="w-2/3 h-screen flex justify-center items-center">
					<main className="w-full h-full overflow-y-scroll">{children}</main>
				</div>
			</div>
			<footer></footer>
		</div>
	);
};
