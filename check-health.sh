#!/bin/bash

# Health check script for Traxx application
# This script tests the server connectivity and host configuration

# Print header
echo "===== Traxx Server Health Check ====="
echo "Running health check at $(date)"
echo ""

# Get the server URL
SERVER_URL="http://localhost:5000"
echo "Testing server at: $SERVER_URL"

# Test the health endpoint
echo "Testing API health endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $SERVER_URL/api/health-check)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
CONTENT=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ API health check successful (HTTP $HTTP_CODE)"
  echo "Response: $CONTENT"
else
  echo "❌ API health check failed (HTTP $HTTP_CODE)"
  echo "Response: $CONTENT"
fi

echo ""

# Test for CORS headers
echo "Testing CORS headers..."
HEADERS=$(curl -s -I -X OPTIONS $SERVER_URL/api/health-check)

if echo "$HEADERS" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ CORS headers are properly set"
  echo "Headers:"
  echo "$HEADERS" | grep "Access-Control"
else
  echo "❌ CORS headers are missing"
  echo "Headers:"
  echo "$HEADERS"
fi

echo ""

# Check for Replit environment
echo "Checking for Replit environment..."
if [ -n "$REPL_ID" ]; then
  echo "✅ Running in Replit environment"
  echo "REPL_ID: $REPL_ID"
  echo "REPL_SLUG: $REPL_SLUG"
  echo "REPL_OWNER: $REPL_OWNER"
else
  echo "⚠️ Not running in Replit environment"
fi

echo ""

# Check for Vite host configuration
echo "Checking for Vite host configuration..."
if [ -n "$VITE_SPECIFIC_HOST" ]; then
  echo "✅ Specific Replit host configured: $VITE_SPECIFIC_HOST"
else
  echo "⚠️ No specific Replit host configured"
fi

if [ -f "vite.config.local.js" ]; then
  echo "✅ vite.config.local.js exists with custom host configuration"
else
  echo "⚠️ vite.config.local.js not found"
fi

echo ""
echo "===== Health Check Complete ====="