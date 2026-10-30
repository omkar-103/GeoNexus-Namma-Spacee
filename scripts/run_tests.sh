#!/usr/bin/env bash
set -e

echo "=== Running GeoNexus Namma Space Engine Test Suite ==="
node --test src/engine/**/*.test.ts
echo "=== All Tests Passed Successfully ==="
