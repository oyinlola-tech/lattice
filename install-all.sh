#!/bin/bash
set -e

echo "Installing all Zudo packages..."

PACKAGES=(
  "@zudo/core"
  "@zudo/errors"
  "@zudo/types"
  "@zudo/constants"
  "@zudo/config"
  "@zudo/logger"
  "@zudo/crypto"
  "@zudo/container"
  "@zudo/events"
  "@zudo/messaging"
  "@zudo/middleware"
  "@zudo/validation"
  "@zudo/schema"
  "@zudo/serialization"
  "@zudo/cqrs"
  "@zudo/database"
  "@zudo/auth"
  "@zudo/http"
  "@zudo/cache"
  "@zudo/queue"
  "@zudo/tenancy"
  "@zudo/permissions"
  "@zudo/feature-flags"
  "@zudo/lifecycle"
  "@zudo/observability"
  "@zudo/security"
  "@zudo/transactions"
  "@zudo/storage"
  "@zudo/adapters"
  "@zudo/api"
  "@zudo/cli"
  "@zudo/docs"
  "@zudo/openapi"
  "@zudo/plugins"
  "@zudo/rpc"
  "@zudo/runtime"
  "@zudo/scheduler"
  "@zudo/testing"
)

for pkg in "${PACKAGES[@]}"; do
  echo "Installing $pkg..."
  npm install "$pkg"
done

echo ""
echo "All Zudo packages installed!"
