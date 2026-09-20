import { Link } from "@tanstack/react-router";
import { CheckCheck, HandCoins, Pencil, RefreshCw, X } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { DownloadReceiptButton } from "#/features/facturation/components/download-receipt-button";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import {
	useAnnulerCommande,
	useCommande,
	usePretCommande,
	useRetirerCommande,
	useTraitementCommande,
} from "../hooks/use-commandes";
import {
	type CommandePressing,
	type CommandePressingStatut,
	MODE_TARIFICATION_LABELS,
	PRESSING_STATUT_LABELS,
} from "../models/commandes";
import { CommandeFormDialog } from "./commande-form-dialog";
import { RecuDepotButton } from "./recu-depot-button";
import { RetirerCommandeDialog } from "./retirer-commande-dialog";
import { ValiderDemandeDialog } from "./valider-demande-dialog";

const PRESSING_STATUT_BADGE: Record<CommandePressingStatut, string> = {
	EN_ATTENTE: "bg-[#8E44AD] text-white",
	DEPOSE: "bg-[#2980B9] text-white",
	EN_TRAITEMENT: "bg-[#E67E22] text-white",
	PRET: "bg-[#27AE60] text-white",
	RETIRE: "bg-[#95A5A6] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

interface CommandeFichePageProps {
	/** Id de la commande (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche commande — [N°] » (module Pressing, M4) : informations client,
 * liste des articles, montants et statut. Actions : Modifier, Changer le statut
 * (En traitement / Prêt), Retirer (encaissement du solde) et impression du
 * reçu de dépôt. L'historique des changements de statut n'est pas exposé par
 * le backend → omis.
 */
export function CommandeFichePage({ id }: CommandeFichePageProps) {
	const canModifier = useCan("PRESSING.MODIFIER");
	const canCreer = useCan("PRESSING.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const canAnnuler = useCan("PRESSING.ANNULER");
	const moyensQuery = useMoyensPaiement();
	const traitementMutation = useTraitementCommande();
	const pretMutation = usePretCommande();
	const retirerMutation = useRetirerCommande();
	const annulerMutation = useAnnulerCommande();

	const [aModifier, setAModifier] = useState<CommandePressing | null>(null);
	const [retraitOuvert, setRetraitOuvert] = useState(false);
	const [validerOuvert, setValiderOuvert] = useState(false);
	const [refuserOuvert, setRefuserOuvert] = useState(false);

	const commandeQuery = useCommande(id);

	if (commandeQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (commandeQuery.isError || !commandeQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Fiche commande
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Commande introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/pressing/commandes">Retour aux commandes</Link>
					</Button>
				</div>
			</div>
		);
	}

	const commande = commandeQuery.data;
	const nomClient = commande.client_nom ?? "—";
	const prenomClient = commande.client_prenoms ?? "";
	const nomComplet = `${nomClient} ${prenomClient}`.trim();
	const aUnReste = Number(commande.reste_a_payer) > 0;
	const enAttente = commande.statut === "EN_ATTENTE";
	const estTerminee =
		commande.statut === "RETIRE" || commande.statut === "ANNULEE";

	return (
		<div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Pressing", to: "/pressing/commandes" },
					{ label: commande.numero_commande },
				]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-lg font-semibold text-foreground sm:text-2xl">
							Fiche commande — {commande.numero_commande}
						</h1>
						{commande.mode_tarification ? (
							<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
								{MODE_TARIFICATION_LABELS[commande.mode_tarification]}
							</span>
						) : null}
					</div>
					<p className="text-xs text-muted-foreground sm:text-sm">
						{nomComplet}
					</p>
				</section>

				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full sm:w-auto justify-center"
					>
						<Link to="/pressing/commandes">Retour aux commandes</Link>
					</Button>
					<RecuDepotButton
						idCommande={commande.id}
						variant="outline"
						size="sm"
						showLabel={true}
					/>
					<DownloadReceiptButton
						sourceType="COMMANDE_PRESSING"
						idClient={commande.id_client ?? null}
						montantTotal={commande.montant_total ?? undefined}
						isPaid={Number(commande.reste_a_payer) === 0}
						variant="outline"
						size="sm"
						showLabel={true}
					/>
					{enAttente && canCreer ? (
						<Button
							size="sm"
							onClick={() => setValiderOuvert(true)}
							className="w-full sm:w-auto justify-center"
						>
							<CheckCheck className="size-4" aria-hidden />
							Valider et chiffrer
						</Button>
					) : null}
					{enAttente && canAnnuler ? (
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setRefuserOuvert(true)}
							className="w-full sm:w-auto justify-center"
						>
							<X className="size-4" aria-hidden />
							Refuser
						</Button>
					) : null}
					{canModifier ? (
						<>
							{commande.statut === "DEPOSE" ? (
								<Button
									variant="outline"
									size="sm"
									disabled={traitementMutation.isPending}
									onClick={() => traitementMutation.mutate(commande.id)}
									className="w-full sm:w-auto justify-center"
								>
									<RefreshCw className="size-4" aria-hidden />
									Passer en traitement
								</Button>
							) : null}
							{commande.statut === "EN_TRAITEMENT" ? (
								<Button
									variant="outline"
									size="sm"
									disabled={pretMutation.isPending}
									onClick={() => pretMutation.mutate(commande.id)}
									className="w-full sm:w-auto justify-center"
								>
									<CheckCheck className="size-4" aria-hidden />
									Passer en « Prêt »
								</Button>
							) : null}
							{!estTerminee && !enAttente ? (
								<Button
									onClick={() => setAModifier(commande)}
									className="w-full sm:w-auto justify-center"
								>
									<Pencil className="size-4" aria-hidden />
									Modifier
								</Button>
							) : null}
						</>
					) : null}
					{canCreer && canFinancesVoir && aUnReste && !estTerminee ? (
						<Button
							disabled={retirerMutation.isPending}
							onClick={() => setRetraitOuvert(true)}
							className="w-full sm:w-auto justify-center"
						>
							<HandCoins className="size-4" aria-hidden />
							Retirer
						</Button>
					) : null}
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne label="Client" valeur={nomComplet} />
					<Ligne label="Téléphone" valeur={commande.client_tel ?? "—"} />
					<Ligne
						label="Date de dépôt"
						valeur={formatDateHeureUTC(commande.date_depot)}
					/>
					<Ligne
						label="Retrait prévu"
						valeur={commande.date_retrait_prevue ?? "—"}
					/>
					<Ligne
						label="Retrait réel"
						valeur={
							commande.date_retrait_reelle
								? formatDateHeureUTC(commande.date_retrait_reelle)
								: "—"
						}
					/>
					<Ligne
						label="Montant total"
						valeur={formatMontantFCFA(commande.montant_total)}
					/>
					<Ligne label="Acompte" valeur={formatMontantFCFA(commande.acompte)} />
					<Ligne
						label="Reste à payer"
						valeur={formatMontantFCFA(commande.reste_a_payer)}
					/>
					<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
						<dt className="text-muted-foreground">Statut</dt>
						<dd>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
									PRESSING_STATUT_BADGE[commande.statut],
								)}
							>
								{PRESSING_STATUT_LABELS[commande.statut]}
							</span>
						</dd>
					</div>
				</dl>
			</section>

			{commande.statut === "ANNULEE" && commande.motif_annulation ? (
				<section className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">
						Motif du refus : {commande.motif_annulation}
					</p>
				</section>
			) : null}

			{enAttente ? (
				<section className="rounded-lg border border-border bg-accent/30 p-4 text-sm text-muted-foreground">
					Demande de dépôt déclarée via le portail résident — montants non
					encore chiffrés. « Valider et chiffrer » passe la demande en « Déposé
					».
				</section>
			) : null}

			<section className="space-y-3">
				<h2 className="text-base font-semibold text-foreground">Articles</h2>
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									TYPE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									QTÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									PRESTATION
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									{commande.mode_tarification === "POIDS"
										? "POIDS (KG)"
										: "TARIF"}
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									TOTAL
								</th>
							</tr>
						</thead>
						<tbody>
							{commande.lignes.map((ligne) => (
								<tr key={ligne.id} className="border-t border-border">
									<td className="px-4 py-3 text-foreground">
										{ligne.type_vetement}
									</td>
									<td className="px-4 py-3 text-foreground">
										{ligne.quantite}
									</td>
									<td className="px-4 py-3 text-foreground">
										{ligne.prestation}
									</td>
									<td className="px-4 py-3 text-foreground">
										{commande.mode_tarification === "POIDS"
											? (ligne.poids_kg ?? "—")
											: formatMontantFCFA(ligne.tarif)}
									</td>
									<td className="px-4 py-3 text-right text-foreground">
										{formatMontantFCFA(ligne.total)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<CommandeFormDialog
				open={aModifier !== null}
				commande={aModifier}
				lignesInitiales={commande.lignes}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAModifier(null);
				}}
				onSaved={() => setAModifier(null)}
			/>

			<RetirerCommandeDialog
				open={retraitOuvert}
				commande={commande}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setRetraitOuvert(false);
				}}
				onSaved={() => setRetraitOuvert(false)}
			/>

			<ValiderDemandeDialog
				open={validerOuvert}
				commande={enAttente ? commande : null}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setValiderOuvert(false);
				}}
				onSaved={() => setValiderOuvert(false)}
			/>

			<ConfirmDialog
				open={refuserOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setRefuserOuvert(false);
				}}
				title="Refuser la demande"
				message={`Refuser la demande ${commande.numero_commande} ? Elle sera annulée définitivement.`}
				confirmLabel="Refuser"
				cancelLabel="Conserver"
				destructive
				busy={annulerMutation.isPending}
				onConfirm={() =>
					annulerMutation.mutate(commande.id, {
						onSuccess: () => setRefuserOuvert(false),
					})
				}
			/>
		</div>
	);
}
