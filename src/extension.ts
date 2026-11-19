import { ExtensionContext, Uri, commands } from "vscode"

import { VsCodeAdapter } from "./adapter/vs-code-adapter"
import { Controller } from "./controller/controller"
import { YamlFormattingProvider } from "./controller/formatting-provider"

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
    commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri: Uri) => {
      new Controller().sortYamlFiles(uri)
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
