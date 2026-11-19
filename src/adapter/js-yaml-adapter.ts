import { dump, load } from "js-yaml"

import { Settings } from "../settings"
import { SortUtil } from "../util/sort-util"
import { removeTrailingCharacters, splitYaml } from "../util/yaml-text"

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
   * Dumps a whole yaml document with the user specific settings.
   * An empty document (no content or only comments) is dumped as an empty string.
   * @param   text     Loaded yaml document which should be dumped.
   * @param   sortKeys If set to true, the function will sort the keys in the document.
   * @param   custom   0 for the default sort, 1 to 3 for the custom sort keywords.
   * @returns Clean yaml document.
   */
  dumpYaml(text: unknown, sortKeys: boolean, custom: number): string {
    // js-yaml loads an empty document or one with only comments as null or undefined
    if (text === undefined || text === null || isEmptyMapping(text)) {
      return ""
    }
    return this.dumpValue(text, sortKeys, custom)
  }

  /**
   * Dumps any yaml value, including scalars, `null` and empty collections, with the user specific settings.
   * @param   value    Value which should be dumped.
   * @param   sortKeys If set to true, the function will sort the keys of mappings.
   * @param   custom   0 for the default sort, 1 to 3 for the custom sort keywords.
   * @returns The dumped value without trailing line break.
   */
  dumpValue(value: unknown, sortKeys: boolean, custom: number): string {
    let yaml = dump(value, {
      indent: this.settings.indent,
      forceQuotes: this.settings.forceQuotes,
      lineWidth: this.settings.lineWidth,
      noArrayIndent: this.settings.noArrayIndent,
      noCompatMode: this.settings.noCompatMode,
      quotingType: this.settings.getQuotingType(),
      schema: this.settings.getSchema(),
      styles: { "!!null": this.settings.getNullStyle() },
      sortKeys: this.getKeyComparator(sortKeys, custom)
    })

    // this is neccesary to avoid linebreaks in a selection sort
    yaml = removeTrailingCharacters(yaml, 1)

    return yaml
  }
  /**
   * @param sortKeys If set to false, keys keep their order.
   * @param custom   0 for the default sort, 1 to 3 for the custom sort keywords.
   * @returns The value for js-yaml's `sortKeys` option.
   */
  getKeyComparator(sortKeys: boolean, custom: number): boolean | ((a: string, b: string) => number) {
    if (custom > 0 && this.settings.useCustomSortRecursively) {
      const sort = new SortUtil(this.settings, custom)
      return (a: string, b: string) => sort.customSort(a, b)
    }
    if (sortKeys && this.settings.sortOrderReverse) {
      // mirror js-yaml's default order, which compares by code point
      return (a: string, b: string) => SortUtil.compare(b, a)
    }
    return sortKeys
  }

}

/**
 * @param value Any loaded yaml value.
 * @returns True for a mapping without keys, e.g. an empty document.
 */
const isEmptyMapping = (value: unknown): boolean =>
  typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0
