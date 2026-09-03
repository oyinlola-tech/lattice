#!/bin/bash
set -e

echo "Installing all Zudolib packages..."

PACKAGES=(
  "@zudolib/core"
  "@zudolib/errors"
  "@zudolib/types"
  "@zudolib/constants"
  "@zudolib/config"
  "@zudolib/logger"
  "@zudolib/crypto"
  "@zudolib/container"
  "@zudolib/events"
  "@zudolib/messaging"
  "@zudolib/middleware"
  "@zudolib/validation"
  "@zudolib/schema"
  "@zudolib/serialization"
  "@zudolib/cqrs"
  "@zudolib/database"
  "@zudolib/auth"
  "@zudolib/http"
  "@zudolib/cache"
  "@zudolib/queue"
  "@zudolib/tenancy"
  "@zudolib/permissions"
  "@zudolib/feature-flags"
  "@zudolib/lifecycle"
  "@zudolib/observability"
  "@zudolib/security"
  "@zudolib/transactions"
  "@zudolib/storage"
  "@zudolib/adapters"
  "@zudolib/api"
  "@zudolib/cli"
  "@zudolib/docs"
  "@zudolib/openapi"
  "@zudolib/plugins"
  "@zudolib/rpc"
  "@zudolib/runtime"
  "@zudolib/scheduler"
  "@zudolib/testing"
)

for pkg in "${PACKAGES[@]}"; do
  echo "Installing $pkg..."
  npm install "$pkg"
done

echo ""
echo "All Zudolib packages installed!"
