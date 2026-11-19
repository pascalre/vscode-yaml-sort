import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { prependWhitespacesOnEachLine, removeLeadingSpacesOnEachLine } from "../lib"
import { YamlDocument, YamlStream, splitDocuments, validateTextRange } from "../util/yaml-text"
import { YamlUtil } from "../util/yaml-util"

/**
 * The parts of YamlUtil a transformation depends on. Kept narrow so tests can pass a stub.
 */
export type YamlOperations = Pick<YamlUtil, "formatYaml" | "settings" | "sortYaml">

export interface SortOptions {
  /** 0 for the default sort, 1 to 3 for the custom sort keywords. */
  customSort: number
  /** True when the text is a selection instead of the whole document. */
  isSelection: boolean
}

/**
 * Transforms the content of a single, non-empty document. Returns null if that fails.
 */
type ContentTransformation = (content: string) => string | null

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
 * @returns The transformed stream, or null if one document could not be transformed.
 */
const transformDocuments = (stream: YamlStream, transform: ContentTransformation): YamlStream | null => {
  const documents: YamlDocument[] = []
  for (const document of stream.documents) {
    if (document.content.trim() === "") {
      documents.push({ delimiter: document.delimiter, content: "" })
      continue
    }
    const content = transform(document.content)
    if (!content) {
      // never return a partial result: it would drop documents or empty the selection
      return null
    }
    documents.push({ delimiter: document.delimiter, content })
  }
  return { directives: stream.directives, documents }
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

  const sorted = transformDocuments(splitDocuments(text), (content) => {
    // an indented selection is sorted like a top-level document and indented again afterwards (see #53)
    const indentation = options.isSelection ? YamlUtil.getNumberOfLeadingSpaces(content) : 0
    const sortedContent = yaml.sortYaml(removeLeadingSpacesOnEachLine(content, indentation), options.customSort)
    return sortedContent ? prependWhitespacesOnEachLine(sortedContent, indentation) : null
  })
  if (!sorted) {
    return null
  }
  return joinDocuments(sorted, options.isSelection ? undefined : yaml.settings.useLeadingDashes)
}

/**
 * Formats every yaml document in a text without sorting it.
 * @param text Text containing one or more yaml documents.
 * @param yaml Yaml operations, injectable for tests.
 * @returns The formatted text, or null if a document could not be formatted
 *          (the error has already been reported to the user).
 */
export const formatDocuments = (text: string, yaml: YamlOperations = new YamlUtil()): string | null => {
  const formatted = transformDocuments(splitDocuments(text), (content) => yaml.formatYaml(content, false))
  if (!formatted) {
    return null
  }
  return joinDocuments(formatted, yaml.settings.useLeadingDashes)
}
