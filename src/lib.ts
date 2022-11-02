import { glob } from "glob"

/**
 * Returns all files in a directory and its subdirectories with extension .yml or .yaml
 * @param   {vscode.Uri} uri Base URI
 * @returns {string[]}   List of Yaml files
 */
export function getYamlFilesInDirectory(uri: string): string[] {
  return glob.sync(uri + "/**/**.y?(a)ml")
}

/**
 * Removes single quotes from special keywords
 * e.g. '1.4.2': will result in 1.4.2: or 'puppet::key': will result in puppet::key:
 * @param  {string} text String for processing.
 * @returns {string} processed text
 */
export function removeQuotesFromKeys(text: string): string {
  return text.replace(/'(.*)':/g, "$1:")
}

/**
 * Removes a given count of characters from a string.
 * @param   {string} text  String for processing.
 * @param   {number} count The number of characters to remove from the end of the returned string.
 * @returns {string} Input text with removed trailing characters.
 */
export function removeTrailingCharacters(text: string, count = 1): string {
  if (count >= 0 && count <= text.length) {
    return text.substr(0, text.length - count)
  } else {
    throw new Error("The count parameter is not in a valid range")
  }
}

/**
 * Prepends a given count of whitespaces to every single line in a text.
 * Lines with yaml seperators (---) will not be indented
 * @param   {string} text  Text which should get some leading whitespaces on each line.
 * @param   {number} count The number of whitesspaces to prepend on each line of the returned string.
 * @returns {string} Input Text, which has the given count of whitespaces prepended on each single line.
 */
export function prependWhitespacesOnEachLine(text: string, count: number): string {
  if (count < 0) {
    throw new Error("The count parameter is not a positive number")
  }

  const spaces = " ".repeat(count)
  return text.replace(/^(?!---)/mg, spaces)
}

/**
 * Removes the leading line break of the first element of an array.
 * @param   {RegExpMatchArray} delimiters Array for processing.
 * @returns {RegExpMatchArray}
 */
export function removeLeadingLineBreakOfFirstElement(delimiters: RegExpMatchArray):RegExpMatchArray {
  let firstDelimiter = delimiters.shift()
  if (firstDelimiter) {
    firstDelimiter = firstDelimiter.replace(/^\n/, "")
    delimiters.unshift(firstDelimiter)  
  }
  return delimiters
}

/**
 * Splits a string, which contains multiple yaml documents.
 * @param   {string}   multipleYamls String which contains multiple yaml documents.
 * @returns {[string]} Array of yaml documents.
 */
export function splitYaml(multipleYamls: string):[string] {
  return multipleYamls.split(/^---.*/m).filter((obj) => obj) as [string]
}

/**
 * Returns all delimiters with comments.
 * @param   {string}  multipleYamls String which contains multiple yaml documents.
 * @param   {boolean} isSelectionEmpty Specify if the text is an selection
 * @param   {boolean} useLeadingDashes Specify if the documents should have a leading delimiter.
 *                                   If set to false, it will add an empty array element at the beginning of the output.
 * @returns {[string]} Array of yaml delimiters.
 */
export function getDelimiters(multipleYamls: string, isSelectionEmpty: boolean, useLeadingDashes: boolean): string[] {
  // remove empty lines
  multipleYamls = multipleYamls.trim()
  multipleYamls = multipleYamls.replace(/^\n/, "")
  let delimiters = multipleYamls.match(/^---.*/gm)
  if (!delimiters) {
    return [""]
  }

  // append line break to every delimiter
  delimiters = delimiters.map((delimiter) => "\n" + delimiter + "\n")

  if (delimiters) {
    if (isSelectionEmpty) {
      if (!useLeadingDashes && multipleYamls.startsWith("---")) {
        delimiters.shift()
        delimiters.unshift("")
      } else if (useLeadingDashes && !multipleYamls.startsWith("---")) {
        delimiters.unshift("---\n")
      } else {
        delimiters.unshift("")
      }
    } else {
      if (!multipleYamls.startsWith("---")) {
        delimiters.unshift("")
      } else {
        let firstDelimiter = delimiters.shift()
        if (firstDelimiter) {
          firstDelimiter = firstDelimiter.replace(/^\n/, "")
          delimiters.unshift(firstDelimiter)
        }
      }
    }
  }
  return delimiters
}

/**
 * Replace all tabs in a given string with spaces
 * @param   {string} text Text to be processed
 * @param   {number} count Number of spaces to be added for a removed tab
 * @returns {string} processed text
 */
export function replaceTabsWithSpaces(text: string, count: number): string {
  if (count < 1) {
    throw new Error("The count parameter has to be 1 or higher")
  }

  const spaces = " ".repeat(count)
  return text.replace(/\t/mg, spaces)
}

/**
 * Add a new line before each occurence of a top level keyword after a new line
 * @param   {string} text Text to be processed
 * @returns {string} processed text
 */
export function addNewLineBeforeRootKeywords(text: string): string{
  return text.replace(/\n[^\s]*:/g, "\n$&")
}

/**
 * Add a new line before each keyword up to level n
 * @param   {number} n Last level to add new lines
 * @param   {number} indent Indentation of yaml
 * @param   {string} text Text to be processed
 * @returns {string} text with new lines
 */
export function addNewLineBeforeKeywordsUpToLevelN(n: number, indent: number, text: string): string {
  let level = 0;
  let result = text;

  while (level < n) {
    if (level == 0) {
      result = result.replace(/\n[^\s].*:/g, "\n$&")
    } else {
      let spaces = " ".repeat(indent)
      spaces = spaces.repeat(level)
      const regex = new RegExp("\n" + spaces + "[\\w-]*:", "g")
      result = result.replace(regex, "\n$&")
    }
    level++;
  }

  return result;
}