import xior from "xior";

export interface Whitelabel {
	id: string;
	name: string;
}

export interface WhitelabelResponse {
	data: Array<Whitelabel>;
}

export const getWhitelabels = async (): Promise<WhitelabelResponse> => {
	try {
		const response = await xior.get<WhitelabelResponse>(
			`http://localhost:3000/whitelabels`
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
