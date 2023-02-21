import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import { CORE_SCHEMA, DEFAULT_SCHEMA, FAILSAFE_SCHEMA, JSON_SCHEMA, Schema } from "js-yaml"
import { workspace } from "vscode"

export class Settings {
    filter = "vscode-yaml-sort"
    workspace = workspace

    getBoolean(name: string) {
        return this.workspace.getConfiguration().get(`${this.filter}.${name}`) as boolean
    }

    getNumber(name: string) {
        return this.workspace.getConfiguration().get(`${this.filter}.${name}`) as number
    }

    getString(name: string) {
        return this.workspace.getConfiguration().get(`${this.filter}.${name}`) as string
    }

    getCustomSortKeywords(index: number): string[] {
        if ([1, 2, 3].includes(index))
            return this.workspace.getConfiguration().get(`${this.filter}.customSortKeywords_${index}`) as string[]
        return []
    }
    getExtensions(): string[] {
        return this.workspace.getConfiguration().get(`${this.filter}.extensions`) as string[]
    }
    getQuotingType(): "'" | "\"" {
        return this.workspace.getConfiguration().get(`${this.filter}.quotingType`) as "'" | "\""
    }
    getSchema(): Schema {
        const schema = this.workspace.getConfiguration().get(`${this.filter}.schema`) as string
        return Settings.getJsYamlSchemaFromString(schema)
    }

    customSortKeywords1 = this.getCustomSortKeywords(1)
    customSortKeywords2 = this.getCustomSortKeywords(2)
    customSortKeywords3 = this.getCustomSortKeywords(3)
    emptyLinesUntilLevel = this.getNumber("emptyLinesUntilLevel")
    forceQuotes = this.getBoolean("forceQuotes")
    indent = this.getNumber("indent")
    lineWidth = this.getNumber("lineWidth")
    locale = this.getString("locale")
    noArrayIndent = this.getBoolean("noArrayIndent")
    noCompatMode = this.getBoolean("noCompatMode")
    notifySuccess = this.getBoolean("notifySuccess")
    quotingType = this.getQuotingType()
    schema = this.getSchema()
    sortArrays = this.getBoolean("sortArrays")
    sortOnSave = this.getNumber("sortOnSave")
    useCustomSortRecursively = this.getBoolean("useCustomSortRecursively")
    useLeadingDashes = this.getBoolean("useLeadingDashes")
    useArrayProcessor = this.getBoolean("useArrayProcessor")
    useCommentProcessor = this.getBoolean("useCommentProcessor")
    useHelmProcessor = this.getBoolean("useHelmProcessor")
    useOctalProcessor = this.getBoolean("useOctalProcessor")

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
