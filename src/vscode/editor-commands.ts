import { Range, TextEdit, TextEditor, WorkspaceEdit, window, workspace } from "vscode"

import { readSettings } from "./configuration"
import { ErrorReporter } from "./error-reporter"
import { Severity, VsCodeAdapter } from "./vs-code-adapter"
import { formatDocuments, sortDocuments } from "../core/document-transformer"
import { JsYamlAdapter } from "../core/js-yaml-adapter"
import { Settings } from "../core/settings"
import { YamlSorter } from "../core/yaml-sorter"

/**
 * The commands that work on the document of one editor.
 */
export class EditorCommands {
  readonly editor: TextEditor
  readonly settings: Settings
  readonly yamlSorter: YamlSorter
  readonly jsYamlAdapter: JsYamlAdapter
  readonly vsCodeAdapter: VsCodeAdapter
  readonly errorReporter = new ErrorReporter()

  /**
   * @param editor The editor to work on. Defaults to the active editor.
   * @throws Error if no editor is given and none is active.
   */
  constructor(editor: TextEditor | undefined = window.activeTextEditor) {
    if (!editor) {
      throw new Error("No texteditor is active")
    }
    this.editor = editor
    // one snapshot of the settings that apply to the edited document
    this.settings = readSettings(editor.document)
    this.yamlSorter = new YamlSorter(this.settings)
    this.jsYamlAdapter = new JsYamlAdapter(this.settings)
    this.vsCodeAdapter = new VsCodeAdapter(this.settings)
  }

  /**
   * Validates the whole document and reports the result.
   * @returns True if the document is valid yaml.
   */
  validateYamlWrapper(): boolean {
    try {
      this.jsYamlAdapter.validateYaml(this.editor.document.getText())
    } catch (error) {
      this.errorReporter.handleError(error)
      return false
    }
    this.vsCodeAdapter.showMessage(Severity.INFO, "YAML is valid.")
    return true
  }

  /**
   * Formats the whole document, regardless of a selection.
   * @returns The applied edits, or none if the document could not be formatted.
   */
  async formatYamlWrapper(): Promise<TextEdit[]> {
    const document = this.editor.document
    let newText: string
    try {
      newText = formatDocuments(document.getText(), this.yamlSorter)
    } catch (error) {
      this.errorReporter.handleError(error)
      return []
    }
    // only the command reports success, the formatter stays silent (see #65)
    return this.replace(VsCodeAdapter.getFullDocumentRange(document), newText, "Yaml formatted successfully")
  }

  /**
   * Sorts the selected lines, or the whole document if nothing is selected.
   * @param customSort 0 for the default sort, 1 to 3 for the custom sort keywords.
   * @returns The applied edits, or none if the text could not be sorted.
   */
  async sortYamlWrapper(customSort = 0): Promise<TextEdit[]> {
    const range = VsCodeAdapter.getRange(this.editor)
    let newText: string
    try {
      newText = sortDocuments(this.editor.document.getText(range), { customSort, isSelection: !this.editor.selection.isEmpty }, this.yamlSorter)
    } catch (error) {
      this.errorReporter.handleError(error)
      return []
    }
    return this.replace(range, newText, "Keys resorted successfully")
  }

  /**
   * Replaces a range of the editor's document and reports success once the edit is applied.
   * @returns The applied edits, or none if VS Code rejected them.
   */
  private async replace(range: Range, text: string, successMessage: string): Promise<TextEdit[]> {
    const edit = TextEdit.replace(range, text)
    const workspaceEdit = new WorkspaceEdit()
    // the edit belongs to this editor's document, even if another editor became active meanwhile
    workspaceEdit.set(this.editor.document.uri, [edit])
    if (!await workspace.applyEdit(workspaceEdit)) {
      this.vsCodeAdapter.showMessage(Severity.ERROR, "The changes could not be applied to the document.")
      return []
    }
    this.vsCodeAdapter.showMessage(Severity.INFO, successMessage)
    return [edit]
  }
}
