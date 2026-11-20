import { deepEqual, equal } from "assert"

import { Uri, workspace } from "vscode"

import { readSettings } from "../../vscode/configuration"

suite("Test readSettings()", () => {
  test("should read the configuration for the given document", () => {
    const document = { uri: Uri.file("/project/a.yaml"), languageId: "yaml" }
    const calls: unknown[][] = []
    const getConfiguration = (section?: string, scope?: unknown) => {
      calls.push([section, scope])
      return workspace.getConfiguration(section)
    }

    readSettings(document, getConfiguration)

    deepEqual(calls, [["vscode-yaml-sort", document]])
  })

  test("should read the values of VS Code's configuration", () => {
    equal(readSettings().indent, workspace.getConfiguration("vscode-yaml-sort").get("indent"))
  })
})
