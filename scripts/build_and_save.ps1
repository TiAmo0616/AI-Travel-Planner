<#
Build backend/frontend images and export them to tar files under ./dist

Usage (PowerShell):
  .\scripts\build_and_save.ps1 -RepositoryOwner yourdockeruser

Generated artifacts:
  ./dist/ai-travel-backend.tar
  ./dist/ai-travel-frontend.tar
#>

param(
  [string]$RepositoryOwner = 'yourdockeruser',
  [string]$Tag = 'latest'
)

set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

New-Item -ItemType Directory -Path dist -Force | Out-Null

Write-Host "Building backend image..."
docker build -t $("$RepositoryOwner/ai-travel-backend:$Tag") -f backend/app/Dockerfile backend/app

Write-Host "Building frontend image... (may take a while)"
docker build -t $("$RepositoryOwner/ai-travel-frontend:$Tag") frontend

Write-Host "Saving images to ./dist/..."
docker save -o dist/ai-travel-backend.tar $("$RepositoryOwner/ai-travel-backend:$Tag")
docker save -o dist/ai-travel-frontend.tar $("$RepositoryOwner/ai-travel-frontend:$Tag")

Write-Host "Artifacts written to: $(Resolve-Path dist)"

Pop-Location
