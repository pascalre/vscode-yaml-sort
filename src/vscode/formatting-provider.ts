import { DocumentFormattingEditProvider, Range, TextDocument, TextEdit } from "vscode"

import { readSettings } from "./configuration"
import { ErrorReporter } from "./error-reporter"
import { formatDocuments, sortDocuments } from "../core/document-transformer"
import { YamlSorter } from "../core/yaml-sorter"

/**
 * Formats (or, depending on `sortOnSave`, sorts) a whole yaml document.
 *
 * VS Code applies the returned edits itself, e.g. for "Format Document" or format on save,
 * so this provider must never apply them on its own (see #180).
 */
export class YamlFormattingProvider implements DocumentFormattingEditProvider {
  errorReporter = new ErrorReporter()

  /**
   * @param document The document VS Code asks to format. It may differ from the active editor.
   * @returns One edit replacing the whole document, or no edit if the document cannot be processed.
   */
  provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {
    const settings = readSettings(document)
    const yamlSorter = new YamlSorter(settings)
    const text = document.getText()
    let newText: string
    try {
      newText = settings.doSortOnSave()
        ? sortDocuments(text, { customSort: settings.sortOnSave, isSelection: false }, yamlSorter)
        : formatDocuments(text, yamlSorter)
    } catch (error) {
      this.errorReporter.handleError(error)
      return []
    }
    const fullRange = document.validateRange(new Range(0, 0, document.lineCount, 0))
    return [TextEdit.replace(fullRange, newText)]
  }
}
