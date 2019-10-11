# Contributing

This guide supports developers in contributing code.

## Testing

Run the following commands to run SonarScanner:
* `docker pull sonarqube`: Pull sonarqube container.
* `docker run -d --name sonarqube -p 9000:9000 -p 9092:9092 sonarqube:latest`: Start sonarqube container. This can take some time.
* `gulp sonar`: Run the SonarScanner.

## Packaging
Run the following command to pack code to a vsix package:
* `vsce package`
