import { ExtensionContext, Uri, commands, window } from "vscode"

import { sortYamlFilesInDirectory } from "./vscode/directory-sorter"
import { EditorCommands } from "./vscode/editor-commands"
import { YamlFormattingProvider } from "./vscode/formatting-provider"
import { VsCodeAdapter } from "./vscode/vs-code-adapter"

/**
 * Runs a command on the active editor, or explains why it cannot run, e.g. when the command is
 * started with a key binding while no editor is open.
 */
const withActiveEditor = <T>(command: (editorCommands: EditorCommands) => T) => (): T | undefined => {
  const editor = window.activeTextEditor
  if (!editor) {
    window.showErrorMessage("Open a yaml file to run this command.")
    return undefined
  }
  return command(new EditorCommands(editor))
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    VsCodeAdapter.registerFormatter(new YamlFormattingProvider()),
    commands.registerCommand("vscode-yaml-sort.sortYaml", withActiveEditor((editor) => editor.sortYamlWrapper())),
    commands.registerCommand("vscode-yaml-sort.validateYaml", withActiveEditor((editor) => editor.validateYamlWrapper())),
    commands.registerCommand("vscode-yaml-sort.formatYaml", withActiveEditor((editor) => editor.formatYamlWrapper())),
    commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri?: Uri) => sortYamlFilesInDirectory(uri))
  )
  for (const index of [1, 2, 3]) {
    context.subscriptions.push(
      commands.registerCommand(`vscode-yaml-sort.customSortYaml_${index}`, withActiveEditor((editor) => editor.sortYamlWrapper(index)))
    )
  }
}
