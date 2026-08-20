import { KeyRound, Pencil, Plus, Power, PowerOff } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";
import { formatDateHeureISO } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import { useRoles } from "../hooks/use-roles";
import {
	useModifierUtilisateur,
	useReinitialiserMotDePasse,
	useUtilisateurs,
} from "../hooks/use-utilisateurs";
import type { Utilisateur } from "../models/utilisateurs";
import {
	filtrerUtilisateurs,
	nomComplet,
	paginerUtilisateurs,
} from "../models/utilisateurs";
import { UTILISATEURS_PAGE_SIZE } from "../permissions";
import { UtilisateurFormDialog } from "./utilisateur-form-dialog";

/** Filtres/pagination reflétés dans l'URL. */
export interface UtilisateursSearch {
	search?: string;
	role?: string;
	statut?: string;
	page?: number;
}

interface UtilisateursPageProps {
	initialSearch: UtilisateursSearch;
	onSearchChange: (
		maj: (prev: UtilisateursSearch) => UtilisateursSearch,
	) => void;
}

/** Modale « Réinitialiser le mot de passe ». */
function ReinitialiserMdpDialog({
	utilisateur,
	onOpenChange,
}: {
	utilisateur: Utilisateur | null;
	onOpenChange: (open: boolean) => void;
}) {
	const resetMutation = useReinitialiserMotDePasse();
	const [motDePasse, setMotDePasse] = useState("");
	const [erreur, setErreur] = useState(false);

	const confirmer = () => {
		if (!utilisateur) return;
		if (motDePasse.trim().length < 6) {
			setErreur(true);
			return;
		}
		setErreur(false);
		resetMutation.mutate(
			{ id: utilisateur.id, motDePasse },
			{ onSettled: () => onOpenChange(false) },
		);
	};

	return (
		<Dialog.Root open={utilisateur !== null} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Réinitialiser le mot de passe
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Compte {utilisateur?.login ?? ""} — le nouveau mot de passe est
						appliqué immédiatement.
					</Dialog.Description>
					<div className="mt-4 space-y-4">
						<InputField
							id="nouveau-mdp"
							label="Nouveau mot de passe"
							type="password"
							value={motDePasse}
							onChange={(event) => setMotDePasse(event.target.value)}
							error={
								erreur
									? "Le mot de passe doit contenir au moins 6 caractères."
									: undefined
							}
						/>
						{resetMutation.isError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								Impossible de réinitialiser le mot de passe.
							</p>
						) : null}
						<div className="flex items-center justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button
								type="button"
								onClick={confirmer}
								disabled={resetMutation.isPending}
							>
								Réinitialiser
							</Button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/**
 * Page « Utilisateurs » (M11, 12.1) : comptes, rôle, dernière connexion,
 * statut, Ajouter / Modifier / Réinitialiser / Désactiver-Activer.
 */
export function UtilisateursPage({
	initialSearch,
	onSearchChange,
}: UtilisateursPageProps) {
	const canCreer = useCan("ADMIN.CREER");
	const canModifier = useCan("ADMIN.MODIFIER");

	const [search, setSearch] = useState(initialSearch.search ?? "");
	const [role, setRole] = useState(initialSearch.role ?? "tous");
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Utilisateur | null>(null);
	const [aReinitialiser, setAReinitialiser] = useState<Utilisateur | null>(
		null,
	);

	const utilisateursQuery = useUtilisateurs({ search });
	const rolesQuery = useRoles();
	const modifierMutation = useModifierUtilisateur();

	const roles = rolesQuery.data ?? [];
	const roleParId = useMemo(
		() => new Map(roles.map((r) => [r.id, r.libelle])),
		[roles],
	);

	const changerFiltre = (patch: {
		search?: string;
		role?: string;
		statut?: string;
	}) => {
		if (patch.search !== undefined) setSearch(patch.search);
		setRole(patch.role ?? role);
		setStatut(patch.statut ?? statut);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const utilisateurs = utilisateursQuery.data ?? [];
	const filtres = filtrerUtilisateurs(utilisateurs, { role, statut });
	const pagination = paginerUtilisateurs(filtres, page, UTILISATEURS_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Utilisateurs" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Utilisateurs
					</h1>
					<p className="text-muted-foreground">
						Comptes d'accès à l'application, rôles et statut.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter un utilisateur
					</Button>
				) : null}
			</div>

			<div className="flex gap-2">
				<div className="flex-1">
					<InputField
						placeholder="Rechercher par login, email, nom…"
						value={search}
						onChange={(e) => changerFiltre({ search: e.target.value })}
					/>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Select
					value={role}
					onValueChange={(valeur) => changerFiltre({ role: valeur })}
				>
					<SelectTrigger aria-label="Rôle" className="w-52">
						<SelectValue placeholder="Rôle" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les rôles</SelectItem>
						{roles.map((r) => (
							<SelectItem key={r.id} value={r.id}>
								{r.libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={statut}
					onValueChange={(valeur) => changerFiltre({ statut: valeur })}
				>
					<SelectTrigger aria-label="Statut" className="w-44">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les statuts</SelectItem>
						<SelectItem value="actifs">Actifs</SelectItem>
						<SelectItem value="inactifs">Inactifs</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{utilisateursQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : utilisateursQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les utilisateurs.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void utilisateursQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun utilisateur trouvé.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									LOGIN
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									EMPLOYÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									RÔLE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DERNIÈRE CONNEXION
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								{canModifier ? (
									<th scope="col" className="px-4 py-3 text-right font-medium">
										ACTIONS
									</th>
								) : null}
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((utilisateur) => (
								<tr
									key={utilisateur.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{utilisateur.login}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{nomComplet(utilisateur)}
									</td>
									<td className="px-4 py-3 text-foreground">
										{utilisateur.id_role
											? (roleParId.get(utilisateur.id_role) ?? "—")
											: "—"}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(utilisateur.dernier_connexion)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												utilisateur.actif
													? "bg-[#27AE60] text-white"
													: "bg-[#95A5A6] text-white",
											)}
										>
											{utilisateur.actif ? "Actif" : "Inactif"}
										</span>
									</td>
									{canModifier ? (
										<td className="px-4 py-3">
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													title="Modifier"
													onClick={() => setAModifier(utilisateur)}
												>
													<Pencil className="size-4" aria-hidden />
													<span className="sr-only">Modifier</span>
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													title="Réinitialiser le mot de passe"
													onClick={() => setAReinitialiser(utilisateur)}
												>
													<KeyRound className="size-4" aria-hidden />
													<span className="sr-only">Réinitialiser</span>
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													title={utilisateur.actif ? "Désactiver" : "Activer"}
													onClick={() =>
														modifierMutation.mutate({
															id: utilisateur.id,
															actif: !utilisateur.actif,
														})
													}
												>
													{utilisateur.actif ? (
														<PowerOff
															className="size-4 text-destructive"
															aria-hidden
														/>
													) : (
														<Power className="size-4 text-lagoon" aria-hidden />
													)}
													<span className="sr-only">
														{utilisateur.actif ? "Désactiver" : "Activer"}
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

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des utilisateurs"
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<p className="text-sm text-muted-foreground">
						Affichage de {pagination.start} à {pagination.end} sur{" "}
						{pagination.total} résultats
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page <= 1}
							onClick={() => allerPage(pagination.page - 1)}
						>
							Précédent
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page >= pagination.totalPages}
							onClick={() => allerPage(pagination.page + 1)}
						>
							Suivant
						</Button>
					</div>
				</nav>
			) : null}

			<UtilisateurFormDialog
				open={formOuvert || aModifier !== null}
				utilisateur={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) {
						setFormOuvert(false);
						setAModifier(null);
					}
				}}
				onSaved={() => {
					setFormOuvert(false);
					setAModifier(null);
				}}
			/>

			<ReinitialiserMdpDialog
				utilisateur={aReinitialiser}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAReinitialiser(null);
				}}
			/>
		</div>
	);
}
