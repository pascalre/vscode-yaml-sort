// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import { Settings } from "./settings"
import { VsCodeAdapter } from "./adapter/vs-code-adapter"
import { formatYamlWrapper, sortYamlFiles, sortYamlWrapper, validateYamlWrapper } from "./controller"

const settings = new Settings()
const vscodeadapter = new VsCodeAdapter()

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const formatter: vscode.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(): vscode.TextEdit[] {
      if (settings.sortOnSave >= 0 && settings.sortOnSave <= 3) {
        return sortYamlWrapper(settings.sortOnSave)
      } else {/* istanbul ignore next */
        return formatYamlWrapper()
      }
    }
  }

  // register at activate-time
  vscodeadapter.registerFormatter(formatter)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-yaml-sort.sortYaml", () => {
      sortYamlWrapper()
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.validateYaml", () => {
      validateYamlWrapper()
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.formatYaml", () => {
      formatYamlWrapper()
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_1", () => {
      sortYamlWrapper(1)
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_2", () => {
      /* istanbul ignore next */
      sortYamlWrapper(2)
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_3", () => {
      /* istanbul ignore next */
      sortYamlWrapper(3)
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri: vscode.Uri) => {
      sortYamlFiles(uri)
    })
  )
}
