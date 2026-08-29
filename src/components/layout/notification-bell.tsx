import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	type NotificationEnvelope,
	type NotificationPriority,
	useNotifications,
} from "#/core/notifications";
import { cn } from "#/lib/utils";

const PRIORITY_BORDER: Record<NotificationPriority, string> = {
	CRITICAL: "border-l-[#E74C3C]",
	HIGH: "border-l-[#E67E22]",
	MEDIUM: "border-l-[#2980B9]",
	LOW: "border-l-transparent",
};

const PRIORITY_DOT: Record<NotificationPriority, string> = {
	CRITICAL: "bg-[#E74C3C]",
	HIGH: "bg-[#E67E22]",
	MEDIUM: "bg-[#2980B9]",
	LOW: "bg-gray-400",
};

/** Format court fr-FR (jj/mm/aa hh:mm) — pas de lib de date, un seul usage. */
function formatHeure(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString("fr-FR", {
		dateStyle: "short",
		timeStyle: "short",
	});
}

function NotificationItem({
	item,
	isRead,
	onRead,
}: {
	item: NotificationEnvelope;
	isRead: boolean;
	onRead: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onRead}
			className={cn(
				"flex w-full flex-col gap-1 border-l-4 px-4 py-3 text-left transition-colors hover:bg-accent/50",
				PRIORITY_BORDER[item.priority],
				isRead ? "opacity-60" : "bg-accent/20",
			)}
		>
			<div className="flex items-center gap-2">
				<span
					className={cn(
						"size-1.5 shrink-0 rounded-full",
						PRIORITY_DOT[item.priority],
					)}
					aria-hidden
				/>
				<span
					className={cn(
						"truncate text-sm text-foreground",
						isRead ? "font-normal" : "font-semibold",
					)}
				>
					{item.message.title}
				</span>
			</div>
			<p className="line-clamp-2 text-xs text-muted-foreground">
				{item.message.body}
			</p>
			<span className="text-[0.65rem] text-muted-foreground">
				{formatHeure(item.timestamp)}
			</span>
		</button>
	);
}

/**
 * Cloche de notifications temps réel (Socket.IO, namespace `/notifications`).
 * Historique + flux live via `useNotifications()` — aucun appel REST.
 */
export function NotificationBell({ className }: { className?: string }) {
	const [open, setOpen] = useState(false);
	const {
		status,
		notifications,
		unreadCount,
		isRead,
		markAsRead,
		markAllAsRead,
		refreshHistory,
	} = useNotifications();

	return (
		<DropdownMenu.Root open={open} onOpenChange={setOpen}>
			<DropdownMenu.Trigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn("relative", className)}
					aria-label="Notifications"
					title="Notifications"
				>
					<Bell />
					{unreadCount > 0 ? (
						<span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[0.6rem] font-semibold text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					) : null}
				</Button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-card shadow-lg animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
					sideOffset={8}
					align="end"
				>
					<div className="flex items-center justify-between border-b border-border px-4 py-3">
						<p className="text-sm font-semibold text-foreground">
							Notifications
						</p>
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon-xs"
								title="Rafraîchir"
								onClick={() => refreshHistory()}
							>
								<RefreshCw className="size-3.5" aria-hidden />
							</Button>
							{unreadCount > 0 ? (
								<Button
									variant="ghost"
									size="icon-xs"
									title="Tout marquer comme lu"
									onClick={() => markAllAsRead()}
								>
									<CheckCheck className="size-3.5" aria-hidden />
								</Button>
							) : null}
						</div>
					</div>

					<div className="max-h-96 overflow-y-auto">
						{status === "connecting" || status === "idle" ? (
							<p className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Connexion…
							</p>
						) : notifications.length === 0 ? (
							<p className="px-4 py-6 text-center text-sm text-muted-foreground">
								Aucune notification.
							</p>
						) : (
							<ul>
								{notifications.map((item) => (
									<li
										key={item.id}
										className="border-b border-border last:border-b-0"
									>
										<NotificationItem
											item={item}
											isRead={isRead(item.id)}
											onRead={() => markAsRead(item.id)}
										/>
									</li>
								))}
							</ul>
						)}
					</div>

					{status === "disconnected" ? (
						<p className="border-t border-border px-4 py-2 text-center text-xs text-destructive">
							Connexion perdue — nouvelle tentative en cours…
						</p>
					) : null}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
