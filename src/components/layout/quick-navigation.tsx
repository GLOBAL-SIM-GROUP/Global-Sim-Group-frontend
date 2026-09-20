import { useLocation, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { usePermissions } from "#/core/auth";
import { hasPermission } from "#/core/permissions";
import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
} from "#/core/permissions/modules";

interface NavigationEntry {
	label: string;
	path: string;
	group: string;
}

const SPECIAL_ENTRIES: Array<
	NavigationEntry & { permission?: Parameters<typeof hasPermission>[1] }
> = [
	{ label: "Accueil", path: "/", group: "Navigation" },
	{
		label: "Tableau de bord global",
		path: "/dashboard",
		group: "Navigation",
		permission: "ADMIN.VOIR",
	},
	{
		label: "Signalements",
		path: "/signalements",
		group: "Navigation",
		permission: "SIGNALEMENT.VOIR",
	},
	{
		label: "Rapports",
		path: "/rapports",
		group: "Navigation",
		permission: "ADMIN.VOIR",
	},
];

const RESIDENT_ENTRIES: NavigationEntry[] = [
	{
		label: "Mon espace résident",
		path: "/residence/portail",
		group: "Résident",
	},
	{
		label: "Mes paiements",
		path: "/residence/portail/paiements",
		group: "Résident",
	},
	{
		label: "Ma caution",
		path: "/residence/portail/caution",
		group: "Résident",
	},
	{
		label: "Suivi Pressing",
		path: "/residence/portail/pressing",
		group: "Résident",
	},
	{
		label: "Restaurant",
		path: "/residence/portail/restaurant",
		group: "Résident",
	},
	{
		label: "Salle de fête",
		path: "/residence/portail/salle-fete",
		group: "Résident",
	},
	{
		label: "Boutique",
		path: "/residence/portail/boutique",
		group: "Résident",
	},
	{
		label: "Mes états des lieux",
		path: "/residence/portail/etat-des-lieux",
		group: "Résident",
	},
];

function useNavigationEntries(): NavigationEntry[] {
	const permissions = usePermissions();

	return useMemo(() => {
		const modules = getAccessibleModules(permissions);
		const moduleEntries = modules.flatMap((module) =>
			getAccessibleModuleSubItems(module, permissions).map((item) => ({
				label: item.label,
				path: item.path,
				group: module.title,
			})),
		);
		const specialEntries = SPECIAL_ENTRIES.filter(
			(entry) =>
				!entry.permission || hasPermission(permissions, entry.permission),
		);
		const residentEntries = hasPermission(permissions, "RESIDENT.VOIR")
			? RESIDENT_ENTRIES
			: [];
		const uniques = new Map<string, NavigationEntry>();
		for (const entry of [
			...specialEntries,
			...residentEntries,
			...moduleEntries,
		]) {
			uniques.set(entry.path, entry);
		}
		return [...uniques.values()];
	}, [permissions]);
}

export function useCurrentPageTitle(): string {
	const { pathname } = useLocation();
	const entries = useNavigationEntries();
	const active = [...entries]
		.filter((entry) =>
			entry.path === "/"
				? pathname === "/"
				: pathname === entry.path || pathname.startsWith(`${entry.path}/`),
		)
		.sort((a, b) => b.path.length - a.path.length)[0];
	return active?.label ?? "GLOBAL SIM GROUP";
}

export function QuickNavigation() {
	const navigate = useNavigate();
	const entries = useNavigationEntries();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen((current) => !current);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const normalizedSearch = search.trim().toLocaleLowerCase("fr");
	const results = normalizedSearch
		? entries.filter((entry) =>
				`${entry.label} ${entry.group}`
					.toLocaleLowerCase("fr")
					.includes(normalizedSearch),
			)
		: entries;

	const openEntry = (entry: NavigationEntry) => {
		setOpen(false);
		setSearch("");
		void navigate({ href: entry.path });
	};

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setSearch("");
			}}
		>
			<Dialog.Trigger asChild>
				<Button
					variant="outline"
					className="hidden w-56 justify-between text-muted-foreground md:flex lg:w-72"
				>
					<span className="inline-flex min-w-0 items-center gap-2">
						<Search className="size-4 shrink-0" aria-hidden />
						<span className="truncate">Rechercher une page…</span>
					</span>
					<kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[0.65rem]">
						Ctrl K
					</kbd>
				</Button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-[15vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
					<Dialog.Title className="sr-only">Rechercher une page</Dialog.Title>
					<Dialog.Description className="sr-only">
						Recherchez parmi les pages auxquelles vous avez accès.
					</Dialog.Description>
					<div className="flex items-center gap-2 border-b border-border p-3">
						<Search
							className="size-5 shrink-0 text-muted-foreground"
							aria-hidden
						/>
						<Input
							autoFocus
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && results[0]) openEntry(results[0]);
							}}
							placeholder="Rechercher une page…"
							className="border-0 shadow-none focus-visible:ring-0"
						/>
						<Dialog.Close asChild>
							<Button variant="ghost" size="icon-sm">
								<X className="size-4" aria-hidden />
								<span className="sr-only">Fermer</span>
							</Button>
						</Dialog.Close>
					</div>
					<div className="max-h-[55vh] overflow-y-auto p-2">
						{results.length === 0 ? (
							<p className="px-3 py-8 text-center text-sm text-muted-foreground">
								Aucune page trouvée.
							</p>
						) : (
							<ul className="space-y-1">
								{results.map((entry) => (
									<li key={entry.path}>
										<button
											type="button"
											onClick={() => openEntry(entry)}
											className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
										>
											<span className="text-sm font-medium text-foreground">
												{entry.label}
											</span>
											<span className="text-xs text-muted-foreground">
												{entry.group}
											</span>
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
