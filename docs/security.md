# Sécurité

Règles de sécurité pour le développement frontend. **Le backend reste la
frontière de sécurité** ; le frontend limite la surface d'exploitation.

## Tokens (JWT)

- **Mémoire uniquement** (décision projet) : `createMemoryTokenStore()`. Rien
  de persistant → une session est perdue au reload, mais un script injecté ne
  lit aucun token dans `localStorage`.
- **Jamais loggés** : ni `console.*`, ni transport d'erreur, ni field UI.
- Pas de token dans les URLs, le `.env`, les en-têtes autres que le bearer.

## Accès réseau

- Tout part du wrapper `core/api/http.ts` : pas de `fetch()` brut (uniformité
  du bearer, du refresh, de l'enveloppe d'erreur, du timeout).
- Base URL configurée par `VITE_API_URL` (défaut relatif `/api/v1` ; en dev le
  proxy Vite relaie vers le backend dev). Rien d'autre n'est préfixé par le
  backend dev en production sans validation.

## Permissions

- Le modèle frontend (`core/permissions`) reflète le backend réel — on
  n'invente pas de préfixe/verbe.
- Les guards d'UI (`requirePermissions`, `useCan`) sont du confort, **pas**
  une protection : le backend autorise ou refuse sur chaque endpoint.

## Injection & contenu

- React échappe le texte par défaut. Ne jamais utiliser `dangerouslySetInnerHTML`
  sur du contenu non approuvé (messages backend inclus).
- Ne jamais passer des valeurs utilisateur dans des URLS (requêtes) sans
  encodage — le wrapper utilise des chemins relatifs fixes (aucune
  interpolation de chemin depuis l'utilisateur).

## Dépendances & secrets

- Pas de secret dans le bundle client (tout ce qui est embarqué est public).
- Nouvelles dépendances justifiées et épinglées par le lockfile.

## Devtools / prod

- Les devtools (Router/Query) ne sont montés qu'en `import.meta.env.DEV`
  (retirés aussi par le plugin `@tanstack/devtools-vite` au build).

## À ne pas faire

- ❌ Envoyer les tokens au serveur d'erreurs / au monitoring.
- ❌ `dangerouslySetInnerHTML` sur du contenu backend ou utilisateur.
- ❌ Réduire le stockage mémoire à localStorage sans décision produit validée.
- ❌ Penser que masquer un bouton enlève la permission côté backend.
