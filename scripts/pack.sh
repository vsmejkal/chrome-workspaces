#!/bin/bash

# Bundle service worker
rollup -c

# Create archive
zip -r chrome-workspaces.zip src manifest.json serviceWorkerLoader.js -x "*.d.ts"
