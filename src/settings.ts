import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import { CORE_SCHEMA, DEFAULT_SCHEMA, FAILSAFE_SCHEMA, JSON_SCHEMA, Schema } from "js-yaml"
import { ConfigurationScope, WorkspaceConfiguration, workspace } from "vscode"

type QuotingType = "'" | "\""

// js-yaml only supports these styles for the !!null tag
const NULL_STYLES = ["lowercase", "uppercase", "camelcase", "canonical", "empty"]

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
   * @param configuration The extension's configuration section. Defaults to the global and workspace settings.
   */
  constructor(configuration: WorkspaceConfiguration = workspace.getConfiguration(Settings.SECTION)) {
    const read = <T>(name: string) => configuration.get(name) as T
    this.customSortKeywords1 = read<string[]>("customSortKeywords_1")
    this.customSortKeywords2 = read<string[]>("customSortKeywords_2")
    this.customSortKeywords3 = read<string[]>("customSortKeywords_3")
    this.emptyLinesUntilLevel = read<number>("emptyLinesUntilLevel")
    this.extensions = read<string[]>("extensions")
    this.forceQuotes = read<boolean>("forceQuotes")
    this.indent = read<number>("indent")
    this.lineWidth = read<number>("lineWidth")
    this.locale = read<string>("locale")
    this.nullStyle = read<string>("nullStyle")
    this.noArrayIndent = read<boolean>("noArrayIndent")
    this.noCompatMode = read<boolean>("noCompatMode")
    this.notifySuccess = read<boolean>("notifySuccess")
    this.quotingType = read<QuotingType>("quotingType")
    this.schema = Settings.getJsYamlSchemaFromString(read<string>("schema"))
    this.sortArrays = read<boolean>("sortArrays")
    this.sortOnSave = read<number>("sortOnSave")
    this.sortOrderReverse = read<boolean>("sortOrderReverse")
    this.useCustomSortRecursively = read<boolean>("useCustomSortRecursively")
    this.useLeadingDashes = read<boolean>("useLeadingDashes")
    this.useArrayProcessor = read<boolean>("useArrayProcessor")
    this.useBlockProcessor = read<boolean>("useBlockProcessor")
    this.useCommentProcessor = read<boolean>("useCommentProcessor")
    this.useHelmProcessor = read<boolean>("useHelmProcessor")
    this.useOctalProcessor = read<boolean>("useOctalProcessor")
  }

  /**
   * Reads the settings that apply to a document: workspace folder settings in a multi-root
   * workspace and language specific settings like `"[yaml]": { "vscode-yaml-sort.indent": 4 }`.
   * @param document         The document, or its uri and language id.
   * @param getConfiguration Injectable for tests.
   * @returns The settings for the document.
   */
  static forDocument(
    document: ConfigurationScope,
    getConfiguration: (section?: string, scope?: ConfigurationScope) => WorkspaceConfiguration = workspace.getConfiguration
  ): Settings {
    return new Settings(getConfiguration(Settings.SECTION, document))
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
