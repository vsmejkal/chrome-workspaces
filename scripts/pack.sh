#!/bin/bash

# Creates ZIP archive with extension
zip -r chrome-workspaces.zip src manifest.json -x "*.d.ts" -x ".DS_Store"
