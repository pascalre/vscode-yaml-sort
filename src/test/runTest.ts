import { resolve } from "path"

import { runTests } from "@vscode/test-electron"

const main = async (): Promise<void> => {
  // The folder containing the Extension Manifest package.json
  // Passed to `--extensionDevelopmentPath`
  const extensionDevelopmentPath = resolve(__dirname, "../../")

  // The path to the test runner
  // Passed to --extensionTestsPath
  const extensionTestsPath = resolve(__dirname, "./integration/index")

  // Download VS Code, unzip it and run the integration test
  await runTests({ extensionDevelopmentPath, extensionTestsPath })
}

main().catch((error: unknown) => {
  /* istanbul ignore next */
  console.error("Failed to run tests:", error)
  /* istanbul ignore next */
  process.exit(1)
})
