import * as vscode from "vscode"
import { Settings } from "../settings"

export enum Severity {
  INFO, ERROR
}

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

  getActiveDocument(textEditor: vscode.TextEditor) {
    return textEditor.document.getText()
  }

  getFullDocumentRange(textEditor: vscode.TextEditor) {
    return new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(textEditor.document.lineCount + 1, 0))
  }

  getSelectedRange(textEditor: vscode.TextEditor) {
    let endLine = textEditor.selection.end.line
    // if selection ends on the first character on a new line ignore this line
    if (textEditor.selection.end.character === 0) {
      endLine--
    }

    // ensure selection covers whole start and end line
    return new vscode.Selection(
      textEditor.selection.start.line, 0,
      endLine, textEditor.document.lineAt(endLine).range.end.character)
  }

  getRange(textEditor: vscode.TextEditor) {
    if (textEditor.selection.isEmpty) {
      return this.getFullDocumentRange(textEditor)
    } else {
      return this.getSelectedRange(textEditor)
    }
  }

  getText(textEditor: vscode.TextEditor, range: vscode.Range) {
    return textEditor.document.getText(range)
  }

  /*
  getText(textEditor: vscode.TextEditor) {
    if (textEditor.selection.isEmpty) {
      return this.getActiveDocument(textEditor)
    } else {
      const selection = this.getSelectedRange(textEditor)
      return textEditor.document.getText(selection)
    }
  }*/

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
    if (useAsFormatter && !registration) {
      vscode.languages.registerDocumentFormattingEditProvider('yaml', formatter)
    } else if (!useAsFormatter && registration) {
      registration.dispose()
    }
  }

  showMessage(severity: Severity, message: string) {
    switch(severity) {
      case Severity.ERROR :
        vscode.window.showErrorMessage(message)
        break;
      case Severity.INFO :
        if (this.settings.getNotifySuccess()) {
          vscode.window.showInformationMessage(message)
        }
        break
    }
  }
}

