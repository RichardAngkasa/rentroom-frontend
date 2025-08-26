/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, {
	type PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { type Ticket, fetchTicketsApi } from "../api/ticket";
import { type Whitelabel, getWhitelabels } from "../api/whitelabel";

interface SSEMessage {
	type: "connected" | "heartbeat" | "issue_update";
	timestamp: string;
	message?: string;
	action?: "created" | "updated" | "deleted";
	data?: Ticket | { id: string };
}

interface TicketDataContextType {
	// SSE related
	sseUpdates: Array<Ticket>;
	isConnected: boolean;

	// Query related
	data: any;
	whitelabels?: {
		data: Array<Whitelabel>;
	};
	fetchNextPage: () => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;

	// Combined data
	allTickets: Array<Ticket>;
}

const TicketDataContext = createContext<TicketDataContextType | null>(null);

export const useTicketData = (): TicketDataContextType => {
	const context = useContext(TicketDataContext);
	if (!context) {
		throw new Error("useTicketData must be used within a TicketDataProvider");
	}
	return context;
};

export const TicketDataProvider: React.FC<PropsWithChildren> = ({
	children,
}) => {
	const [sseUpdates, setSseUpdates] = useState<Array<Ticket>>([]);
	const [isConnected, setIsConnected] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	// HTTP Query for initial data
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
		queryFn: async ({ pageParam: page = 1 }) => {
			console.log("Fetching tickets for page:", page);
			return fetchTicketsApi(page);
		},
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.meta.nextPage ? allPages.length + 1 : undefined;
		},
		initialPageParam: 1,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const { data: whitelabels } = useQuery({
		queryKey: ["whitelabels"],
		queryFn: () => getWhitelabels(),
	});

	// SSE Connection
	useEffect(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		const connectToSSE = async (): Promise<void> => {
			try {
				await fetchEventSource("http://localhost:3000/stream/issues", {
					signal: abortController.signal,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					onopen(response) {
						console.log("SSE connection opened, status:", response.status);
						console.log(
							"Response headers:",
							Object.fromEntries(response.headers.entries())
						);

						const contentType = response.headers.get("content-type");
						console.log("Content-Type:", contentType);

						if (response.ok) {
							if (
								contentType &&
								(contentType.includes("text/event-stream") ||
									contentType.includes("text/plain") ||
									contentType.includes("application/octet-stream"))
							) {
								console.log("Successfully connected to SSE stream");
								setIsConnected(true);
								return;
							} else {
								console.warn(
									`Unexpected content-type: ${contentType}, but proceeding anyway`
								);
								setIsConnected(true);
								return;
							}
						} else if (response.status >= 400 && response.status < 500) {
							setIsConnected(false);
							throw new Error(
								`Client error: ${response.status} ${response.statusText}`
							);
						} else {
							setIsConnected(false);
							throw new Error(
								`Server error: ${response.status} ${response.statusText}`
							);
						}
					},
					onmessage(event) {
						console.log("Raw SSE:", event.data);
						try {
							const message = JSON.parse(event.data) as SSEMessage;

							switch (message.type) {
								case "connected":
									console.log("Connected to issue stream");
									setIsConnected(true);
									break;

								case "heartbeat":
									console.log("Still Alive!", message.timestamp);
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
						} catch (error) {
							console.error("Error parsing SSE data:", error);
						}
					},
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					onerror(error) {
						console.error("SSE connection error:", error);
						setIsConnected(false);

						if (error instanceof Error) {
							if (
								error.message.includes("Failed to fetch") ||
								error.message.includes("NetworkError") ||
								error.message.includes("Server error: 5")
							) {
								console.log("Network or server error, will retry...");
								return 1000;
							} else if (error.message.includes("Client error: 4")) {
								console.log("Client error, not retrying");
								return false;
							}
						}

						return 2000;
					},
					onclose() {
						console.warn("SSE connection closed");
						setIsConnected(false);
					},
					headers: {
						Accept: "text/event-stream",
						"Cache-Control": "no-cache",
					},
					openWhenHidden: false,
				});
			} catch (error) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				if (error.name !== "AbortError") {
					console.error("Failed to establish SSE connection:", error);
					setIsConnected(false);
				}
			}
		};

		void connectToSSE();

		return (): void => {
			abortController.abort();
			setIsConnected(false);
		};
	}, []);

	// Combine SSE updates with fetched data
	const allTickets = React.useMemo(() => {
		const fetchedTickets = data?.pages.flatMap((page) => page.data) ?? [];

		const sseTicketIds = new Set(sseUpdates.map((ticket) => ticket.id));
		const uniqueFetchedTickets = fetchedTickets.filter(
			(ticket) => !sseTicketIds.has(ticket.id)
		);

		return [...sseUpdates, ...uniqueFetchedTickets];
	}, [data, sseUpdates]);

	const contextValue: TicketDataContextType = {
		// SSE
		sseUpdates,
		isConnected,

		// Query
		data,
		fetchNextPage: () => void fetchNextPage(),
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		whitelabels,

		// Combined
		allTickets,
	};

	return (
		<TicketDataContext.Provider value={contextValue}>
			{children}
		</TicketDataContext.Provider>
	);
};
