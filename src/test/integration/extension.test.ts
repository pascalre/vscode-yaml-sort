import { deepEqual, equal, notDeepEqual } from "assert"
import { resolve } from "path"

import { Position, Range, Selection, Uri, commands, window, workspace } from "vscode"

import { EditorCommands } from "../../vscode/editor-commands"

suite("Test validateYaml", () => {
  test("do not fail when executing command", async () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })
    await commands.executeCommand("vscode-yaml-sort.validateYaml")
  })
})

suite("Test sortYamlWrapper", () => {
  /*
  test("should return `[]` on invalid quotingType", async () => {
    const settings = workspace.getConfiguration("vscode-yaml-sort")
    await settings.update("quotingType", "`", ConfigurationTarget.Global)

    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const actual =
        'key:\n' +
        '  key2: value'

      activeEditor.edit((builder) => builder.replace(
        new Range(
          new Position(0, 0),
          new Position(activeEditor.document.lineCount + 1, 0)),
        actual))

      deepEqual(sortYamlWrapper(), [])
    } else {
      equal(true, false)
    }

    await settings.update("quotingType", "'", ConfigurationTarget.Global)
  })
  */
  test("should return edits on a valid yaml", async () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const actual =
        "key:\n" +
        " key2: value"

      activeEditor.edit((builder) => builder.replace(
        new Range(
          new Position(0, 0),
          new Position(activeEditor.document.lineCount + 1, 0)),
        actual))

      notDeepEqual(new EditorCommands().sortYamlWrapper(), [])
    } else {
      equal(true, false)
    }
  })

  test("should return `[]` on invalid selection", async () => {
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const actual =
        "key:\n" +
        "  key2: value"

      activeEditor.edit((builder) => builder.replace(
        new Range(
          new Position(0, 0),
          new Position(activeEditor.document.lineCount + 1, 0)),
        actual))

      activeEditor.selection = new Selection(0, 0, 0, 4)
      deepEqual(new EditorCommands().sortYamlWrapper(), [])
    } else {
      equal(true, false)
    }
  })
  test("should ignore line if selection ends on a lines first character", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testSortYamlWrapper.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const expected =
        "key:\n" +
        "  key2: value\n" +
        "  key3: value\n" +
        "key4: value"

      activeEditor.selection = new Selection(0, 0, 3, 0)
      await commands.executeCommand("vscode-yaml-sort.sortYaml")
      // do not assert too fast
      await new Promise(r => setTimeout(r, 2000))
      equal(activeEditor.document.getText(), expected)
    } else {
      equal(true, false)
    }
  })
})
