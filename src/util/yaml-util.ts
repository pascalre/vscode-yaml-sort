import { ErrorUtil } from "./error-util"
import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"
import { ProcessorController } from "../controller/processor-controller"
import { prependWhitespacesOnEachLine } from "../lib"
import { Settings } from "../settings"

const sortArrays = (obj: unknown) => {
  if (!obj || typeof obj !== 'object') {
      return
  } else if (Array.isArray(obj)) {
      obj.sort()
  }
  Object.keys(obj).forEach(key => {
    const object = obj[key as keyof unknown]
    if (typeof object === 'object') {
        if (Array.isArray(object)) {
          Object.entries(object).sort()
        }
        sortArrays(object)
    }
  })
}

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
        sortArrays(doc)
      }

      let sortedYaml = ""
      if (customSort > 0 && !this.settings.useCustomSortRecursively) {
        const keywords = this.settings.getCustomSortKeywords(customSort)

        keywords.forEach(key => {
          if (doc[key]) {
            let sortedSubYaml = this.jsyamladapter.dumpYaml(doc[key], true, customSort)
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
      let doc = new JsYamlAdapter().dumpYaml(this.jsyamladapter.load(processor.text) as string, false, 0)
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

  /**
   * Returns all delimiters with comments.
   * @param   {string}  multipleYamls String which contains multiple yaml documents.
   * @param   {boolean} isSelectionEmpty Specify if the text is an selection
   * @param   {boolean} useLeadingDashes Specify if the documents should have a leading delimiter.
   *                                   If set to false, it will add an empty array element at the beginning of the output.
   * @returns {[string]} Array of yaml delimiters.
   */
  getDelimiters(yamls: string, isSelectionEmpty: boolean): RegExpMatchArray {
    // remove empty lines
    let multipleYamls = yamls.trim()
    multipleYamls = multipleYamls.replace(/^\n/, "")
    let delimiters = multipleYamls.match(/^---.*/gm)
    if (!delimiters) {
      return [""]
    }

    // append line break to every delimiter
    delimiters = delimiters.map((delimiter) => `\n${delimiter}\n`) as RegExpMatchArray

    if (delimiters) {
      if (isSelectionEmpty) {
        if (!this.settings.useLeadingDashes && multipleYamls.startsWith("---")) {
          delimiters.shift()
          delimiters.unshift("")
        } else if (this.settings.useLeadingDashes && !multipleYamls.startsWith("---")) {
          delimiters.unshift("---\n")
        } else {
          delimiters.unshift("")
        }
      } else {
        if (!multipleYamls.startsWith("---")) {
          delimiters.unshift("")
        } else {
          let firstDelimiter = delimiters.shift()
          if (firstDelimiter) {
            firstDelimiter = firstDelimiter.replace(/^\n/, "")
            delimiters.unshift(firstDelimiter)
          }
        }
      }
    }
    return delimiters
  }
}

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
