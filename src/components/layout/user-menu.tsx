import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { type ReactNode, useState } from "react";

import { useAuth } from "#/core/auth";
import { cn } from "#/lib/utils";

export interface UserMenuItem {
	label: string;
	to: string;
	icon?: ReactNode;
}

export function UserMenu({
	avatar,
	login,
	role,
	variant = "sidebar",
	items,
}: {
	avatar: ReactNode;
	login: string;
	role?: string;
	variant?: "sidebar" | "navbar";
	/** Entrées supplémentaires affichées avant « Se déconnecter ». */
	items?: UserMenuItem[];
}) {
	const [open, setOpen] = useState(false);
	const { logout } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		setOpen(false);
		await logout();
		await router.navigate({ to: "/login" });
	};

	return (
		<DropdownMenu.Root open={open} onOpenChange={setOpen}>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					className={cn(
						"flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
						variant === "sidebar"
							? "w-full hover:bg-lagoon/20"
							: "w-auto hover:bg-accent",
					)}
					aria-label="Menu utilisateur"
				>
					{avatar}
					<div
						className={cn("min-w-0", variant === "navbar" && "hidden sm:block")}
					>
						<p
							className={cn(
								"truncate text-sm font-medium",
								variant === "sidebar" ? "text-white" : "text-foreground",
							)}
						>
							{login}
						</p>
						{role ? (
							<p
								className={cn(
									"truncate text-xs",
									variant === "sidebar"
										? "text-gray-400"
										: "text-muted-foreground",
								)}
							>
								{role}
							</p>
						) : null}
					</div>
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className={cn(
						"z-50 min-w-48 rounded-lg border shadow-lg animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
						variant === "sidebar"
							? "border-palm bg-sea-ink"
							: "border-border bg-card",
					)}
					sideOffset={8}
					align="end"
				>
					<div
						className={cn(
							"border-b px-4 py-3 text-center",
							variant === "sidebar" ? "border-palm" : "border-border",
						)}
					>
						<p
							className={cn(
								"text-sm font-medium",
								variant === "sidebar" ? "text-white" : "text-foreground",
							)}
						>
							{login}
						</p>
						{role ? (
							<p
								className={cn(
									"text-xs",
									variant === "sidebar"
										? "text-gray-400"
										: "text-muted-foreground",
								)}
							>
								{role}
							</p>
						) : null}
					</div>

					{items?.map((item) => (
						<DropdownMenu.Item key={item.to} asChild>
							<Link
								to={item.to as never}
								onClick={() => setOpen(false)}
								className={cn(
									"flex w-full items-center justify-center gap-2 px-4 py-2 text-sm transition-colors outline-none",
									variant === "sidebar"
										? "text-gray-300 hover:bg-lagoon/20 hover:text-white"
										: "text-foreground hover:bg-accent",
								)}
							>
								{item.icon}
								<span>{item.label}</span>
							</Link>
						</DropdownMenu.Item>
					))}

					<DropdownMenu.Item asChild>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void handleLogout();
							}}
							className={cn(
								"flex w-full items-center justify-center gap-2 px-4 py-2 text-sm transition-colors outline-none",
								variant === "sidebar"
									? "text-gray-300 hover:bg-lagoon/20 hover:text-white"
									: "text-foreground hover:bg-accent",
							)}
						>
							<LogOut className="size-4" aria-hidden />
							<span>Se déconnecter</span>
						</button>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
