import { useForm } from "@tanstack/react-form";
import { CalendarDays, Clock, PartyPopper, Timer, Users } from "lucide-react";
import { Toast } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";

type SalleFeteField =
	| "typeManifestation"
	| "dateEvenement"
	| "heureDebut"
	| "duree"
	| "nombreInvites";

const CHAMPS_REQUIS: SalleFeteField[] = [
	"typeManifestation",
	"dateEvenement",
	"heureDebut",
	"duree",
	"nombreInvites",
];

const LABELS_CHAMPS: Record<SalleFeteField, string> = {
	typeManifestation: "Le type de manifestation",
	dateEvenement: "La date",
	heureDebut: "L'heure de début",
	duree: "La durée",
	nombreInvites: "Le nombre d'invités",
};

/**
 * Demande de réservation de salle de fête (espace client) — PAS de
 * catalogue/panier comme restaurant/boutique : aucun endpoint accessible à un
 * compte CLIENT n'existe pour la salle de fête (le seul GET renvoie toutes
 * les réservations de tous les clients, jamais exposable côté client ; aucune
 * création possible). Le formulaire ne soumet donc rien au backend — il
 * affiche une confirmation locale et se désactive après un envoi, cf. mémoire
 * `extension-clients-externes`.
 */
export function SalleFetePage() {
	const [envoye, setEnvoye] = useState(false);
	const [toastOuvert, setToastOuvert] = useState(false);

	const form = useForm({
		defaultValues: {
			typeManifestation: "",
			dateEvenement: "",
			heureDebut: "",
			duree: "",
			nombreInvites: "",
			observations: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<SalleFeteField, string>> = {};
				for (const champ of CHAMPS_REQUIS) {
					if (!value[champ].trim()) {
						fields[champ] = `${LABELS_CHAMPS[champ]} est requis.`;
					}
				}
				return { fields };
			},
		},
		onSubmit: async () => {
			// Pas d'appel réseau : aucun endpoint CLIENT n'existe pour la salle de
			// fête (cf. commentaire du composant). Confirmation locale uniquement.
			setEnvoye(true);
			setToastOuvert(true);
		},
	});

	return (
		<Toast.Provider swipeDirection="right">
			<div className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Salle de fête
					</h1>
					<p className="text-sm text-muted-foreground">
						Formulez votre demande de réservation — mariages, cérémonies,
						séminaires. Nos équipes vous répondront pour confirmer la
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
					<form.Field name="typeManifestation">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Type de manifestation"
								placeholder="Mariage, cérémonie, séminaire, anniversaire…"
								icon={<PartyPopper className="size-4" aria-hidden />}
								value={field.state.value}
								disabled={envoye}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<form.Field name="dateEvenement">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									type="date"
									label="Date souhaitée"
									icon={<CalendarDays className="size-4" aria-hidden />}
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="heureDebut">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									type="time"
									label="Heure de début souhaitée"
									icon={<Clock className="size-4" aria-hidden />}
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<form.Field name="duree">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									type="number"
									min={1}
									step={1}
									label="Durée souhaitée (heures)"
									placeholder="4"
									icon={<Timer className="size-4" aria-hidden />}
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="nombreInvites">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									type="number"
									min={1}
									step={1}
									label="Nombre d'invités (approximatif)"
									placeholder="80"
									icon={<Users className="size-4" aria-hidden />}
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
					</div>

					<form.Field name="observations">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Message (optionnel)</Label>
								<Textarea
									id={field.name}
									name={field.name}
									placeholder="Précisez vos besoins (traiteur, sonorisation, décoration…)"
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
					Nos équipes vous répondront prochainement pour confirmer votre
					réservation.
				</Toast.Description>
			</Toast.Root>
			<Toast.Viewport />
		</Toast.Provider>
	);
}
