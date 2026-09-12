# Compile le guide Pressing en 3 passages (table des matières + renvois).
# Usage : .\build-guide.ps1   (à lancer depuis le dossier docs/guides-utilisation/pressing)
$tex = "pressing.tex"

Write-Host "==> Passage 1/3"
pdflatex -interaction=nonstopmode -halt-on-error $tex *> $null
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du passage 1 (code $LASTEXITCODE)"; exit 1 }

Write-Host "==> Passage 2/3"
pdflatex -interaction=nonstopmode -halt-on-error $tex *> $null
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du passage 2 (code $LASTEXITCODE)"; exit 1 }

Write-Host "==> Passage 3/3"
pdflatex -interaction=nonstopmode -halt-on-error $tex *> $null
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du passage 3 (code $LASTEXITCODE)"; exit 1 }

Write-Host "==> Termine : pressing.pdf est a jour."
