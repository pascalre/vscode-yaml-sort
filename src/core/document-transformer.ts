import { prependWhitespacesOnEachLine, removeLeadingSpacesOnEachLine } from "./indentation"
import { JsYamlAdapter } from "./js-yaml-adapter"
import { YamlSorter } from "./yaml-sorter"
import { YamlDocument, YamlStream, splitDocuments, validateTextRange } from "./yaml-text"

/**
 * The parts of YamlSorter a transformation depends on. Kept narrow so tests can pass a stub.
 */
export type YamlOperations = Pick<YamlSorter, "formatYaml" | "settings" | "sortYaml">

export interface SortOptions {
  /** 0 for the default sort, 1 to 3 for the custom sort keywords. */
  customSort: number
  /** True when the text is a selection instead of the whole document. */
  isSelection: boolean
}

/**
 * Transforms the content of a single, non-empty document.
 * @throws Error if the content cannot be transformed.
 */
type ContentTransformation = (content: string) => string

/**
 * Puts the transformed documents back together.
 * @param stream        The directives and the documents, with their transformed content.
 * @param leadingDashes Whether the first document should start with a delimiter. Directives always keep theirs.
 * @returns The joined text.
 */
const joinDocuments = (stream: YamlStream, leadingDashes: boolean | undefined): string => {
  const rendered = stream.documents.map((document, index) => {
    let delimiter = document.delimiter
    if (index === 0 && leadingDashes !== undefined && stream.directives === "") {
      // undefined keeps the first delimiter as it is, e.g. for a selection
      delimiter = leadingDashes ? (delimiter ?? "---") : undefined
    }
    return [delimiter, document.content].filter((line) => line).join("\n")
  })
  return stream.directives + rendered.join("\n")
}

/**
 * Applies a transformation to every non-empty document. Empty documents are kept as they are.
 * The transformation throws for a document it cannot transform, so there never is a partial
 * result that drops documents or empties a selection.
 * @returns The transformed stream.
 */
const transformDocuments = (stream: YamlStream, transform: ContentTransformation): YamlStream => ({
  directives: stream.directives,
  documents: stream.documents.map((document): YamlDocument => ({
    delimiter: document.delimiter,
    content: document.content.trim() === "" ? "" : transform(document.content),
  })),
})

/**
 * Sorts every yaml document in a text.
 * @param text    Text containing one or more yaml documents.
 * @param options Sort options.
 * @param yaml    Yaml operations, injectable for tests.
 * @returns The sorted text.
 * @throws  Error if the text is not valid yaml, the selection ends invalid or a document cannot be sorted.
 */
export const sortDocuments = (text: string, options: SortOptions, yaml: YamlOperations = new YamlSorter()): string => {
  validateTextRange(text)
  new JsYamlAdapter(yaml.settings).validateYaml(text)

  const sorted = transformDocuments(splitDocuments(text), (content) => {
    // an indented selection is sorted like a top-level document and indented again afterwards (see #53)
    const indentation = options.isSelection ? YamlSorter.getNumberOfLeadingSpaces(content) : 0
    const sortedContent = yaml.sortYaml(removeLeadingSpacesOnEachLine(content, indentation), options.customSort)
    return prependWhitespacesOnEachLine(sortedContent, indentation)
  })
  return joinDocuments(sorted, options.isSelection ? undefined : yaml.settings.useLeadingDashes)
}

/**
 * Formats every yaml document in a text without sorting it.
 * @param text Text containing one or more yaml documents.
 * @param yaml Yaml operations, injectable for tests.
 * @returns The formatted text.
 * @throws  Error if a document is not valid yaml.
 */
export const formatDocuments = (text: string, yaml: YamlOperations = new YamlSorter()): string => {
  const formatted = transformDocuments(splitDocuments(text), (content) => yaml.formatYaml(content, false))
  return joinDocuments(formatted, yaml.settings.useLeadingDashes)
}
