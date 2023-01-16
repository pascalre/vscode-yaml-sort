import { TextEditor, TextEdit, Uri, window } from "vscode"
import { JsYamlAdapter } from "./adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "./adapter/vs-code-adapter"
import { prependWhitespacesOnEachLine, removeLeadingLineBreakOfFirstElement } from "./lib"
import { Settings } from "./settings"
import { FileUtil } from "./util/file-util"
import { getDelimiters, splitYaml, validateTextRange, YamlUtil } from "./util/yaml-util"

const settings = new Settings()
const jsyamladapter = new JsYamlAdapter()
const outterVscodeadapter = new VsCodeAdapter()
const yamlutil = new YamlUtil()

export class Controller {
  editor: TextEditor | undefined
  fileutil: FileUtil
  vscodeadapter: VsCodeAdapter

  constructor(fileutil = new FileUtil(), vscodeadapter = new VsCodeAdapter()) {
    this.editor = window.activeTextEditor
    this.fileutil = fileutil
    this.vscodeadapter = vscodeadapter
  }

  validateYamlWrapper(): boolean {
    if (this.editor) {
      const text = VsCodeAdapter.getActiveDocument(this.editor)
      try {
        jsyamladapter.validateYaml(text)
        this.vscodeadapter.showMessage(Severity.INFO, "YAML is valid.")
        return true
      } catch (e) {
        if (e instanceof Error) {
          this.vscodeadapter.showMessage(Severity.INFO, `YAML is invalid. ${e.message}`)
        }
      }
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
    } catch (e) {
      if (e instanceof Error) {
        this.vscodeadapter.showMessage(Severity.ERROR, e.message)
      }
    }
  }
}

export function sortYamlWrapper(customSort = 0): TextEdit[] {
  const activeEditor = window.activeTextEditor

  if (activeEditor) {
    const textRange = VsCodeAdapter.getRange(activeEditor)
    let text = VsCodeAdapter.getText(activeEditor, textRange)

    try {
      validateTextRange(text)
      jsyamladapter.validateYaml(text)
    } catch (e) {
      if (e instanceof Error) {
        outterVscodeadapter.showMessage(Severity.ERROR, e.message)
      }
      return [] as TextEdit[]
    }

    let delimiters = getDelimiters(text, activeEditor.selection.isEmpty, settings.getUseLeadingDashes())
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
      let sortedYaml = yamlutil.sortYaml(unsortedYaml, customSort)
      if (sortedYaml) {
        if (!activeEditor.selection.isEmpty) {
          // get number of leading whitespaces, these whitespaces will be used for indentation
          const indentation = YamlUtil.getNumberOfLeadingSpaces(unsortedYaml)
          sortedYaml = prependWhitespacesOnEachLine(sortedYaml, indentation)
        }
        newText += delimiters.shift() + sortedYaml
      } else {
        return [] as TextEdit[]
      }
    })
    if (activeEditor.selection.isEmpty && settings.getUseLeadingDashes()) {
      newText = `---\n${newText}`
    }
    outterVscodeadapter.showMessage(Severity.INFO, "Keys resorted successfully")
    return updateText(activeEditor, newText)
  }
  return [] as TextEdit[]
}

export function updateText(editor: TextEditor, text: string) {
  const edits = VsCodeAdapter.getEdits(editor, text)
  VsCodeAdapter.applyEdits([edits])
  return [edits]
}

export function formatYamlWrapper(): TextEdit[] {
  const activeEditor = window.activeTextEditor

  if (activeEditor) {
    let doc = VsCodeAdapter.getActiveDocument(activeEditor)
    let delimiters = getDelimiters(doc, true, settings.getUseLeadingDashes())
    // remove yaml metadata tags
    const matchMetadata = /^%.*\n/gm
    // set metadata tags, if there is no metadata tag it should be an emtpy array
    if (matchMetadata.test(doc)) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    }
    doc = doc.replace(matchMetadata, "")
    doc = doc.replace(/^\n/, "")

    let formattedYaml
    const yamls = splitYaml(doc)
    let newText = ""
    for (const unformattedYaml of yamls) {
      formattedYaml = yamlutil.formatYaml(unformattedYaml, false)
      if (formattedYaml) {
        newText += delimiters.shift() + formattedYaml
      } else {
        return []
      }
    }
    if (settings.getUseLeadingDashes()) {
      newText = `---\n${newText}`
    }
    return updateText(activeEditor, newText)
  }
  return []
}
