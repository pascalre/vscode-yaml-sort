import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { prependWhitespacesOnEachLine, removeLeadingLineBreakOfFirstElement, removeLeadingSpacesOnEachLine } from "../lib"
import { splitYaml, validateTextRange } from "../util/yaml-text"
import { YamlUtil } from "../util/yaml-util"

/**
 * The parts of YamlUtil a transformation depends on. Kept narrow so tests can pass a stub.
 */
export type YamlOperations = Pick<YamlUtil, "formatYaml" | "getDelimiters" | "setLeadingDashes" | "sortYaml">

export interface SortOptions {
  /** 0 for the default sort, 1 to 3 for the custom sort keywords. */
  customSort: number
  /** True when the text is a selection instead of the whole document. */
  isSelection: boolean
}

interface PreparedText {
  text: string
  delimiters: string[]
}

const DIRECTIVE = /^%.*\n/m
const DIRECTIVES = /^%.*\n/gm

/**
 * Removes yaml directives (e.g. `%YAML 1.1`) and collects the document delimiters.
 * @param text       Text containing one or more yaml documents.
 * @param delimiters Delimiters as returned by YamlUtil.getDelimiters().
 * @returns The text without directives and the delimiters to put in front of each document.
 */
const removeDirectives = (text: string, delimiters: RegExpMatchArray): PreparedText => {
  let adjustedDelimiters = delimiters
  if (DIRECTIVE.test(text)) {
    adjustedDelimiters.shift()
    adjustedDelimiters = removeLeadingLineBreakOfFirstElement(adjustedDelimiters)
  }
  const withoutDirectives = text.replace(DIRECTIVES, "").replace(/^\n/, "")
  return { text: withoutDirectives, delimiters: adjustedDelimiters }
}

/**
 * Sorts every yaml document in a text.
 * @param text    Text containing one or more yaml documents.
 * @param options Sort options.
 * @param yaml    Yaml operations, injectable for tests.
 * @returns The sorted text, or null if a document could not be sorted
 *          (the error has already been reported to the user).
 * @throws  Error if the text is not valid yaml or the selection ends invalid.
 */
export const sortDocuments = (text: string, options: SortOptions, yaml: YamlOperations = new YamlUtil()): string | null => {
  validateTextRange(text)
  new JsYamlAdapter().validateYaml(text)

  const prepared = removeDirectives(text, yaml.getDelimiters(text, !options.isSelection))
  let newText = ""
  for (const unsortedYaml of splitYaml(prepared.text)) {
    // an indented selection is sorted like a top-level document and indented again afterwards (see #53)
    const indentation = options.isSelection ? YamlUtil.getNumberOfLeadingSpaces(unsortedYaml) : 0
    const sortedYaml = yaml.sortYaml(removeLeadingSpacesOnEachLine(unsortedYaml, indentation), options.customSort)
    if (!sortedYaml) {
      // never return a partial result: it would drop documents or empty the selection
      return null
    }
    newText += (prepared.delimiters.shift() ?? "") + prependWhitespacesOnEachLine(sortedYaml, indentation)
  }
  return options.isSelection ? newText : yaml.setLeadingDashes(newText)
}

/**
 * Formats every yaml document in a text without sorting it.
 * @param text Text containing one or more yaml documents.
 * @param yaml Yaml operations, injectable for tests.
 * @returns The formatted text, or null if a document could not be formatted
 *          (the error has already been reported to the user).
 */
export const formatDocuments = (text: string, yaml: YamlOperations = new YamlUtil()): string | null => {
  const prepared = removeDirectives(text, yaml.getDelimiters(text, true))
  let newText = ""
  for (const unformattedYaml of splitYaml(prepared.text)) {
    const formattedYaml = yaml.formatYaml(unformattedYaml, false)
    if (!formattedYaml) {
      return null
    }
    newText += (prepared.delimiters.shift() ?? "") + formattedYaml
  }
  return yaml.setLeadingDashes(newText)
}
