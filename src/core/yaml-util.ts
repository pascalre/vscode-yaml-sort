import { prependWhitespacesOnEachLine } from "./indentation"
import { JsYamlAdapter } from "./js-yaml-adapter"
import { ProcessorController } from "./processor/processor-controller"
import { Settings } from "./settings"
import { sortArraysRecursively } from "./sort-util"
import { removeTrailingCharacters } from "./yaml-text"

/**
 * @param value Any loaded yaml value.
 * @returns True for a mapping, i.e. an object that is no list.
 */
const isMapping = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export class YamlUtil {
  settings: Settings
  jsyamladapter: JsYamlAdapter

  constructor(settings = new Settings()) {
    this.settings = settings
    this.jsyamladapter = new JsYamlAdapter(settings)
  }

  static getNumberOfLeadingSpaces(text: string): number {
    if (!text.startsWith(" ")) {
      return 0
    } else {
      return text.search(/\S/)
    }
  }

  static isValueMultiline(text: string) {
    return (!text.startsWith("|") && text.includes(":")) || text.startsWith("-")
  }

  setLeadingDashes(text: string) {
    if (this.settings.useLeadingDashes) {
      return `---\n${text}`
    }
    return text
  }

  transformMultilineValue(text: string) {
    let result = prependWhitespacesOnEachLine(text, this.settings.indent)
    if (text.endsWith("\n")) {
      result = removeTrailingCharacters(result, this.settings.indent)
    }
    return result
  }

  /**
   * Sorts a single yaml document.
   * @param unsortedYaml The content of one document, without delimiter.
   * @param customSort   0 for the default sort, 1 to 3 for the custom sort keywords.
   * @returns The sorted document.
   * @throws  YAMLException if the document is not valid yaml.
   */
  sortYaml(unsortedYaml: string, customSort = 0): string {
    const processor = new ProcessorController(unsortedYaml, this.settings)
    processor.preprocess()

    const doc = this.jsyamladapter.load(processor.text)
    if (this.settings.sortArrays) {
      sortArraysRecursively(doc)
    }

    processor.text = this.dumpSorted(doc, customSort)
    processor.postprocess()
    return processor.text
  }

  /**
   * Dumps a loaded document with sorted keys. A custom sort that is not applied recursively puts
   * the custom sort keywords on top and sorts the remaining keys as usual.
   * @param doc        The loaded document.
   * @param customSort 0 for the default sort, 1 to 3 for the custom sort keywords.
   * @returns The dumped document.
   */
  dumpSorted(doc: unknown, customSort: number): string {
    if (customSort === 0 || this.settings.useCustomSortRecursively || !isMapping(doc)) {
      return this.jsyamladapter.dumpYaml(doc, true, customSort)
    }
    // check for the key itself, values like 0, false or null must be ordered too
    const keywords = this.settings.getCustomSortKeywords(customSort)
      .filter((key) => Object.prototype.hasOwnProperty.call(doc, key))
    // build the remaining keys anew instead of deleting them from the loaded document
    const remainder = Object.fromEntries(Object.entries(doc).filter(([key]) => !keywords.includes(key)))
    const dumpedKeywords = keywords.map((key) => this.dumpKeyword(key, doc[key], customSort)).join("")
    return dumpedKeywords + this.jsyamladapter.dumpYaml(remainder, true, customSort)
  }

  /**
   * Dumps one top-level keyword of a custom sort together with its value.
   * @param key        The keyword.
   * @param value      Its value.
   * @param customSort 1 to 3, the custom sort that is applied.
   * @returns The yaml lines for the keyword, ending with a line break.
   */
  dumpKeyword(key: string, value: unknown, customSort: number): string {
    const dumpedValue = this.jsyamladapter.dumpValue(value, true, customSort)
    if (YamlUtil.isValueMultiline(dumpedValue)) {
      return `${key}:\n${this.transformMultilineValue(dumpedValue)}\n`
    }
    return `${key}: ${dumpedValue}\n`
  }

  /**
   * Formats a single yaml document without sorting it.
   * @param yaml             The content of one document, without delimiter.
   * @param useLeadingDashes Whether the result should start with a delimiter.
   * @returns The formatted document.
   * @throws  YAMLException if the document is not valid yaml.
   */
  formatYaml(yaml: string, useLeadingDashes: boolean): string {
    const processor = new ProcessorController(yaml, this.settings)
    processor.preprocess()
    processor.text = this.jsyamladapter.dumpYaml(this.jsyamladapter.load(processor.text), false, 0)
    processor.postprocess()
    return useLeadingDashes ? `---\n${processor.text}` : processor.text
  }
}
