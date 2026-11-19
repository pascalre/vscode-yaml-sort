/*
 * Text level operations on yaml documents. They work on plain strings and
 * do not depend on js-yaml, VS Code or the user settings.
 */

/**
 * Removes a given count of characters from a string.
 * @param   {string} text  String for processing.
 * @param   {number} count The number of characters to remove from the end of the returned string.
 * @returns {string} Input text with removed trailing characters.
 */
export function removeTrailingCharacters(text: string, count = 1): string {
  if (count >= 0 && count <= text.length) {
    return text.substring(0, text.length - count)
  } else {
    throw new Error("The count parameter is not in a valid range")
  }
}

export function validateTextRange(textRange: string) {
  // remove trailing whitespaces, to check for things like 'text:  '
  const text = textRange.trim()
  const notValidEndingCharacters = [":", "|", ">"]
  if (notValidEndingCharacters.includes(text.charAt(text.length - 1))) {
    throw new Error("YAML selection is invalid. Check the ending of your selection.")
  }
}

/**
 * Splits a string, which contains multiple yaml documents.
 * @param   {string}   multipleYamls String which contains multiple yaml documents.
 * @returns {[string]} Array of yaml documents.
 */
export function splitYaml(multipleYamls: string): [string] {
  return multipleYamls.split(/^---.*/m).filter((obj) => obj) as [string]
}
