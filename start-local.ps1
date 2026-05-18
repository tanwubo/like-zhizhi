[CmdletBinding()]
param(
    [switch]$FirstRun,
    [switch]$WithDocker,
    [switch]$Seed,
    [switch]$Migrate,
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$Message)
    Write-Host "WARN: $Message" -ForegroundColor Yellow
}

function Assert-Command {
    param(
        [string]$Name,
        [string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing command '$Name'. $InstallHint"
    }
}

function Invoke-External {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [string[]]$Arguments = @()
    )

    Write-Host "> $FilePath $($Arguments -join ' ')" -ForegroundColor DarkGray
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
    }
}

function Get-PnpmCommand {
    if (Get-Command corepack -ErrorAction SilentlyContinue) {
        return @{
            FilePath = "corepack"
            Prefix = @("pnpm")
        }
    }

    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        return @{
            FilePath = "pnpm"
            Prefix = @()
        }
    }

    throw "Missing pnpm. Install Node.js with Corepack, then run 'corepack enable'."
}

function Invoke-Pnpm {
    param([string[]]$Arguments)

    $allArgs = @($script:Pnpm.Prefix) + $Arguments
    Invoke-External -FilePath $script:Pnpm.FilePath -Arguments $allArgs
}

function Test-PortInUse {
    param([int]$TargetPort)

    $connection = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    return $null -ne $connection
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Step "Local startup mode"
if ($FirstRun) {
    Write-Host "Mode: first run"
} else {
    Write-Host "Mode: restart"
}
Write-Host "Port: $Port"

Write-Step "Checking tools"
Assert-Command -Name "node" -InstallHint "Install Node.js 22 LTS for this project."
$nodeVersion = (& node --version).Trim()
Write-Host "Node: $nodeVersion"
if ($nodeVersion -match '^v(\d+)\.') {
    $nodeMajor = [int]$Matches[1]
    if ($nodeMajor -ne 22) {
        Write-Warn "Project docs recommend Node.js 22. Current version is $nodeVersion."
    }
}

$script:Pnpm = Get-PnpmCommand
Write-Host "Package manager: $($script:Pnpm.FilePath) $($script:Pnpm.Prefix -join ' ')"

if ($WithDocker) {
    Write-Step "Starting Docker dependencies"
    Assert-Command -Name "docker" -InstallHint "Install Docker Desktop or remove -WithDocker."
    Invoke-External -FilePath "docker" -Arguments @("compose", "up", "-d", "postgres", "minio")
} else {
    Write-Step "Skipping Docker dependencies"
    Write-Host "Use -WithDocker to start PostgreSQL and MinIO from docker-compose.yml."
}

Write-Step "Checking environment file"
if (-not (Test-Path ".env")) {
    if (-not (Test-Path ".env.example")) {
        throw "Missing .env and .env.example."
    }

    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example."
} else {
    Write-Host ".env exists."
}

Write-Step "Checking dependencies"
if ($FirstRun) {
    Invoke-Pnpm -Arguments @("install")
} elseif (-not (Test-Path "node_modules")) {
    throw "node_modules is missing. Run '.\start-local.ps1 -FirstRun' first."
} else {
    Write-Host "node_modules exists. Skipping install for restart mode."
}

if ($FirstRun -or $Migrate) {
    Write-Step "Preparing database client and schema"
    Invoke-Pnpm -Arguments @("db:generate")
    Invoke-Pnpm -Arguments @("db:migrate")
} else {
    Write-Step "Skipping database migration"
    Write-Host "Use -Migrate to run Prisma migration during restart."
}

if ($Seed) {
    Write-Step "Seeding database"
    Invoke-Pnpm -Arguments @("db:seed")
} else {
    Write-Step "Skipping database seed"
    Write-Host "Use -Seed to run prisma/seed.ts."
}

Write-Step "Checking web port"
if (Test-PortInUse -TargetPort $Port) {
    throw "Port $Port is already in use. Stop the existing process or choose another port with -Port."
}

Write-Step "Starting Next.js development server"
Write-Host "Open http://localhost:$Port"
Invoke-Pnpm -Arguments @("dev", "--", "-p", "$Port")
