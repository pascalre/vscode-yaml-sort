import { prependWhitespacesOnEachLine } from "./indentation"
import { JsYamlAdapter } from "./js-yaml-adapter"
import { ErrorUtil } from "../vscode/error-util"
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
  errorutil = new ErrorUtil()

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

  sortYaml(unsortedYaml: string, customSort = 0): string | null {
    try {
      const processor = new ProcessorController(unsortedYaml, this.settings)
      processor.preprocess()
      const unsortedYamlWithoutTabs = processor.text

      const doc = this.jsyamladapter.load(unsortedYamlWithoutTabs)

      if (this.settings.sortArrays) {
        sortArraysRecursively(doc)
      }

      let sortedYaml = ""
      let remainder = doc
      if (customSort > 0 && !this.settings.useCustomSortRecursively && isMapping(doc)) {
        // check for the key itself, values like 0, false or null must be ordered too
        const keywords = this.settings.getCustomSortKeywords(customSort)
          .filter((key) => Object.prototype.hasOwnProperty.call(doc, key))
        sortedYaml = keywords.map((key) => this.dumpKeyword(key, doc[key], customSort)).join("")
        // the remaining keys are sorted as usual; build them anew instead of deleting from the loaded document
        remainder = Object.fromEntries(Object.entries(doc).filter(([key]) => !keywords.includes(key)))
      }

      // either sort whole yaml or sort the rest of the yaml (which can be empty) and add it to the sortedYaml
      sortedYaml += this.jsyamladapter.dumpYaml(remainder, true, customSort)

      processor.text = sortedYaml
      processor.postprocess()

      return processor.text
    } catch (error) {
      this.errorutil.handleError(error)
      return null
    }
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
   * Formats a yaml document (without sorting).
   * @param   {string} yaml Yaml to be formatted.
   * @returns {string} Formatted yaml.
   */
  formatYaml(yaml: string, useLeadingDashes: boolean): string | null {
    try {
      const processor = new ProcessorController(yaml, this.settings)
      processor.preprocess()
      let doc = this.jsyamladapter.dumpYaml(this.jsyamladapter.load(processor.text), false, 0)
      processor.text = doc
      processor.postprocess()
      doc = processor.text
      if (useLeadingDashes) {
        doc = `---\n${doc}`
      }
      return doc
    } catch (error) {
      this.errorutil.handleError(error)
      return null
    }
  }

}
