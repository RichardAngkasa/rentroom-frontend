// components/layout/Layout/TicketLayout.tsx
import { Input, MultiSelect, Pill, Select } from "@mantine/core";
import { useParams } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, {
	useEffect,
	useRef,
	useState,
	type PropsWithChildren,
} from "react";
import xior from "xior"; // Adjust import based on your setup
import { TicketCard } from "../../../pages/ticket/components/TicketCard";

interface Ticket {
	id: string;
}

interface TicketsResponse {
	tickets: Array<Ticket>;
	hasMore: boolean;
}

interface TicketLayoutProps extends PropsWithChildren {
	selectedTicketId?: string;
}

export const TicketLayout: React.FC<TicketLayoutProps> = ({
	children,
	selectedTicketId,
}) => {
	const parameters = useParams({ strict: false });
	const currentTicketId = parameters?.ticketId || selectedTicketId;

	// SSE state
	const [sseUpdates, setSseUpdates] = useState<Array<Ticket>>([]);
	const eventSourceRef = useRef<EventSource | null>(null);

	// Infinite scroll setup
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
	} = useInfiniteQuery({
		queryKey: ["tickets"],
		queryFn: async ({ pageParam: pageParameter = 1 }) => {
			const response = await xior.get<TicketsResponse>(
				`/issues?limit=10&page=${pageParameter}`
			);
			return response.data;
		},
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.hasMore ? allPages.length + 1 : undefined;
		},
		initialPageParam: 1,
	});

	// SSE connection setup
	useEffect(() => {
		// Close existing connection
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		// Create new SSE connection
		const eventSource = new EventSource("/issues/stream");
		eventSourceRef.current = eventSource;

		eventSource.onmessage = (event) => {
			try {
				const update = JSON.parse(event.data) as Ticket;
				setSseUpdates((previous) => {
					// Remove duplicate if exists and add new update
					const filtered = previous.filter((ticket) => ticket.id !== update.id);
					return [update, ...filtered];
				});
			} catch (error_) {
				console.error("Error parsing SSE data:", error_);
			}
		};

		eventSource.onerror = (error) => {
			console.error("SSE connection error:", error);
		};

		// Cleanup on unmount
		return () => {
			eventSource.close();
		};
	}, []);

	// Infinite scroll observer
	const loadMoreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 1.0 }
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	// Merge SSE updates with fetched data
	const allTickets = React.useMemo(() => {
		const fetchedTickets = data?.pages.flatMap((page) => page.tickets) ?? [];

		// Merge SSE updates, avoiding duplicates
		const ticketMap = new Map<string, Ticket>();

		// Add fetched tickets first
		fetchedTickets.forEach((ticket) => {
			ticketMap.set(ticket.id, ticket);
		});

		// Override with SSE updates (more recent data)
		sseUpdates.forEach((ticket) => {
			ticketMap.set(ticket.id, ticket);
		});

		return Array.from(ticketMap.values());
	}, [data, sseUpdates]);

	return (
		<div className="h-screen">
			<nav></nav>
			<div className="flex h-full">
				<div className="w-1/3 flex flex-col border-r border-gray-300">
					<div className="p-4 border-b border-gray-300 overflow-x-hidden">
						<Input placeholder="Search Ticket..." />
						<div className="flex gap-x-4 mb-4">
							<div className="w-2/3">
								<MultiSelect
									searchable
									label="Filter WL"
									placeholder="Pick value"
									data={[
										"speed-merchant-1",
										"speed-merchant-2",
										"speed-merchant-3",
										"speed-merchant-4",
										"speed-merchant-5",
									]}
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
									ticketId={parseInt(ticket.id)}
								/>
							);
						})}

						{/* Loading indicator for infinite scroll */}
						{isFetchingNextPage && (
							<div className="p-4 text-center">Loading more tickets...</div>
						)}

						{/* Intersection observer trigger */}
						<div ref={loadMoreRef} className="h-4" />

						{/* No more data indicator */}
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
