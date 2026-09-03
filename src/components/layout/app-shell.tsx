import { Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AppBackground } from "./app-background";
import { NotificationBell } from "./notification-bell";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex min-h-dvh relative">
			<AppBackground />
			{/* Desktop: sidebar always visible */}
			<div className="hidden lg:block">
				<Sidebar />
			</div>

			{/* Mobile overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
					aria-hidden
				/>
			)}

			{/* Mobile sidebar in modal */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:hidden ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<Sidebar onClose={() => setSidebarOpen(false)} />
			</div>

			<div className="flex min-w-0 flex-1 flex-col relative z-10">
				<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
					<div className="flex h-14 w-full items-center gap-2 sm:gap-4 px-2 sm:px-4">
						<button
							type="button"
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors shrink-0"
							aria-label="Toggle sidebar"
						>
							{sidebarOpen ? (
								<X className="size-5" />
							) : (
								<Menu className="size-5" />
							)}
						</button>
						<span className="text-xs sm:text-lg font-semibold lg:hidden truncate">
							GLOBAL SIM GROUP
						</span>
						<div className="ml-auto flex items-center">
							<NotificationBell />
						</div>
					</div>
				</header>
				{/* Pas de fermeture au clic ici : le calque `Mobile overlay`
				    ci-dessus (z-40, plein écran) capte déjà tout clic hors
				    sidebar quand elle est ouverte — ce `<main>` (z-10) ne
				    reçoit jamais ces clics. */}
				<main className="min-w-0 flex-1 relative">{children}</main>
			</div>
		</div>
	);
}
