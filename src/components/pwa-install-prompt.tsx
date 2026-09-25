import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";

/**
 * Événement `beforeinstallprompt` (Chromium uniquement — absent de
 * `lib.dom`). Conservé via `preventDefault` pour déclencher la boîte de
 * dialogue native au moment choisi (clic sur « Installer »).
 */
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * État d'installabilité de l'app. `installed` couvre le lancement depuis
 * l'icône (display-mode standalone/fullscreen/minimal-ui) et le flag iOS
 * `navigator.standalone` (Safari n'émet jamais `beforeinstallprompt`) ;
 * `appinstalled` confirme une installation depuis la bannière.
 */
function usePwaInstall() {
	const [promptEvent, setPromptEvent] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [installed, setInstalled] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(
			"(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)",
		);
		const syncInstalled = () =>
			setInstalled(
				media.matches ||
					Boolean((navigator as { standalone?: boolean }).standalone),
			);
		syncInstalled();

		const onBeforeInstall = (event: Event) => {
			// Empêche l'infobar native — la bannière déclenche `prompt()` au clic.
			event.preventDefault();
			setPromptEvent(event as BeforeInstallPromptEvent);
		};
		const onInstalled = () => {
			setInstalled(true);
			setPromptEvent(null);
		};
		const onDisplayModeChange = () => syncInstalled();

		window.addEventListener("beforeinstallprompt", onBeforeInstall);
		window.addEventListener("appinstalled", onInstalled);
		media.addEventListener("change", onDisplayModeChange);
		return () => {
			window.removeEventListener("beforeinstallprompt", onBeforeInstall);
			window.removeEventListener("appinstalled", onInstalled);
			media.removeEventListener("change", onDisplayModeChange);
		};
	}, []);

	const proposer = async () => {
		if (!promptEvent) return;
		await promptEvent.prompt();
		// `prompt()` consomme l'événement — plus réutilisable, on le jette.
		setPromptEvent(null);
	};

	return {
		visible: Boolean(promptEvent) && !installed && !dismissed,
		proposer,
		fermer: () => setDismissed(true),
	};
}

/**
 * Bannière d'installation PWA : visible tant que le navigateur considère
 * l'app installable (`beforeinstallprompt` émis) ET qu'elle n'est pas
 * installée — l'événement ne se réémet jamais une fois l'app installée, et
 * `appinstalled`/display-mode masquent la bannière à posteriori. La fermer
 * ne cache que la vue courante : elle réapparaît au prochain chargement,
 * tant que l'app n'est pas installée.
 */
export function PwaInstallPrompt() {
	const { visible, proposer, fermer } = usePwaInstall();
	if (!visible) return null;

	return (
		<div className="fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm">
			<Download className="size-5 shrink-0 text-lagoon" aria-hidden />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-foreground">Installer SIM</p>
				<p className="text-xs text-muted-foreground">
					Accédez à la plateforme en un clic, comme une application.
				</p>
			</div>
			<Button
				type="button"
				size="sm"
				className="bg-lagoon text-white hover:bg-lagoon/90"
				onClick={() => void proposer()}
			>
				Installer
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="size-8 shrink-0"
				aria-label="Fermer"
				onClick={fermer}
			>
				<X className="size-4" aria-hidden />
			</Button>
		</div>
	);
}
