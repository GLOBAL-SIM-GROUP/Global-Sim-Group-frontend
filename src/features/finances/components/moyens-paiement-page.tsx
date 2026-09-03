import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, Power, PowerOff } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useCreerMoyenPaiement,
	useModifierMoyenPaiement,
	useMoyensPaiement,
} from "../hooks/use-finances";

/** Modale « Ajouter un moyen de paiement ». */
function MoyenPaiementFormDialog({
	open,
	onOpenChange,
	onSaved,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const createMutation = useCreerMoyenPaiement();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: { libelle: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.libelle.trim()) fields.libelle = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await createMutation.mutateAsync({ libelle: value.libelle.trim() });
				onSaved();
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						(toApiError(error).message || "Une erreur est survenue."),
				);
			}
		},
	});
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter un moyen de paiement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Mode de règlement proposé lors des encaissements.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="libelle">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Libellé"
									placeholder="ex : Mobile Money"
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
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? (
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

/**
 * Page « Moyens de paiement » (module Finances, M8) : modes de règlement
 * disponibles, Ajouter / Activer / Désactiver.
 */
export function MoyensPaiementPage() {
	const canCreer = useCan("FINANCES.CREER");
	const canModifier = useCan("FINANCES.MODIFIER");
	const canVoir = useCan("FINANCES.VOIR");
	const moyensQuery = useMoyensPaiement();
	const toggleMutation = useModifierMoyenPaiement();
	const [formOuvert, setFormOuvert] = useState(false);

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux moyens de paiement.
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Moyens de paiement" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Moyens de paiement
					</h1>
					<p className="text-muted-foreground">
						Modes de règlement proposés lors des encaissements.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter un moyen de paiement
					</Button>
				) : null}
			</div>

			{moyensQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : moyensQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les moyens de paiement.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void moyensQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (moyensQuery.data ?? []).length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun moyen de paiement trouvé.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ACTIF
								</th>
								{canModifier ? (
									<th scope="col" className="px-4 py-3 text-right font-medium">
										ACTIONS
									</th>
								) : null}
							</tr>
						</thead>
						<tbody>
							{(moyensQuery.data ?? []).map((moyen) => (
								<tr
									key={moyen.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{moyen.libelle}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												moyen.actif
													? "bg-[#27AE60] text-white"
													: "bg-[#95A5A6] text-white",
											)}
										>
											{moyen.actif ? "Actif" : "Inactif"}
										</span>
									</td>
									{canModifier ? (
										<td className="px-4 py-3">
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													title={moyen.actif ? "Désactiver" : "Activer"}
													onClick={() =>
														toggleMutation.mutate({
															id: moyen.id,
															libelle: moyen.libelle,
															actif: !moyen.actif,
														})
													}
												>
													{moyen.actif ? (
														<PowerOff className="size-4" aria-hidden />
													) : (
														<Power className="size-4" aria-hidden />
													)}
													<span className="sr-only">
														{moyen.actif ? "Désactiver" : "Activer"}
													</span>
												</Button>
											</div>
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<MoyenPaiementFormDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>
		</div>
	);
}
