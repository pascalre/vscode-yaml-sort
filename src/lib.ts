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
export function removeLeadingLineBreakOfFirstElement(delimiters: RegExpMatchArray): RegExpMatchArray {
  let firstDelimiter = delimiters.shift()
  if (firstDelimiter) {
    firstDelimiter = firstDelimiter.replace(/^\n/, "")
    delimiters.unshift(firstDelimiter)
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
export function addNewLineBeforeRootKeywords(text: string): string {
  return text.replace(/\n[^\s]*:/g, "\n$&")
}
