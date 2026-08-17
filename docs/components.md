# Composants

## Organisation

```
src/components/
  ui/        composants shadcn/ui générés (button, input, label, select, …)
  layout/    coquille applicative (app-shell, language-selector, logout-button)
```

Les écrans d'une feature vivent dans `features/<module>/components/`
(voir `src/features/README.md`), les composants **génériques et réutilisables**
dans `src/components/`.

## Règles

1. **Ne pas réécrire un composant shadcn** : composer avec les primitives de
   `components/ui` (props `className` via `cn` de `#/lib/utils`).
2. Un composant de layout n'embarque pas de logique métier — il reçoit ses
   données par props ou hooks d'état (`useAuth`, `useLocale`).
3. L'accessibilité est de base : `Label` lié à l'input via `htmlFor`/`id`,
   `aria-label` sur les contrôles icônes, `role="alert"` sur les erreurs
   globales de formulaire.
4. Les textes passent par les messages Paraglide (`m.*`) — jamais en dur.

## Accents (Tailwind)

- Classes utilitaires Tailwind 4 + variables CSS de shadcn (`.border`, `bg-card`,
  `text-muted-foreground`, `text-destructive`, …) définies dans `styles.css`.
- Éviter les couleurs hexadécimales en dur : utiliser les tokens du thème.

## À ne pas faire

- ❌ Copier/coller un composant shadcn pour le modifier à la volée dans une feature.
- ❌ Générer un composant « fourre-tout » (props `any`, toutes responsabilités).
- ❌ Afficher des données sans état de chargement/erreur (patterns Query).
