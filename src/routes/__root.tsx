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
import { Button } from "#/components/ui/button";
import type { AuthSession } from "#/core/auth";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

interface RouterContext {
	queryClient: QueryClient;
	auth: AuthSession;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "GLOBAL SIM GROUP — SIM" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			// Favicon de l'onglet — logo servis depuis public/ (idem /login).
			{ rel: "icon", type: "image/png", href: "/logo.png" },
		],
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
			<h1 className="text-xl font-semibold">Une erreur est survenue.</h1>
			{error instanceof Error ? (
				<p className="max-w-md text-sm text-muted-foreground">
					{error.message}
				</p>
			) : null}
			<Button variant="outline" onClick={reset}>
				Réessayer
			</Button>
		</main>
	);
}

function NotFoundComponent() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-xl font-semibold">Page introuvable.</h1>
			<Link to="/" className="text-sm text-muted-foreground underline">
				Retour à l'accueil
			</Link>
		</main>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="fr">
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
