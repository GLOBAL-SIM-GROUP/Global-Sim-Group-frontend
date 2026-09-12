# Compile le guide Accueil & Tableau de bord en 3 passages (table des matières + renvois).
# Usage : .\build-guide.ps1   (à lancer depuis le dossier docs/guides-utilisation/accueil-dashboard)
$tex = "accueil-tableau-de-bord.tex"

Write-Host "==> Passage 1/3"
pdflatex -interaction=nonstopmode -halt-on-error $tex *> $null
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du passage 1 (code $LASTEXITCODE)"; exit 1 }

Write-Host "==> Passage 2/3"
pdflatex -interaction=nonstopmode -halt-on-error $tex *> $null
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du passage 2 (code $LASTEXITCODE)"; exit 1 }

Write-Host "==> Passage 3/3"
pdflatex -interaction=nonstopmode -halt-on-error $tex *> $null
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du passage 3 (code $LASTEXITCODE)"; exit 1 }

Write-Host "==> Termine : accueil-tableau-de-bord.pdf est a jour."
