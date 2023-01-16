import { Settings } from "../settings"
import { load, dump } from "js-yaml"
import { SortUtil } from "../util/sort-util"
import { removeTrailingCharacters, splitYaml } from "../util/yaml-util"

export class JsYamlAdapter {
  settings: Settings

  constructor(settings = new Settings()) {
    this.settings = settings
  }

  /**
   * Validates a yaml document
   * @param text Yaml document
   * @returns true if yaml is valid
   */
  validateYaml(text: string): boolean {
    splitYaml(text).forEach((yaml) => {
      load(yaml, { schema: this.settings.getSchema() })
    })
    return true
  }

  load(text: string) {
    return load(text, this.getLoadOptions())
  }

  getLoadOptions() {
    return { schema: this.settings.getSchema() }
  }

  /**
   * Dumps a yaml with the user specific settings.
   * @param   {string}  text     Yaml document which should be dumped.
   * @param   {boolean} sortKeys If set to true, the function will sort the keys in the document. Defaults to true.
   * @returns {string}           Clean yaml document.
   */
  dumpYaml(text: string, sortKeys: boolean, custom: number): string {
    if (Object.keys(text).length === 0) {
      return ""
    }

    const sort = new SortUtil(this.settings, custom)

    let yaml = dump(text, {
      indent: this.settings.getIndent(),
      forceQuotes: this.settings.getForceQuotes(),
      lineWidth: this.settings.getLineWidth(),
      noArrayIndent: this.settings.getNoArrayIndent(),
      noCompatMode: this.settings.getNoCompatMode(),
      quotingType: this.settings.getQuotingType(),
      schema: this.settings.getSchema(),
      sortKeys: (!(custom > 0 && this.settings.getUseCustomSortRecursively()) ? sortKeys : (a: string, b: string) => {
        return sort.customSort(a, b)
      })
    })

    // this is neccesary to avoid linebreaks in a selection sort
    yaml = removeTrailingCharacters(yaml, 1)

    return yaml
  }
}
