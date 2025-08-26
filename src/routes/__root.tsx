import type * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TicketDataProvider } from "../hooks/useTickets";

function RootComponent(): React.FC {
	return (
		<TicketDataProvider>
			<Outlet />
		</TicketDataProvider>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
});
