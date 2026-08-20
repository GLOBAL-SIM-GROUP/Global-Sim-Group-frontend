import { useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { useAuth } from "#/core/auth";

export function UserMenu({
	avatar,
	login,
	role,
}: {
	avatar: ReactNode;
	login: string;
	role?: string;
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
					className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-lagoon/20 transition-colors"
					aria-label="User menu"
				>
					{avatar}
					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-white">
							{login}
						</p>
						{role ? (
							<p className="truncate text-sm text-gray-400">{role}</p>
						) : null}
					</div>
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className="min-w-48 rounded-lg border border-palm bg-sea-ink shadow-lg z-50 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
					sideOffset={8}
					align="end"
				>
					<div className="px-4 py-3 border-b border-palm text-center">
						<p className="text-sm font-medium text-white">{login}</p>
						{role ? (
							<p className="text-xs text-gray-400">{role}</p>
						) : null}
					</div>

					<DropdownMenu.Item asChild>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void handleLogout();
							}}
							className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-lagoon/20 hover:text-white transition-colors outline-none"
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
