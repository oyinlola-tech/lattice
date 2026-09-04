#!/bin/bash
set -e

echo "Publishing all Zudojs packages to npm..."

PACKAGES=(
  "packages/http"
  "packages/security"
  "packages/transactions"
  "packages/storage"
  "packages/adapters"
  "packages/api"
  "packages/cli"
  "packages/docs"
  "packages/openapi"
  "packages/plugins"
  "packages/rpc"
  "packages/runtime"
  "packages/scheduler"
  "packages/testing"
)

for pkg in "${PACKAGES[@]}"; do
  echo ""
  echo "Publishing $pkg..."
  cd "/home/oyinlola/Desktop/Zudo/$pkg"
  npm publish --access public
done

echo ""
echo "All packages published successfully!"
