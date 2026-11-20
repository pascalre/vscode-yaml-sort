import { ExtensionContext, Uri, commands } from "vscode"

import { Controller } from "./vscode/controller"
import { sortYamlFilesInDirectory } from "./vscode/file-sorter"
import { YamlFormattingProvider } from "./vscode/formatting-provider"
import { VsCodeAdapter } from "./vscode/vs-code-adapter"

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    VsCodeAdapter.registerFormatter(new YamlFormattingProvider()),
    commands.registerCommand("vscode-yaml-sort.sortYaml", () => {
      new Controller().sortYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.validateYaml", () => {
      new Controller().validateYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.formatYaml", () => {
      new Controller().formatYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri?: Uri) => {
      sortYamlFilesInDirectory(uri)
    })
  )
  for (const index of [1, 2, 3]) {
    context.subscriptions.push(
      commands.registerCommand(`vscode-yaml-sort.customSortYaml_${index}`, () => {
        new Controller().sortYamlWrapper(index)
      })
    )
  }
}
