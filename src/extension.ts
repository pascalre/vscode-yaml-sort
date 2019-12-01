// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as yamlParser from "js-yaml"
import * as vscode from "vscode"

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
}

/**
 * Splits a string, which contains multiple yaml documents.
 * @param {string} multipleYamls String which contains multiple yaml documents.
 * @returns {[string]} Array of yaml documents.
 */
export function splitYaml(multipleYamls: string) {
  return multipleYamls.split(/^---.*/m).filter((obj) => obj) as [string]
}

/**
 * Returns all delimiters with comments
 * @param {string} multipleYamls String which contains multiple yaml documents.
 * @param {boolean} isSelectionEmpty Specify if the text is an selection
 * @returns {[string]} Array of yaml delimiters.
 */

export function getDelimiters(multipleYamls: string, isSelectionEmpty: boolean) {
  const useLeadingDashes = vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes")
  // remove empty lines
  multipleYamls = multipleYamls.replace(/^\n/g, "")
  let delimiters = multipleYamls.match(/^---.*/gm)
  if (!delimiters) {
    return [""]
  }

  // append line break to every delimiter
  // delimiters = delimiters.map(delimiter => delimiter + "\n")!
  // let firstElement = delimiters.shift()!;
  delimiters = delimiters.map((delimiter) => "\n" + delimiter + "\n")!
  // delimiters.unshift(firstElement)

  if (isSelectionEmpty) {
    if (!useLeadingDashes && multipleYamls.startsWith("---")) {
      delimiters.shift()
      delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
    } else if (useLeadingDashes && !multipleYamls.startsWith("---")) {
      delimiters.unshift("---\n")
    }
  } else {
    const firstDelimiter = delimiters.shift()!.replace(/^\n/, "")
    delimiters.unshift(firstDelimiter)
    if (!multipleYamls.startsWith("---")) {
      delimiters.unshift("")
    }
  }
  return delimiters
}

/**
 * Removes the leading line break of the first element of an array.
 * @param {RegExpMatchArray} delimiters Array for processing.
 * @returns {RegExpMatchArray}
 */
export function removeLeadingLineBreakOfFirstElement(delimiters: RegExpMatchArray) {
  const firstDelimiter = delimiters.shift()!.replace(/^\n/, "")
  delimiters.unshift(firstDelimiter)
  return delimiters
}

/**
 * Removes a given count of characters from a string.
 * @param {string} text  String for processing.
 * @param {number} count The number of characters to remove from the end of the returned string.
 * @returns {string} Input text which removed trailing characters.
 */
export function removeTrailingCharacters(text: string, count: number = 1) {
  if (count < 0 || count > text.length) {
    throw new Error("The count parameter is not in a valid range")
  }
  return text.substr(0, text.length - count)
}

/**
 * Removes single quotes from special keywords
 * e.g. '1.4.2': will result in 1.4.2: or 'puppet::key': will result in puppet::key:
 * @param {string} text String for processing.
 */
export function removeQuotesFromKeys(text: string) {
  return text.replace(/'(.*)':/g, "$1:")
}

/**
 * Prepends a given count of whitespaces to every single line in a text.
 * Lines with yaml seperators (---) will not be indented
 * @param {string} text  Text which should get some leading whitespaces on each line.
 * @param {number} count The number of whitesspaces to prepend on each line of the returned string.
 * @returns {string} Input Text, which has the given count of whitespaces prepended on each single line.
 */
export function prependWhitespacesOnEachLine(text: string, count: number) {
  if (count < 0) {
    throw new Error("The count parameter is not a positive number")
  }

  const spaces = " ".repeat(count)
  return text.replace(/^(?!---)/mg, spaces)
}

/**
 * Checks if a text ends with a character which suggests, that the selection is missing something.
 * @param {string} text Text which should represent a valid yaml selection to sort.
 * @returns {boolean} true, if selection is missing something
 */
export function isSelectionInvalid(text: string) {
  // remove trailing whitespaces, to check for things like 'text:  '
  text = text.trim()
  const notValidEndingCharacters = [":", "|", ">"]
  if (notValidEndingCharacters.includes(text.charAt(text.length - 1))) {
    vscode.window.showErrorMessage("YAML selection is invalid. Please check the ending of your selection.")
    return true
  }
  return false
}

/**
 * Dumps a yaml with the user specific settings.
 * @param {number}  text     Yaml document which should be dumped.
 * @param {boolean} sortKeys If set to true, the function will sort the keys in the document. Defaults to true.
 * @returns {string} Clean yaml document.
 */
