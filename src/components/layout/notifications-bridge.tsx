import { useQueryClient } from "@tanstack/react-query";
import { Toast } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { useNotifications } from "#/core/notifications";
import type { NotificationEnvelope } from "#/core/notifications/types";
import { journalKeys, sauvegardesKeys } from "#/features/admin/permissions";
import {
	depensesKeys,
	impayesKeys,
	paiementsKeys,
	tableauBordKeys,
} from "#/features/finances/permissions";
import {
	produitsKeys,
	stockKeys,
	ventesKeys,
} from "#/features/marchandise/permissions";
import {
	cautionKeys,
	marketVentesKeys,
	echeancesKeys as portailEcheancesKeys,
	paiementsKeys as portailPaiementsKeys,
	pressingCommandesKeys,
	recuPressingKeys,
	restaurantCommandesKeys,
	salleFeteDisponibilitesKeys,
	salleFeteReservationsKeys,
	sejoursPortailKeys,
} from "#/features/portail/permissions";
import { commandesKeys } from "#/features/pressing/permissions";
import {
	chargesKeys,
	clientsKeys,
	contratsKeys,
	sejoursKeys,
	suiviKeys,
} from "#/features/residence/permissions";
import { commandesRestaurantKeys } from "#/features/restaurant/permissions";
import { paiesKeys, pointagesKeys } from "#/features/rh/permissions";
import { reservationsKeys } from "#/features/salle-fete/permissions";
import { signalementsKeys } from "#/features/signalements/permissions";

/**
 * Événement de notification → clés TanStack Query à invalider pour un
 * rafraîchissement « live » des écrans. Couvre à la fois les vues staff et
 * les vues du portail résident (`/residence/portail/*` vit sous le layout
 * authentifié, contrairement à `/espace-client` qui a son propre bridge) ;
 * invalider une clé sans requête montée est sans effet.
 */
const INVALIDATIONS_PAR_EVENT: Record<string, readonly (readonly unknown[])[]> =
	{
		"restaurant.commande_creee": [commandesRestaurantKeys.all],
		"restaurant.commande.statut": [
			commandesRestaurantKeys.all,
			restaurantCommandesKeys.all,
		],
		"pressing.commande.statut": [
			commandesKeys.all,
			pressingCommandesKeys.all,
			recuPressingKeys.all,
		],
		"pressing.commande_prete": [
			commandesKeys.all,
			pressingCommandesKeys.all,
			recuPressingKeys.all,
		],
		"pressing.retrait_depasse": [commandesKeys.all],
		"salle_fete.reservation_creee": [reservationsKeys.all],
		"salle_fete.reservation.statut": [
			reservationsKeys.all,
			salleFeteReservationsKeys.all,
			salleFeteDisponibilitesKeys.all,
		],
		"salle_fete.evenement_proche_solde": [reservationsKeys.all],
		"market.stock_bas": [produitsKeys.all, stockKeys.all],
		"market.rupture_stock": [produitsKeys.all, stockKeys.all],
		"market.demande_creee": [ventesKeys.all],
		"market.vente.statut": [ventesKeys.all, marketVentesKeys.all],
		"residence.echeance_en_retard": [suiviKeys.all, portailEcheancesKeys.all],
		"residence.contrat_expire_bientot": [contratsKeys.all],
		"residence.contrat_expire": [contratsKeys.all, clientsKeys.all],
		"residence.sejour_depart_jour": [sejoursKeys.all],
		"residence.sejour_demande_creee": [sejoursKeys.all],
		"residence.sejour.statut": [sejoursKeys.all, sejoursPortailKeys.all],
		"residence.charge_impayee": [chargesKeys.all],
		"residence.caution_a_restituter": [contratsKeys.all, cautionKeys.all],
		"finances.caisse_non_fermee": [["finances", "caisses"]],
		"finances.impaye_nouveau": [impayesKeys.all],
		"finances.depense_importante": [depensesKeys.all],
		"paiement.important": [paiementsKeys.all, portailPaiementsKeys.all],
		"tirage.ecart": [["tirages"], tableauBordKeys.all],
		"finances.tirage.ecart": [["tirages"], tableauBordKeys.all],
		"signalement.cree": [signalementsKeys.all],
		"signalement.pris_en_charge": [signalementsKeys.all],
		"signalement.resolu": [signalementsKeys.all],
		"signalement.rejete": [signalementsKeys.all],
		"signalement.en_retard": [signalementsKeys.all],
		"rh.pointage_anomalie": [pointagesKeys.all],
		"rh.bulletins_prets": [paiesKeys.all],
		"rh.paie.payee": [paiesKeys.all],
		"admin.securite": [journalKeys.all],
		"job.echec": [journalKeys.all],
		"sauvegarde.echec": [sauvegardesKeys.all],
	};

interface ToastItem {
	id: string;
	title: string;
	body: string;
	priority: NotificationEnvelope["priority"];
}

/**
 * Pont notifications → shell authentifié : à chaque événement live, invalide
 * les requêtes TanStack Query concernées (files EN_ATTENTE, listes, portail
 * résident) pour un rafraîchissement immédiat, et affiche un toast pour les
 * priorités HIGH/CRITICAL (LOW/MEDIUM ne vont qu'au centre de notifications).
 *
 * Comme le bridge portail : le premier snapshot (historique repoussé à la
 * connexion) est marqué « vu » sans toast ni invalidation — il reflète le
 * passé. Les ids déjà traités ne sont jamais re-traités (`vusRef`).
 */
export function NotificationsBridge() {
	const { notifications } = useNotifications();
	const queryClient = useQueryClient();
	const vusRef = useRef<Set<string> | null>(null);
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	useEffect(() => {
		if (vusRef.current === null) {
			vusRef.current = new Set(notifications.map((n) => n.id));
			return;
		}
		const vus = vusRef.current;
		const nouveaux = notifications.filter((n) => !vus.has(n.id));
		for (const n of notifications) vus.add(n.id);
		if (nouveaux.length === 0) return;

		for (const n of nouveaux) {
			for (const key of INVALIDATIONS_PAR_EVENT[n.event] ?? []) {
				void queryClient.invalidateQueries({ queryKey: key });
			}
		}
		setToasts((actuels) => [
			...actuels,
			...nouveaux
				.filter((n) => n.priority === "HIGH" || n.priority === "CRITICAL")
				.map((n) => ({
					id: n.id,
					title: n.message.title,
					body: n.message.body,
					priority: n.priority,
				})),
		]);
	}, [notifications, queryClient]);

	return (
		<Toast.Provider swipeDirection="right">
			{toasts.map((toast) => (
				<Toast.Root
					key={toast.id}
					duration={toast.priority === "CRITICAL" ? 10_000 : 6000}
					onOpenChange={(ouvert) => {
						if (!ouvert) {
							setToasts((actuels) => actuels.filter((t) => t.id !== toast.id));
						}
					}}
					className={
						toast.priority === "CRITICAL"
							? "rounded-lg border border-destructive bg-card px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
							: "rounded-lg border border-amber-500/60 bg-card px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
					}
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
