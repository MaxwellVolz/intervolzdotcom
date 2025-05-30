#!/bin/bash
set -e

SRC_DIR=$1
TARGET_DIR="/var/www/wheretoeatandwhy"

echo "Deploying to $TARGET_DIR..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$SRC_DIR"/* "$TARGET_DIR"

echo "Deployment complete."