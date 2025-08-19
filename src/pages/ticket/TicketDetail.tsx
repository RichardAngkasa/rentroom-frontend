import { Chip, Group } from "@mantine/core";
import { useParams } from "@tanstack/react-router";
import {
	FaTelegramPlane,
	FaClock,
	FaCalendarAlt,
	FaBriefcase,
	FaTicketAlt,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { TbMessageReportFilled } from "react-icons/tb";
import { CardItem } from "./components/CardItem";
import { ticketPriorityPill, ticketStatusPill } from "../../constants";

export const TicketDetail: React.FC = () => {
	const { ticketId } = useParams({ from: "/ticket/$ticketId" });

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between items-center border-b border-gray-300 p-6">
				<div>
					<h1 className="text-3xl font-bold">Ticket #{ticketId}</h1>
					<div className="mt-2 flex gap-2">
						<span className="text-xs font-semibold rounded-full border px-3 py-1">
							3 days
						</span>
						{ticketStatusPill(4)}
						{ticketPriorityPill(1)}
					</div>
				</div>
				<div>
					<MdClose className="cursor-pointer" size={24} />
				</div>
			</div>
			<div className="bg-gray-50 px-6 pt-6" style={{ flex: 1 }}>
				<div className="grid grid-cols-6 gap-6">
					<div className="col-span-6 bg-white border rounded-lg border-gray-200 shadow p-6">
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Quick Actions
						</label>
						<Chip.Group value="1">
							<Group gap="xs" justify="start">
								<Chip color="grey" value="1">
									Open
								</Chip>
								<Chip color="yellow" value="2">
									In Progress
								</Chip>
								<Chip color="green" value="3">
									Done
								</Chip>
								<Chip color="red" value="4">
									Skipped
								</Chip>
							</Group>
						</Chip.Group>
					</div>

					<div className="col-span-3 bg-white border rounded-lg border-gray-200 shadow p-6">
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Contact & Assignments
						</label>
						<div className="flex flex-col gap-4">
							<CardItem
								title="Message"
								desc={
									<span className="underline cursor-pointer text-blue-500 text-sm">
										https://t.me/blablabla
									</span>
								}
								icon={
									<div className="bg-[#2CA4E1] p-2 rounded inline-block">
										<FaTelegramPlane className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								desc={<span className="text-sm">Mulyono</span>}
								title="Assigned to"
								icon={
									<div className="bg-gray-500 p-2 rounded inline-block">
										<FaClock className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								desc={<span className="text-sm">https://t.me/blablabla</span>}
								title="Reporter"
								icon={
									<div className="bg-amber-500 p-2 rounded inline-block">
										<TbMessageReportFilled className="text-white" size={18} />
									</div>
								}
							/>
						</div>
					</div>

					{/* <label className="block text-sm font-medium text-gray-700 mb-2">
						Priority
					</label>
					<span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
						High
					</span>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Status
					</label>
					<span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
						In Progress
					</span> */}

					<div className="col-span-3 bg-white border rounded-lg border-gray-200 shadow p-6">
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Timeline & Details
						</label>
						<div className="flex flex-col gap-4">
							<CardItem
								desc={<span className="text-sm">27 Jun 2023</span>}
								title="Created"
								icon={
									<div className="bg-green-700 p-2 rounded inline-block">
										<TbMessageReportFilled className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								desc={<span className="text-sm">29 Jun 2023</span>}
								title="Last Update"
								icon={
									<div className="bg-lime-700 p-2 rounded inline-block">
										<FaCalendarAlt className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								desc={<span className="text-sm">speed-merchant-3 / asu69</span>}
								title="Merchant"
								icon={
									<div className="bg-red-700 p-2 rounded inline-block">
										<FaBriefcase className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								title="Ticket #"
								desc={
									<div className="relative">
										<span className="text-sm px-2 block py-1 border border-gray-400 rounded font-semibold">
											#2387128312831238761237
										</span>
										{/* <div className="absolute w-full h-full top-0 left-0 bg-green-400 border border-green-600 text-green-800 px-2 py-1 font-semibold text-sm rounded">
											Copied!
										</div> */}
									</div>
								}
								icon={
									<div className="bg-yellow-700 p-2 rounded inline-block">
										<FaTicketAlt className="text-white" size={18} />
									</div>
								}
							/>
						</div>
					</div>

					<div className="col-span-6 bg-white border rounded-lg border-gray-200 shadow p-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Description
							</label>
							<p className="text-gray-600">
								This is the description for ticket #{ticketId}. Lorem ipsum
								dolor sit amet, consectetur adipiscing elit, sed do eiusmod
								tempor incididunt ut labore et dolore magna aliqua.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
