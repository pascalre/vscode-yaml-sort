import { TextEditor, TextEdit, Uri, window } from "vscode"
import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"
import { prependWhitespacesOnEachLine, removeLeadingLineBreakOfFirstElement } from "../lib"
import { Settings } from "../settings"
import { ErrorUtil } from "../util/error-util"
import { FileUtil } from "../util/file-util"
import { splitYaml, validateTextRange, YamlUtil } from "../util/yaml-util"

const settings = new Settings()
const jsyamladapter = new JsYamlAdapter()
const outteryamlutil = new YamlUtil()

export class Controller {
  editor: TextEditor
  fileutil = new FileUtil()
  yamlutil = new YamlUtil()
  vscodeadapter = new VsCodeAdapter()
  errorutil = new ErrorUtil()

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
      jsyamladapter.validateYaml(text)
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
    let doc = VsCodeAdapter.getActiveDocument(this.editor)
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
      const formattedYaml = outteryamlutil.formatYaml(unformattedYaml, false)
      if (formattedYaml) {
        newText += delimiters.shift() + formattedYaml
      } else {
        return []
      }
    }
    if (settings.useLeadingDashes) {
      newText = `---\n${newText}`
    }
    return this.applyEdits(newText)
  }

  applyEdits(text: string) {
    const edits = VsCodeAdapter.getEdits(this.editor, text)
    VsCodeAdapter.applyEdits([edits])
    return [edits]
  }

  sortYamlWrapper(customSort = 0): TextEdit[] {
    const textRange = VsCodeAdapter.getRange(this.editor)
    let text = VsCodeAdapter.getText(this.editor, textRange)

    try {
      validateTextRange(text)
      jsyamladapter.validateYaml(text)
    } catch (error) {
      this.errorutil.handleError(error)
      return [] as TextEdit[]
    }

    let delimiters = this.yamlutil.getDelimiters(text, this.editor.selection.isEmpty)
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
    splitYaml(text).forEach((unsortedYaml) => {
      let sortedYaml = outteryamlutil.sortYaml(unsortedYaml, customSort)
      if (sortedYaml) {
        if (!this.editor.selection.isEmpty) {
          // get number of leading whitespaces, these whitespaces will be used for indentation
          const indentation = YamlUtil.getNumberOfLeadingSpaces(unsortedYaml)
          sortedYaml = prependWhitespacesOnEachLine(sortedYaml, indentation)
        }
        newText += delimiters.shift() + sortedYaml
      } else {
        return [] as TextEdit[]
      }
    })
    if (this.editor.selection.isEmpty && settings.useLeadingDashes) {
      newText = `---\n${newText}`
    }
    this.vscodeadapter.showMessage(Severity.INFO, "Keys resorted successfully")
    return this.applyEdits(newText)
  }
}
