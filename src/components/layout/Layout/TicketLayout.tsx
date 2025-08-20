import { Input, MultiSelect, Pill, Select } from "@mantine/core";
import { useParams } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, {
	type PropsWithChildren,
	useEffect,
	useRef,
	useState,
} from "react";
import { TicketCard } from "../../../pages/ticket/components/TicketCard";
import { fetchTicketsApi, type Ticket } from "../../../api/ticket";

interface TicketLayoutProps extends PropsWithChildren {
	selectedTicketId?: string;
	onTicketSelect?: (ticket: Ticket | null) => void;
}

interface SSEMessage {
	type: "connected" | "heartbeat" | "issue_update";
	timestamp: string;
	message?: string;
	action?: "created" | "updated" | "deleted";
	data?: Ticket | { id: string };
}

export const TicketLayout: React.FC<TicketLayoutProps> = ({
	children,
	selectedTicketId,
	onTicketSelect,
}) => {
	const parameters = useParams({ strict: false });
	const currentTicketId = parameters?.ticketId || selectedTicketId;

	const [sseUpdates, setSseUpdates] = useState<Array<Ticket>>([]);
	const eventSourceRef = useRef<EventSource | null>(null);

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
		queryFn: async ({ pageParam: page = 1 }) => fetchTicketsApi(page),
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.meta.nextPage ? allPages.length + 1 : undefined;
		},
		initialPageParam: 1,
	});

	useEffect(() => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		const eventSource = new EventSource("http://localhost:3000/stream/issues");
		eventSourceRef.current = eventSource;

		eventSource.onmessage = (event): void => {
			try {
				const message = JSON.parse(event.data as string) as SSEMessage;

				switch (message.type) {
					case "connected":
						console.log("Connected to issue stream");
						break;

					case "heartbeat":
						// Handle heartbeat if needed
						break;

					case "issue_update": {
						if (!message.action || !message.data) {
							console.warn("Invalid issue_update message:", message);
							break;
						}

						const { action, data } = message;

						if (action === "deleted") {
							const deletionData = data as { id: string };
							setSseUpdates((previous) =>
								previous.filter((ticket) => ticket.id !== deletionData.id)
							);
						} else {
							const ticketUpdate = data as Ticket;
							setSseUpdates((previous) => {
								const filtered = previous.filter(
									(ticket) => ticket.id !== ticketUpdate.id
								);
								return [ticketUpdate, ...filtered];
							});
						}

						break;
					}

					default:
						console.log("Unknown SSE message type:", message.type);
				}
			} catch (error_) {
				console.error("Error parsing SSE data:", error_);
			}
		};

		eventSource.onerror = (error): void => {
			console.error("SSE connection error:", error);
		};

		return (): void => {
			eventSource.close();
		};
	}, []);

	const loadMoreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					void fetchNextPage();
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

	const allTickets = React.useMemo(() => {
		const fetchedTickets = data?.pages.flatMap((page) => page.data) ?? [];

		const ticketMap = new Map<string, Ticket>();

		fetchedTickets.forEach((ticket) => {
			ticketMap.set(ticket.id, ticket);
		});

		sseUpdates.forEach((ticket) => {
			ticketMap.set(ticket.id, ticket);
		});

		return Array.from(ticketMap.values());
	}, [data, sseUpdates]);

	const selectedTicket = React.useMemo(() => {
		return allTickets.find((ticket) => ticket.id === currentTicketId) || null;
	}, [allTickets, currentTicketId]);

	useEffect(() => {
		onTicketSelect?.(selectedTicket);
	}, [selectedTicket, onTicketSelect]);

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
