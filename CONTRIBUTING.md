# Contributing

This guide supports developers in contributing code.

## Testing & Linting
* `npm run test`: Run the unit tests
* `npm run lint`: Run the eslint
* `mocha src/test/lib.test.ts --require ts-node/register --ui tdd`

Run the following commands to run SonarScanner:
* `docker pull sonarqube`: Pull sonarqube container.
* `docker run -d --name sonarqube -p 9000:9000 -p 9092:9092 sonarqube:latest`: Start sonarqube container. This can take some time.

## Packaging
Run the following command to pack code to a vsix package:
* `vsce package`

### Before release
* Bump version
* Update CHANGELOG.md
* Update README.md

### Publishing to VS Code marketplace
`vsce publish -p $TOKEN --packagePath PACKAGE.vsix`

### Publishing to OpenVSX marketplace
`npx ovsx publish -p TOKEN PACKAGE.vsix`