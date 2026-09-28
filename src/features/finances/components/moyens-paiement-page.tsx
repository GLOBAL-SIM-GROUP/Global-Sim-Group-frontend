import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, Power, PowerOff } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { InputField } from "#/components/ui/input-field";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Ajouter un moyen de paiement</DialogTitle>
				<DialogDescription>
					Mode de règlement proposé lors des encaissements.
				</DialogDescription>
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
			</DialogContent>
		</Dialog>
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Moyens de paiement" },
				]}
				title="Moyens de paiement"
				description="Modes de règlement proposés lors des encaissements."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter un moyen de paiement
						</Button>
					) : undefined
				}
			/>

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
				<EmptyState title="Aucun moyen de paiement trouvé." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>LIBELLÉ</Th>
								<Th>ACTIF</Th>
								{canModifier ? <Th className="text-right">ACTIONS</Th> : null}
							</tr>
						</DataTableHead>
						<tbody>
							{(moyensQuery.data ?? []).map((moyen) => (
								<Tr key={moyen.id}>
									<Td className="font-medium text-foreground">
										{moyen.libelle}
									</Td>
									<Td>
										<Badge variant={moyen.actif ? "success" : "neutral"}>
											{moyen.actif ? "Actif" : "Inactif"}
										</Badge>
									</Td>
									{canModifier ? (
										<Td>
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
										</Td>
									) : null}
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
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
