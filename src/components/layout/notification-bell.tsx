import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";
import {
	type NotificationEnvelope,
	type NotificationPriority,
	routeFor,
	useNotifications,
} from "#/core/notifications";
import { parseInstantUTC } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import "./notification-bell.css";

// Mécanique de balancement portée de React Bits BellToggle (WAAPI pur, pas
// de `motion`) : la cloche oscille en anneaux décroissants, avec des vagues
// sonores à chaque passage.
const SEG_EASE = "cubic-bezier(0.77, 0, 0.175, 1)";
const WARP = 0.6;

const passOffset = (k: number, passes: number) =>
	1 - (1 - (k + 2 / 3) / (passes + 1)) ** WARP;

const ringKeyframes = (
	from: number,
	amplitude: number,
	passes: number,
	decay: number,
): Keyframe[] => {
	const frames: Keyframe[] = [
		{ transform: `rotate(${from}deg)`, offset: 0, easing: SEG_EASE },
	];
	for (let k = 0; k < passes; k++) {
		const angle = amplitude * (1 - k / passes) ** decay * (k % 2 ? 1 : -1);
		frames.push({
			transform: `rotate(${angle.toFixed(2)}deg)`,
			offset: passOffset(k, passes),
			easing: SEG_EASE,
		});
	}
	frames.push({ transform: "rotate(0deg)", offset: 1 });
	return frames;
};

const liveAngle = (el: HTMLElement) => {
	const tf = getComputedStyle(el).transform;
	if (!tf || tf === "none") return 0;
	const m = new DOMMatrix(tf);
	return (Math.atan2(m.b, m.a) * 180) / Math.PI;
};

const prefersReducedMotion = () =>
	typeof window.matchMedia === "function" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PRIORITY_BORDER: Record<NotificationPriority, string> = {
	CRITICAL: "border-l-danger",
	HIGH: "border-l-warning",
	MEDIUM: "border-l-info",
	LOW: "border-l-transparent",
};

const PRIORITY_DOT: Record<NotificationPriority, string> = {
	CRITICAL: "bg-danger",
	HIGH: "bg-warning",
	MEDIUM: "bg-info",
	LOW: "bg-gray-400",
};

