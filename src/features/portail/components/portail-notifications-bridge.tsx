import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { useNotifications } from "#/core/notifications";

import {
	logementsPortailKeys,
	marketVentesKeys,
	pressingCommandesKeys,
	recuPressingKeys,
	restaurantCommandesKeys,
	salleFeteDisponibilitesKeys,
	salleFeteReservationsKeys,
	sejoursPortailKeys,
	signalementsPortailKeys,
} from "../permissions";

/** Événements portail → clés de requêtes à invalider. */
const INVALIDATIONS_PAR_EVENT: Record<string, readonly (readonly string[])[]> =
	{
		"restaurant.commande.statut": [restaurantCommandesKeys.all],
		"pressing.commande.statut": [
			pressingCommandesKeys.all,
			recuPressingKeys.all,
		],
		"pressing.commande_prete": [
			pressingCommandesKeys.all,
			recuPressingKeys.all,
		],
		"salle_fete.reservation.statut": [
			salleFeteReservationsKeys.all,
			salleFeteDisponibilitesKeys.all,
		],
		"market.vente.statut": [marketVentesKeys.all],
		"residence.sejour.statut": [
			sejoursPortailKeys.all,
			logementsPortailKeys.all,
		],
		// Statut d'un signalement portail (backend 091) — `signalement.cree`
		// est staff-only, non reçu par le déclarant.
		"signalement.pris_en_charge": [signalementsPortailKeys.all],
		"signalement.resolu": [signalementsPortailKeys.all],
		"signalement.rejete": [signalementsPortailKeys.all],
	};

/**
 * Corps de toast spécifique pour un changement de statut de signalement —
 * le déclarant voit le nouveau statut plutôt qu'un compteur générique.
 * Uniquement appliqué quand l'événement arrive seul dans la vague.
 */
const TOASTS_EVENEMENT_SIGNALEMENT: Record<string, string> = {
	"signalement.pris_en_charge":
		"Votre signalement a été pris en charge par nos équipes.",
	"signalement.resolu": "Votre signalement a été résolu.",
	"signalement.rejete": "Votre signalement a été rejeté.",
};

interface ToastItem {
	id: string;
	title: string;
	body: string;
}

/**
 * Pont notifications → portail résident : à chaque événement métier reçu sur
 * le socket (`restaurant.commande.statut`, `pressing.commande.statut`,
 * `pressing.commande_prete`, `salle_fete.reservation.statut`,
 * `market.vente.statut`), invalide les requêtes concernées.
 *
 * Un seul toast « Vous avez de nouvelles notifications » est affiché par
 * vague d'événements (remplacé si déjà visible) plutôt qu'un toast par
 * notification : à la connexion, l'historique repoussé par le socket arrive
 * après le montage et produirait sinon une rafale.
 *
 * Le client de notifications reçoit chaque événement deux fois (canal
 * générique `notification` + canal au nom de l'event) — le snapshot est déjà
 * dédoublonné par `id`, et `vusRef` évite tout re-traitement.
 */
export function PortailNotificationsBridge() {
	const { notifications } = useNotifications();
	const queryClient = useQueryClient();
	const vusRef = useRef<Set<string> | null>(null);
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	useEffect(() => {
		if (vusRef.current === null) {
			// Premier passage : l'historique (jusqu'à 50 items) est marqué « vu »
			// sans toast — il reflète le passé, pas une nouveauté.
			vusRef.current = new Set(notifications.map((n) => n.id));
			return;
		}
		const vus = vusRef.current;
		const nouveaux = notifications.filter(
			(n) => !vus.has(n.id) && n.event in INVALIDATIONS_PAR_EVENT,
		);
		for (const n of notifications) vus.add(n.id);
		if (nouveaux.length === 0) return;

		for (const n of nouveaux) {
			for (const key of INVALIDATIONS_PAR_EVENT[n.event] ?? []) {
				void queryClient.invalidateQueries({ queryKey: key });
			}
		}
		const statutSignalement =
			nouveaux.length === 1
				? TOASTS_EVENEMENT_SIGNALEMENT[nouveaux[0].event]
				: undefined;
		setToasts([
			{
				id: `nouvelles-${Date.now()}`,
				title: statutSignalement ? "Signalement" : "Nouvelles notifications",
				body:
					statutSignalement ??
					(nouveaux.length > 1
						? `Vous avez ${nouveaux.length} nouvelles notifications.`
						: "Vous avez une nouvelle notification."),
			},
		]);
	}, [notifications, queryClient]);

	return (
		<Toast.Provider swipeDirection="right">
			{toasts.map((toast) => (
				<Toast.Root
					key={toast.id}
					duration={6000}
					onOpenChange={(ouvert) => {
						if (!ouvert) {
							setToasts((actuels) => actuels.filter((t) => t.id !== toast.id));
						}
					}}
					className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
				>
					<Toast.Title className="text-sm font-semibold text-foreground">
						{toast.title}
					</Toast.Title>
					<Toast.Description className="text-sm text-muted-foreground">
						{toast.body}
					</Toast.Description>
				</Toast.Root>
			))}
			<Toast.Viewport className="fixed right-6 bottom-6 z-50 flex w-90 max-w-full flex-col gap-2 outline-none" />
		</Toast.Provider>
	);
}
