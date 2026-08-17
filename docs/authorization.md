# Autorisation (permissions)

## Modèle réel du backend

Permissions au format **`<MODULE>.<VERBE>`** avec exactement :

- 12 préfixes : `RESIDENCE PRESSING RESTAURANT SALLE_FETE FACTURATION FINANCES
  RH CLIENT MARCHANDISE ADMIN AUDIT CORE`
- 4 verbes : `VOIR`, `CREER`, `MODIFIER`, `SUPPRIMER`

Le frontend les déclare en dur dans `src/core/permissions/types.ts`
(`PermissionCode` = union des combinaisons) — **source** : réponse réelle de
`GET /auth/me` (smoke test 2026-08-17, compte `admin`).

> ⚠️ Écart avec `prompt-adapted.md` §9 : le spec décrit 13 modules (dont
> `MARKET`) et 3 verbes « sans DELETE ». Le backend déployé renvoie en réalité
> 12 modules (pas de `MARKET`) et un 4e verbe `SUPPRIMER`. La réponse réelle de
> `/me` fait foi — mettre à jour `types.ts` **et** `permissions.test.ts` si le
> seeding évolue.

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
