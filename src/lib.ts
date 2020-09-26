/**
 * Removes single quotes from special keywords
 * e.g. '1.4.2': will result in 1.4.2: or 'puppet::key': will result in puppet::key:
 * @param {string} text String for processing.
 */
export function removeQuotesFromKeys(text: string) {
  return text.replace(/'(.*)':/g, "$1:")
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
 * Splits a string, which contains multiple yaml documents.
 * @param {string} multipleYamls String which contains multiple yaml documents.
 * @returns {[string]} Array of yaml documents.
 */
export function splitYaml(multipleYamls: string) {
  return multipleYamls.split(/^---.*/m).filter((obj) => obj) as [string]
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
    return true
  }
  return false
}

/**
 * Returns all delimiters with comments.
 * @param {string} multipleYamls String which contains multiple yaml documents.
 * @param {boolean} isSelectionEmpty Specify if the text is an selection
 * @param {boolean} useLeadingDashes Specify if the documents should have a leading delimiter.
 *                                   If set to false, it will add an empty array element at the beginning of the output.
 * @returns {[string]} Array of yaml delimiters.
 */
export function getDelimiters(multipleYamls: string, isSelectionEmpty: boolean, useLeadingDashes: boolean) {
  // remove empty lines
  multipleYamls = multipleYamls.trim()
  multipleYamls = multipleYamls.replace(/^\n/, "")
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
      // delimiters = removeLeadingLineBreakOfFirstElement(delimiters)
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
      const firstDelimiter = delimiters.shift()!.replace(/^\n/, "")
      delimiters.unshift(firstDelimiter)
    }
  }
  return delimiters
}

/**
 * Replace all tabs in a given string with spaces
 * @param {string} text Text to be processed
 * @param {number} count Number of spaces to be added for a removed tab
 */
export function replaceTabsWithSpaces(text: string, count: number) {
  if (count < 1) {
    throw new Error("The count parameter has to be 1 or higher")
  }

  const spaces = " ".repeat(count)
  return text.replace(/\t/mg, spaces)
}