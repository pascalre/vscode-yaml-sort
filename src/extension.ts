// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as yamlParser from "js-yaml"
import * as vscode from "vscode"
import * as fs from "fs"

import {
  getDelimiters,
  isSelectionInvalid,
  prependWhitespacesOnEachLine,
  removeLeadingLineBreakOfFirstElement,
  removeQuotesFromKeys,
  replaceTabsWithSpaces,
  removeTrailingCharacters,
  splitYaml,
  addNewLineBeforeKeywordsUpToLevelN,
  getYamlFilesInDirectory
} from "./lib"

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.sortYaml", () => {
    sortYamlWrapper()
  }))
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.validateYaml", () => {
    validateYamlWrapper()
  }))
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.formatYaml", () => {
    formatYamlWrapper()
  }))
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_1", () => {
    sortYamlWrapper(1)
  }))
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_2", () => {
    sortYamlWrapper(2)
  }))
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_3", () => {
    sortYamlWrapper(3)
  }))
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.sortYamlFilesInDirectory", (uri: vscode.Uri) => {
    sortYamlFiles(uri)
  }))
}

/**
 * Dumps a yaml with the user specific settings.
 * @param   {string}  text     Yaml document which should be dumped.
 * @param   {boolean} sortKeys If set to true, the function will sort the keys in the document. Defaults to true.
 * @returns {string}           Clean yaml document.
 */
export function dumpYaml(text: string, sortKeys = true, customSort = 0): string {
  if (Object.keys(text).length === 0) {
    return ""
  }

  let yaml = yamlParser.dump(text, {
    indent:        vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent"),
    forceQuotes:   vscode.workspace.getConfiguration().get("vscode-yaml-sort.forceQuotes"),
    lineWidth:     vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth"),
    noArrayIndent: vscode.workspace.getConfiguration().get("vscode-yaml-sort.noArrayIndent"),
    quotingType:   vscode.workspace.getConfiguration().get("vscode-yaml-sort.quotingType"),
    sortKeys:      (!(customSort > 0 && vscode.workspace.getConfiguration().get("vscode-yaml-sort.useCustomSortRecursively")) ? sortKeys : (a: string, b: string) => {
      const sortOrder = getCustomSortKeywords(customSort)

      const indexA = sortOrder.indexOf(a)
      const indexB = sortOrder.indexOf(b)

      if (indexA > -1 && indexB > -1) {
        return indexA > indexB ? 1 : indexA < indexB ? -1 : 0
      }
      if (indexA !== -1 && indexB === -1) {
        return -1
      }
      if (indexA === -1 && indexB !== -1) {
        return 1
      }
      return a > b ? 1 : a < b ? -1 : 0
    })
  })

  // this is neccesary to avoid linebreaks in a selection sort
  yaml = removeTrailingCharacters(yaml, 1)

  if (vscode.workspace.getConfiguration().get("vscode-yaml-sort.useQuotesForSpecialKeywords")) {
    return yaml
  } else {
    return removeQuotesFromKeys(yaml)
  }
}

/**
 * Looks up the user settings for one of the three the custom sort keywords.
 * @param   {number}   count Number of the keyword list.
 * @returns {[string]} Array of custom sort keywords.
 */
export function getCustomSortKeywords(count: number): [string] {
  switch (count) {
    case 1:
      return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_1") as [string]
    case 2:
      return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_2") as [string]
    case 3:
      return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_3") as [string]
    default: throw new Error("The count parameter is not in a valid range")
  }
}

export function sortYamlWrapper(customSort = 0): boolean {
  if (vscode.window.activeTextEditor) {
    const useLeadingDashes      = vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes") as boolean
    const quotingType           = vscode.workspace.getConfiguration().get("vscode-yaml-sort.quotingType") as string
    const activeEditor          = vscode.window.activeTextEditor
    let   doc                   = activeEditor.document.getText()
    let   numberOfLeadingSpaces = 0
    let   rangeToBeReplaced     = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(activeEditor.document.lineCount + 1, 0))

    if (!["'", "\""].includes(quotingType)) {
      vscode.window.showErrorMessage("Quoting type is an invalid value. Please check your settings.")
      return false
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
        return false
      }
    } else {
      if (!validateYaml(doc)) {
        return false
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
      let sortedYaml = sortYaml(unsortedYaml, customSort)
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
      // update yaml
      activeEditor.edit((builder) => builder.replace(rangeToBeReplaced, newText))
      vscode.window.showInformationMessage("Keys resorted successfully")
    }
    return true
  }
  return false
}

