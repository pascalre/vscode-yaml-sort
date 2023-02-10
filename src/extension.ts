import { ExtensionContext, DocumentFormattingEditProvider, commands, Uri, TextEdit } from "vscode"
import { Settings } from "./settings"
import { VsCodeAdapter } from "./adapter/vs-code-adapter"
import { Controller } from "./controller/controller"

export function activate(context: ExtensionContext) {

  const formatter: DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(): TextEdit[] {
      const settings = new Settings()
      if (settings.doSortOnSave()) {
        return new Controller().sortYamlWrapper(settings.sortOnSave)
      } else {
        return new Controller().formatYamlWrapper()
      }
    }
  }

  VsCodeAdapter.registerFormatter(formatter)

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
