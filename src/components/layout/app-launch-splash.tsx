import { useEffect, useRef, useState } from "react";

/** Durée minimale d'affichage (évite un flash trop bref si la session était déjà prête). */
const MIN_VISIBLE_MS = 550;
/** Durée du fondu de sortie. */
const FADE_OUT_MS = 300;
/** Filet de sécurité si `ready` tarde (réseau lent) — ne bloque jamais l'app. */
const SAFETY_TIMEOUT_MS = 3000;

type Phase = "enter" | "hold" | "leave" | "gone";

/**
 * Écran de lancement animé — logo sur fond `bg-sea-ink` (même bleu que
 * `background_color` du manifest), pour prolonger visuellement le splash
 * natif de l'OS sans coupure de couleur perceptible.
 *
 * Ne s'affiche QUE lorsque l'app tourne en PWA installée
 * (`display-mode: standalone`) — jamais dans un onglet de navigateur
 * classique, où ce délai serait juste de la friction pour un usage
 * quotidien répété (F5). Monté une seule fois par `AuthenticatedLayout`
 * (route persistante `_authenticated`, jamais remontée lors d'une
 * navigation interne) : s'affiche donc exactement à chaque vrai
 * lancement/rechargement de l'app installée, jamais entre deux pages.
 *
 * Reste visible au moins `MIN_VISIBLE_MS` ET jusqu'à ce que `ready`
 * (session restaurée) devienne vrai, avec un filet de sécurité à
 * `SAFETY_TIMEOUT_MS` pour ne jamais bloquer l'app si la restauration
 * traîne.
 */
export function AppLaunchSplash({ ready }: { ready: boolean }) {
	const [phase, setPhase] = useState<Phase>("enter");
	const mountedAtRef = useRef(Date.now());

	useEffect(() => {
		// Navigateur sans `matchMedia` (très rare) : on ne peut pas confirmer le
		// mode PWA installé, on n'affiche donc rien plutôt que de risquer un
		// splash affiché à tort dans un onglet classique.
		if (typeof window.matchMedia !== "function") {
			setPhase("gone");
			return;
		}
		const isStandalonePwa = window.matchMedia(
			"(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)",
		).matches;
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (!isStandalonePwa || reduceMotion) {
			setPhase("gone");
			return;
		}
		// `requestAnimationFrame` (pas juste un état initial) : force un premier
		// paint à "enter" avant de déclencher la transition CSS vers "hold",
		// sinon le navigateur peut fusionner les deux états et sauter l'entrée.
		const raf = requestAnimationFrame(() => setPhase("hold"));
		return () => cancelAnimationFrame(raf);
	}, []);

	useEffect(() => {
		if (phase !== "hold") return;
		const elapsed = Date.now() - mountedAtRef.current;
		const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
		const timer = setTimeout(
			() => setPhase("leave"),
			ready ? remaining : SAFETY_TIMEOUT_MS,
		);
		return () => clearTimeout(timer);
	}, [phase, ready]);

	useEffect(() => {
		if (phase !== "leave") return;
		const timer = setTimeout(() => setPhase("gone"), FADE_OUT_MS);
		return () => clearTimeout(timer);
	}, [phase]);

	if (phase === "gone") return null;

	const entered = phase !== "enter";
	const leaving = phase === "leave";

	return (
		<div
			aria-hidden
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-sea-ink transition-opacity duration-300 ease-out"
			style={{
				opacity: leaving ? 0 : 1,
				pointerEvents: leaving ? "none" : "auto",
			}}
		>
			<img
				src="/logo.png"
				alt=""
				className="h-28 w-28 transition-all duration-500 ease-out sm:h-32 sm:w-32"
				style={{
					opacity: entered ? 1 : 0,
					transform: entered ? "scale(1)" : "scale(0.88)",
				}}
			/>
		</div>
	);
}
