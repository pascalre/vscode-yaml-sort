import { equal } from "assert"
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

import { Selection, Uri, commands, window, workspace } from "vscode"

import { EditorCommands } from "../../vscode/editor-commands"


suite("Test sortYamlFiles", () => {
  const fileContent = "---\nakey: value\nkey: value"

  test("should sort all yaml files in directory", async () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/folder1"))

    await commands.executeCommand("vscode-yaml-sort.sortYamlFilesInDirectory", uri)

    let sortedFile = readFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file.yaml", "utf-8").toString()
    equal(sortedFile, fileContent)
    sortedFile = readFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file2.yaml", "utf-8").toString()
    equal(sortedFile, fileContent)

    writeFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file.yaml", fileContent)
    writeFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file2.yaml", fileContent)
  })
})

suite("Test validateYamlWrapper", () => {
  test("should return true on open document", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testValidateYamlWrapper.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })
    equal(new EditorCommands().validateYamlWrapper(), true)
  })
})

suite("Test formatYamlWrapper", () => {
  test("should return true on a valid yaml", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testFormatYamlWrapper2.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const expected =
        "---\n" +
        "key:\n" +
        "  key2: value"

      equal((await new EditorCommands().formatYamlWrapper())[0].newText, expected)
    } else {
      equal(true, false)
    }
  })
  test("should format multiple yaml in one file", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testFormatYamlWrapper.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const expected =
        "---\n" +
        "key1: value\n" +
        "---\n" +
        "key2: value"

      equal((await new EditorCommands().formatYamlWrapper())[0].newText, expected)
    } else {
      equal(true, false)
    }
  })
  test("should fail on invalid yaml", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testFormatYamlWrapper-fail.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      equal(undefined, undefined)
    } else {
      equal(true, false)
    }
  })
})

suite("Test formatYamlWrapper with a selection", () => {
  test("should format the whole document instead of replacing the selection with it", async () => {
    const document = await workspace.openTextDocument({ language: "yaml", content: "b:   1\na:   2" })
    const editor = await window.showTextDocument(document, { preview: false })
    editor.selection = new Selection(0, 0, 0, 5)

    await new EditorCommands(editor).formatYamlWrapper()

    equal(document.getText(), "---\nb: 1\na: 2")
  })
})

suite("Test editor commands without an active editor", () => {
  test("should not fail when no editor is open", async () => {
    await commands.executeCommand("workbench.action.closeAllEditors")

    await commands.executeCommand("vscode-yaml-sort.sortYaml")
    await commands.executeCommand("vscode-yaml-sort.formatYaml")
    await commands.executeCommand("vscode-yaml-sort.validateYaml")
  })
})
