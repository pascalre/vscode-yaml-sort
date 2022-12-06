import { addNewLineBeforeKeywordsUpToLevelN, prependWhitespacesOnEachLine, replaceTabsWithSpaces } from "../lib"
import { Settings } from "../settings"
import * as vscode from "vscode"
import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"

export class YamlUtil {
    settings: Settings
    jsyamladapter: JsYamlAdapter

    constructor(settings = new Settings()) {
        this.settings = settings
        this.jsyamladapter = new JsYamlAdapter(settings)
    }

    sortYaml(unsortedYaml: string, customSort = 0): string | null {
        try {
            const unsortedYamlWithoutTabs = replaceTabsWithSpaces(unsortedYaml, this.settings.getIndent())
            const comments = findComments(unsortedYamlWithoutTabs)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const doc = this.jsyamladapter.load(unsortedYamlWithoutTabs) as any
            let sortedYaml = ""

            if (customSort > 0 && !this.settings.getUseCustomSortRecursively()) {
                const keywords = this.settings.getCustomSortKeywords(customSort)

                keywords.forEach(key => {
                    if (doc[key]) {
                        let sortedSubYaml = this.jsyamladapter.dumpYaml(doc[key], true, customSort, this.settings)
                        if ((sortedSubYaml.includes(":") && !sortedSubYaml.startsWith("|")) || sortedSubYaml.startsWith("-")) {
                            // when key cotains more than one line, we need some transformation:
                            // add a new line and indent each line some spaces
                            sortedSubYaml = prependWhitespacesOnEachLine(sortedSubYaml, this.settings.getIndent())
                            if (sortedSubYaml.endsWith("\n")) {
                                sortedSubYaml = removeTrailingCharacters(sortedSubYaml, this.settings.getIndent())
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
            sortedYaml += this.jsyamladapter.dumpYaml(doc, true, customSort, this.settings)

            if (this.settings.getEmptyLinesUntilLevel() > 0) {
                sortedYaml = addNewLineBeforeKeywordsUpToLevelN(this.settings.getEmptyLinesUntilLevel(), this.settings.getIndent(), sortedYaml)
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
    formatYaml(yaml: string, useLeadingDashes: boolean): string | null {
        try {
            const comments = findComments(yaml)
            let doc = new JsYamlAdapter().dumpYaml(this.jsyamladapter.load(yaml) as string, false, 0, this.settings)
            doc = applyComments(doc, comments)
            if (useLeadingDashes) {
                doc = "---\n" + doc
            }
            if (this.settings.getNotifySuccess()) {
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
}

export function hasTextYamlKeys(text: string) {
    if (Object.keys(text).length === 0) {
        return false
    }
    return true
}

/**
 * Removes a given count of characters from a string.
 * @param   {string} text  String for processing.
 * @param   {number} count The number of characters to remove from the end of the returned string.
 * @returns {string} Input text with removed trailing characters.
 */
export function removeTrailingCharacters(text: string, count = 1): string {
    if (count >= 0 && count <= text.length) {
        return text.substring(0, text.length - count)
    } else {
        throw new Error("The count parameter is not in a valid range")
    }
}

/**
 * Checks if a text ends with a character which suggests, that the selection is missing something.
 * @param   {string}        text Text which should represent a valid yaml selection to sort.
 * @returns {boolean} true, if selection is missing something
 */
export function isSelectionInvalid(text: string): boolean {
    // remove trailing whitespaces, to check for things like 'text:  '
    text = text.trim()
    const notValidEndingCharacters = [":", "|", ">"]
    if (notValidEndingCharacters.includes(text.charAt(text.length - 1))) {
        return true
    }
    try {
        new JsYamlAdapter().validateYaml(text)
        return false
    } catch (e) {
        if (e instanceof Error) {
            new VsCodeAdapter().showMessage(Severity.ERROR, e.message)
        }
        return true
    }
}

export function validateTextRange(text: string) {
    // remove trailing whitespaces, to check for things like 'text:  '
    text = text.trim()
    const notValidEndingCharacters = [":", "|", ">"]
    if (notValidEndingCharacters.includes(text.charAt(text.length - 1))) {
        throw new Error("YAML selection is invalid. Check the ending of your selection.")
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

/**
 * Splits a string, which contains multiple yaml documents.
 * @param   {string}   multipleYamls String which contains multiple yaml documents.
 * @returns {[string]} Array of yaml documents.
 */
export function splitYaml(multipleYamls: string): [string] {
    return multipleYamls.split(/^---.*/m).filter((obj) => obj) as [string]
}

/**
 * Returns all delimiters with comments.
 * @param   {string}  multipleYamls String which contains multiple yaml documents.
 * @param   {boolean} isSelectionEmpty Specify if the text is an selection
 * @param   {boolean} useLeadingDashes Specify if the documents should have a leading delimiter.
 *                                   If set to false, it will add an empty array element at the beginning of the output.
 * @returns {[string]} Array of yaml delimiters.
 */
export function getDelimiters(multipleYamls: string, isSelectionEmpty: boolean, useLeadingDashes: boolean): RegExpMatchArray {
    // remove empty lines
    multipleYamls = multipleYamls.trim()
    multipleYamls = multipleYamls.replace(/^\n/, "")
    let delimiters = multipleYamls.match(/^---.*/gm)
    if (!delimiters) {
        return [""]
    }

    // append line break to every delimiter
    delimiters = delimiters.map((delimiter) => "\n" + delimiter + "\n") as RegExpMatchArray

    if (delimiters) {
        if (isSelectionEmpty) {
            if (!useLeadingDashes && multipleYamls.startsWith("---")) {
                delimiters.shift()
                delimiters.unshift("")
            } else if (useLeadingDashes && !multipleYamls.startsWith("---")) {
                delimiters.unshift("---\n")
            } else {
                delimiters.unshift("")
            }
        } else {
            if (!multipleYamls.startsWith("---")) {
                delimiters.unshift("")
            } else {
                let firstDelimiter = delimiters.shift()
                if (firstDelimiter) {
                    firstDelimiter = firstDelimiter.replace(/^\n/, "")
                    delimiters.unshift(firstDelimiter)
                }
            }
        }
    }
    return delimiters
}
