import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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

import { rechercherClients } from "../api/clients";
import { useCreerClient } from "../hooks/use-clients";
import { nomComplet } from "../models/clients";

type TypeClient = "LOCATAIRE" | "PASSAGE" | "AUTRE";

const TYPE_CLIENT_LABELS: Record<TypeClient, string> = {
	LOCATAIRE: "Locataire",
	PASSAGE: "Passage",
	AUTRE: "Autre",
};

interface CreerClientInlineFormProps {
	/** Appelé avec l'id et le nom complet du client créé/trouvé. */
	onSaved: (id: string, label: string) => void;
	onCancel: () => void;
}

/** Champ Select avec label visible (le contenu s'ouvre en portal). */
function SelectField({
	id,
	label,
	value,
	onValueChange,
	children,
}: {
	id: string;
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} aria-label={label} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}

/**
 * Création inline d'un client (base unique) quand la recherche ne donne rien.
 * La réponse du POST n'a pas de schéma : si elle n'expose pas `id_client`, on
 * relance la recherche serveur par nom + prénoms et on sélectionne le premier
 * résultat — la réponse est `unknown`, jamais inventée.
 */
export function CreerClientInlineForm({
	onSaved,
	onCancel,
}: CreerClientInlineFormProps) {
	const createMutation = useCreerClient();
	const [globalError, setGlobalError] = useState<string | null>(null);

	// ═══ DEBUG création client ═══
	// Détecte un VRAI rechargement de page : au montage, on compare le type de
	// navigation et la présence du marqueur posé pendant la soumission.
	useEffect(() => {
		const nav = performance.getEntriesByType("navigation")[0] as
			| PerformanceNavigationTiming
			| undefined;
		console.log(
			"[DEBUG-client] formulaire inline monté — type de navigation:",
			nav?.type,
		);
		if (sessionStorage.getItem("sim-debug-client-en-cours") === "1") {
			console.warn(
				"[DEBUG-client] ⚠️ La page a été RE-CHARGÉE pendant la création du client.",
			);
			sessionStorage.removeItem("sim-debug-client-en-cours");
		}
		const onBeforeUnload = () => {
			if (sessionStorage.getItem("sim-debug-client-en-cours") === "1") {
				console.warn(
					"[DEBUG-client] ⚠️ Déchargement de la page pendant la création client — href =",
					window.location.href,
				);
			}
		};
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, []);
	// ═══ fin DEBUG ═══

	const form = useForm({
		defaultValues: {
			nom: "",
			prenoms: "",
			telPrincipal: "",
			typeClient: "LOCATAIRE" as TypeClient,
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			console.log(
				"[DEBUG-client] 2. mutation création client lancée, payload =",
				{
					nom: value.nom.trim(),
					prenoms: value.prenoms.trim(),
					telPrincipal: value.telPrincipal.trim(),
					typeClient: value.typeClient,
				},
			);
			// Marqueur : si la page se recharge pendant la création, le useEffect
			// ci-dessus le détectera au prochain montage.
			sessionStorage.setItem("sim-debug-client-en-cours", "1");
			try {
				const resultat = await createMutation.mutateAsync({
					nom: value.nom.trim(),
					prenoms: value.prenoms.trim(),
					telPrincipal: value.telPrincipal.trim(),
					typeClient: value.typeClient,
				});
				console.log(
					"[DEBUG-client] 3. création client RÉUSSIE, réponse =",
					resultat,
				);
				const idDirect = (resultat as { id_client?: string } | undefined)
					?.id_client;
				if (idDirect) {
					onSaved(
						idDirect,
						`${value.nom.trim()} ${value.prenoms.trim()}`.trim(),
					);
					return;
				}
				// Réponse sans id : re-recherche par nom + prénoms, premier résultat.
				const trouves = await rechercherClients(
					`${value.nom.trim()} ${value.prenoms.trim()}`.trim(),
				);
				const premier = trouves[0];
				if (premier) {
					onSaved(premier.id, nomComplet(premier));
				} else {
					setGlobalError(
						"Client créé mais introuvable — relancez la recherche.",
					);
				}
			} catch (error) {
				console.error("[DEBUG-client] 3. création client ÉCHOUÉE :", error);
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			} finally {
				sessionStorage.removeItem("sim-debug-client-en-cours");
			}
		},
	});

	return (
		<div className="space-y-3 rounded-md border border-border bg-accent/30 p-3">
			<p className="text-sm font-medium text-foreground">Nouveau client</p>
			{/* ⚠️ Pas de `<form>` ici : il serait IMBRIQUÉ dans le `<form>` parent
			    (interdit par le standard HTML) — le navigateur l'ignore lors du rendu
			    SSR et le bouton « Créer » déclencherait une soumission native (GET) →
			    rechargement avec les champs dans l'URL, session perdue. Le bouton
			    appelle `form.handleSubmit()` directement ; Entrée dans un champ
			    soumet aussi. */}
			<div className="space-y-3">
				<form.Field name="nom">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Nom"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									void form.handleSubmit();
								}
							}}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="prenoms">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prénoms"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									void form.handleSubmit();
								}
							}}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="telPrincipal">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Téléphone"
							placeholder="ex : +2250700000000"
							inputMode="tel"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									void form.handleSubmit();
								}
							}}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="typeClient">
					{(field) => (
						<SelectField
							id={field.name}
							label="Type de client"
							value={field.state.value}
							onValueChange={(valeur) =>
								field.handleChange(valeur as TypeClient)
							}
						>
							{(Object.keys(TYPE_CLIENT_LABELS) as TypeClient[]).map((type) => (
								<SelectItem key={type} value={type}>
									{TYPE_CLIENT_LABELS[type]}
								</SelectItem>
							))}
						</SelectField>
					)}
				</form.Field>

				{globalError ? (
					<p role="alert" className="text-sm font-medium text-destructive">
						{globalError}
					</p>
				) : null}

				<div className="flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={createMutation.isPending}
						onClick={onCancel}
					>
						Annuler
					</Button>
					<Button
						type="button"
						size="sm"
						disabled={createMutation.isPending}
						onClick={() => void form.handleSubmit()}
					>
						{createMutation.isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						{createMutation.isPending ? "Création…" : "Créer"}
					</Button>
				</div>
			</div>
		</div>
	);
}
