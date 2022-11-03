import { addNewLineBeforeKeywordsUpToLevelN, prependWhitespacesOnEachLine, removeTrailingCharacters, replaceTabsWithSpaces } from "../lib"
import { Settings } from "../settings"
import * as jsyaml from "js-yaml"
import * as vscode from "vscode"
import { dumpYaml } from "../adapter/js-yaml-adapter"

export function hasTextYamlKeys(text: string) {
    if (Object.keys(text).length === 0) {
        return false
    }
    return true
}

export function sortYaml(
    unsortedYaml: string,
    customSort = 0,
    settings: Settings
): string | null {
    try {
        const loadOptions = { schema: settings.getSchema() }
        const unsortedYamlWithoutTabs = replaceTabsWithSpaces(unsortedYaml, settings.getIndent())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const comments = findComments(unsortedYamlWithoutTabs)
        const doc = jsyaml.load(unsortedYamlWithoutTabs, loadOptions) as any
        let sortedYaml = ""

        if (customSort > 0 && !settings.getUseCustomSortRecursively()) {
            const keywords = settings.getCustomSortKeywords(customSort)

            keywords.forEach(key => {
                if (doc[key]) {
                    let sortedSubYaml = dumpYaml(doc[key], true, customSort, settings)
                    if ((sortedSubYaml.includes(":") && !sortedSubYaml.startsWith("|")) || sortedSubYaml.startsWith("-")) {
                        // when key cotains more than one line, we need some transformation:
                        // add a new line and indent each line some spaces
                        sortedSubYaml = prependWhitespacesOnEachLine(sortedSubYaml, settings.getIndent())
                        if (sortedSubYaml.endsWith("\n")) {
                            sortedSubYaml = removeTrailingCharacters(sortedSubYaml, settings.getIndent())
                        }
                        sortedYaml += key + ":\n" + sortedSubYaml + "\n"
                    } else {
                        sortedYaml += key + ": " + sortedSubYaml + "\n"
                    }
                    // delete key from yaml
                    delete doc[key]
                }
            })
        }

        // either sort whole yaml or sort the rest of the yaml (which can be empty) and add it to the sortedYaml
        sortedYaml += dumpYaml(doc, true, customSort, settings)

        if (settings.getEmptyLinesUntilLevel() > 0) {
            sortedYaml = addNewLineBeforeKeywordsUpToLevelN(settings.getEmptyLinesUntilLevel(), settings.getIndent(), sortedYaml)
        }

        sortedYaml = applyComments(sortedYaml, comments)

        return sortedYaml
    } catch (e) {
        if (e instanceof Error) {
            vscode.window.showErrorMessage("Keys could not be resorted: " + e.message)
        }
        return null
    }
}

/**
 * Formats a yaml document (without sorting).
 * @param   {string} yaml Yaml to be formatted.
 * @returns {string} Formatted yaml.
 */
export function formatYaml(
    yaml: string,
    useLeadingDashes: boolean,
    settings: Settings
): string | null {
    try {
        const loadOptions = { schema: settings.getSchema() }
        const comments = findComments(yaml)
        let doc = dumpYaml(jsyaml.load(yaml, loadOptions) as string, false, 0, settings)
        doc = applyComments(doc, comments)
        if (useLeadingDashes) {
            doc = "---\n" + doc
        }
        if (settings.getNotifySuccess()) {
            vscode.window.showInformationMessage("Yaml formatted successfully")
        }
        return doc
    } catch (e) {
        if (e instanceof Error) {
            vscode.window.showErrorMessage("Yaml could not be formatted: " + e.message)
        }
        return null
    }
}

/**
 * Finds all full line comments in a given yaml (ignoring comments in the same line with code).
 * @param text Yaml document
 */
export function findComments(text: string): Map<string, string> {
    const comments = new Map<string, string>
    const lines = text.toString().split("\n")
    for (let i = 0; i < lines.length; i++) {
        let comment = ""
        while (/^ *#/.test(lines[i])) {
            comment += lines[i] + "\n"
            i++
        }
        comment = comment.replace(/\n$/, "")
        if (comment != "") {
            if (i < lines.length) {
                comments.set(comment, lines[i])
            } else {
                comments.set(comment, '')
            }
        }
    }
    return comments
}

export function applyComments(text: string, comments: Map<string, string>): string {
    for (const [comment, line] of comments) {
        if (line == '') {
            text += "\n" + comment
        } else {
            let index = text.search(line)
            if (index == -1) {
                const trimmedLine = line.trim()
                index = text.search(trimmedLine)
                if (index != -1) {
                    const textHelper = text.slice(0, index)
                    const lastLineBreak = textHelper.lastIndexOf('\n')
                    // remove trailing whitespaces
                    const textBeforeComment = textHelper.slice(0, lastLineBreak)
                    let textAfterComment = textHelper.slice(lastLineBreak)
                    textAfterComment += text.slice(text.search(trimmedLine))
                    text = textBeforeComment + "\n" + comment.split("\n")[0] + textAfterComment
                }
            } else {
                text = text.slice(0, index) + comment + "\n" + text.slice(text.search(line))
            }
        }
    }
    return text
}