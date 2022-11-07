import * as vscode from "vscode"
import * as fs from "fs"
import { JsYamlAdapter } from "./adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "./adapter/vs-code-adapter"
import { prependWhitespacesOnEachLine, removeLeadingLineBreakOfFirstElement } from "./lib"
import { Settings } from "./settings"
import { getYamlFilesInDirectory } from "./util/file-util"
import { formatYaml, getDelimiters, sortYaml, splitYaml, validateTextRange } from "./util/yaml-util"

const settings = new Settings()
const jsyamladapter = new JsYamlAdapter()
const vscodeadapter = new VsCodeAdapter()

export function sortYamlWrapper(customSort = 0): vscode.TextEdit[] {
  const activeEditor = vscode.window.activeTextEditor
  if (activeEditor) {

    const textRange = vscodeadapter.getRange(activeEditor)
    let text = vscodeadapter.getText(activeEditor, textRange)

    try {
      validateTextRange(text)
      jsyamladapter.validateYaml(text)
    } catch (e) {
      if (e instanceof Error) {
        vscodeadapter.showMessage(Severity.ERROR, e.message)
      }
      return []
    }

    let numberOfLeadingSpaces = 0

    let delimiters = getDelimiters(text, activeEditor.selection.isEmpty, settings.getUseLeadingDashes())
    // remove yaml metadata tags
    const matchMetadata = /^%.*\n/gm
    // set metadata tags, if there is no metadata tag it should be an emtpy array
    let newText = ""
    if (text.match(matchMetadata)) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    }
    text = text.replace(matchMetadata, "")
    text = text.replace(/^\n/, "")

    // sort yaml
    let validYaml = true
    splitYaml(text).forEach((unsortedYaml) => {
      let sortedYaml = sortYaml(unsortedYaml, settings, customSort)
      if (sortedYaml) {
        if (!activeEditor.selection.isEmpty) {
          // get number of leading whitespaces, these whitespaces will be used for indentation
          if (!unsortedYaml.startsWith(" ")) {
            numberOfLeadingSpaces = 0
          } else {
            numberOfLeadingSpaces = unsortedYaml.search(/\S/)
          }
          sortedYaml = prependWhitespacesOnEachLine(sortedYaml, numberOfLeadingSpaces)
        }
        newText += delimiters.shift() + sortedYaml
      } else {
        validYaml = false
      }
    })
    if (activeEditor.selection.isEmpty && settings.getUseLeadingDashes()) {
      newText = "---\n" + newText
    }

    if (validYaml) {
      const edits = vscode.TextEdit.replace(textRange, newText)
      vscodeadapter.showMessage(Severity.INFO, "Keys resorted successfully")
      vscodeadapter.applyEdits([edits])
      return [edits]
    }
  }
  return []
}

export function validateYamlWrapper(): boolean {
  //  const text = vscodeadapter.getActiveDocument()
  if (vscode.window.activeTextEditor) {
    const text = vscode.window.activeTextEditor.document.getText()
    try {
      jsyamladapter.validateYaml(text)
      vscode.window.showInformationMessage("YAML is valid.")
      return true
    } catch (e) {
      if (e instanceof Error) {
        vscode.window.showErrorMessage("YAML is invalid: " + e.message)
      }
      return false
    }
  }
  /* istanbul ignore next */
  return false
}

export function formatYamlWrapper(): vscode.TextEdit[] {
  //let doc = vscodeadapter.getActiveDocument()
  const activeEditor = vscode.window.activeTextEditor

  if (activeEditor) {
    let doc = activeEditor.document.getText()
    let delimiters = getDelimiters(doc, true, settings.getUseLeadingDashes())
    // remove yaml metadata tags
    const matchMetadata = /^%.*\n/gm
    // set metadata tags, if there is no metadata tag it should be an emtpy array
    if (doc.match(matchMetadata)) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    }
    doc = doc.replace(matchMetadata, "")
    doc = doc.replace(/^\n/, "")

    let formattedYaml
    let validYaml = true
    const yamls = splitYaml(doc)
    let newText = ""
    for (const unformattedYaml of yamls) {
      formattedYaml = formatYaml(unformattedYaml, false, settings)
      if (formattedYaml) {
        newText += delimiters.shift() + formattedYaml
      } else {
        validYaml = false
        break
      }
    }
    if (validYaml) {
      if (settings.getUseLeadingDashes()) {
        newText = "---\n" + newText
      }
      const edits = vscode.TextEdit.replace(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        newText)
      new VsCodeAdapter().applyEdits([edits])
      return [edits]
    }
  }
  return []
}

/**
 * Sorts all yaml files in a directory
 * @param {vscode.Uri} uri Base URI
 */
export function sortYamlFiles(uri: vscode.Uri): boolean {
  const files = getYamlFilesInDirectory(uri.fsPath)
  files.forEach((file: string) => {
    const yaml = fs.readFileSync(file, 'utf-8').toString()
    const sortedYaml = sortYaml(yaml, settings, 0)

    if (sortedYaml) {
      try {
        fs.writeFileSync(file, sortedYaml)
      } catch (e) {
        /* istanbul ignore next */
        vscode.window.showErrorMessage("File " + file + " could not be sorted")
      }
    } else {
      vscode.window.showErrorMessage("File " + file + " could not be sorted")
    }
  })
  return true
}