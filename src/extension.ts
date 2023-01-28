import { ExtensionContext, DocumentFormattingEditProvider, commands, Uri, TextEdit } from "vscode"
import { Settings } from "./settings"
import { VsCodeAdapter } from "./adapter/vs-code-adapter"
import { Controller } from "./controller/controller"

const settings = new Settings()
const vscodeadapter = new VsCodeAdapter()

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

  const formatter: DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(): TextEdit[] {
      if (settings.doSortOnSave()) {
        return new Controller().sortYamlWrapper(settings.sortOnSave)
      } else {/* istanbul ignore next */
        return new Controller().formatYamlWrapper()
      }
    }
  }

  // register at activate-time
  vscodeadapter.registerFormatter(formatter)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    commands.registerCommand("vscode-yaml-sort.sortYaml", () => {
      new Controller().sortYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.validateYaml", () => {
      new Controller().validateYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.formatYaml", () => {
      new Controller().formatYamlWrapper()
    }),
    commands.registerCommand("vscode-yaml-sort.customSortYaml_1", () => {
      new Controller().sortYamlWrapper(1)
    }),
    commands.registerCommand("vscode-yaml-sort.customSortYaml_2", () => {
      /* istanbul ignore next */
      new Controller().sortYamlWrapper(2)
    }),
    commands.registerCommand("vscode-yaml-sort.customSortYaml_3", () => {
      /* istanbul ignore next */
      new Controller().sortYamlWrapper(3)
    }),
    commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri: Uri) => {
      new Controller().sortYamlFiles(uri)
    })
  )
}
