import * as vscode from "vscode"
import { Settings } from "../settings"

export class VsCodeAdapter {
  section: string
  settings: Settings

  constructor(settings = new Settings(), section = "vscode-yaml-sort") {
    this.settings = settings
    this.section = section
  }

  getProperty(property: string) {
    return vscode.workspace.getConfiguration().get(`${this.section}.${property}`)
  }

  getActiveDocument() {
    if (vscode.window.activeTextEditor) {
      return vscode.window.activeTextEditor.document.getText()
    }
  }

  /**
  * Applys edits to a text editor
  * @param activeEditor Editor to apply the changes
  * @param edits Changes to apply
  */
  applyEdits(edit: [vscode.TextEdit]) {
    if (vscode.window.activeTextEditor) {
      const workspaceEdit = new vscode.WorkspaceEdit()
      workspaceEdit.set(vscode.window.activeTextEditor.document.uri, edit)
      vscode.workspace.applyEdit(workspaceEdit)
    }
  }

  // have a function that adds/removes the formatter based
  // on a configuration setting
  registerFormatter(formatter: vscode.DocumentFormattingEditProvider) {
    let registration: vscode.Disposable | undefined
    const useAsFormatter = this.settings.getUseAsFormatter()
    if (useAsFormatter && !registration) {/* istanbul ignore next */
      registration = vscode.languages.registerDocumentFormattingEditProvider('yaml', formatter)
    } else if (!useAsFormatter && registration) {/* istanbul ignore next */
      registration.dispose();/* istanbul ignore next */
      registration = undefined;
    }
  }
}

