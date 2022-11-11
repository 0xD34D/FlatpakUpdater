#!/bin/sh
PLUGIN_NAME=$(cat package.json | jq -r '.["name"]')
PLUGIN_VERSION=$(cat package.json | jq -r '.["version"]')

cat deploy.files | zip -@ -r ${PLUGIN_NAME}_${PLUGIN_VERSION}.zip