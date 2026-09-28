#!/usr/bin/env bash
# Compile les 16 guides utilisateur (3 passages pdflatex chacun).
set -u
ROOT="docs/guides-utilisation"
declare -a GUIDES=(
  "residence.tex|$ROOT"
  "abonnements.tex|$ROOT/abonnements"
  "accueil-tableau-de-bord.tex|$ROOT/accueil-dashboard"
  "administration.tex|$ROOT/administration"
  "clients.tex|$ROOT/clients"
  "espace-client.tex|$ROOT/espace-client"
  "facturation.tex|$ROOT/facturation"
  "finances.tex|$ROOT/finances"
  "marchandise.tex|$ROOT/marchandise"
  "portail-resident.tex|$ROOT/portail-resident"
  "pressing.tex|$ROOT/pressing"
  "rapports.tex|$ROOT/rapports"
  "restaurant.tex|$ROOT/restaurant"
  "rh.tex|$ROOT/rh"
  "salle-fete.tex|$ROOT/salle-fete"
  "signalements.tex|$ROOT/signalements"
)
FAIL=0
for entry in "${GUIDES[@]}"; do
  tex="${entry%%|*}"
  dir="${entry##*|}"
  name="${tex%.tex}"
  echo "===== $name ====="
  ok=1
  for pass in 1 2 3; do
    (cd "$dir" && pdflatex -interaction=nonstopmode -halt-on-error "$tex" > "compile-p$pass.log" 2>&1)
    if [ $? -ne 0 ]; then
      echo "  !! ECHEC passage $pass — voir $dir/compile-p$pass.log"
      ok=0
      FAIL=1
      break
    fi
  done
  if [ $ok -eq 1 ]; then
    pdf="$dir/$name.pdf"
    if [ -f "$pdf" ]; then
      echo "  OK -> $pdf ($(du -h "$pdf" | cut -f1))"
    else
      echo "  !! PDF absent malgré exit 0"
      FAIL=1
    fi
  fi
done
echo "===== FIN (FAIL=$FAIL) ====="
exit $FAIL
