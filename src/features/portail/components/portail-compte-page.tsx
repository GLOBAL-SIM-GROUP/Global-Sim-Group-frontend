import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	BedDouble,
	CalendarDays,
	ClipboardList,
	KeyRound,
	Loader2,
	ShieldCheck,
	ShoppingCart,
} from "lucide-react";
import { useState } from "react";

import { PhotoProfilEditable } from "#/components/avatar-profil";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { PageHeader } from "#/components/ui/page-header";
import { authApi, toApiError } from "#/core/api";
import { useMonCompte } from "#/core/api/hooks/use-mon-compte";
import { useCurrentUser } from "#/core/auth";
import { servicesDuCompte } from "#/core/permissions";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { usePortailResume } from "../hooks/use-portail";

/** Ligne lecture seule (même gabarit que `portail-page.tsx`). */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

const lienRaccourciClassName =
	"group flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md";

function Raccourci({
	to,
	icon: Icon,
	titre,
	description,
}: {
	to: string;
	icon: typeof CalendarDays;
	titre: string;
	description: string;
}) {
	return (
		<Link to={to as never} className={lienRaccourciClassName}>
			<Icon className="size-5 shrink-0 text-lagoon" aria-hidden />
			<div className="min-w-0">
				<p className="text-sm font-semibold text-foreground">{titre}</p>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
		</Link>
	);
}

/**
 * « Mon compte » du portail, partagé entre l'espace résident
 * (`/residence/portail/compte`, `variant="resident"`), l'espace client
 * (`/espace-client/mon-compte`, `variant="client"`) et l'espace staff
 * (`/mon-compte`, `variant="staff"`) : informations réellement exposées à la
 * personne — `/auth/me` + `GET /auth/mon-compte` (login, nom, email, photo
 * de profil éditable, dossier, services accessibles) + changement de mot
 * de passe.
 *
 * La variante résidente ajoute le bloc locatif via
 * `GET /residence/portail/resume` (nom du titulaire, contrat et logement en
 * cours) + les raccourcis « Mes échéances » / « Ma caution » ; la variante
 * cliente n'appelle pas ce endpoint (403 `RESIDENT.VOIR`) et montre les
 * raccourcis « Mes demandes » / « Mon panier » ; la variante staff n'appelle
 * pas non plus le résumé et ne montre pas de raccourcis.
 *
 * Pas d'endpoint « changer mon mot de passe connecté » : le seul mécanisme
 * self-service est `POST /auth/mot-de-passe-oublie` — le bouton envoie
 * donc l'email de réinitialisation à l'adresse associée au compte ; le lien
 * mène à `/reinitialiser-mot-de-passe` (route publique) et le succès révoque
 * toutes les sessions, y compris celle en cours.
 *
 * La page reste utile si le résumé portail échoue : identité et mot de passe
 * viennent de `/auth/me`, seule la carte logement disparaît.
 */
