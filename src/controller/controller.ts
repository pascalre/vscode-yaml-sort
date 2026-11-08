import { TextEdit, TextEditor, Uri, window } from "vscode"

import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"
import { prependWhitespacesOnEachLine, removeLeadingLineBreakOfFirstElement } from "../lib"
import { Settings } from "../settings"
import { ErrorUtil } from "../util/error-util"
import { FileUtil } from "../util/file-util"
import { YamlUtil, splitYaml, validateTextRange } from "../util/yaml-util"

export class Controller {
  fileutil = new FileUtil()
  yamlutil = new YamlUtil()
  jsyamladapter = new JsYamlAdapter()
  vscodeadapter = new VsCodeAdapter()
  errorutil = new ErrorUtil()
  settings = new Settings()

  /**
   * Returns the active text editor. It is required by all commands operating on
   * the open document, unlike `sortYamlFiles()` which works on files on disk.
   */
  private getActiveEditor(): TextEditor {
    const editor = window.activeTextEditor
    if (!editor) {
      throw new Error("No texteditor is active")
    }
    return editor
  }

  validateYamlWrapper(): boolean {
    const text = VsCodeAdapter.getActiveDocument(this.getActiveEditor())
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
   * Sorts all yamm files in a directory
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
    const editor = this.getActiveEditor()
    let doc = VsCodeAdapter.getActiveDocument(editor)
    let delimiters = this.yamlutil.getDelimiters(doc, true)
    // remove yaml metadata tags
    const matchMetadata = /^%.*\n/gm
    // set metadata tags, if there is no metadata tag it should be an emtpy array
    if (matchMetadata.test(doc)) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    }
    doc = doc.replace(matchMetadata, "")
    doc = doc.replace(/^\n/, "")

    const yamls = splitYaml(doc)
    let newText = ""
    for (const unformattedYaml of yamls) {
      const formattedYaml = this.yamlutil.formatYaml(unformattedYaml, false)
      if (formattedYaml) {
        newText += delimiters.shift() + formattedYaml
      } else {
        return []
      }
    }
    newText = this.yamlutil.setLeadingDashes(newText)
    return this.applyEdits(newText)
  }

  applyEdits(text: string) {
    const editor = this.getActiveEditor()
    const edits = VsCodeAdapter.getEdits(editor, text)
    VsCodeAdapter.applyEdits([edits])
    return [edits]
  }

  sortYamlWrapper(customSort = 0): TextEdit[] {
    const editor = this.getActiveEditor()
    const textRange = VsCodeAdapter.getRange(editor)
    let text = VsCodeAdapter.getText(editor, textRange)

    try {
      validateTextRange(text)
      this.jsyamladapter.validateYaml(text)
    } catch (error) {
      this.errorutil.handleError(error)
      return [] as TextEdit[]
    }

    let delimiters = this.yamlutil.getDelimiters(text, editor.selection.isEmpty)
    // remove yaml metadata tags
    const matchMetadata = /^%.*\n/gm
    // set metadata tags, if there is no metadata tag it should be an emtpy array
    if (matchMetadata.test(text)) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    }
    text = text.replace(matchMetadata, "")
    text = text.replace(/^\n/, "")

    // sort yaml
    let newText = ""
    for (const unsortedYaml of splitYaml(text)) {
      let sortedYaml = this.yamlutil.sortYaml(unsortedYaml, customSort)
      if (!sortedYaml) {
        // return no edits at all instead of applying partially sorted text
        return [] as TextEdit[]
      }
      if (!editor.selection.isEmpty) {
        // get number of leading whitespaces, these whitespaces will be used for indentation
        const indentation = YamlUtil.getNumberOfLeadingSpaces(unsortedYaml)
        sortedYaml = prependWhitespacesOnEachLine(sortedYaml, indentation)
      }
      newText += delimiters.shift() + sortedYaml
    }
    if (editor.selection.isEmpty) {
      newText = this.yamlutil.setLeadingDashes(newText)
    }
    this.vscodeadapter.showMessage(Severity.INFO, "Keys resorted successfully")
    return this.applyEdits(newText)
  }
}