export function dumpYaml(text: string, sortKeys: boolean = true) {
  if (Object.keys(text).length === 0) {
    return ""
  }

  let yaml = yamlParser.safeDump(text, {
    indent:        vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent"),
    lineWidth:     vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth"),
    noArrayIndent: vscode.workspace.getConfiguration().get("vscode-yaml-sort.noArrayIndent"),
    sortKeys,
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
 * @param {number} count Number of the keyword list.
 * @returns {[string]} Array of custom sort keywords.
 */
export function getCustomSortKeywords(count: number) {
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

export function sortYamlWrapper(customSort: number = 0) {
  const activeEditor = vscode.window.activeTextEditor!
  let rangeToBeReplaced = new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(activeEditor.document.lineCount + 1, 0))
  let doc = activeEditor.document.getText()
  let numberOfLeadingSpaces = 0

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
      return false
    }

    // get number of leading whitespaces, these whitespaces will be used for indentation
    numberOfLeadingSpaces = doc.search(/\S/)
  }

  let delimiters = getDelimiters(doc, activeEditor.selection.isEmpty)

  // remove yaml metadata tags
  const matchMetadata = /^\%.*\n/gm
  // set metadata tags, if there is no metadata tag it should be an emtpy array
  const metadata = doc.match(matchMetadata) ? doc.match(matchMetadata)! : [""]
  let newText = ""
  if (doc.match(matchMetadata)) {
    // metadata = doc.match(matchMetadata)!
    // newText = metadata.join("") + delimiters.shift();
    delimiters.shift()
    delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
  }
  doc = doc.replace(matchMetadata, "")

//  if (!validateYaml(doc))
//    return false;

  // sort yaml
  splitYaml(doc).forEach((unsortedYaml) => {
    if (sortYaml(unsortedYaml, customSort)) {
      newText += delimiters.shift() + sortYaml(unsortedYaml, customSort)!
    }
  })

  // remove leading dashes
  /*if (!activeEditor.selection.isEmpty ||
    !vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes")) {
    newText = newText.replace("---\n", "");
  }*/

  if (!activeEditor.selection.isEmpty) {
    newText = prependWhitespacesOnEachLine(newText, numberOfLeadingSpaces)
  }

  // update yaml
  activeEditor.edit((builder) => builder.replace(rangeToBeReplaced, newText))
}

export function sortYaml(unsortedYaml: string, customSort: number = 0) {
  try {
    const doc = yamlParser.safeLoad(unsortedYaml)
    const indent = vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent") as number
    let sortedYaml = ""

    if (customSort > 0) {
      const keywords = getCustomSortKeywords(customSort)

      keywords.forEach((key) => {
        if (doc[key]) {
          let sortedSubYaml = dumpYaml(doc[key])
          if (sortedSubYaml.includes(":") && !sortedSubYaml.startsWith("|")) {
              // when key cotains more than one line, we need some transformation:
              // add a new line and indent each line some spaces
              sortedSubYaml = prependWhitespacesOnEachLine(sortedSubYaml, indent)
              sortedSubYaml = removeTrailingCharacters(sortedSubYaml, indent)
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
    sortedYaml += dumpYaml(doc)

    vscode.window.showInformationMessage("Keys resorted successfully")
    return sortedYaml
  } catch (e) {
    vscode.window.showErrorMessage("Keys could not be resorted: " + e.message)
    return null
  }
}

export function validateYamlWrapper() {
  const activeEditor = vscode.window.activeTextEditor!
  validateYaml(activeEditor.document.getText())!
}

/**
 * Validates a given yaml document.
 * @param {string} yaml Yaml to be validated.
 * @returns {boolean} True, if yaml is valid.
 */
export function validateYaml(text: string) {
  try {
    yamlParser.safeLoad(text)
    vscode.window.showInformationMessage("YAML is valid.")
    return true
  } catch (e) {
    vscode.window.showErrorMessage("YAML is invalid: " + e.message)
    return false
  }
}

export function formatYamlWrapper() {
  const activeEditor = vscode.window.activeTextEditor!
  const formattedYaml = formatYaml(activeEditor.document.getText())
  if (formattedYaml) {
    activeEditor.edit((builder) => builder.replace(
      new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(activeEditor.document.lineCount + 1, 0)),
      formattedYaml))
  }
}

/**
 * Formats a yaml document (without sorting).
 * @param {string} yaml Yaml to be formatted.
 * @returns {string} Formatted yaml.
 */
export function formatYaml(yaml: string) {
  try {
    let doc = dumpYaml(yamlParser.safeLoad(yaml), false)
    if (vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes")) {
      doc = "---\n" + doc
    }
    vscode.window.showInformationMessage("Yaml formatted successfully")
    return doc
  } catch (e) {
    vscode.window.showErrorMessage("Yaml could not be formatted: " + e.message)
    return null
  }
}
