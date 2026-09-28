# Autorisation (permissions)

## Modèle réel du backend

Permissions au format **`<MODULE>.<VERBE>`**. Au dernier audit en direct
(`GET /admin/permissions`, catalogue complet — 2026-09-27) : **18 modules,
94 codes**. Ce nombre a déjà changé plusieurs fois depuis le lancement du
projet (12→14→15→17→18 modules) et changera encore — ne jamais le considérer
figé. Modules actuels : `RESIDENCE PRESSING RESTAURANT SALLE_FETE
FACTURATION FINANCES RH RESIDENT CLIENT MARCHANDISE ADMIN AUDIT CORE
SIGNALEMENT DEPENSE PORTAIL ABONNEMENT RAPPORTS`.

Les verbes ne sont plus seulement les 4 génériques (`VOIR`/`CREER`/
`MODIFIER`/`SUPPRIMER`) : plusieurs modules ont des verbes propres, ajoutés au
fil des features backend — `ENCAISSER`, `GERER_TARIFS`, `COMMANDER`,
`DECLARER`, `DEMANDER`, `VALIDER`, `ANNULER`, `GERER_CATALOGUE`, `VENDRE`,
`AJUSTER`, `DECIDER_RELIQUAT`, `DECLARER_TIERS`, et au moins `SUPERVISER`/
`RETIRER`/`TRAITER`/`MARQUER_PRET` (ces 4 derniers existent réellement côté
backend — vus sur PRESSING — mais **ne sont pas encore modélisés** dans
`types.ts` ; le frontend continue d'y gater certaines actions avec les verbes
génériques `MODIFIER`/`CREER`, un écart connu, pas encore corrigé).

Le frontend les déclare en dur dans `src/core/permissions/types.ts`
(`PermissionCode` = union des combinaisons), documentées module par module
avec la date et la méthode de vérification. **Cette union n'est jamais
exhaustive par construction** : un verbe/module absent ne veut pas dire qu'il
n'existe pas côté backend, seulement qu'il n'a pas encore été rencontré et
vérifié. Avant de supposer qu'un module/verbe manque, vérifier en direct :

```bash
# Catalogue complet (tous les codes qui existent)
curl -s https://dev.sim.strife-cyber.org/api/v1/admin/permissions \
  -H "Authorization: Bearer $TOKEN"

# Permissions d'un rôle donné
curl -s https://dev.sim.strife-cyber.org/api/v1/admin/roles/$ID/permissions \
  -H "Authorization: Bearer $TOKEN"
```

> ⚠️ Écart avec `prompt-adapted.md` §9 : le spec décrit 13 modules (dont
> `MARKET`) et 3 verbes « sans DELETE ». `MARKET` n'a toujours aucun préfixe
> de permission ; `SUPPRIMER` existe bien, sur la plupart des modules. La
> réponse réelle du backend fait foi — mettre à jour `types.ts` **et**
> `permissions.test.ts` (et ce document) si le catalogue évolue encore.
>
> ⚠️ **Cas vécu, à retenir** : le module `RAPPORTS` est réel et distinct
> d'`ADMIN` depuis son introduction côté backend, mais tout le frontend
> (5 routes, la sidebar, l'accueil, Ctrl-K, le tableau de bord global) l'a
> gaté sur `ADMIN.VOIR` pendant des semaines sur la foi d'un commentaire
> jamais revérifié (« pas de permission RAPPORTS dédiée »). Conséquence
> réelle : les 5 rôles Responsable (résidence/magasin/pressing/restaurant/
> salle de fête), qui ont `RAPPORTS.VOIR` sans `ADMIN.VOIR`, n'avaient tout
> simplement pas accès à leurs propres rapports. Corrigé le 2026-09-27 après
> vérification via `GET /admin/permissions` + `GET /admin/roles/:id/permissions`
> rôle par rôle. Leçon : un commentaire qui affirme qu'un module/permission
> « n'existe pas côté backend » se périme silencieusement — il documente un
> état constaté à une date, jamais une garantie durable.

## D'où viennent les permissions

L'utilisateur connecté reçoit ses permissions via `GET /auth/me`
(`permissions: string[]`). Elles sont stockées dans la snapshot de session
(`useAuth().user.permissions`).

## Usage

```ts
// hooks (core/auth/hooks.ts)
const user = useCurrentUser()          // AuthMeResponse | null
const permissions = usePermissions()   // string[]
const canVoir = useCan('FINANCES.VOIR')

// guards de route (core/auth/guards.ts)
beforeLoad: ({ context }) => {
  requirePermissions(context.auth, 'FINANCES.VOIR', 'FINANCES.MODIFIER')
}

// helpers purs (core/permissions)
hasPermission(permissions, 'RH.CREER')
hasAnyPermission(permissions, 'RH.CREER', 'RH.MODIFIER')
hasAllPermissions(permissions, 'RH.VOIR', 'RH.MODIFIER')
```

## Règle de sécurité

**Le frontend n'est pas une frontière de sécurité.** Les permissions côté
client ne sont qu'un confort d'UI (afficher/masquer, pré-rediriger). Le
backend applique réellement les permissions sur chaque endpoint. Ne jamais
faire confiance aux permissions du client pour protéger une donnée.

## À ne pas faire

- ❌ Inventer un préfixe (`SALLE_FETE` et `SALLEFETE` sont distincts) ou un
  verbe (`DELETE`, `EXPORTER`…) qui n'existe pas côté backend.
- ❌ Coder une page « en dur » sans gate, en supposant que seul le backend
  protège — l'UI doit refléter le modèle (masquer ce qui est interdit).
- ❌ Cacher des données sensibles en se reposant uniquement sur `useCan()` :
  la réponse réseau est la seule source de vérité.
