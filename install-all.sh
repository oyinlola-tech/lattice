#!/bin/bash
set -e

echo "Installing all Zudojs packages..."

PACKAGES=(
  "@zudojs/core"
  "@zudojs/errors"
  "@zudojs/types"
  "@zudojs/constants"
  "@zudojs/config"
  "@zudojs/logger"
  "@zudojs/crypto"
  "@zudojs/container"
  "@zudojs/events"
  "@zudojs/messaging"
  "@zudojs/middleware"
  "@zudojs/validation"
  "@zudojs/schema"
  "@zudojs/serialization"
  "@zudojs/cqrs"
  "@zudojs/database"
  "@zudojs/auth"
  "@zudojs/http"
  "@zudojs/cache"
  "@zudojs/queue"
  "@zudojs/tenancy"
  "@zudojs/permissions"
  "@zudojs/feature-flags"
  "@zudojs/lifecycle"
  "@zudojs/observability"
  "@zudojs/security"
  "@zudojs/transactions"
  "@zudojs/storage"
  "@zudojs/adapters"
  "@zudojs/api"
  "@zudojs/cli"
  "@zudojs/docs"
  "@zudojs/openapi"
  "@zudojs/plugins"
  "@zudojs/rpc"
  "@zudojs/runtime"
  "@zudojs/scheduler"
  "@zudojs/testing"
)

for pkg in "${PACKAGES[@]}"; do
  echo "Installing $pkg..."
  npm install "$pkg"
done

echo ""
echo "All Zudojs packages installed!"
