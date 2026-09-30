import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Dialogue modale partagé (wrapper Radix) — design system « Concierge ».
 * Standardise overlay, centrage, rayon `rounded-lg`, paddings et animation
 * d'entrée pour les ~85 boîtes de dialogue du projet qui reproduisaient ce
 * markup à la main (cf. `docs.global-sim-group.com/frontend/design-system/` § Modales).
 *
 * Usage :
 *   <Dialog open={…} onOpenChange={…}>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>…</DialogTitle>
 *         <DialogDescription>…</DialogDescription>
 *       </DialogHeader>
 *       …contenu…
 *       <DialogFooter>…boutons…</DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 motion-safe:animate-in motion-safe:fade-in-0" />
			<DialogPrimitive.Content
				className={cn(
					"fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg",
					"motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
					className,
				)}
				{...props}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}

function DialogHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex flex-col space-y-1.5 text-left", className)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={cn("text-base font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
