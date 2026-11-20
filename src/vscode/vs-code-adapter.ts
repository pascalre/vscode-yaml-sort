import { Disposable, DocumentFormattingEditProvider, Range, Selection, TextDocument, TextEditor, languages, window } from "vscode"

import { Settings } from "../core/settings"

export enum Severity {
  INFO, ERROR
}

export class VsCodeAdapter {
  settings: Settings

  constructor(settings = new Settings()) {
    this.settings = settings
  }

  showMessage(severity: Severity, message: string) {
    if (severity === Severity.ERROR) {
      window.showErrorMessage(message)
    } else {
      this.notify(message)
    }
  }

  notify(message: string) {
    if (this.settings.notifySuccess) {
      window.showInformationMessage(message)
    }
  }

  static registerFormatter(formatter: DocumentFormattingEditProvider): Disposable {
    return languages.registerDocumentFormattingEditProvider("yaml", formatter)
  }

  /**
   * @param document A text document.
   * @returns The range from the beginning to the end of the document.
   */
  static getFullDocumentRange(document: TextDocument): Range {
    return document.validateRange(new Range(0, 0, document.lineCount, 0))
  }

  /**
   * @param textEditor An editor with a non-empty selection.
   * @returns The selection, extended to whole lines. A selection that ends on the first character
   *          of a line does not include that line.
   */
  static getSelectedRange(textEditor: TextEditor): Selection {
    let endLine = textEditor.selection.end.line
    if (textEditor.selection.end.character === 0) {
      endLine--
    }
    return new Selection(
      textEditor.selection.start.line, 0,
      endLine, textEditor.document.lineAt(endLine).range.end.character)
  }

  /**
   * @param textEditor An editor.
   * @returns The selected lines, or the whole document if nothing is selected.
   */
  static getRange(textEditor: TextEditor): Range {
    if (textEditor.selection.isEmpty) {
      return VsCodeAdapter.getFullDocumentRange(textEditor.document)
    }
    return VsCodeAdapter.getSelectedRange(textEditor)
  }
}
