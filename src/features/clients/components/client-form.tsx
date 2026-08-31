import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
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
import { cn } from "#/lib/utils";

import { listClients } from "../api/clients";
import { useCreerClient, useModifierClient } from "../hooks/use-clients";
import type { Client, TypeClient } from "../models/clients";
import { nomComplet, TYPE_CLIENT_LABELS } from "../models/clients";

const TYPES: TypeClient[] = ["AUTRE"];

interface ClientFormProps {
	/** Client à modifier (mode édition) ; null = création. */
	client: Client | null;
	/**
	 * Type imposé à la création (« Ajouter un locataire » vs « Ajouter un
	 * client ») : le sélecteur de type est alors masqué, implicite au contexte
	 * d'origine. Ignoré en édition (le type reste modifiable comme avant).
	 */
	typeClientCree?: TypeClient;
	onCancel: () => void;
	/**
	 * Appelé après un enregistrement réussi avec l'id (et le nom complet) du
	 * client — création ou édition. La réponse du POST n'a pas de schéma
	 * garanti : si elle n'expose pas `id_client`, on relance une recherche par
	 * nom + prénoms et on prend le premier résultat (jamais d'id inventé).
	 */
	onSaved: (id?: string, label?: string) => void;
}

/**
 * Formulaire « Ajouter / Modifier un client » (3.1) : informations
 * personnelles, coordonnées et type de client. En création, le type est
 * imposé par le contexte d'origine (`typeClientCree`) plutôt que choisi dans
 * le formulaire. Dialog-agnostique : `ClientFormDialog` l'affiche en modale,
 * `ClientRechercheField` peut l'embarquer inline (création d'un locataire
 * depuis un autre formulaire, ex. contrat de location).
 */
export function ClientForm({
	client,
	typeClientCree,
	onCancel,
	onSaved,
}: ClientFormProps) {
	const createMutation = useCreerClient();
	const editMutation = useModifierClient();
	const [globalError, setGlobalError] = useState<string | null>(null);

	/** Type imposé par le contexte d'origine : sélecteur masqué (implicite). */
	const typeVerrouille = !client && Boolean(typeClientCree);

	const form = useForm({
		defaultValues: {
			nom: client?.nom ?? "",
			prenoms: client?.prenoms ?? "",
			typeClient: client?.type_client ?? typeClientCree ?? "",
			dateNaissance: client?.date_naissance ?? "",
			lieuNaissance: client?.lieu_naissance ?? "",
			sexe: client?.sexe ?? "",
			nationalite: client?.nationalite ?? "",
			profession: client?.profession ?? "",
			telPrincipal: client?.tel_principal ?? "",
			telSecondaire: client?.tel_secondaire ?? "",
			email: client?.email ?? "",
			adresse: client?.adresse ?? "",
			ville: client?.ville ?? "",
			pays: client?.pays ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.prenoms.trim()) fields.prenoms = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				if (!value.typeClient) fields.typeClient = "Sélectionnez un type.";
				if (!value.dateNaissance) fields.dateNaissance = "Ce champ est requis.";
				if (!value.lieuNaissance.trim())
					fields.lieuNaissance = "Ce champ est requis.";
				if (!value.sexe) fields.sexe = "Sélectionnez une option.";
				if (!value.nationalite.trim())
					fields.nationalite = "Ce champ est requis.";
				if (!value.profession.trim())
					fields.profession = "Ce champ est requis.";
				if (!value.telSecondaire.trim())
					fields.telSecondaire = "Ce champ est requis.";
				if (!value.email.trim()) fields.email = "Ce champ est requis.";
				if (!value.adresse.trim()) fields.adresse = "Ce champ est requis.";
				if (!value.ville.trim()) fields.ville = "Ce champ est requis.";
				if (!value.pays.trim()) fields.pays = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					nom: value.nom.trim(),
					prenoms: value.prenoms.trim(),
					telPrincipal: value.telPrincipal.trim(),
					typeClient: value.typeClient as TypeClient,
					dateNaissance: value.dateNaissance || null,
					lieuNaissance: value.lieuNaissance.trim() || null,
					sexe: value.sexe || null,
					nationalite: value.nationalite.trim() || null,
					profession: value.profession.trim() || null,
					telSecondaire: value.telSecondaire.trim() || null,
					email: value.email.trim() || null,
					adresse: value.adresse.trim() || null,
					ville: value.ville.trim() || null,
					pays: value.pays.trim() || null,
				};
				if (client) {
					await editMutation.mutateAsync({ id: client.id, ...corps });
					onSaved(client.id, `${corps.prenoms} ${corps.nom}`.trim());
					return;
				}
				const resultat = await createMutation.mutateAsync(corps);
				const idDirect = (resultat as { id_client?: string } | undefined)
					?.id_client;
				const label = `${corps.nom} ${corps.prenoms}`.trim();
				if (idDirect) {
					onSaved(idDirect, label);
					return;
				}
				const trouves = await listClients({ search: label });
				const premier = trouves[0];
				if (premier) {
					onSaved(premier.id, nomComplet(premier));
				} else {
					setGlobalError(
						"Client créé mais introuvable — relancez la recherche.",
					);
				}
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			}
		},
	});

	return (
		<form
			className="space-y-4"
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
				<form.Field name="prenoms">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prénom(s)"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<div
				className={cn(
					"grid gap-4",
					typeVerrouille ? "grid-cols-1" : "grid-cols-2",
				)}
			>
				{!typeVerrouille ? (
					<form.Field name="typeClient">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Type de client</Label>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger
										id={field.name}
										aria-label="Type de client"
										className="w-full"
									>
										<SelectValue placeholder="Sélectionner" />
									</SelectTrigger>
									<SelectContent>
										{TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{TYPE_CLIENT_LABELS[type]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors[0] ? (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>
				) : null}
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
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="dateNaissance">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Date de naissance</Label>
							<Input
								id={field.name}
								name={field.name}
								type="date"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							{field.state.meta.errors[0] ? (
								<p className="text-xs text-destructive">
									{field.state.meta.errors[0]}
								</p>
							) : null}
						</div>
					)}
				</form.Field>
				<form.Field name="lieuNaissance">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Lieu de naissance"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="sexe">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Sexe</Label>
							<Select
								value={field.state.value}
								onValueChange={field.handleChange}
							>
								<SelectTrigger
									id={field.name}
									aria-label="Sexe"
									className="w-full"
								>
									<SelectValue placeholder="—" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="M">Masculin</SelectItem>
									<SelectItem value="F">Féminin</SelectItem>
									<SelectItem value="AUTRE">Autre</SelectItem>
								</SelectContent>
							</Select>
							{field.state.meta.errors[0] ? (
								<p className="text-xs text-destructive">
									{field.state.meta.errors[0]}
								</p>
							) : null}
						</div>
					)}
				</form.Field>
				<form.Field name="nationalite">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Nationalité"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="profession">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Profession / activité"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="telSecondaire">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Téléphone secondaire"
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
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="adresse">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Adresse habituelle"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
				<div className="grid grid-cols-2 gap-4">
					<form.Field name="ville">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Ville"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
					<form.Field name="pays">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Pays"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
				</div>
			</div>

			{globalError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{globalError}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Annuler
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending || editMutation.isPending}
				>
					{createMutation.isPending || editMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					Enregistrer
				</Button>
			</div>
		</form>
	);
}