/** Format court fr-FR (jj/mm/aa hh:mm) — pas de lib de date, un seul usage. */
function formatHeure(iso: string): string {
	// Instants serveur (UTC naïf possible) — `new Date` direct lirait en local.
	const date = parseInstantUTC(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString("fr-FR", {
		dateStyle: "short",
		timeStyle: "short",
	});
}

function NotificationItem({
	item,
	isRead,
	role,
	permissions,
	onActivate,
}: {
	item: NotificationEnvelope;
	isRead: boolean;
	role?: string;
	permissions: readonly string[];
	/** Marque comme lu, et navigue si une destination existe pour cet événement. */
	onActivate: () => void;
}) {
	// Pas de destination connue (événement inconnu, id manquant, ou pas encore
	// de vue self-service pour ce type — ex. `rh.paie.payee`) : l'item reste
	// affiché mais n'a plus l'affordance cliquable (pas de curseur pointeur).
	const clickable = routeFor(item, role, permissions) !== null;

	const contenu = (
		<>
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
		</>
	);

	if (!clickable) {
		return (
			<div
				className={cn(
					"flex w-full cursor-default flex-col gap-1 border-l-4 px-4 py-3 text-left",
					PRIORITY_BORDER[item.priority],
					isRead ? "opacity-60" : "bg-accent/20",
				)}
			>
				{contenu}
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={onActivate}
			className={cn(
				"flex w-full cursor-pointer flex-col gap-1 border-l-4 px-4 py-3 text-left transition-colors hover:bg-accent/50",
				PRIORITY_BORDER[item.priority],
				isRead ? "opacity-60" : "bg-accent/20",
			)}
		>
			{contenu}
		</button>
	);
}

/**
 * Cloche de notifications temps réel (Socket.IO, namespace `/notifications`).
 * Historique + flux live via `useNotifications()` — aucun appel REST.
 */
export function NotificationBell({ className }: { className?: string }) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const user = useCurrentUser();
	const role = user?.role;
	const permissions = user?.permissions ?? [];
	const {
		status,
		notifications,
		unreadCount,
		isRead,
		markAsRead,
		markAllAsRead,
		clearAll,
		refreshHistory,
	} = useNotifications();

	const glyphRef = useRef<HTMLSpanElement>(null);
	const waveLeftRef = useRef<SVGSVGElement>(null);
	const waveRightRef = useRef<SVGSVGElement>(null);
	const prevUnreadRef = useRef(unreadCount);

	// Balancement : `amplitude` = premier écart en degrés, `passes` =
	// demi-oscillations avant l'arrêt, amortissement constant (decay = 1).
	const swing = (amplitude: number, passes: number, duration: number) => {
		const el = glyphRef.current;
		if (!el || prefersReducedMotion()) return;
		for (const animation of el.getAnimations()) animation.cancel();
		el.animate(ringKeyframes(liveAngle(el), amplitude, passes, 1), {
			duration,
			easing: "linear",
		});
		for (let k = 0; k < passes; k++) {
			const side = k % 2 ? waveRightRef.current : waveLeftRef.current;
			if (!side) continue;
			const strength = (1 - k / passes) ** 1;
			side.animate(
				[
					{ opacity: 0, transform: "scale(0.55)" },
					{ opacity: 0.9 * strength, offset: 0.3 },
					{ opacity: 0, transform: "scale(1.25)" },
				],
				{
					duration: 380,
					delay: passOffset(k, passes) * duration,
					easing: "ease-out",
				},
			);
		}
	};

	// Une notification arrive en live (Socket.IO) : carillon + vagues.
	// Pas de swing au montage — `prevUnreadRef` démarre à la valeur courante.
	// biome-ignore lint/correctness/useExhaustiveDependencies: `swing` ne dépend que de refs
	useEffect(() => {
		const precedent = prevUnreadRef.current;
		prevUnreadRef.current = unreadCount;
		if (unreadCount > precedent) swing(17, 5, 820);
	}, [unreadCount]);

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		// Petit balancement à l'ouverture — retour visuel du clic.
		if (next) swing(8, 3, 480);
	};

	const handleActivate = (item: NotificationEnvelope) => {
		markAsRead(item.id);
		const route = routeFor(item, role, permissions);
		if (route) {
			setOpen(false);
			void navigate(route);
		}
	};

	return (
		<DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
			<DropdownMenu.Trigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn("relative", className)}
					aria-label="Notifications"
					title="Notifications"
				>
					<span className="notif-bell__bell" aria-hidden="true">
						<span ref={glyphRef} className="notif-bell__glyph">
							<Bell />
						</span>
						<svg
							ref={waveLeftRef}
							className="notif-bell__wave notif-bell__wave--left"
							viewBox="0 0 14 14"
							aria-hidden="true"
						>
							<path d="M14 8a6 6 0 0 0-6 6" />
							<path d="M14 4A10 10 0 0 0 4 14" />
						</svg>
						<svg
							ref={waveRightRef}
							className="notif-bell__wave notif-bell__wave--right"
							viewBox="0 0 14 14"
							aria-hidden="true"
						>
							<path d="M0 8a6 6 0 0 1 6 6" />
							<path d="M0 4a10 10 0 0 1 10 10" />
						</svg>
					</span>
					{unreadCount > 0 ? (
						<span className="notif-bell__badge absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[0.6rem] font-semibold text-white">
							<span key={unreadCount} className="notif-bell__digit">
								{unreadCount > 9 ? "9+" : unreadCount}
							</span>
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
							{notifications.length > 0 ? (
								<Button
									variant="ghost"
									size="icon-xs"
									title="Vider la liste"
									onClick={() => clearAll()}
								>
									<Trash2 className="size-3.5" aria-hidden />
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
											role={role}
											permissions={permissions}
											onActivate={() => handleActivate(item)}
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
