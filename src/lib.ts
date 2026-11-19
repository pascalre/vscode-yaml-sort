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
 * Removes up to a given count of leading spaces from every single line in a text.
 * The counterpart of prependWhitespacesOnEachLine().
 * @param   text  Text whose lines should lose their leading spaces.
 * @param   count The maximum number of spaces to remove from each line.
 * @returns Input text without the leading spaces.
 */
export const removeLeadingSpacesOnEachLine = (text: string, count: number): string => {
  if (count <= 0) {
    return text
  }
  return text.replace(new RegExp(`^ {1,${count}}`, "gm"), "")
}
