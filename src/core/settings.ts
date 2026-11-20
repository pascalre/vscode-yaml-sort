import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import { CORE_SCHEMA, DEFAULT_SCHEMA, FAILSAFE_SCHEMA, JSON_SCHEMA, Schema } from "js-yaml"

export type QuotingType = "'" | "\""

// js-yaml only supports these styles for the !!null tag
const NULL_STYLES = ["lowercase", "uppercase", "camelcase", "canonical", "empty"]

/**
 * The values used when the configuration has none. They must match the defaults declared in
 * package.json, which a unit test verifies.
 */
export const DEFAULT_CONFIGURATION = {
  customSortKeywords_1: ["apiVersion", "kind", "metadata", "spec", "data"],
  customSortKeywords_2: [] as string[],
  customSortKeywords_3: [] as string[],
  emptyLinesUntilLevel: 0,
  extensions: ["yaml", "yml"],
  forceQuotes: false,
  indent: 2,
  lineWidth: 500,
  locale: "en",
  noArrayIndent: false,
  noCompatMode: false,
  notifySuccess: true,
  nullStyle: "lowercase",
  quotingType: "'" as QuotingType,
  schema: "DEFAULT_SCHEMA",
  sortArrays: false,
  sortOnSave: 0,
  sortOrderReverse: false,
  useArrayProcessor: true,
  useBlockProcessor: true,
  useCommentProcessor: true,
  useCustomSortRecursively: false,
  useHelmProcessor: true,
  useLeadingDashes: true,
  useOctalProcessor: true,
}

export type ConfigurationKey = keyof typeof DEFAULT_CONFIGURATION

/**
 * Read access to the extension's configuration section. VS Code's `WorkspaceConfiguration`
 * satisfies it, so the core does not depend on the VS Code API.
 */
export interface ConfigurationReader {
  get<T>(key: string): T | undefined
}

const NO_CONFIGURATION: ConfigurationReader = { get: () => undefined }

/**
 * A snapshot of the extension's settings.
 *
 * All values are read once, when the snapshot is created. Afterwards they can be changed on the
 * instance, e.g. in tests, and every getter reflects the change.
 */
export class Settings {
  static readonly SECTION = "vscode-yaml-sort"

  customSortKeywords1: string[]
  customSortKeywords2: string[]
  customSortKeywords3: string[]
  emptyLinesUntilLevel: number
  extensions: string[]
  forceQuotes: boolean
  indent: number
  lineWidth: number
  locale: string
  nullStyle: string
  noArrayIndent: boolean
  noCompatMode: boolean
  notifySuccess: boolean
  quotingType: QuotingType
  schema: Schema
  sortArrays: boolean
  sortOnSave: number
  sortOrderReverse: boolean
  useCustomSortRecursively: boolean
  useLeadingDashes: boolean
  useArrayProcessor: boolean
  useBlockProcessor: boolean
  useCommentProcessor: boolean
  useHelmProcessor: boolean
  useOctalProcessor: boolean

  /**
   * @param configuration The extension's configuration section. Missing values fall back to
   *                      DEFAULT_CONFIGURATION, so `new Settings()` yields the defaults.
   */
  constructor(configuration: ConfigurationReader = NO_CONFIGURATION) {
    const read = <K extends ConfigurationKey>(key: K): (typeof DEFAULT_CONFIGURATION)[K] => {
      const value = configuration.get<(typeof DEFAULT_CONFIGURATION)[K]>(key) ?? DEFAULT_CONFIGURATION[key]
      // copy lists, so changing a snapshot never changes the defaults or another snapshot
      return (Array.isArray(value) ? [...value] : value) as (typeof DEFAULT_CONFIGURATION)[K]
    }
    this.customSortKeywords1 = read("customSortKeywords_1")
    this.customSortKeywords2 = read("customSortKeywords_2")
    this.customSortKeywords3 = read("customSortKeywords_3")
    this.emptyLinesUntilLevel = read("emptyLinesUntilLevel")
    this.extensions = read("extensions")
    this.forceQuotes = read("forceQuotes")
    this.indent = read("indent")
    this.lineWidth = read("lineWidth")
    this.locale = read("locale")
    this.nullStyle = read("nullStyle")
    this.noArrayIndent = read("noArrayIndent")
    this.noCompatMode = read("noCompatMode")
    this.notifySuccess = read("notifySuccess")
    this.quotingType = read("quotingType")
    this.schema = Settings.getJsYamlSchemaFromString(read("schema"))
    this.sortArrays = read("sortArrays")
    this.sortOnSave = read("sortOnSave")
    this.sortOrderReverse = read("sortOrderReverse")
    this.useCustomSortRecursively = read("useCustomSortRecursively")
    this.useLeadingDashes = read("useLeadingDashes")
    this.useArrayProcessor = read("useArrayProcessor")
    this.useBlockProcessor = read("useBlockProcessor")
    this.useCommentProcessor = read("useCommentProcessor")
    this.useHelmProcessor = read("useHelmProcessor")
    this.useOctalProcessor = read("useOctalProcessor")
  }

  /**
   * @param index 1, 2 or 3.
   * @returns The keywords of the custom sort, or an empty list for any other index.
   */
  getCustomSortKeywords(index: number): string[] {
    switch (index) {
      case 1:
        return this.customSortKeywords1
      case 2:
        return this.customSortKeywords2
      case 3:
        return this.customSortKeywords3
      default:
        return []
    }
  }

  getExtensions(): string[] {
    return this.extensions
  }

  getQuotingType(): QuotingType {
    return this.quotingType
  }

  getSchema(): Schema {
    return this.schema
  }

  getNullStyle(): string {
    return NULL_STYLES.includes(this.nullStyle) ? this.nullStyle : "lowercase"
  }

  static getJsYamlSchemaFromString(schema: string): Schema {
    switch (schema) {
      case "HOMEASSISTANT_SCHEMA":
        return HOMEASSISTANT_SCHEMA as Schema
      case "CLOUDFORMATION_SCHEMA":
        return CLOUDFORMATION_SCHEMA as Schema
      case "CORE_SCHEMA":
        return CORE_SCHEMA
      case "FAILSAFE_SCHEMA":
        return FAILSAFE_SCHEMA
      case "JSON_SCHEMA":
        return JSON_SCHEMA
      default:
        return DEFAULT_SCHEMA
    }
  }

  doSortOnSave(): boolean {
    return (this.sortOnSave >= 0 && this.sortOnSave <= 3)
  }
}
