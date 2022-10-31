import * as jsyaml from "js-yaml"
import * as vscode from "vscode"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"

export class Settings {
    getCustomSortKeywords(index: number): string[] {
        if ([1, 2, 3].includes(index))
            return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_" + index) as string[]
        return []
    }
    getEmptyLinesUntilLevel(): number {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.emptyLinesUntilLevel") as number
    }
    getForceQuotes(): boolean {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.forceQuotes") as boolean
    }
    getIndent(): number {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent") as number
    }
    getLineWidth(): number {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth") as number
    }
    getLocale(): string {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.locale") as string
    }
    getNoArrayIndent(): boolean {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.noArrayIndent") as boolean
    }
    getNoCompatMode(): boolean {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.noCompatMode") as boolean
    }
    getNotifySuccess(): boolean {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.notifySuccess") as boolean
    }
    getQuotingType(): "'" | "\"" {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.quotingType") as "'" | "\""
    }
    getSchema(): jsyaml.Schema {
        const schema = vscode.workspace.getConfiguration().get("vscode-yaml-sort.schema") as string
        return this.getJsYamlSchemaFromString(schema)
    }
    getSortOnSave(): number {
        return vscode.workspace.getConfiguration().get('vscode-yaml-sort.sortOnSave') as number
    }
    getUseCustomSortRecursively(): boolean {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.useCustomSortRecursively") as boolean
    }
    getUseLeadingDashes(): boolean {
        return vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes") as boolean
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
    useCustomSortRecursively = this.getUseCustomSortRecursively()
    useLeadingDashes = this.getUseLeadingDashes()

    getJsYamlSchemaFromString(schema: string): jsyaml.Schema {
        switch(schema) {
            case "HOMEASSISTANT_SCHEMA"  : return HOMEASSISTANT_SCHEMA as jsyaml.Schema
            case "CLOUDFORMATION_SCHEMA" : return CLOUDFORMATION_SCHEMA as jsyaml.Schema
            case "CORE_SCHEMA"           : return jsyaml.CORE_SCHEMA
            case "FAILSAFE_SCHEMA"       : return jsyaml.FAILSAFE_SCHEMA
            case "JSON_SCHEMA"           : return jsyaml.JSON_SCHEMA
            default                      : return jsyaml.DEFAULT_SCHEMA
        }
    }
}
