import { TextEdit, TextEditor, Uri, window } from "vscode"

import { formatDocuments, sortDocuments } from "./document-transformer"
import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"
import { Settings } from "../settings"
import { ErrorUtil } from "../util/error-util"
import { FileUtil } from "../util/file-util"
import { YamlUtil } from "../util/yaml-util"

export class Controller {
  editor: TextEditor
  fileutil = new FileUtil()
  yamlutil = new YamlUtil()
  jsyamladapter = new JsYamlAdapter()
  vscodeadapter = new VsCodeAdapter()
  errorutil = new ErrorUtil()
  settings = new Settings()

  constructor() {
    if (window.activeTextEditor) {
      this.editor = window.activeTextEditor
    } else {
      throw new Error("No texteditor is active")
    }
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

  /**
   * Sorts all yaml files in a directory
   * @param {Uri} uri Base URI
   */
  sortYamlFiles(uri: Uri) {
    const files = this.fileutil.getFiles(uri.fsPath)
    files.forEach((file: string) => {
      this.sortFile(file)
    })
  }

  sortFile(file: string) {
    try {
      this.fileutil.sortFile(file)
    } catch (error) {
      this.errorutil.handleError(error)
    }
  }

  formatYamlWrapper(): TextEdit[] {
    const newText = formatDocuments(VsCodeAdapter.getActiveDocument(this.editor), this.yamlutil)
    if (newText === null) {
      return []
    }
    return this.applyEdits(newText)
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
    this.vscodeadapter.showMessage(Severity.INFO, "Keys resorted successfully")
    return this.applyEdits(newText)
  }
}
