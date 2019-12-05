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
