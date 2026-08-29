import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { InputField } from "#/components/ui/input-field";
import { requirePermissions } from "#/core/auth";
import { useCreerSignalement } from "#/features/signalements/hooks/use-signalements";

export const Route = createFileRoute("/_authenticated/signalements/creer")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "SIGNALEMENT.CREER");
	},
	component: CreerSignalementPage,
});

function CreerSignalementPage() {
	const navigate = useNavigate();
	const [titre, setTitre] = useState("");
	const [description, setDescription] = useState("");
	const [globalError, setGlobalError] = useState<string | null>(null);

	const { mutate: creer, isPending } = useCreerSignalement();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!titre.trim() || !description.trim()) {
			setGlobalError("Tous les champs sont requis");
			return;
		}
		creer(
			{ titre: titre.trim(), description: description.trim() },
			{
				onSuccess: () => navigate({ to: "/signalements" }),
				onError: (error) => {
					setGlobalError("Erreur lors de la création du signalement");
					console.error(error);
				},
			},
		);
	};

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Signalements", to: "/signalements" },
					{ label: "Nouveau signalement" },
				]}
			/>

			<div>
				<h1 className="text-2xl font-semibold text-foreground">
					Nouveau signalement
				</h1>
				<p className="mt-1 text-muted-foreground">
					Décrivez le problème ou le signalement.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Créer un signalement</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<InputField
							label="Titre"
							placeholder="Résumé du problème"
							value={titre}
							onChange={(e) => {
								setTitre(e.target.value);
								setGlobalError(null);
							}}
							required
						/>

						<div>
							<label
								htmlFor="signalement-description"
								className="text-sm font-medium text-foreground block mb-2"
							>
								Description
							</label>
							<textarea
								id="signalement-description"
								className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Décrivez le problème en détail"
								value={description}
								onChange={(e) => {
									setDescription(e.target.value);
									setGlobalError(null);
								}}
								required
							/>
						</div>

						{globalError && (
							<div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
								{globalError}
							</div>
						)}

						<div className="flex gap-3 pt-4">
							<Button type="submit" disabled={isPending}>
								{isPending ? (
									<>
										<Loader2 className="size-4 mr-2 animate-spin" />
										Création en cours…
									</>
								) : (
									"Créer le signalement"
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate({ to: "/signalements" })}
								disabled={isPending}
							>
								Annuler
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
