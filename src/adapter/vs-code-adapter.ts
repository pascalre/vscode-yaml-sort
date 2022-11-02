import * as vscode from "vscode"

export class VsCodeAdapter {
  section: string
  activeEditor = vscode.window.activeTextEditor

  constructor(section = "vscode-yaml-sort") {
    this.section = section
  }

  getProperty(property: string) {
    return vscode.workspace.getConfiguration().get(`${this.section}.${property}`)
  }

  /**
  * Applys edits to a text editor
  * @param activeEditor Editor to apply the changes
  * @param edits Changes to apply
  */
  applyEdits(edit: [vscode.TextEdit]) {
    if (this.activeEditor) {
      const workspaceEdit = new vscode.WorkspaceEdit()
      workspaceEdit.set(this.activeEditor.document.uri, edit)
      vscode.workspace.applyEdit(workspaceEdit)
    }
  }
}

