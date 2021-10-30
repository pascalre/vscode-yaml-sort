#!/bin/bash
# Usage: ./publish.sh [PACKAGE.vsix]

# Publishing to VS Code marketplace
vsce publish -p $VSC_TOKEN --packagePath $1

# Publishing to OpenVSX marketplace
npx ovsx publish -p $OVSX_TOKEN $2