import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Primitives de tableau — design system « Concierge ». Uniformisent les ~66
 * tableaux du back-office : coque avec défilement horizontal, en-tête
 * `bg-muted` discret (remplace l'ancien `bg-sea-ink` plein pot), lignes
 * `border-t` avec survol `accent`. Voir `docs.global-sim-group.com/frontend/design-system/` § Tableaux.
 *
 *   <TableShell>
 *     <DataTable>
 *       <DataTableHead><tr><Th>…</Th></tr></DataTableHead>
 *       <tbody><Tr><Td>…</Td></Tr></tbody>
 *     </DataTable>
 *   </TableShell>
 */

/** Coque : bordure, rayon, défilement horizontal, ombre légère. */
export function TableShell({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"overflow-x-auto rounded-lg border border-border bg-card shadow-sm",
				className,
			)}
			{...props}
		/>
	);
}

export function DataTable({
	className,
	...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
	return (
		<table
			className={cn("w-full border-collapse text-sm", className)}
			{...props}
		/>
	);
}

/** En-tête : fond `muted` discret, texte secondaire — pas de navy plein. */
export function DataTableHead({
	className,
	...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
	return (
		<thead
			className={cn("bg-muted/60 text-left text-muted-foreground", className)}
			{...props}
		/>
	);
}

export function Th({
	className,
	...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			scope="col"
			className={cn(
				"px-4 py-3 text-xs font-semibold uppercase tracking-wide",
				className,
			)}
			{...props}
		/>
	);
}

/** Ligne : bordure haute + survol ; `relative` permet le stretched link. */
export function Tr({
	className,
	...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr
			className={cn(
				"relative border-t border-border transition-colors hover:bg-accent/40",
				className,
			)}
			{...props}
		/>
	);
}

export function Td({
	className,
	...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
	return <td className={cn("px-4 py-3", className)} {...props} />;
}
