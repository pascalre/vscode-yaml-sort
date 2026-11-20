import { ExtensionContext, Uri, commands } from "vscode"

import { sortYamlFilesInDirectory } from "./vscode/directory-sorter"
import { EditorCommands } from "./vscode/editor-commands"
import { YamlFormattingProvider } from "./vscode/formatting-provider"
import { VsCodeAdapter } from "./vscode/vs-code-adapter"

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    VsCodeAdapter.registerFormatter(new YamlFormattingProvider()),
    commands.registerCommand("vscode-yaml-sort.sortYaml", () => {
      new EditorCommands().sortYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.validateYaml", () => {
      new EditorCommands().validateYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.formatYaml", () => {
      new EditorCommands().formatYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri?: Uri) => {
      sortYamlFilesInDirectory(uri)
    })
  )
  for (const index of [1, 2, 3]) {
    context.subscriptions.push(
      commands.registerCommand(`vscode-yaml-sort.customSortYaml_${index}`, () => {
        new EditorCommands().sortYamlWrapper(index)
      })
    )
  }
}
