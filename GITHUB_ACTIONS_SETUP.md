# Configuration GitHub Actions — déploiement VPS

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) a deux jobs :

| Job | Runner | Quand | Rôle |
| --- | --- | --- | --- |
| `ci` | `ubuntu-latest` (GitHub) | chaque PR, push sur `main`, lancement manuel | `npm ci`, `npm run check`, `npm test`, `npm run build` |
| `deploy` | self-hosted **GSG-Frontend** (`[self-hosted, linux, x64, gsg-frontend]`) | push sur `main` / lancement manuel, après un `ci` vert | met à jour le clone sur le VPS et reconstruit le conteneur de production |

Aucun SSH ni secret GitHub n'est nécessaire : le runner tourne directement sur
le VPS de production (`vmi3533714`, utilisateur `deploy`, membre du groupe
`docker`, pas de sudo sans mot de passe).

## Ce que fait `deploy`

1. `actions/checkout` du commit validé par `ci` dans le workspace du runner.
2. `docker compose -p globalsimgroup -f /home/deploy/apps/GlobalSimGroup/docker-compose.yml -f <override> up -d --build frontend`
   — l'override remplace seulement `build.context` par le checkout du runner ;
   le reste (conteneur `sim-frontend`, labels Traefik `global-sim-group.com`,
   réseau `traefik-net`, `.env` avec API_URL/DOMAIN) vient du compose de prod.
   Le clone manuel `GlobalSimGroup/Global-Sim-Group-frontend/` n'est plus
   utilisé (ses objets git appartiennent à root, `deploy` ne peut pas le mettre à jour).
3. Health check : `wget http://127.0.0.1:3000/` dans le conteneur (60 s max,
   logs affichés en cas d'échec).
4. `docker image prune -f` (images orphelines uniquement).

Les volumes Docker ne sont **jamais** supprimés : le VPS héberge aussi la base
de production (`sim-postgres-prod`), le backend et Traefik.

## Prérequis sur le VPS

- Runner GSG-Frontend en ligne (Settings → Actions → Runners), avec le label `gsg-frontend`.
- `/home/deploy/apps/GlobalSimGroup/` contient `docker-compose.yml` et `.env`.
- Réseau externe `traefik-net` existant.

## Dépannage

- **Job `deploy` bloqué en « Queued »** : le runner est hors ligne — sur le VPS,
  `cd ~/actions-runner-frontend && sudo ./svc.sh status` (puis `start`).
- **Health check en échec** : lire les logs affichés par le job, ou
  `docker logs sim-frontend`.
- **Rollback** : relancer un ancien run du workflow (« Re-run jobs ») — il
  redéploie son propre commit.
