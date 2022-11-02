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