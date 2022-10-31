// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as jsyaml from "js-yaml"
import * as vscode from "vscode"
import * as fs from "fs"

import {
  getDelimiters,
  prependWhitespacesOnEachLine,
  removeLeadingLineBreakOfFirstElement,
  replaceTabsWithSpaces,
  removeTrailingCharacters,
  splitYaml,
  addNewLineBeforeKeywordsUpToLevelN,
  getYamlFilesInDirectory,
} from "./lib"
import { Settings } from "./settings"
import { Sort } from "./sort"

const settings = new Settings()

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

  // have a function that adds/removes the formatter based
  // on a configuration setting
  let registration: vscode.Disposable | undefined;
  function registerFormatterIfEnabled() {
    const isEnabled = vscode.workspace.getConfiguration().get('vscode-yaml-sort.useAsFormatter', true);
    if (isEnabled && !registration) {/* istanbul ignore next */
      registration = vscode.languages.registerDocumentFormattingEditProvider('yaml', formatter);
    } else if (!isEnabled && registration) {/* istanbul ignore next */
      registration.dispose();/* istanbul ignore next */
      registration = undefined;
    }
  }

  // register at activate-time
  registerFormatterIfEnabled();

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
    /* istanbul ignore next */
    sortYamlWrapper(2)
  }))
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_3", () => {
    /* istanbul ignore next */
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
 export function dumpYaml(text: string, sortKeys: boolean, custom: number, settings: Settings): string {

  if (Object.keys(text).length === 0) {
    return ""
  }

  let yaml = jsyaml.dump(text, {
    indent: settings.getIndent(),
    forceQuotes: settings.getForceQuotes(),
    lineWidth: settings.getLineWidth(),
    noArrayIndent: settings.getNoArrayIndent(),
    noCompatMode: settings.getNoCompatMode(),
    quotingType: settings.getQuotingType(),
    schema: settings.getSchema(),
    sortKeys: (!(custom > 0 && settings.getUseCustomSortRecursively()) ? sortKeys : (a: string, b: string) => {
      const sortOrder = settings.getCustomSortKeywords(custom)
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
      return a.localeCompare(b, settings.getLocale())
    })
  })

  // this is neccesary to avoid linebreaks in a selection sort
  yaml = removeTrailingCharacters(yaml, 1)

  return yaml
}

/**
 * Looks up the user settings for one of the three the custom sort keywords.
 * @param   {number}   count Number of the keyword list.
 * @returns {[string]} Array of custom sort keywords.
 */
 export function getCustomSortKeywords(count: number): [string] {
  if (count == 1 || count == 2 || count == 3) {
    return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_" + count) as [string]
  } else
    throw new Error("The count parameter is not in a valid range")
}

/**
 * Applys edits to a text editor
 * @param activeEditor Editor to apply the changes
 * @param edits Changes to apply
 */
export function applyEdits(activeEditor: vscode.TextEditor, edits: [vscode.TextEdit]) {
  if (activeEditor) {
    const workEdits = new vscode.WorkspaceEdit()
    workEdits.set(activeEditor.document.uri, edits)
    vscode.workspace.applyEdit(workEdits)
  }
}

export function sortYamlWrapper(customSort = 0): vscode.TextEdit[] {
  if (vscode.window.activeTextEditor) {
    const activeEditor = vscode.window.activeTextEditor
    const notifySuccess = vscode.workspace.getConfiguration().get("vscode-yaml-sort.notifySuccess") as boolean
    const quotingType = vscode.workspace.getConfiguration().get("vscode-yaml-sort.quotingType") as "'" | '"'
    const useLeadingDashes = vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes") as boolean

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
      if (!validateYaml(doc, settings, false)) {
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
      applyEdits(activeEditor, [edits])
      return [edits]
    }
  }
  return []
}

