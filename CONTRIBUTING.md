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

Get tokens under:
* https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token
* https://open-vsx.org/user-settings/tokens

## Quality Gateway
### SonarCloud
Find analysis on [sonarcloud.io](https://sonarcloud.io/project/overview?id=pascalre_vscode-yaml-sort)

### DeepSource
Find analysis on [deepsource.io](https://deepsource.io/gh/pascalre/vscode-yaml-sort)

### CodeFactor
[![CodeFactor](https://www.codefactor.io/repository/github/pascalre/vscode-yaml-sort/badge/master)](https://www.codefactor.io/repository/github/pascalre/vscode-yaml-sort/overview/master)

Find analysis on [codefactor.io](https://www.codefactor.io/repository/github/pascalre/vscode-yaml-sort/overview/master)


## Security
Find analysis on [snyk.io](https://app.snyk.io/org/pascalre/project/e7d5ea5f-b9ee-426e-9f91-4c910a742838)
