import { Chip, Group } from "@mantine/core";
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
import { updateTicketStatusApi, type Ticket } from "../../api/ticket";
import moment from "moment";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface Props {
	ticket: Ticket | null;
	onStatusUpdate?: (newStatus: number) => void;
}

export const TicketDetail: React.FC<Props> = ({ ticket, onStatusUpdate }) => {
	const [isUpdating, setIsUpdating] = useState(false);
	if (!ticket) return null;

	const updateTicketStatus = async (newStatus: number): Promise<void> => {
		if (newStatus === ticket.status || isUpdating) return;

		setIsUpdating(true);
		try {
			const result = await updateTicketStatusApi({
				ticketId: ticket.id,
				status: newStatus,
			});

			if (result.success) {
				onStatusUpdate?.(newStatus);
			}
		} catch (error) {
			console.error("Error updating ticket status:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between items-center border-b border-gray-300 p-6">
				<div>
					<h1 className="text-3xl font-bold">{ticket.title}</h1>
					<div className="mt-2 flex gap-2">
						<span className="text-xs font-semibold rounded-full border px-3 py-1">
							{moment(ticket.createdAt).fromNow()}
						</span>
						{ticketStatusPill(ticket.status)}
						{ticketPriorityPill(ticket.priority)}
					</div>
				</div>
				<div>
					<Link to="/ticket">
						<MdClose className="cursor-pointer" size={24} />
					</Link>
				</div>
			</div>
			<div className="bg-gray-50 px-6 py-6" style={{ flex: 1 }}>
				<div className="grid grid-cols-6 gap-6">
					<div className="col-span-6 bg-white border rounded-lg border-gray-200 shadow p-6">
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Quick Actions
						</label>
						<Chip.Group
							value={ticket.status.toString()}
							onChange={(value) => {
								void updateTicketStatus(Number(value));
							}}
						>
							<Group gap="xs" justify="start">
								<Chip color="grey" value="1">
									Open
								</Chip>
								<Chip color="blue" value="2">
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
										{ticket.link}
									</span>
								}
								icon={
									<div className="bg-[#2CA4E1] p-2 rounded inline-block">
										<FaTelegramPlane className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								title="Assigned to"
								desc={
									<span className="text-sm">
										{ticket.assignee ? ticket.assignee.name : "-"}
									</span>
								}
								icon={
									<div className="bg-gray-500 p-2 rounded inline-block">
										<FaClock className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								desc={<span className="text-sm">{ticket.reporter.name}</span>}
								title="Reporter"
								icon={
									<div className="bg-amber-500 p-2 rounded inline-block">
										<TbMessageReportFilled className="text-white" size={18} />
									</div>
								}
							/>
						</div>
					</div>

					<div className="col-span-3 bg-white border rounded-lg border-gray-200 shadow p-6">
						<label className="block text-lg text-gray-700 mb-2 font-semibold">
							Timeline & Details
						</label>
						<div className="flex flex-col gap-4">
							<CardItem
								title="Created"
								desc={
									<span className="text-sm">
										{moment(ticket.createdAt).format("DD MMM YYYY, HH:mm")}
									</span>
								}
								icon={
									<div className="bg-green-700 p-2 rounded inline-block">
										<TbMessageReportFilled className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								title="Last Update"
								desc={
									<span className="text-sm">
										{moment(ticket.updatedAt).format("DD MMM YYYY, HH:mm")}
									</span>
								}
								icon={
									<div className="bg-lime-700 p-2 rounded inline-block">
										<FaCalendarAlt className="text-white" size={18} />
									</div>
								}
							/>
							<CardItem
								title="Merchant"
								desc={
									<span className="text-sm">
										{ticket.whitelabel.name} / {ticket.whitelabel.id}
									</span>
								}
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
											{ticket.id}
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
							<label className="block text-lg text-gray-700 mb-2 font-semibold">
								Content
							</label>
							<p
								dangerouslySetInnerHTML={{
									__html: ticket.description.split("\n").join("<br />"),
								}}
								className="text-gray-600"
							></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