export function sortYaml(
  unsortedYaml: string,
  customSort = 0,
  settings: Settings
): string | null {
  try {
    const loadOptions = { schema: settings.getSchema() }
    const unsortedYamlWithoutTabs = replaceTabsWithSpaces(unsortedYaml, settings.getIndent())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments = findComments(unsortedYamlWithoutTabs)
    const doc = jsyaml.load(unsortedYamlWithoutTabs, loadOptions) as any
    let sortedYaml = ""

    if (customSort > 0 && !settings.getUseCustomSortRecursively()) {
      const keywords = getCustomSortKeywords(customSort)

      keywords.forEach(key => {
        if (doc[key]) {
          let sortedSubYaml = dumpYaml(doc[key], true, customSort, settings)
          if ((sortedSubYaml.includes(":") && !sortedSubYaml.startsWith("|")) || sortedSubYaml.startsWith("-")) {
            // when key cotains more than one line, we need some transformation:
            // add a new line and indent each line some spaces
            sortedSubYaml = prependWhitespacesOnEachLine(sortedSubYaml, settings.getIndent())
            if (sortedSubYaml.endsWith("\n")) {
              sortedSubYaml = removeTrailingCharacters(sortedSubYaml, settings.getIndent())
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
    sortedYaml += dumpYaml(doc, true, customSort, settings)

    if (settings.getEmptyLinesUntilLevel() > 0) {
      sortedYaml = addNewLineBeforeKeywordsUpToLevelN(settings.getEmptyLinesUntilLevel(), settings.getIndent(), sortedYaml)
    }

    sortedYaml = applyComments(sortedYaml, comments)

    return sortedYaml
  } catch (e) {
    if (e instanceof Error) {
      vscode.window.showErrorMessage("Keys could not be resorted: " + e.message)
    }
    return null
  }
}

export function validateYamlWrapper(): boolean {
  if (vscode.window.activeTextEditor) {
    validateYaml(vscode.window.activeTextEditor.document.getText(), settings, true)
    return true
  }
  /* istanbul ignore next */
  return false
}

/**
 * Validates a given yaml document.
 * @param   {string}  notifySuccess Notify successfull validation.
 * @param   {string}  text Yaml to be validated.
 * @param   {string}  schema Expected schema.
 * @returns {boolean} True, if yaml is valid.
 */
export function validateYaml(text: string, settings: Settings, notify: boolean): boolean {
  try {
    splitYaml(text).forEach((yaml) => {
      jsyaml.load(yaml, { schema: settings.getSchema() })
    })
    if (notify && settings.getNotifySuccess()) {
      vscode.window.showInformationMessage("YAML is valid.")
    }
    return true
  } catch (e) {
    if (e instanceof Error) {
      vscode.window.showErrorMessage("YAML is invalid: " + e.message)
    }
    return false
  }
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
      formattedYaml = formatYaml(unformattedYaml, false, settings.getNotifySuccess(), settings)
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
      applyEdits(activeEditor, [edits])
      return [edits]
    }
  }
  return []
}

/**
 * Formats a yaml document (without sorting).
 * @param   {string} yaml Yaml to be formatted.
 * @returns {string} Formatted yaml.
 */
export function formatYaml(
  yaml: string,
  useLeadingDashes: boolean,
  notifySuccess: boolean,
  settings: Settings
): string | null {
  try {
    const loadOptions = { schema: settings.getSchema() }
    const comments = findComments(yaml)
    let doc = dumpYaml(jsyaml.load(yaml, loadOptions) as string, false, 0, settings)
    doc = applyComments(doc, comments)
    if (useLeadingDashes) {
      doc = "---\n" + doc
    }
    if (notifySuccess) {
      vscode.window.showInformationMessage("Yaml formatted successfully")
    }
    return doc
  } catch (e) {
    if (e instanceof Error) {
      vscode.window.showErrorMessage("Yaml could not be formatted: " + e.message)
    }
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
  return !validateYaml(text, settings, false)
}

/**
 * Finds all full line comments in a given yaml (ignoring comments in the same line with code).
 * @param text Yaml document
 */
export function findComments(text: string): Map<string, string> {
  const comments = new Map<string, string>
  const lines = text.toString().split("\n")
  for (let i = 0; i < lines.length; i++) {
    let comment = ""
    while (/^ *#/.test(lines[i])) {
      comment += lines[i] + "\n"
      i++
    }
    comment = comment.replace(/\n$/, "")
    if (comment != "") {
      if (i < lines.length) {
        comments.set(comment, lines[i])
      } else {
        comments.set(comment, '')
      }
    }
  }
  return comments
}

export function applyComments(text: string, comments: Map<string, string>): string {
  for (const [comment, line] of comments) {
    if (line == '') {
      text += "\n" + comment
    } else {
      let index = text.search(line)
      if (index == -1) {
        const trimmedLine = line.trim()
        index = text.search(trimmedLine)
        if (index != -1) {
          const textHelper = text.slice(0, index)
          const lastLineBreak = textHelper.lastIndexOf('\n')
          // remove trailing whitespaces
          const textBeforeComment = textHelper.slice(0, lastLineBreak)
          let textAfterComment = textHelper.slice(lastLineBreak)
          textAfterComment += text.slice(text.search(trimmedLine))
          text = textBeforeComment + "\n" + comment.split("\n")[0] + textAfterComment
        }
      } else {
        text = text.slice(0, index) + comment + "\n" + text.slice(text.search(line))
      }
    }
  }
  return text
}