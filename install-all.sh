#!/bin/bash
set -e

echo "Installing all Lattice packages..."

PACKAGES=(
  "@oyinlola141/lattice-core"
  "@oyinlola141/lattice-errors"
  "@oyinlola141/lattice-types"
  "@oyinlola141/lattice-constants"
  "@oyinlola141/lattice-config"
  "@oyinlola141/lattice-logger"
  "@oyinlola141/lattice-crypto"
  "@oyinlola141/lattice-container"
  "@oyinlola141/lattice-events"
  "@oyinlola141/lattice-messaging"
  "@oyinlola141/lattice-middleware"
  "@oyinlola141/lattice-validation"
  "@oyinlola141/lattice-schema"
  "@oyinlola141/lattice-serialization"
  "@oyinlola141/lattice-cqrs"
  "@oyinlola141/lattice-database"
  "@oyinlola141/lattice-auth"
  "@oyinlola141/lattice-http"
  "@oyinlola141/lattice-cache"
  "@oyinlola141/lattice-queue"
  "@oyinlola141/lattice-tenancy"
  "@oyinlola141/lattice-permissions"
  "@oyinlola141/lattice-feature-flags"
  "@oyinlola141/lattice-lifecycle"
  "@oyinlola141/lattice-observability"
  "@oyinlola141/lattice-security"
  "@oyinlola141/lattice-transactions"
  "@oyinlola141/lattice-storage"
  "@oyinlola141/lattice-adapters"
  "@oyinlola141/lattice-api"
  "@oyinlola141/lattice-cli"
  "@oyinlola141/lattice-docs"
  "@oyinlola141/lattice-openapi"
  "@oyinlola141/lattice-plugins"
  "@oyinlola141/lattice-rpc"
  "@oyinlola141/lattice-runtime"
  "@oyinlola141/lattice-scheduler"
  "@oyinlola141/lattice-testing"
)

for pkg in "${PACKAGES[@]}"; do
  echo "Installing $pkg..."
  npm install "$pkg"
done

echo ""
echo "All Lattice packages installed!"
