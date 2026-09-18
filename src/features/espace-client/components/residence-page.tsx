import { useForm } from "@tanstack/react-form";
import { CalendarDays, Users } from "lucide-react";
import { Toast } from "radix-ui";
import { useState } from "react";

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
import { Textarea } from "#/components/ui/textarea";
import {
	LOGEMENT_TYPE_LABELS,
	type LogementType,
} from "#/features/residence/models/logements";

type ResidenceField =
	| "typeLogement"
	| "dateArrivee"
	| "dateDepart"
	| "nombrePersonnes";

const CHAMPS_REQUIS: ResidenceField[] = [
	"typeLogement",
	"dateArrivee",
	"dateDepart",
	"nombrePersonnes",
];

const LABELS_CHAMPS: Record<ResidenceField, string> = {
	typeLogement: "Le type de logement",
	dateArrivee: "La date d'arrivée",
	dateDepart: "La date de départ",
	nombrePersonnes: "Le nombre de personnes",
};

/**
 * Demande de séjour court (espace client) — PAS de catalogue/panier comme
 * restaurant/boutique : aucun endpoint accessible à un compte CLIENT
 * n'existe pour les séjours (`GET /residence/logements` et
 * `POST /residence/sejours` sont staff-only et exigent un `id_logement` que
 * le client ne connaît pas). Le formulaire ne soumet donc rien au backend —
 * il affiche une confirmation locale et se désactive après un envoi, même
 * logique que `SalleFetePage`.
 */
export function ResidencePage() {
	const [envoye, setEnvoye] = useState(false);
	const [toastOuvert, setToastOuvert] = useState(false);

	const form = useForm({
		defaultValues: {
			typeLogement: "" as LogementType | "",
			dateArrivee: "",
			dateDepart: "",
			nombrePersonnes: "",
			observations: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<ResidenceField, string>> = {};
				for (const champ of CHAMPS_REQUIS) {
					if (!String(value[champ]).trim()) {
						fields[champ] = `${LABELS_CHAMPS[champ]} est requis.`;
					}
				}
				return { fields };
			},
		},
		onSubmit: async () => {
			// Pas d'appel réseau : aucun endpoint CLIENT n'existe pour les
			// séjours (cf. commentaire du composant). Confirmation locale
			// uniquement.
			setEnvoye(true);
			setToastOuvert(true);
		},
	});

	return (
		<Toast.Provider swipeDirection="right">
			<div className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Résidence — séjours courts
					</h1>
					<p className="text-sm text-muted-foreground">
						Formulez votre demande de séjour — chambre ou studio, pour une nuit
						ou quelques semaines. Nos équipes vous répondront pour confirmer la
						disponibilité et les modalités.
					</p>
				</div>

				<form
					className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="typeLogement">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Type de logement souhaité</Label>
								<Select
									value={field.state.value}
									disabled={envoye}
									onValueChange={(value) =>
										field.handleChange(value as LogementType)
									}
								>
									<SelectTrigger
										id={field.name}
										name={field.name}
										aria-label="Type de logement souhaité"
										className="w-full"
									>
										<SelectValue placeholder="Chambre ou studio" />
									</SelectTrigger>
									<SelectContent>
										{(
											Object.entries(LOGEMENT_TYPE_LABELS) as [
												LogementType,
												string,
											][]
										).map(([type, label]) => (
											<SelectItem key={type} value={type}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors[0] ? (
									<p className="text-sm text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<form.Field name="dateArrivee">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									type="date"
									label="Date d'arrivée souhaitée"
									icon={<CalendarDays className="size-4" aria-hidden />}
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="dateDepart">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									type="date"
									label="Date de départ souhaitée"
									icon={<CalendarDays className="size-4" aria-hidden />}
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
					</div>

					<form.Field name="nombrePersonnes">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								type="number"
								min={1}
								step={1}
								label="Nombre de personnes"
								placeholder="2"
								icon={<Users className="size-4" aria-hidden />}
								value={field.state.value}
								disabled={envoye}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>

					<form.Field name="observations">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Message / observations (optionnel)
								</Label>
								<Textarea
									id={field.name}
									name={field.name}
									placeholder="Précisez vos besoins (étage, équipements, heure d'arrivée…)"
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button
								type="submit"
								disabled={envoye || isSubmitting}
								className="w-full bg-lagoon text-white hover:bg-lagoon/90"
							>
								{envoye ? "Demande envoyée" : "Envoyer ma demande"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</div>

			<Toast.Root
				open={toastOuvert}
				onOpenChange={setToastOuvert}
				duration={4000}
				className="fixed right-6 bottom-6 z-50 rounded-lg border border-border bg-card px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
			>
				<Toast.Title className="text-sm font-semibold text-foreground">
					Demande enregistrée
				</Toast.Title>
				<Toast.Description className="text-sm text-muted-foreground">
					Nos équipes vous répondront prochainement pour confirmer votre séjour.
				</Toast.Description>
			</Toast.Root>
			<Toast.Viewport />
		</Toast.Provider>
	);
}
