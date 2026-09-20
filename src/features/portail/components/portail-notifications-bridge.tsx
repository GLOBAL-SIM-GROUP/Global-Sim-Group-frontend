import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { useNotifications } from "#/core/notifications";

import {
	marketVentesKeys,
	pressingCommandesKeys,
	recuPressingKeys,
	restaurantCommandesKeys,
	salleFeteDisponibilitesKeys,
	salleFeteReservationsKeys,
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
 * `market.vente.statut`), invalide les
 * requêtes concernées et affiche un toast avec le titre/corps déjà formatés
 * en français par le backend.
 *
 * Le client de notifications reçoit chaque événement deux fois (canal
 * générique `notification` + canal au nom de l'event) — le snapshot est déjà
 * dédoublonné par `id`, et `vusRef` évite tout re-traitement. L'historique
 * repoussé à la connexion n'est PAS toasté : seuls les ids arrivés après le
 * montage déclenchent un toast.
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
		setToasts((actuels) => [
			...actuels,
			...nouveaux.map((n) => ({
				id: n.id,
				title: n.message.title,
				body: n.message.body,
			})),
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
