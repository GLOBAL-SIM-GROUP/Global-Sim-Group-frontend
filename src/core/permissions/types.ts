/**
 * Codes de permission réels du backend déployé, revalidés au smoke test
 * (2026-08-17 : `GET /auth/me` sur `https://dev.sim.strife-cyber.org` avec le
 * compte `admin` → 48 codes ; 2026-08-20 : le compte `resident` renvoie
 * `RESIDENT.VOIR` → 13 modules). La spec OpenAPI ne les contient pas ; cette
 * union est écrite à la main.
 *
 * ⚠️ Écart avec `prompt-adapted.md` §9 : le spec décrit 13 modules et 3 verbes
 * « sans DELETE », mais le backend réel renvoie **pas de `MARKET`** et
 * **4 verbes** dont `SUPPRIMER`. La réponse réelle de `/api/v1/me` fait foi : si le
 * seeding du backend évolue, mettre à jour cette union **et**
 * `permissions.test.ts`.
 *
 * `DEPENSE` (2026-09-07) : les mutations dépenses/catégories-dépenses ont été
 * détachées du verbe `FINANCES.*` partagé avec les paiements — un caissier
 * garde `FINANCES.CREER` (paiements) mais perd `DEPENSE.CREER`. Seuls
 * ADMINISTRATEUR/DIRIGEANT ont les nouveaux codes. La lecture reste sur
 * `FINANCES.VOIR` (`DEPENSE.VOIR` est accordé en parallèle à qui avait déjà
 * `FINANCES.VOIR`, donc pas de régression de lecture à gérer côté front).
 *
 * `ENCAISSER` (2026-09-13) : 5e verbe, vérifié en direct sur `FINANCES.*`
 * (caissiers) et `RESIDENCE.*` (séjours courts — le caissier résidence a
 * `RESIDENCE.ENCAISSER` sans `RESIDENCE.CREER` : il encaisse mais ne crée pas
 * de séjour, contrairement au réceptionniste qui a `CREER` sans `ENCAISSER`).
 * `RESIDENCE.VALIDER`/`RESIDENCE.ANNULER` (residence 087+088) : validation
 * (chiffrage) et refus des demandes de séjour portail `EN_ATTENTE` —
 * accordés au réceptionniste. `RESIDENCE.DEMANDER` : création/annulation
 * côté client/résident (`/residence/portail/sejours`).
 *
 * `SUPERVISER` (2026-09-27) : existe sur 5 modules (RESIDENCE, RESTAURANT,
 * RH, MARCHANDISE, PRESSING) mais un seul endpoint le vérifie réellement à ce
 * jour — `POST /market/stock/reesolde` (`MARCHANDISE.SUPERVISER`), une
 * fonctionnalité de réconciliation de stock pas encore construite côté
 * frontend. Modélisé pour que le catalogue reste correct, sans UI à gater
 * pour l'instant.
 *
 * `GERER_TARIFS` (2026-09-16) : propre à PRESSING (tarif au kilo). PRESSING a
 * en réalité 9 verbes réels côté backend, tous désormais modélisés et
 * correctement câblés (corrigé le 2026-09-27, vérifié rôle par rôle via
 * `GET /admin/roles/:id/permissions` et les 403 documentés dans `/docs-json`) :
 * `TRAITER` (DEPOSE→EN_TRAITEMENT, `POST .../traitement`) — Opérateur
 * lavage/séchage ; `MARQUER_PRET` (EN_TRAITEMENT→PRET, `POST .../pret`) —
 * Opérateur repassage (verbe **distinct** de `TRAITER`, pas le même
 * opérateur) ; `RETIRER` (encaissement du solde, `POST .../retirer`) —
 * Caissier pressing (a aussi `FINANCES.VOIR`) ; `SUPERVISER` — n'est
 * actuellement vérifié par **aucun** endpoint pressing (seul
 * `POST /market/stock/reesolde` le requiert, sur `MARCHANDISE.SUPERVISER` —
 * fonctionnalité pas encore construite côté frontend) ; `VALIDER` (Contrôleur
 * qualité) — n'est vérifié par **aucun** endpoint pressing à ce jour, un
 * verbe présent au catalogue sans usage backend encore câblé, à ne pas
 * confondre avec `PRESSING.CREER`, qui lui gate réellement
 * `POST .../valider` (validation/chiffrage d'une demande portail
 * `EN_ATTENTE`, malgré son nom). Avant cette correction, le frontend gatait
 * « Passer en traitement »/« Passer en Prêt »/« Retirer » avec les verbes
 * génériques `MODIFIER`/`CREER` : un Opérateur lavage/séchage/repassage ou un
 * Caissier pressing ne voyait alors **aucun** de ces boutons.
 *
 * `COMMANDER`/`DECLARER`/`DEMANDER` (portail résident « demandes », endpoints
 * `/restaurant/portail/commandes`, `/pressing/portail/commandes`,
 * `/salle-fete/portail/reservations`) : verbes propres au compte CLIENT —
 * créer/annuler une commande restaurant (`RESTAURANT.COMMANDER`), déclarer
 * un dépôt pressing (`PRESSING.DECLARER`), demander une réservation de salle
 * de fête (`SALLE_FETE.DEMANDER`).
 *
 * `PORTAIL` (market 085, migration backend 084) : module neutre dont le seul
 * verbe est `PORTAIL.VOIR`, accordé aux rôles RESIDENT **et** CLIENT — il
 * couvre toutes les lectures des portails de service (`GET
 * /restaurant/portail/*`, `/pressing/portail/*`, `/salle-fete/portail/*`,
 * `/market/portail/*`). Le portail « résidence » (`/residence/portail/*` :
 * résumé, échéances, caution…) reste sous `RESIDENT.VOIR` — un CLIENT
 * auto-inscrit n'y a pas accès (pas de contrat).
 *
 * `VALIDER`/`ANNULER` (demandes portail `EN_ATTENTE`, spec OpenAPI live) :
 * validation/chiffrage des demandes résident (`SALLE_FETE.VALIDER` →
 * `POST /salle-fete/reservations/{id}/valider`, `RESTAURANT.VALIDER` →
 * `POST /restaurant/commandes/{id}/statut` EN_ATTENTE→EN_COURS) et refus des
 * demandes pressing (`PRESSING.ANNULER` → `POST /pressing/commandes/{id}/annuler`).
 *
 * Boutique (market 084, contrat convenu — endpoints `/market/portail/ventes`
 * pas encore dans la spec générée) : `MARCHANDISE.COMMANDER` côté résident
 * (créer/annuler une demande), `MARCHANDISE.VALIDER`/`MARCHANDISE.ANNULER`
 * côté staff (validation → `EN_COURS` + décrément stock / refus + motif).
 *
 * `GERER_CATALOGUE` (salle de fête, spec OpenAPI live) : administration des
 * types de manifestation — `POST/PATCH /salle-fete/catalogue/types-manifestation`.
 * La lecture du catalogue reste sur `SALLE_FETE.VOIR`.
 *
 * `ABONNEMENT` (abonnements 089/090) : quotas prépayés pressing/restauration.
 * Verbes propres au module : `VENDRE` (souscrire + encaisser un paiement
 * complémentaire), `AJUSTER` (correction manuelle de quota + résiliation),
 * `DECIDER_RELIQUAT` (reporter/perdre le reliquat d'une souscription
 * expirée). Le catalogue des offres reste sur les verbes génériques
 * (`VOIR`/`CREER`/`MODIFIER`/`SUPPRIMER`).
 *
 * `RAPPORTS` (2026-09-27, vérifié en direct via `GET /admin/permissions` —
 * catalogue complet, 18 modules/94 codes) : module désormais réel et
 * **distinct** d'`ADMIN`, contrairement à ce que supposait tout le code
 * avant cette date (« pas de permission RAPPORTS, suit ADMIN.VOIR »). Seul
 * verbe : `VOIR`. Vérifié rôle par rôle : Administrateur et Dirigeant ont
 * les deux (`ADMIN.VOIR` + `RAPPORTS.VOIR`), mais les 5 rôles
 * Responsable (résidence/magasin/pressing/restaurant/salle de fête) n'ont
 * **que** `RAPPORTS.VOIR`, jamais `ADMIN.VOIR` — gater Rapports/le tableau de
 * bord global sur `ADMIN.VOIR` (l'ancien code partout : routes `/rapports/**`,
 * `/dashboard`, sidebar, accueil, Ctrl-K) leur bloquait entièrement l'accès à
 * leurs propres rapports. Corrigé à cette date pour utiliser `RAPPORTS.VOIR`.
 */
