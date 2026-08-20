import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { Loader2, Pencil, Phone, Plus, UserRound } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { formatDateISO } from "#/features/residence/models/format";

import {
	useClient,
	useCreerContact,
	useCreerPiece,
} from "../hooks/use-clients";
import {
	nomComplet,
	SEXE_LABELS,
	TYPE_CLIENT_LABELS,
	TYPE_PIECE_LABELS,
} from "../models/clients";
import { ClientFormDialog } from "./client-form-dialog";

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[10rem_1fr] sm:gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground break-words">{valeur}</dd>
		</div>
	);
}

/** Modale « Ajouter un contact d'urgence » (3.2). */
function ContactDialog({
	idClient,
	onOpenChange,
}: {
	idClient: string;
	onOpenChange: (open: boolean) => void;
}) {
	const creerMutation = useCreerContact();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			nom: "",
			prenom: "",
			lien: "",
			telPrincipal: "",
			telSecondaire: "",
			adresse: "",
			email: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.lien.trim()) fields.lien = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await creerMutation.mutateAsync({
					idClient,
					nom: value.nom.trim(),
					lien: value.lien.trim(),
					telPrincipal: value.telPrincipal.trim(),
					prenom: value.prenom.trim() || null,
					telSecondaire: value.telSecondaire.trim() || null,
					adresse: value.adresse.trim() || null,
					email: value.email.trim() || null,
				});
				onOpenChange(false);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			}
		},
	});
	return (
		<Dialog.Root open onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter un contact d'urgence
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Personne à contacter en cas de besoin.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="nom">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Nom"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="prenom">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Prénom"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>
						<form.Field name="lien">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Lien avec le locataire"
									placeholder="ex : Frère, Conjoint…"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="telPrincipal">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Téléphone principal"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="telSecondaire">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Deuxième numéro"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>
						<form.Field name="adresse">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Adresse"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<form.Field name="email">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Adresse e-mail"
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						{globalError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{globalError}
							</p>
						) : null}
						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={creerMutation.isPending}>
								{creerMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Enregistrer
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** Modale « Ajouter une pièce d'identité » (3.1). */
function PieceDialog({
	idClient,
	onOpenChange,
}: {
	idClient: string;
	onOpenChange: (open: boolean) => void;
}) {
	const creerMutation = useCreerPiece();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			typePiece: "CNI",
			numero: "",
			dateDelivrance: "",
			dateExpiration: "",
			autoriteDelivrance: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.numero.trim()) fields.numero = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await creerMutation.mutateAsync({
					idClient,
					typePiece: value.typePiece,
					numero: value.numero.trim(),
					dateDelivrance: value.dateDelivrance || null,
					dateExpiration: value.dateExpiration || null,
					autoriteDelivrance: value.autoriteDelivrance.trim() || null,
				});
				onOpenChange(false);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			}
		},
	});
	return (
		<Dialog.Root open onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter une pièce d'identité
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Pièce fournie par le client.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="typePiece">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Type de pièce</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Type de pièce"
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(TYPE_PIECE_LABELS).map(
												([valeur, libelle]) => (
													<SelectItem key={valeur} value={valeur}>
														{libelle}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>
						<form.Field name="numero">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Numéro de la pièce"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="dateDelivrance">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Délivrance</Label>
										<input
											id={field.name}
											name={field.name}
											type="date"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</div>
								)}
							</form.Field>
							<form.Field name="dateExpiration">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Expiration</Label>
										<input
											id={field.name}
											name={field.name}
											type="date"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</div>
								)}
							</form.Field>
						</div>
						<form.Field name="autoriteDelivrance">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Autorité de délivrance"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						{globalError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{globalError}
							</p>
						) : null}
						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={creerMutation.isPending}>
								{creerMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Enregistrer
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

interface ClientFichePageProps {
	/** Id du client (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche client » (3.1/3.2) : informations personnelles, coordonnées,
 * pièces d'identité et contacts d'urgence.
 */
export function ClientFichePage({ id }: ClientFichePageProps) {
	const canModifier = useCan("CLIENT.MODIFIER");
	const clientQuery = useClient(id);
	const [formOuvert, setFormOuvert] = useState(false);
	const [contactOuvert, setContactOuvert] = useState(false);
	const [pieceOuverte, setPieceOuverte] = useState(false);

	if (clientQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (clientQuery.isError || !clientQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Fiche client</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Client introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/client/clients">Retour à la liste des clients</Link>
					</Button>
				</div>
			</div>
		);
	}

	const client = clientQuery.data;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Locataires et clients", to: "/client/clients" },
					{ label: nomComplet(client) },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche client — {nomComplet(client)}
					</h1>
					<p className="text-muted-foreground">
						{TYPE_CLIENT_LABELS[client.type_client]} ·{" "}
						{client.profession ?? "profession non renseignée"}.
					</p>
				</section>
				<div className="flex items-center gap-2">
					{canModifier ? (
						<Button variant="outline" onClick={() => setFormOuvert(true)}>
							<Pencil className="size-4" aria-hidden />
							Modifier
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<Link to="/client/clients">Retour</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
				<section className="space-y-2 rounded-lg border border-border bg-card p-3 sm:p-5 shadow-sm">
					<h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
						<UserRound className="size-4 sm:size-5 text-lagoon" aria-hidden />
						Informations personnelles
					</h2>
					<dl className="grid gap-2 sm:gap-4 sm:grid-cols-2">
						<Ligne label="Nom" valeur={client.nom} />
						<Ligne label="Prénom(s)" valeur={client.prenoms} />
						<Ligne
							label="Date de naissance"
							valeur={formatDateISO(client.date_naissance)}
						/>
						<Ligne
							label="Lieu de naissance"
							valeur={client.lieu_naissance ?? "—"}
						/>
						<Ligne
							label="Sexe"
							valeur={
								client.sexe ? (SEXE_LABELS[client.sexe] ?? client.sexe) : "—"
							}
						/>
						<Ligne label="Nationalité" valeur={client.nationalite ?? "—"} />
						<Ligne label="Profession" valeur={client.profession ?? "—"} />
						<Ligne
							label="Type de client"
							valeur={TYPE_CLIENT_LABELS[client.type_client]}
						/>
					</dl>
				</section>

				<section className="space-y-2 rounded-lg border border-border bg-card p-3 sm:p-5 shadow-sm">
					<h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
						<Phone className="size-4 sm:size-5 text-lagoon" aria-hidden />
						Coordonnées
					</h2>
					<dl className="grid gap-2 sm:gap-4 sm:grid-cols-2">
						<Ligne label="Téléphone principal" valeur={client.tel_principal} />
						<Ligne
							label="Téléphone secondaire"
							valeur={client.tel_secondaire ?? "—"}
						/>
						<Ligne label="Adresse e-mail" valeur={client.email ?? "—"} />
						<Ligne label="Ville" valeur={client.ville ?? "—"} />
						<Ligne label="Adresse" valeur={client.adresse ?? "—"} />
						<Ligne label="Pays" valeur={client.pays ?? "—"} />
					</dl>
				</section>
			</div>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-foreground">
						Pièces d'identité
					</h2>
					{canModifier ? (
						<Button size="sm" onClick={() => setPieceOuverte(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter une pièce
						</Button>
					) : null}
				</div>
				{client.pieces.length === 0 ? (
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucune pièce enregistrée.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										TYPE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										NUMÉRO
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										DÉLIVRANCE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										EXPIRATION
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										AUTORITÉ
									</th>
								</tr>
							</thead>
							<tbody>
								{client.pieces.map((piece) => (
									<tr
										key={piece.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{TYPE_PIECE_LABELS[piece.type_piece] ?? piece.type_piece}
										</td>
										<td className="px-4 py-3 text-foreground">
											{piece.numero}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateISO(piece.date_delivrance)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateISO(piece.date_expiration)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{piece.autorite_delivrance ?? "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-foreground">
						Contacts d'urgence
					</h2>
					{canModifier ? (
						<Button size="sm" onClick={() => setContactOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter un contact
						</Button>
					) : null}
				</div>
				{client.contacts.length === 0 ? (
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucun contact d'urgence enregistré.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										CONTACT
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										LIEN
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										TÉLÉPHONE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										E-MAIL
									</th>
								</tr>
							</thead>
							<tbody>
								{client.contacts.map((contact) => (
									<tr
										key={contact.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{[contact.prenom, contact.nom]
												.filter(Boolean)
												.join(" ") || contact.nom}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{contact.lien}
										</td>
										<td className="px-4 py-3 text-foreground">
											{contact.tel_principal}
											{contact.tel_secondaire
												? ` · ${contact.tel_secondaire}`
												: ""}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{contact.email ?? "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<ClientFormDialog
				open={formOuvert}
				client={client}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			{contactOuvert ? (
				<ContactDialog idClient={client.id} onOpenChange={setContactOuvert} />
			) : null}

			{pieceOuverte ? (
				<PieceDialog idClient={client.id} onOpenChange={setPieceOuverte} />
			) : null}
		</div>
	);
}
