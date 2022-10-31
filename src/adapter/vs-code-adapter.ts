import * as vscode from "vscode"

export class VsCodeAdapter {
    section: string

    constructor(section = "vscode-yaml-sort") {
        this.section = section
    }

    getConfiguration(property: string) {
        return vscode.workspace.getConfiguration().get(`${this.section}.${property}`)
    }
}