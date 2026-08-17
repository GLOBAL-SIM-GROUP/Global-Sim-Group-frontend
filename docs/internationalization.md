# Internationalisation (Paraglide)

## Modèle

- **Paraglide 2** (`@inlang/paraglide-js`) compile `messages/{fr,en}.json`
  vers `src/paraglide/` (gitignoré) — via le plugin Vite au build/dev et via
  `npm run i18n:compile` (aussi déclenché par `pretypecheck`).
- Source : **français** (`sourceLanguageTag: "fr"`), traduction : anglais.
- Locale par défaut : `fr`. Locales supportées : `fr`, `en`.

## Utilisation

```tsx
import * as m from '#/paraglide/messages'

m.app_name()                    // "GLOBAL SIM GROUP"
m.auth_login_submit()           // "Se connecter" / "Sign in"
m.error_http_unknown({ status: 500 })  // messages paramétrés {status}
```

La locale courante est lue par `getLocale()` (runtime) au rendu. Le hook
`useLocale()` (`core/i18n`) expose `{ locale, setLocale }` et abonne les
composants via `useSyncExternalStore` : au changement, les composants
re-rendent et réévaluent les messages dans la bonne langue.

## Sélecteur de langue

- **Explicite uniquement** : aucun auto-switch depuis la langue du navigateur.
- La stratégie Paraglide compilée est `globalVariable baseLocale` (pas de
  cookie, pas de `preferredLanguage`, pas de `localStorage` interne).
- Le sélecteur (`components/layout/language-selector.tsx`) persiste la locale
  dans `localStorage["sim.locale"]` (clé distincte de Paraglide) et met à jour
  `<html lang>`.

## Codes d'erreur backend → messages

```ts
// core/i18n/error-messages.ts
getErrorMessageForCode('VALIDATION_ERROR') // message traduit, ou null si inconnu
```

Mapping : `VALIDATION_ERROR`, `UNAUTHORIZED`, `NETWORK_ERROR` → message
Paraglide. Le backend renvoie ses messages en français ; l'UI affiche
**toujours** la traduction courante.

## Formats

- Nombres/montants selon la locale cible, ex. `1 234,56` en français.
- Ne pas concaténer de fragments traduits ; utiliser les paramètres de message
  (`{status}`, `{nom}`) et les pluriels/choix de Paraglide.

## À ne pas faire

- ❌ String en dur dans un composant (tout passe par `m.*`).
- ❌ Appeler `getLocale()`/`setLocale()` de Paraglide hors de `core/i18n`.
- ❌ Détection automatique de la langue du navigateur (décision produit : sélecteur explicite).
- ❌ Traduire en concaténant (`label + " : " + value`) — utiliser un message avec paramètre.
