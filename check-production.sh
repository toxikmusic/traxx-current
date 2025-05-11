#!/bin/bash

# Production detection check for Traxx application
# This script tests how the application detects the production environment in Replit

# Print header
echo "===== Traxx Production Environment Check ====="
echo "Running check at $(date)"
echo ""

# Check for production environment variables
echo "Checking environment variables..."

# Check NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
  echo "✅ NODE_ENV is set to production: $NODE_ENV"
else
  echo "⚠️ NODE_ENV is not set to production: $NODE_ENV"
fi

# Check REPLIT_* environment variables
echo ""
echo "REPLIT environment variables:"
env | grep -E "REPL_|REPLIT_" | sort

# Check for production files
echo ""
echo "Checking for production indicators in files..."

# Check package.json for production scripts
if grep -q '"start":\s*"node' package.json; then
  echo "✅ Production start script found in package.json"
else
  echo "⚠️ No production start script found in package.json"
fi

# Check for production detection in code
if grep -q "app.get('env') === 'production'" server/index.ts; then
  echo "✅ Production environment detection found in server/index.ts"
else
  echo "⚠️ No production environment detection found in server/index.ts"
fi

# Check vite configuration for production mode
if grep -q "config for production" vite.config.js; then
  echo "✅ Production configuration found in vite.config.js"
else
  echo "⚠️ No explicit production configuration found in vite.config.js"
fi

echo ""
echo "===== Production Check Complete ====="