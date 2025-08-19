import type React from "react";

interface Props {
	icon: React.ReactNode;
	title: string;
	desc?: React.ReactNode;
}

export const CardItem: React.FC<Props> = ({ icon, title, desc }) => {
	return (
		<div className="flex items-center gap-x-2">
			{icon}
			<div className="w-full">
				<h6 className="font-semibold text-sm text-gray-500">{title}</h6>
				{desc}
			</div>
		</div>
	);
};
