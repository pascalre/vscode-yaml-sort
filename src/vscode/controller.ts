import { TextEdit, TextEditor, window } from "vscode"

import { readSettings } from "./configuration"
import { ErrorUtil } from "./error-util"
import { Severity, VsCodeAdapter } from "./vs-code-adapter"
import { formatDocuments, sortDocuments } from "../core/document-transformer"
import { JsYamlAdapter } from "../core/js-yaml-adapter"
import { Settings } from "../core/settings"
import { YamlUtil } from "../core/yaml-util"

export class Controller {
  editor: TextEditor
  settings: Settings
  yamlutil: YamlUtil
  jsyamladapter: JsYamlAdapter
  vscodeadapter: VsCodeAdapter
  errorutil = new ErrorUtil()

  constructor() {
    if (!window.activeTextEditor) {
      throw new Error("No texteditor is active")
    }
    this.editor = window.activeTextEditor
    // one snapshot of the settings that apply to the edited document
    this.settings = readSettings(this.editor.document)
    this.yamlutil = new YamlUtil(this.settings)
    this.jsyamladapter = new JsYamlAdapter(this.settings)
    this.vscodeadapter = new VsCodeAdapter(this.settings)
  }

  validateYamlWrapper(): boolean {
    const text = VsCodeAdapter.getActiveDocument(this.editor)
    try {
      this.jsyamladapter.validateYaml(text)
      this.vscodeadapter.showMessage(Severity.INFO, "YAML is valid.")
      return true
    } catch (error) {
      this.errorutil.handleError(error)
    }
    return false
  }

  formatYamlWrapper(): TextEdit[] {
    let newText: string
    try {
      newText = formatDocuments(VsCodeAdapter.getActiveDocument(this.editor), this.yamlutil)
    } catch (error) {
      this.errorutil.handleError(error)
      return []
    }
    const edits = this.applyEdits(newText)
    // only the command reports success, the formatter stays silent (see #65)
    this.vscodeadapter.showMessage(Severity.INFO, "Yaml formatted successfully")
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
      newText = sortDocuments(text, { customSort, isSelection: !this.editor.selection.isEmpty }, this.yamlutil)
    } catch (error) {
      this.errorutil.handleError(error)
      return []
    }
    const edits = this.applyEdits(newText)
    this.vscodeadapter.showMessage(Severity.INFO, "Keys resorted successfully")
    return edits
  }
}
