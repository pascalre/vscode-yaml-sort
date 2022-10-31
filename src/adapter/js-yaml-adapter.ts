import { Settings } from "../settings"
import * as jsyaml from "js-yaml"
import { removeTrailingCharacters } from "../lib"


export function hasTextYamlKeys(text: string) {
  if (Object.keys(text).length === 0) {
    return false
  }
  return true
}

/**
 * Dumps a yaml with the user specific settings.
 * @param   {string}  text     Yaml document which should be dumped
 * @param   {boolean} sortKeys If true, will sort the keys in the document
 * @returns {string} Yaml document
 */
/*
export function dumpYaml(text: string, settings: Settings, custom: number, sortKeys: boolean): string {
  if (!hasTextYamlKeys(text)) {
    return ""
  }

  console.log("Here we go. Custom: " + custom + ", length: " + settings.getCustomSortKeywords(custom).length + ", keywords: " + settings.getCustomSortKeywords(custom) + ", recursive: " + settings.getUseCustomSortRecursively())
  
  let yaml = jsyaml.dump(text, {
    indent: settings.getIndent(),
    forceQuotes: settings.getForceQuotes(),
    lineWidth: settings.getLineWidth(),
    noArrayIndent: settings.getNoArrayIndent(),
    noCompatMode: settings.getNoCompatMode(),
    quotingType: settings.getQuotingType(),
    schema: settings.getSchema(),
    sortKeys: (!(custom > 0 && settings.getUseCustomSortRecursively()) ? sortKeys : (a: string, b: string) => {
      const sortOrder = settings.getCustomSortKeywords(custom)
      const indexA = sortOrder.indexOf(a)
      const indexB = sortOrder.indexOf(b)

      if (indexA > -1 && indexB > -1) {
        return indexA > indexB ? 1 : indexA < indexB ? -1 : 0
      }
      if (indexA !== -1 && indexB === -1) {
        return -1
      }
      if (indexA === -1 && indexB !== -1) {
        return 1
      }
      return a.localeCompare(b, settings.getLocale())
    })
  })

  // this is neccesary to avoid linebreaks in a selection sort
  yaml = removeTrailingCharacters(yaml, 1)

  return yaml
}
*/