export function sortYaml(unsortedYaml: string, customSort = 0): string|null {
  try {
    const emptyLinesUntilLevel     = vscode.workspace.getConfiguration().get("vscode-yaml-sort.emptyLinesUntilLevel")     as number
    const indent                   = vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent")                   as number
    const useCustomSortRecursively = vscode.workspace.getConfiguration().get("vscode-yaml-sort.useCustomSortRecursively") as boolean
    const unsortedYamlWithoutTabs  = replaceTabsWithSpaces(unsortedYaml, indent)
    const doc                      = yamlParser.load(unsortedYamlWithoutTabs)                                             as any
    let   sortedYaml               = ""

    if (customSort > 0 && !useCustomSortRecursively) {
      const keywords = getCustomSortKeywords(customSort)

      keywords.forEach(key => {
        if (doc[key]) {
          let sortedSubYaml = dumpYaml(doc[key])
          if ((sortedSubYaml.includes(":") && !sortedSubYaml.startsWith("|")) || sortedSubYaml.startsWith("-")) {
              // when key cotains more than one line, we need some transformation:
              // add a new line and indent each line some spaces
              sortedSubYaml = prependWhitespacesOnEachLine(sortedSubYaml, indent)
              if (sortedSubYaml.endsWith("\n")) {
                sortedSubYaml = removeTrailingCharacters(sortedSubYaml, indent)
              }
              sortedYaml += key + ":\n" + sortedSubYaml + "\n"
          } else {
            sortedYaml += key + ": " + sortedSubYaml + "\n"
          }
          // delete key from yaml
          delete doc[key]
        }
      })
    }

    // either sort whole yaml or sort the rest of the yaml (which can be empty) and add it to the sortedYaml
    sortedYaml += dumpYaml(doc, true, customSort)

    if (emptyLinesUntilLevel > 0) {
      sortedYaml = addNewLineBeforeKeywordsUpToLevelN(emptyLinesUntilLevel, indent, sortedYaml)
    }

    return sortedYaml
  } catch (e) {
    vscode.window.showErrorMessage("Keys could not be resorted: " + e.message)
    return null
  }
}

export function validateYamlWrapper(): boolean {
  if (vscode.window.activeTextEditor) {
    validateYaml(vscode.window.activeTextEditor.document.getText())
    return true
  }
  return false
}

/**
 * Validates a given yaml document.
 * @param   {string}  yaml Yaml to be validated.
 * @returns {boolean} True, if yaml is valid.
 */
export function validateYaml(text: string): boolean {

  try {
    splitYaml(text).forEach((yaml) => {
      yamlParser.load(yaml)
    })
    vscode.window.showInformationMessage("YAML is valid.")
    return true
  } catch (e) {
    vscode.window.showErrorMessage("YAML is invalid: " + e.message)
    return false
  }
}

export function formatYamlWrapper(): boolean {
  const activeEditor  = vscode.window.activeTextEditor
  if (activeEditor) {
    const formattedYaml = formatYaml(activeEditor.document.getText(), vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes") as boolean)
    if (formattedYaml) {
      activeEditor.edit((builder) => builder.replace(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        formattedYaml))
      return true
    }
  }
  return false
}

/**
 * Formats a yaml document (without sorting).
 * @param   {string} yaml Yaml to be formatted.
 * @returns {string} Formatted yaml.
 */
export function formatYaml(yaml: string, useLeadingDashes: boolean): string|null {
  try {
    let doc = dumpYaml(yamlParser.load(yaml) as string, false)
    if (useLeadingDashes) {
      doc = "---\n" + doc
    }
    vscode.window.showInformationMessage("Yaml formatted successfully")
    return doc
  } catch (e) {
    vscode.window.showErrorMessage("Yaml could not be formatted: " + e.message)
    return null
  }
}

/**
 * Sorts all yaml files in a directory
 * @param {vscode.Uri} uri Base URI
 */
export function sortYamlFiles(uri: vscode.Uri): boolean {
  const files = getYamlFilesInDirectory(uri.fsPath)
  files.forEach((file: string) => {
    const yaml = fs.readFileSync(file, 'utf-8').toString()
    const sortedYaml = sortYaml(yaml)
    if (sortedYaml) {
      try {
        fs.writeFileSync(file, yaml)
      } catch(e) {
        vscode.window.showErrorMessage("File " + file + " could not be sorted")
        return false
      }        
    } else {
      vscode.window.showErrorMessage("File " + file + " could not be sorted")
      return false
    }
  })
  return true
}
