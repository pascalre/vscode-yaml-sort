// eslint-disable-next-line @typescript-eslint/no-var-requires
const scanner = require("sonarqube-scanner")
scanner(
  {
    serverUrl: "http://localhost:9000",
    options : {
      "sonar.projectName": "YAML Sort",
      "sonar.projectKey": "vscode-yaml-sort",
      "sonar.sources": "src",
      "sonar.language": "typescript",
      "sonar.test.inclusions": "src/**/*.test.ts",
      "sonar.exclusions": "node_modules",
      "sonar.binaries": "out",
      "sonar.tests": "src/test",
      "sonar.typescript.lcov.reportPaths": "coverage/lcov.info",
    }
  },
  () => process.exit()
)