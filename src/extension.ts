// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import * as fs from "fs"

import {
  getDelimiters,
  prependWhitespacesOnEachLine,
  removeLeadingLineBreakOfFirstElement,
  splitYaml,
} from "./lib"

import {
  JsYamlAdapter
} from "./adapter/js-yaml-adapter"

import { Settings } from "./settings"
import { VsCodeAdapter } from "./adapter/vs-code-adapter"
import { formatYaml, sortYaml } from "./util/yaml-util"
import { getYamlFilesInDirectory } from "./util/file-util"

const settings = new Settings()
const jsyamladapter = new JsYamlAdapter()
const vscodeadapter = new VsCodeAdapter()

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const formatter: vscode.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(): vscode.TextEdit[] {
      if (settings.sortOnSave >= 0 && settings.sortOnSave <= 3) {
        return sortYamlWrapper(settings.sortOnSave)
      } else {/* istanbul ignore next */
        return formatYamlWrapper()
      }
    }
  }

  // register at activate-time
  vscodeadapter.registerFormatter(formatter)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-yaml-sort.sortYaml", () => {
      sortYamlWrapper()
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.validateYaml", () => {
      validateYamlWrapper()
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.formatYaml", () => {
      formatYamlWrapper()
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_1", () => {
      sortYamlWrapper(1)
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_2", () => {
      /* istanbul ignore next */
      sortYamlWrapper(2)
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_3", () => {
      /* istanbul ignore next */
      sortYamlWrapper(3)
    }),
    vscode.commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri: vscode.Uri) => {
      sortYamlFiles(uri)
    })
  )
}

export function sortYamlWrapper(customSort = 0): vscode.TextEdit[] {
  if (vscode.window.activeTextEditor) {
    const activeEditor = vscode.window.activeTextEditor
    const notifySuccess = settings.getNotifySuccess()
    const quotingType = settings.getQuotingType()
    const useLeadingDashes = settings.getUseLeadingDashes()

    let doc = activeEditor.document.getText()
    let numberOfLeadingSpaces = 0
    let rangeToBeReplaced = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(activeEditor.document.lineCount + 1, 0))

    if (!["'", "\""].includes(quotingType)) {
      vscode.window.showErrorMessage("Quoting type is an invalid value. Please check your settings.")
      return []
    }

    if (!activeEditor.selection.isEmpty) {
      let endLine = activeEditor.selection.end.line
      // if the selection ends on the first character on a new line, we will ignore this line
      if (activeEditor.selection.end.character === 0) {
        endLine--
      }

      // ensure that selection covers whole start and end line
      rangeToBeReplaced = new vscode.Selection(
        activeEditor.selection.start.line, 0,
        endLine, activeEditor.document.lineAt(endLine).range.end.character)
      doc = activeEditor.document.getText(rangeToBeReplaced)

      // check if selection to sort is valid, maybe the user missed a trailing line
      if (isSelectionInvalid(doc)) {
        vscode.window.showErrorMessage("YAML selection is invalid. Please check the ending of your selection.")
        return []
      }
    } else {
      try {
        jsyamladapter.validateYaml(doc)
      } catch (e) {
        if (e instanceof Error) {
          vscode.window.showErrorMessage("YAML is invalid: " + e.message)
        }
        return []
      }
    }

    let delimiters = getDelimiters(doc, activeEditor.selection.isEmpty, useLeadingDashes)
    // remove yaml metadata tags
    const matchMetadata = /^%.*\n/gm
    // set metadata tags, if there is no metadata tag it should be an emtpy array
    let newText = ""
    if (doc.match(matchMetadata)) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    }
    doc = doc.replace(matchMetadata, "")
    doc = doc.replace(/^\n/, "")

    // sort yaml
    let validYaml = true
    splitYaml(doc).forEach((unsortedYaml) => {
      let sortedYaml = sortYaml(unsortedYaml, customSort, settings)
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
    if (activeEditor.selection.isEmpty && useLeadingDashes) {
      newText = "---\n" + newText
    }

    if (validYaml) {
      const edits = vscode.TextEdit.replace(rangeToBeReplaced, newText)
      if (notifySuccess) {
        vscode.window.showInformationMessage("Keys resorted successfully")
      }
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
  const activeEditor = vscode.window.activeTextEditor

  if (activeEditor) {
    let doc = activeEditor.document.getText()
    let delimiters = getDelimiters(doc, true, settings.getUseLeadingDashes())
    // remove yaml metadata tags
    const matchMetadata = /^%.*\n/gm
    // set metadata tags, if there is no metadata tag it should be an emtpy array
    let newText = ""
    if (doc.match(matchMetadata)) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    }
    doc = doc.replace(matchMetadata, "")
    doc = doc.replace(/^\n/, "")

    let formattedYaml
    let validYaml = true
    const yamls = splitYaml(doc)
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
    const sortedYaml = sortYaml(yaml, 0, settings)

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

/**
 * Checks if a text ends with a character which suggests, that the selection is missing something.
 * @param   {string}        text Text which should represent a valid yaml selection to sort.
 * @returns {boolean} true, if selection is missing something
 */
export function isSelectionInvalid(text: string): boolean {
  // remove trailing whitespaces, to check for things like 'text:  '
  text = text.trim()
  const notValidEndingCharacters = [":", "|", ">"]
  if (notValidEndingCharacters.includes(text.charAt(text.length - 1))) {
    return true
  }
  try {
    jsyamladapter.validateYaml(text)
    return false
  } catch (e) {
    if (e instanceof Error) {
      vscode.window.showErrorMessage("YAML is invalid: " + e.message)
    }
    return true
  }
}