export function PortailComptePage({
	variant = "resident",
}: {
	variant?: "resident" | "client" | "staff";
}) {
	const estClient = variant === "client";
	const estResident = variant === "resident";
	const user = useCurrentUser();
	const profilQuery = useMonCompte();
	const resumeQuery = usePortailResume(estResident);
	const [envoye, setEnvoye] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	const reinitialiser = useMutation({
		mutationFn: () => authApi.motDePasseOublie({ login: user?.login ?? "" }),
		onSuccess: () => {
			setErreur(null);
			setEnvoye(true);
		},
		onError: (error) => {
			setErreur(
				toApiError(error).message ||
					"Impossible d'envoyer l'email de réinitialisation.",
			);
		},
	});

	const client = resumeQuery.data?.client;
	const contrat = resumeQuery.data?.contrat_en_cours;
	const services = servicesDuCompte(user?.permissions ?? []);
	const profil = profilQuery.data;
	const nomProfil = [profil?.prenom, profil?.nom].filter(Boolean).join(" ");
	const nomComplet =
		estResident && client
			? `${client.prenoms} ${client.nom}`
			: nomProfil || (user?.login ?? "—");
	const sousTitre = estClient
		? "Compte client"
		: estResident
			? "Compte résident"
			: (profil?.role.libelle ?? "Compte utilisateur");

	return (
		<div
			className={
				estClient ? "w-full space-y-6 pt-6 pb-16" : "w-full space-y-6 p-6"
			}
		>
			<PageHeader
				breadcrumb={
					estClient
						? [
								{ label: "Espace client", to: "/espace-client" },
								{ label: "Mon compte" },
							]
						: estResident
							? [
									{ label: "Accueil", to: "/" },
									{
										label: "Mon espace résident",
										to: "/residence/portail",
									},
									{ label: "Mon compte" },
								]
							: [{ label: "Accueil", to: "/" }, { label: "Mon compte" }]
				}
				title="Mon compte"
				description="Vos informations de compte GLOBAL SIM GROUP."
			/>

			<div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-6">
				<PhotoProfilEditable />
				<div className="min-w-0 space-y-0.5">
					<p className="truncate text-lg font-semibold text-foreground">
						{nomComplet}
					</p>
					<p className="text-sm text-muted-foreground">
						{sousTitre}
						{user?.idClient ? ` · dossier n° ${user.idClient}` : ""}
					</p>
					<p className="text-xs text-muted-foreground">
						Identifiant : {user?.login ?? "—"}
						{profil?.email ? ` · ${profil.email}` : ""}
					</p>
				</div>
			</div>

			{estResident && contrat ? (
				<section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
					<h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
						<BedDouble className="size-4 text-lagoon" aria-hidden />
						Votre logement
					</h2>
					<dl className="grid gap-3 lg:grid-cols-2">
						<Ligne
							label="Logement"
							valeur={`${contrat.logement.numero} — ${contrat.logement.nom} (bât. ${contrat.logement.batiment})`}
						/>
						<Ligne label="Contrat" valeur={contrat.numero_contrat} />
						<Ligne
							label="Loyer"
							valeur={formatMontantFCFA(contrat.montant_loyer)}
						/>
						<Ligne label="Périodicité" valeur={contrat.periodicite ?? "—"} />
						<Ligne label="Début" valeur={formatDateISO(contrat.date_debut)} />
						<Ligne
							label="Fin prévue"
							valeur={formatDateISO(contrat.date_fin_prevue)}
						/>
					</dl>
				</section>
			) : null}

			{services.length > 0 ? (
				<section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
					<h2 className="text-sm font-semibold text-foreground">
						Services accessibles avec votre compte
					</h2>
					<div className="flex flex-wrap gap-2">
						{services.map((service) => (
							<Badge key={service} variant="neutral">
								{service}
							</Badge>
						))}
					</div>
				</section>
			) : null}

			<section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
				<h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
					<KeyRound className="size-4 text-lagoon" aria-hidden />
					Mot de passe
				</h2>
				{envoye ? (
					<output className="block rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">
						Un email de réinitialisation a été envoyé à l'adresse associée à
						votre compte. Suivez le lien pour définir un nouveau mot de passe —
						votre session actuelle sera fermée.
					</output>
				) : (
					<>
						<p className="text-sm text-muted-foreground">
							Un lien de réinitialisation sera envoyé à l'adresse email associée
							à votre compte.
						</p>
						{erreur ? (
							<p role="alert" className="text-sm text-destructive">
								{erreur}
							</p>
						) : null}
						<Button
							type="button"
							variant="outline"
							className="rounded-full"
							disabled={reinitialiser.isPending || !user?.login}
							onClick={() => reinitialiser.mutate()}
						>
							{reinitialiser.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{reinitialiser.isPending ? "Envoi…" : "Modifier mon mot de passe"}
						</Button>
					</>
				)}
			</section>

			{estResident || estClient ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{estClient ? (
						<>
							<Raccourci
								to="/espace-client/mes-demandes"
								icon={ClipboardList}
								titre="Mes demandes"
								description="Suivi de vos demandes et dépôts pressing"
							/>
							<Raccourci
								to="/espace-client/panier"
								icon={ShoppingCart}
								titre="Mon panier"
								description="Articles restaurant et boutique en attente"
							/>
						</>
					) : (
						<>
							<Raccourci
								to="/residence/portail/echeances"
								icon={CalendarDays}
								titre="Mes échéances"
								description="Suivi de vos loyers, dus et payés"
							/>
							<Raccourci
								to="/residence/portail/caution"
								icon={ShieldCheck}
								titre="Ma caution"
								description="Montant versé et statut de restitution"
							/>
						</>
					)}
				</div>
			) : null}

			<p className="text-sm text-muted-foreground">
				Pour modifier vos coordonnées, contactez la réception :{" "}
				<a
					href="mailto:maitresim4@gmail.com"
					className="font-medium text-lagoon hover:underline"
				>
					maitresim4@gmail.com
				</a>
				.
			</p>
		</div>
	);
}
