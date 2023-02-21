import { deepEqual, equal, notDeepEqual } from "assert"
import { resolve } from "path"

import { Position, Range, Selection, Uri, commands, window, workspace } from "vscode"

import { Controller } from "../../controller/controller"
import { Settings } from "../../settings"
import { splitYaml } from "../../util/yaml-util"

suite("Test getCustomSortKeywords", () => {
  test("should return values of `vscode-yaml-sort.customSortKeywords_1`", () => {
    const settings = new Settings()
    settings.getCustomSortKeywords = function () {
      return ["apiVersion", "kind", "metadata", "spec", "data"]
    }
    deepEqual(settings.getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
  })
  test("should return `[]` for custom keywords 2 and 3", () => {
    deepEqual(new Settings().getCustomSortKeywords(2), [])
    deepEqual(new Settings().getCustomSortKeywords(3), [])
  })

  test("should return [] when parameter is not in [1, 2, 3]", () => {
    deepEqual(new Settings().getCustomSortKeywords(0), [])
    deepEqual(new Settings().getCustomSortKeywords(4), [])
    deepEqual(new Settings().getCustomSortKeywords(-1), [])
    deepEqual(new Settings().getCustomSortKeywords(1.5), [])
  })
})

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
        'key:\n' +
        ' key2: value'

      activeEditor.edit((builder) => builder.replace(
        new Range(
          new Position(0, 0),
          new Position(activeEditor.document.lineCount + 1, 0)),
        actual))

      notDeepEqual(new Controller().sortYamlWrapper(), [])
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
        'key:\n' +
        '  key2: value'

      activeEditor.edit((builder) => builder.replace(
        new Range(
          new Position(0, 0),
          new Position(activeEditor.document.lineCount + 1, 0)),
        actual))

      activeEditor.selection = new Selection(0, 0, 0, 4)
      deepEqual(new Controller().sortYamlWrapper(), [])
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
        'key:\n' +
        '  key2: value\n' +
        '  key3: value\n' +
        'key4: value'

      activeEditor.selection = new Selection(0, 0, 3, 0)
      await commands.executeCommand("vscode-yaml-sort.sortYaml")
      // do not assert too fast
      await new Promise(r => setTimeout(r, 2000));
      equal(activeEditor.document.getText(), expected)
    } else {
      equal(true, false)
    }
  })
  test("should remove yaml metadata tags (directives)", async () => {
    // Todo: This test needs a refactoring
    const uri = Uri.parse(resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    // const uri = Uri.parse(resolve("./src/test/files/testSortYaml.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    const activeEditor = window.activeTextEditor
    if (activeEditor) {
      const actual =
        '%YAML 1.1' +
        '---\n' +
        'key:\n' +
        '  key2: value'
      const expected =
        'key:\n' +
        '  key2: value'

      activeEditor.edit((builder) => builder.replace(
        new Range(
          new Position(0, 0),
          new Position(activeEditor.document.lineCount + 1, 0)),
        actual))

      await commands.executeCommand("vscode-yaml-sort.sortYaml")
      // do not assert too fast
      // await new Promise(r => setTimeout(r, 2000));
      equal(activeEditor.document.getText(), expected)
    } else {
      equal(true, false)
    }
  })
})

suite("Test splitYaml", () => {
  test("should return the input string, when the input does not contain `---`", () => {
    const actual = `\
- Orange
- Apple`
    deepEqual(splitYaml(actual), ["- Orange\n- Apple"])
  })
  test("should return the input document without the delimiters", () => {
    const actual = `\
---
- Orange
- Apple`
    deepEqual(splitYaml(actual), ["\n- Orange\n- Apple"])
  })
  test("should return an array with the yaml documents", () => {
    const actual = `\
- Orange
- Apple
---
- Orange
- Apple`
    deepEqual(splitYaml(actual), ["- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
  test("Split multiple yaml documents with leading dashes", () => {
    const actual = `\
---
- Orange
- Apple
---
- Orange
- Apple`

    deepEqual(splitYaml(actual),
      ["\n- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
  test("Split multiple yaml documents with text behind delimiter", () => {
    const actual = `\
--- # comment 1
- Orange
- Apple
--- text
- Orange
- Apple`
    deepEqual(splitYaml(actual),
      ["\n- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
})
