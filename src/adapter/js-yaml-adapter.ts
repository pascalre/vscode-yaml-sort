import { Settings } from "../settings"
import * as jsyaml from "js-yaml"
import { SortUtil } from "../util/sort-util"
import { removeTrailingCharacters, splitYaml } from "../util/yaml-util"

export class JsYamlAdapter {
  settings: Settings

  constructor(settings = new Settings()) {
    this.settings = settings
  }

  getLoadOptions() {
    return { schema: this.settings.getSchema() }
  }

  load(text: string) {
    return jsyaml.load(text, this.getLoadOptions())
  }

  /**
   * Validates a yaml document
   * @param text Yaml document
   * @returns true if yaml is valid
   */
  validateYaml(text: string): boolean {
    splitYaml(text).forEach((yaml) => {
      jsyaml.load(yaml, { schema: this.settings.getSchema() })
    })
    return true
  }


  /**
   * Dumps a yaml with the user specific settings.
   * @param   {string}  text     Yaml document which should be dumped.
   * @param   {boolean} sortKeys If set to true, the function will sort the keys in the document. Defaults to true.
   * @returns {string}           Clean yaml document.
   */
  dumpYaml(text: string, sortKeys: boolean, custom: number, settings: Settings): string {

    if (Object.keys(text).length === 0) {
      return ""
    }

    const sort = new SortUtil(settings, custom)

    let yaml = jsyaml.dump(text, {
      indent: settings.getIndent(),
      forceQuotes: settings.getForceQuotes(),
      lineWidth: settings.getLineWidth(),
      noArrayIndent: settings.getNoArrayIndent(),
      noCompatMode: settings.getNoCompatMode(),
      quotingType: settings.getQuotingType(),
      schema: settings.getSchema(),
      sortKeys: (!(custom > 0 && settings.getUseCustomSortRecursively()) ? sortKeys : (a: string, b: string) => {
        return sort.customSort(a, b)
      })
    })

    // this is neccesary to avoid linebreaks in a selection sort
    yaml = removeTrailingCharacters(yaml, 1)

    return yaml
  }

}