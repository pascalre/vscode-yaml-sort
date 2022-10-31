# Contributing
Thank you for your invested time to make this project even better. This guide supports developers in contributing issues and code.

## Issues
When opening an issue, describe your issue as clear as possible. If useful, provide code or an example repository.

## Workflow
This project uses the [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow).

### Testing & Linting
The following commands support you at developing good code:
* `npm run code-analysis`: Run the static code analysis
* `npm run test`: Run the tests
* `npm run lint`: Run the linter

Run the following commands to run SonarScanner:
* `docker pull --platform linux/x86_64 sonarqube`: Pull sonarqube container.
* `docker run -d --name sonarqube -p 9000:9000 -p 9092:9092 sonarqube:latest`: Start sonarqube container. This can take some time.

### Commit changes
Refer to [this blogpost](https://cbea.ms/git-commit/#end) by cbeams when committing changes. Issue numbers can be added in braces to the end of the commit message.

It is also required to test your changes. Detailled information about test coverage will be published to [coveralls](https://coveralls.io/github/pascalre/vscode-yaml-sort).

### Pull request
Remember to
* bump a version,
* update `CHANGELOG.md` and `README.md`

### Publishing
After the pull request is merged, a tag can be created. When pushing a tag, GitHub Actions will automatically push the packaged project to the [Visual Studio Marketplace](https://marketplace.visualstudio.com) and [Open VSX Registry](https://open-vsx.org).

This is done by executing the commands:

```
vsce publish -p TOKEN --packagePath PACKAGE.vsix
npx ovsx publish -p TOKEN PACKAGE.vsix
```