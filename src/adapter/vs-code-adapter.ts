import { workspace, TextEditor, Range, Position, Selection, TextEdit, WorkspaceEdit, window, DocumentFormattingEditProvider, languages, Disposable }  from "vscode"
import { Settings } from "../settings"

export enum Severity {
  INFO, ERROR
}

export class VsCodeAdapter {
  section = "vscode-yaml-sort"
  settings: Settings

  constructor(settings = new Settings()) {
    this.settings = settings
  }

  getProperty(property: string) {
    return workspace.getConfiguration().get(`${this.section}.${property}`)
  }

  // have a function that adds/removes the formatter based
  // on a configuration setting
  registerFormatter(formatter: DocumentFormattingEditProvider) {
    let registration: Disposable | undefined
    const useAsFormatter = this.settings.getUseAsFormatter()
    if (useAsFormatter && !registration) {
      languages.registerDocumentFormattingEditProvider('yaml', formatter)
    } else if (!useAsFormatter && registration) {
      registration.dispose()
    }
  }

  showMessage(severity: Severity, message: string) {
    if (severity === Severity.ERROR) {
      window.showErrorMessage(message)
    } else {
      this.notify(message)
    }
  }

  notify(message: string) {
    if (this.settings.getNotifySuccess()) {
      window.showInformationMessage(message)
    }
  }

  static getText(textEditor: TextEditor, range: Range) {
    return textEditor.document.getText(range)
  }

  static getFullDocumentRange(textEditor: TextEditor) {
    return new Range(
      new Position(0, 0),
      new Position(textEditor.document.lineCount + 1, 0))
  }

  static getSelectedRange(textEditor: TextEditor) {
    let endLine = textEditor.selection.end.line
    // if selection ends on the first character on a new line ignore this line
    if (textEditor.selection.end.character === 0) {
      endLine--
    }

    // ensure selection covers whole start and end line
    return new Selection(
      textEditor.selection.start.line, 0,
      endLine, textEditor.document.lineAt(endLine).range.end.character)
  }

  /**
  * Applys edits to a text editor
  * @param activeEditor Editor to apply the changes
  * @param edits Changes to apply
  */
  static applyEdits(edit: [TextEdit]) {
    if (window.activeTextEditor) {
      const workspaceEdit = new WorkspaceEdit()
      workspaceEdit.set(window.activeTextEditor.document.uri, edit)
      workspace.applyEdit(workspaceEdit)
    }
  }

  static getActiveDocument(textEditor: TextEditor) {
    return textEditor.document.getText()
  }

  static getRange(textEditor: TextEditor) {
    if (textEditor.selection.isEmpty) {
      return VsCodeAdapter.getFullDocumentRange(textEditor)
    } else {
      return VsCodeAdapter.getSelectedRange(textEditor)
    }
  }

  static getEdits(textEditor: TextEditor, text: string) {
    const range = VsCodeAdapter.getRange(textEditor)
    return TextEdit.replace(range, text)
  }

}
