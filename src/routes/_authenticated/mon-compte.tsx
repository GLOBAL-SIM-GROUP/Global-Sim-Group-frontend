import { createFileRoute } from "@tanstack/react-router";

import { PortailComptePage } from "#/features/portail/components/portail-compte-page";

/**
 * « Mon compte » des comptes sans espace dédié (staff, comptes hybrides) :
 * même page partagée que le portail résident et l'espace client, variante
 * staff — photo de profil, identité `/auth/mon-compte`, mot de passe.
 * Aucune permission requise : le layout `_authenticated` garantit déjà
 * une session ouverte et le endpoint est self-service.
 */
export const Route = createFileRoute("/_authenticated/mon-compte")({
	component: () => <PortailComptePage variant="staff" />,
});
