import { createFileRoute } from "@tanstack/react-router";

const RouteComponent: React.FC = () => {
	return <div>Hello "/ticket/"!</div>;
};

export const Route = createFileRoute("/ticket/")({
	component: RouteComponent,
});
