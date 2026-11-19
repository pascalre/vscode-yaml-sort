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
 * A yaml document together with the delimiter line (`---`, optionally with a comment) in front of it.
 */
export interface YamlDocument {
  /** The delimiter line without line break, undefined if the document has none. */
  delimiter?: string
  /** The content of the document, without leading empty lines. */
  content: string
}

export interface YamlStream {
  /** Directives like `%YAML 1.2` in front of the first delimiter, including their line breaks. */
  directives: string
  documents: YamlDocument[]
}

/**
 * Splits a text into its yaml documents, keeping every delimiter with its own document.
 * @param text Text containing one or more yaml documents.
 * @returns The directives and the documents.
 */
export const splitDocuments = (text: string): YamlStream => {
  // a capturing group makes split() return the delimiters between the contents:
  // [leading content, delimiter, content, delimiter, content, ...]
  const parts = text.split(/^(---.*)$/m)
  const withoutLeadingEmptyLines = (content: string) => content.replace(/^(?:[ \t]*\n)+/, "")
  const leading = parts[0]
  const stream: YamlStream = { directives: "", documents: [] }

  if (/^%/m.test(leading)) {
    stream.directives = leading
  } else if (leading.trim() !== "") {
    stream.documents.push({ content: withoutLeadingEmptyLines(leading) })
  }
  for (let i = 1; i < parts.length; i += 2) {
    stream.documents.push({ delimiter: parts[i], content: withoutLeadingEmptyLines(parts[i + 1]) })
  }
  return stream
}
