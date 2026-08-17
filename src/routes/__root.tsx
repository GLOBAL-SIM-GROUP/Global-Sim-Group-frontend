import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import type { AuthSession } from "#/core/auth";
import { DEFAULT_LOCALE, initLocale, useLocale } from "#/core/i18n";
import * as m from "#/paraglide/messages";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

// Applique la locale persistée (fr par défaut) avant le premier rendu.
initLocale();

interface RouterContext {
	queryClient: QueryClient;
	auth: AuthSession;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: `${m.app_name()} — SIM` },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
	errorComponent: ErrorComponent,
	notFoundComponent: NotFoundComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	// La route racine doit rendre les routes filles (login, _authenticated…).
	return <Outlet />;
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-xl font-semibold">{m.common_error()}</h1>
			{error instanceof Error ? (
				<p className="max-w-md text-sm text-muted-foreground">
					{error.message}
				</p>
			) : null}
			<Button variant="outline" onClick={reset}>
				{m.common_retry()}
			</Button>
		</main>
	);
}

function NotFoundComponent() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-xl font-semibold">{m.error_not_found()}</h1>
			<Link to="/" className="text-sm text-muted-foreground underline">
				{m.common_back_home()}
			</Link>
		</main>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	const { locale } = useLocale();
	// Évite un mismatch d'hydratation sur <html lang> : le serveur rend toujours
	// la locale par défaut, puis on bascule après montage.
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<html lang={mounted ? locale : DEFAULT_LOCALE}>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				{/* Devtools uniquement en développement (retirés du bundle prod). */}
				{import.meta.env.DEV ? (
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				) : null}
				<Scripts />
			</body>
		</html>
	);
}
