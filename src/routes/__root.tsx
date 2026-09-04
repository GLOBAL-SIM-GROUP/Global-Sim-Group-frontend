import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { type ReactNode, useEffect } from "react";
import { Button } from "#/components/ui/button";
import type { AuthSession } from "#/core/auth";
import { AuthProvider } from "#/core/auth/auth-context";
import type { NotificationsClient } from "#/core/notifications";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

// Import CSS sans `?url` : Vite/TanStack Start injectent la feuille de style
// (hash cohérent client/SSR). L'import `?url` + lien manuel désynchronisait le
// hash référencé du fichier émis selon l'environnement de build (404 CSS).
import "../styles.css";

interface RouterContext {
	queryClient: QueryClient;
	auth: AuthSession;
	notifications: NotificationsClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "GLOBAL SIM GROUP — SIM" },
			// PWA : couleur de la barre du navigateur / de la barre de statut.
			{ name: "theme-color", content: "#1A2B4C" },
			// PWA iOS : Safari ignore le Web App Manifest pour l'icône/le mode
			// plein écran — ces balises sont le seul moyen d'obtenir un
			// comportement d'app installée (via « Sur l'écran d'accueil »).
			{ name: "apple-mobile-web-app-capable", content: "yes" },
			{ name: "mobile-web-app-capable", content: "yes" },
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent",
			},
			{ name: "apple-mobile-web-app-title", content: "SIM" },
		],
		links: [
			// Favicon de l'onglet — logo servis depuis public/ (idem /login).
			{ rel: "icon", type: "image/png", href: "/logo.png" },
			// PWA : icône affichée par iOS quand l'app est ajoutée à l'écran
			// d'accueil (Safari ne lit pas `manifest.icons`).
			{ rel: "apple-touch-icon", href: "/logo.png" },
			// PWA : manifeste statique (public/manifest.webmanifest).
			{ rel: "manifest", href: "/manifest.webmanifest" },
		],
	}),
	component: RootComponent,
	errorComponent: ErrorComponent,
	notFoundComponent: NotFoundComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	// Le hook doit être appelé sans condition (règle des Hooks) : le
	// try/catch encaisse le cas, rare, où le contexte du routeur n'est pas
	// encore disponible (ex. tout premier rendu SSR avant hydratation).
	const context = useRouteContext({ from: "__root__" }) as RouterContext;
	const auth: AuthSession | undefined = context?.auth;

	// Enregistrement du service worker (PWA), écrit à la main dans public/sw.js
	// — client uniquement, l'API `navigator.serviceWorker` n'existe pas en SSR.
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js").catch(() => {});
		}
	}, []);

	return (
		<AuthProvider session={auth}>
			<Outlet />
		</AuthProvider>
	);
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
