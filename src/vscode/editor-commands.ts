import { TextEdit, TextEditor, window } from "vscode"

import { readSettings } from "./configuration"
import { ErrorReporter } from "./error-reporter"
import { Severity, VsCodeAdapter } from "./vs-code-adapter"
import { formatDocuments, sortDocuments } from "../core/document-transformer"
import { JsYamlAdapter } from "../core/js-yaml-adapter"
import { Settings } from "../core/settings"
import { YamlSorter } from "../core/yaml-sorter"

export class EditorCommands {
  editor: TextEditor
  settings: Settings
  yamlSorter: YamlSorter
  jsYamlAdapter: JsYamlAdapter
  vsCodeAdapter: VsCodeAdapter
  errorReporter = new ErrorReporter()

  constructor() {
    if (!window.activeTextEditor) {
      throw new Error("No texteditor is active")
    }
    this.editor = window.activeTextEditor
    // one snapshot of the settings that apply to the edited document
    this.settings = readSettings(this.editor.document)
    this.yamlSorter = new YamlSorter(this.settings)
    this.jsYamlAdapter = new JsYamlAdapter(this.settings)
    this.vsCodeAdapter = new VsCodeAdapter(this.settings)
  }

  validateYamlWrapper(): boolean {
    const text = VsCodeAdapter.getActiveDocument(this.editor)
    try {
      this.jsYamlAdapter.validateYaml(text)
      this.vsCodeAdapter.showMessage(Severity.INFO, "YAML is valid.")
      return true
    } catch (error) {
      this.errorReporter.handleError(error)
    }
    return false
  }

  formatYamlWrapper(): TextEdit[] {
    let newText: string
    try {
      newText = formatDocuments(VsCodeAdapter.getActiveDocument(this.editor), this.yamlSorter)
    } catch (error) {
      this.errorReporter.handleError(error)
      return []
    }
    const edits = this.applyEdits(newText)
    // only the command reports success, the formatter stays silent (see #65)
    this.vsCodeAdapter.showMessage(Severity.INFO, "Yaml formatted successfully")
    return edits
  }

  applyEdits(text: string) {
    const edits = VsCodeAdapter.getEdits(this.editor, text)
    VsCodeAdapter.applyEdits([edits])
    return [edits]
  }

  sortYamlWrapper(customSort = 0): TextEdit[] {
    const text = VsCodeAdapter.getText(this.editor, VsCodeAdapter.getRange(this.editor))
    let newText: string
    try {
      newText = sortDocuments(text, { customSort, isSelection: !this.editor.selection.isEmpty }, this.yamlSorter)
    } catch (error) {
      this.errorReporter.handleError(error)
      return []
    }
    const edits = this.applyEdits(newText)
    this.vsCodeAdapter.showMessage(Severity.INFO, "Keys resorted successfully")
    return edits
  }
}