export const MODULES = [
	"RESIDENCE",
	"PRESSING",
	"RESTAURANT",
	"SALLE_FETE",
	"FACTURATION",
	"FINANCES",
	"RH",
	"RESIDENT",
	"CLIENT",
	"MARCHANDISE",
	"ADMIN",
	"AUDIT",
	"CORE",
	"SIGNALEMENT",
	"DEPENSE",
	"PORTAIL",
	"ABONNEMENT",
	"RAPPORTS",
] as const;

export type ModuleCode = (typeof MODULES)[number];

export const PERMISSION_VERBS = [
	"VOIR",
	"CREER",
	"MODIFIER",
	"SUPPRIMER",
	"ENCAISSER",
	"GERER_TARIFS",
	"COMMANDER",
	"DECLARER",
	"DEMANDER",
	"VALIDER",
	"ANNULER",
	"GERER_CATALOGUE",
	"VENDRE",
	"AJUSTER",
	"DECIDER_RELIQUAT",
	"TRAITER",
	"MARQUER_PRET",
	"RETIRER",
	"SUPERVISER",
] as const;

export type PermissionVerb = (typeof PERMISSION_VERBS)[number];

/** Ex. `"RESIDENCE.VOIR"`, `"FINANCES.MODIFIER"`, `"CLIENT.SUPPRIMER"`. */
export type PermissionCode = `${ModuleCode}.${PermissionVerb}`;
