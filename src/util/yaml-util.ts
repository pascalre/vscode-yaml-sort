import { ErrorUtil } from "./error-util"
import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"
import { ProcessorController } from "../controller/processor-controller"
import { prependWhitespacesOnEachLine } from "../lib"
import { Settings } from "../settings"
import { sortArraysRecursively } from "./sort-util"
import { removeTrailingCharacters } from "./yaml-text"

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
      const processor = new ProcessorController(unsortedYaml)
      processor.preprocess()
      const unsortedYamlWithoutTabs = processor.text

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = this.jsyamladapter.load(unsortedYamlWithoutTabs) as any

      if (this.settings.sortArrays) {
        sortArraysRecursively(doc)
      }

      let sortedYaml = ""
      if (customSort > 0 && !this.settings.useCustomSortRecursively) {
        const keywords = this.settings.getCustomSortKeywords(customSort)

        keywords.forEach(key => {
          // check for the key itself, values like 0, false or null must be ordered too
          if (Object.prototype.hasOwnProperty.call(doc, key)) {
            let sortedSubYaml = this.jsyamladapter.dumpValue(doc[key], true, customSort)
            if (YamlUtil.isValueMultiline(sortedSubYaml)) {
              sortedSubYaml = this.transformMultilineValue(sortedSubYaml)
              sortedYaml += `${key}:\n${sortedSubYaml}\n`
            } else {
              sortedYaml += `${key}: ${sortedSubYaml}\n`
            }
            // delete key from yaml
            delete doc[key]
          }
        })
      }

      // either sort whole yaml or sort the rest of the yaml (which can be empty) and add it to the sortedYaml
      sortedYaml += this.jsyamladapter.dumpYaml(doc, true, customSort)

      processor.text = sortedYaml
      processor.postprocess()

      return processor.text
    } catch (error) {
      this.errorutil.handleError(error)
      return null
    }
  }

  /**
   * Formats a yaml document (without sorting).
   * @param   {string} yaml Yaml to be formatted.
   * @returns {string} Formatted yaml.
   */
  formatYaml(yaml: string, useLeadingDashes: boolean): string | null {
    try {
      const processor = new ProcessorController(yaml)
      processor.preprocess()
      let doc = new JsYamlAdapter().dumpYaml(this.jsyamladapter.load(processor.text), false, 0)
      processor.text = doc
      processor.postprocess()
      doc = processor.text
      if (useLeadingDashes) {
        doc = `---\n${doc}`
      }
      new VsCodeAdapter().showMessage(Severity.INFO, "Yaml formatted successfully")
      return doc
    } catch (error) {
      this.errorutil.handleError(error)
      return null
    }
  }

}
