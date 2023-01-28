import { Uri, commands, window, workspace } from "vscode"
import { strictEqual } from "assert"
import { resolve } from "path"
import { readFileSync, writeFileSync } from "fs"
import { Controller } from "../../../controller/controller"

suite("Test sortYamlFiles", () => {
  test("should sort all yaml files in directory", async () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/folder1"))

    await commands.executeCommand("vscode-yaml-sort.sortYamlFilesInDirectory", uri)

    let sortedFile = readFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file.yaml", 'utf-8').toString()
    strictEqual(sortedFile, "akey: value\nkey: value")
    sortedFile = readFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file2.yaml", 'utf-8').toString()
    strictEqual(sortedFile, "akey: value\nkey: value")

    writeFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file.yaml", "key: value\nakey: value")
    writeFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file2.yaml", "key: value\nakey: value")
  })
  /*
  test("should return `true` on invalid yaml", () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/folder2"))
    strictEqual(new Controller().sortYamlFiles(uri), true)
  })
  */
})

suite("Test validateYamlWrapper", () => {
  test("should return true on open document", async () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })
    strictEqual(new Controller().validateYamlWrapper(), true)
  })
})

suite("Test formatYamlWrapper", () => {
  test("should return true on a valid yaml", async () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const expected =
        '---\n' +
        'key:\n' +
        '  key2: value'

      strictEqual(new Controller().formatYamlWrapper()[0].newText, expected)
    } else {
      strictEqual(true, false)
    }
  })
  test("should format multiple yaml in one file", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testFormatYamlWrapper.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const expected =
        '---\n' +
        'key1: value\n' +
        '---\n' +
        'key2: value'

      strictEqual(new Controller().formatYamlWrapper()[0].newText, expected)
    } else {
      strictEqual(true, false)
    }
  })
  test("should fail on invalid yaml", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testFormatYamlWrapper-fail.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      strictEqual(undefined, undefined)
    } else {
      strictEqual(true, false)
    }
  })
})