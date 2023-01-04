import { TextEdit, Uri, window } from "vscode"
import { readFileSync, writeFileSync } from "fs"
import { JsYamlAdapter } from "./adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "./adapter/vs-code-adapter"
import { prependWhitespacesOnEachLine, removeLeadingLineBreakOfFirstElement } from "./lib"
import { Settings } from "./settings"
import { FileUtil } from "./util/file-util"
import { getDelimiters, splitYaml, validateTextRange, YamlUtil } from "./util/yaml-util"

const settings = new Settings()
const jsyamladapter = new JsYamlAdapter()
const vscodeadapter = new VsCodeAdapter()
const yamlutil = new YamlUtil()

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
        vscodeadapter.showMessage(Severity.ERROR, e.message)
      }
      return [] as TextEdit[]
    }

    let numberOfLeadingSpaces = 0

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
          numberOfLeadingSpaces = YamlUtil.getNumberOfLeadingSpaces(unsortedYaml)
          sortedYaml = prependWhitespacesOnEachLine(sortedYaml, numberOfLeadingSpaces)
        }
        newText += delimiters.shift() + sortedYaml
      } else {
        return [] as TextEdit[]
      }
    })
    if (activeEditor.selection.isEmpty && settings.getUseLeadingDashes()) {
      newText = `---\n${newText}`
    }

    const edits = VsCodeAdapter.getEdits(activeEditor, newText)
    vscodeadapter.showMessage(Severity.INFO, "Keys resorted successfully")
    VsCodeAdapter.applyEdits([edits])
    return [edits]
  }
  return [] as TextEdit[]
}

export function validateYamlWrapper(): boolean {
  const activeEditor = window.activeTextEditor

  if (activeEditor) {
    const text = VsCodeAdapter.getActiveDocument(activeEditor)
    try {
      jsyamladapter.validateYaml(text)
      vscodeadapter.showMessage(Severity.INFO, "YAML is valid.")
      return true
    } catch (e) {
      if (e instanceof Error) {
        vscodeadapter.showMessage(Severity.INFO, `YAML is invalid. ${e.message}`)
      }
    }
  }
  return false
}

export function formatYamlWrapper(): TextEdit[] {
  const activeEditor = window.activeTextEditor

  if (activeEditor) {
    let doc = activeEditor.document.getText()
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
    const edits = VsCodeAdapter.getEdits(activeEditor, newText)
    VsCodeAdapter.applyEdits([edits])
    return [edits]
  }
  return []
}

/**
 * Sorts all yaml files in a directory
 * @param {Uri} uri Base URI
 */
export function sortYamlFiles(uri: Uri): boolean {
  const files = new FileUtil().getFilesWithExtensions(uri.fsPath)
  files.forEach((file: string) => {
    const yaml = readFileSync(file, 'utf-8').toString()
    const sortedYaml = yamlutil.sortYaml(yaml, 0)

    if (sortedYaml) {
      try {
        writeFileSync(file, sortedYaml)
      } catch (e) {
        /* istanbul ignore next */
        vscodeadapter.showMessage(Severity.ERROR, `File ${file} could not be sorted`)
      }
    } else {
      vscodeadapter.showMessage(Severity.ERROR, `File ${file} could not be sorted`)
    }
  })
  return true
}