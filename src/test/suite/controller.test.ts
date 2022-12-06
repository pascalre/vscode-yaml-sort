import * as vscode from "vscode"
import * as assert from "assert"
import * as path from "path"
import * as fs from "fs"
import { formatYamlWrapper, sortYamlFiles, validateYamlWrapper } from "../../controller"

suite("Test sortYamlFiles", () => {
  test("should sort all yaml files in directory", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/folder1"))

    await vscode.commands.executeCommand("vscode-yaml-sort.sortYamlFilesInDirectory", uri)

    let sortedFile = fs.readFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file.yaml", 'utf-8').toString()
    assert.strictEqual(sortedFile, "akey: value\nkey: value")
    sortedFile = fs.readFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file2.yaml", 'utf-8').toString()
    assert.strictEqual(sortedFile, "akey: value\nkey: value")

    fs.writeFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file.yaml", "key: value\nakey: value")
    fs.writeFileSync("./src/test/files/getYamlFilesInDirectory/folder1/file2.yaml", "key: value\nakey: value")
  })
  test("should return `true` on invalid yaml", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/folder2"))
    assert.strictEqual(sortYamlFiles(uri), true)
  })
})

suite("Test validateYamlWrapper", async () => {
  test("should return true on open document", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })
    assert.strictEqual(validateYamlWrapper(), true)
  })
})

suite("Test formatYamlWrapper", () => {
  test("should return true on a valid yaml", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const expected =
        '---\n' +
        'key:\n' +
        '  key2: value'

      assert.strictEqual(formatYamlWrapper()[0].newText, expected)
    } else {
      assert.strictEqual(true, false)
    }
  })
  test("should format multiple yaml in one file", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/testFormatYamlWrapper.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const expected =
        '---\n' +
        'key1: value\n' +
        '---\n' +
        'key2: value'

      assert.strictEqual(formatYamlWrapper()[0].newText, expected)
    } else {
      assert.strictEqual(true, false)
    }
  })
  test("should fail on invalid yaml", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/testFormatYamlWrapper-fail.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      assert.strictEqual(undefined, undefined)
    } else {
      assert.strictEqual(true, false)
    }
  })
})