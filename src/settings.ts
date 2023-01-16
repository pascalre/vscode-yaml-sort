import { Schema, CORE_SCHEMA, FAILSAFE_SCHEMA, JSON_SCHEMA, DEFAULT_SCHEMA } from "js-yaml"
import { workspace } from "vscode"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"

export class Settings {
    workspace = workspace

    getCustomSortKeywords(index: number): string[] {
        if ([1, 2, 3].includes(index))
            return this.workspace.getConfiguration().get(`vscode-yaml-sort.customSortKeywords_${index}`) as string[]
        return []
    }
    getEmptyLinesUntilLevel(): number {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.emptyLinesUntilLevel") as number
    }
    getExtensions(): string[] {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.extensions") as string[]
    }
    getForceQuotes(): boolean {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.forceQuotes") as boolean
    }
    getIndent(): number {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.indent") as number
    }
    getLineWidth(): number {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth") as number
    }
    getLocale(): string {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.locale") as string
    }
    getNoArrayIndent(): boolean {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.noArrayIndent") as boolean
    }
    getNoCompatMode(): boolean {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.noCompatMode") as boolean
    }
    getNotifySuccess(): boolean {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.notifySuccess") as boolean
    }
    getQuotingType(): "'" | "\"" {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.quotingType") as "'" | "\""
    }
    getSchema(): Schema {
        const schema = this.workspace.getConfiguration().get("vscode-yaml-sort.schema") as string
        return Settings.getJsYamlSchemaFromString(schema)
    }
    getSortOnSave(): number {
        return this.workspace.getConfiguration().get('vscode-yaml-sort.sortOnSave') as number
    }
    getUseCustomSortRecursively(): boolean {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.useCustomSortRecursively") as boolean
    }
    getUseAsFormatter(): boolean {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.useAsFormatter") as boolean
    }
    getUseLeadingDashes(): boolean {
        return this.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes") as boolean
    }

    customSortKeywords1 = this.getCustomSortKeywords(1)
    customSortKeywords2 = this.getCustomSortKeywords(2)
    customSortKeywords3 = this.getCustomSortKeywords(3)
    emptyLinesUntilLevel = this.getEmptyLinesUntilLevel()
    forceQuotes = this.getForceQuotes()
    indent = this.getIndent()
    lineWidth = this.getLineWidth()
    locale = this.getLocale()
    noArrayIndent = this.getNoArrayIndent()
    noCompatMode = this.getNoCompatMode()
    notifySuccess = this.getNotifySuccess()
    quotingType = this.getQuotingType()
    schema = this.getSchema()
    sortOnSave = this.getSortOnSave()
    useAsFormatter = this.getUseAsFormatter()
    useCustomSortRecursively = this.getUseCustomSortRecursively()
    useLeadingDashes = this.getUseLeadingDashes()

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
        return (this.getSortOnSave() >= 0 && this.getSortOnSave() <= 3)
    }
}
