import xior from "xior";

export interface Ticket {
	id: string;
	title: string;
	description: string;
	link: string;
	status: 1 | 2 | 3 | 4;
	whitelabelId: string;
	priority: 1 | 2 | 3;
	createdAt: Date;
	updatedAt: Date;
	finishedAt: null;
	categoryId: string;
	category: Category;
	whitelabel: Category;
	assignee: Assignee | null;
	reporter: Assignee;
}

export interface Assignee {
	id: string;
	name: string;
}

export interface Category {
	id: string;
	name: string;
}

export interface Meta {
	isFirstPage: boolean;
	isLastPage: boolean;
	currentPage: number;
	previousPage: null;
	nextPage: number;
}

export interface TicketsResponse {
	data: Array<Ticket>;
	meta: Meta;
}

export const fetchTicketsApi = async (
	page: number
): Promise<TicketsResponse> => {
	try {
		const response = await xior.get<TicketsResponse>(
			`${import.meta.env["VITE_APP_BASEURL"]}/issues?limit=10&page=${page}`
		);

		if (!response?.data) {
			throw new Error("No data received from server");
		}

		return response.data;
	} catch (error: unknown) {
		// Narrow the error
		if (error instanceof Error) {
			console.error("API Error:", error.message);
			throw new Error(`Failed to fetch tickets: ${error.message}`);
		}

		// Fallback for unexpected error shapes
		console.error("API Error:", error);
		throw new Error("Failed to fetch tickets: Unknown error");
	}
};

interface TicketStatusUpdatePayload {
	ticketId: string;
	status: number;
}

export const updateTicketStatusApi = async (
	payload: TicketStatusUpdatePayload
): Promise<{ success: boolean }> => {
	try {
		const response = await xior.post<{ success: boolean }>(
			`${import.meta.env["VITE_APP_BASEURL"]}/status`,
			payload
		);

		if (!response?.data) {
			throw new Error("No data received from server");
		}

		return response.data;
	} catch (error: unknown) {
		// Narrow the error
		if (error instanceof Error) {
			console.error("API Error:", error.message);
			throw new Error(`Failed to fetch tickets: ${error.message}`);
		}

		// Fallback for unexpected error shapes
		console.error("API Error:", error);
		throw new Error("Failed to fetch tickets: Unknown error");
	}
};
