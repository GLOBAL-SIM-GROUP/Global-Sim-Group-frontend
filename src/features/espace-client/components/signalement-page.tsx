import { useForm } from "@tanstack/react-form";
import { Flag, MapPin } from "lucide-react";
import { Toast } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";

import { enregistrerDemande } from "../models/demandes";

type SignalementField = "sujet" | "description";

const CHAMPS_REQUIS: SignalementField[] = ["sujet", "description"];

const LABELS_CHAMPS: Record<SignalementField, string> = {
	sujet: "Le sujet",
	description: "La description",
};

/**
 * Signalement (espace client) — même logique que `SalleFetePage` : aucun
 * endpoint accessible à un compte CLIENT n'existe pour les signalements (le
 * module `features/signalements` est staff-only). Le formulaire ne soumet
 * donc rien au backend — confirmation locale, trace dans « Mes demandes »
 * et désactivation après un envoi.
 */
export function SignalementPage() {
	const [envoye, setEnvoye] = useState(false);
	const [toastOuvert, setToastOuvert] = useState(false);

	const form = useForm({
		defaultValues: {
			sujet: "",
			lieu: "",
			description: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<SignalementField, string>> = {};
				for (const champ of CHAMPS_REQUIS) {
					if (!value[champ].trim()) {
						fields[champ] = `${LABELS_CHAMPS[champ]} est requis.`;
					}
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			enregistrerDemande({
				service: "signalement",
				resume: value.lieu.trim()
					? `${value.sujet} — ${value.lieu.trim()}`
					: value.sujet,
				observations: value.description.trim() || undefined,
			});
			setEnvoye(true);
			setToastOuvert(true);
		},
	});

	return (
		<Toast.Provider swipeDirection="right">
			<div className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Signaler un problème
					</h1>
					<p className="text-sm text-muted-foreground">
						Décrivez le problème rencontré dans nos locaux ou services — nos
						équipes vous répondront pour le traiter.
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
					<form.Field name="sujet">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Sujet"
								placeholder="Fuite d'eau, climatiseur en panne, bruit…"
								icon={<Flag className="size-4" aria-hidden />}
								value={field.state.value}
								disabled={envoye}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>

					<form.Field name="lieu">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Lieu (optionnel)"
								placeholder="Restaurant, chambre 12, hall…"
								icon={<MapPin className="size-4" aria-hidden />}
								value={field.state.value}
								disabled={envoye}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						)}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Description</Label>
								<Textarea
									id={field.name}
									name={field.name}
									placeholder="Décrivez le problème et depuis quand vous l'avez remarqué…"
									value={field.state.value}
									disabled={envoye}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{field.state.meta.errors[0] ? (
									<p className="text-sm text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
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
								{envoye ? "Signalement envoyé" : "Envoyer mon signalement"}
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
					Signalement enregistré
				</Toast.Title>
				<Toast.Description className="text-sm text-muted-foreground">
					Nos équipes vous répondront prochainement pour traiter votre
					signalement.
				</Toast.Description>
			</Toast.Root>
			<Toast.Viewport />
		</Toast.Provider>
	);
}
