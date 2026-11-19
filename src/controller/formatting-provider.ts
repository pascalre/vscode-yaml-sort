import { DocumentFormattingEditProvider, Range, TextDocument, TextEdit } from "vscode"

import { formatDocuments, sortDocuments } from "./document-transformer"
import { Settings } from "../settings"
import { ErrorUtil } from "../util/error-util"

/**
 * Formats (or, depending on `sortOnSave`, sorts) a whole yaml document.
 *
 * VS Code applies the returned edits itself, e.g. for "Format Document" or format on save,
 * so this provider must never apply them on its own (see #180).
 */
export class YamlFormattingProvider implements DocumentFormattingEditProvider {
  errorutil = new ErrorUtil()

  /**
   * @param document The document VS Code asks to format. It may differ from the active editor.
   * @returns One edit replacing the whole document, or no edit if the document cannot be processed.
   */
  provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
    const settings = new Settings()
    const text = document.getText()
    let newText: string | null
    try {
      newText = settings.doSortOnSave()
        ? sortDocuments(text, { customSort: settings.sortOnSave, isSelection: false })
        : formatDocuments(text)
    } catch (error) {
      this.errorutil.handleError(error)
      return []
    }
    if (newText === null) {
      return []
    }
    const fullRange = document.validateRange(new Range(0, 0, document.lineCount, 0))
    return [TextEdit.replace(fullRange, newText)]
  }
}
