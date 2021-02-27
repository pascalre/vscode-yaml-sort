//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert"
import * as fs from "fs"
import * as vscode from "vscode"
import * as path from "path"

import {
  getCustomSortKeywords,
  sortYaml,
  validateYaml,
  formatYaml,
  formatYamlWrapper,
  sortYamlFiles,
  validateYamlWrapper,
  sortYamlWrapper
} from "../../extension"

suite("Test getCustomSortKeywords", () => {
  test("should return values of `vscode-yaml-sort.customSortKeywords_1`", () => {
    assert.deepStrictEqual(getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
  })
  test("should return `[]` for custom keywords 2 and 3", () => {
    assert.deepStrictEqual(getCustomSortKeywords(2), [])
    assert.deepStrictEqual(getCustomSortKeywords(3), [])
  })

  test("should fail when parameter is not in [1, 2, 3]", () => {
    assert.throws(() => getCustomSortKeywords(  0), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(  4), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords( -1), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(1.5), new Error("The count parameter is not in a valid range"))
  })
})

suite("Test validateYaml", () => {
  test("should return `true` when passing a valid yaml", () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'
    assert.strictEqual(validateYaml(actual), true)
  })

  test("should return `true` when passing two seperated valid yaml", () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '---\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'
    assert.strictEqual(validateYaml(actual), true)
  })

  test("should return `false` when passing an invalid yaml", () => {
    assert.strictEqual(validateYaml("network: ethernets:"), false)
  })
  test("should return `false` when yaml indentation is not correct", () => {
    assert.strictEqual(validateYaml("person:\nbob\n  age:23"), false)
  })
  test("should return `false` when yaml contains duplicate keys", () => {
    assert.strictEqual(validateYaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n"), false)
  })
})

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

suite("Test dumpYaml", () => {
  test("should recursively use customSort", () => {
    const actual =
      'keyword1: value\n' +
      'keyword: value\n' +
      'keyword2: value\n' +
      'data:\n' +
      '  apiVersion: value\n' +
      '  keyword: value\n' +
      '  data: value\n' +
      '  kind: value\n' +
      'kind: value'

    const expected =
      'kind: value\n' +
      'data:\n' +
      '  apiVersion: value\n' +
      '  kind: value\n' +
      '  data: value\n' +
      '  keyword: value\n' +
      'keyword: value\n' +
      'keyword1: value\n' +
      'keyword2: value'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, true, false, 500, true, "'"), expected)
  })
})

suite("Test validateYamlWrapper", () => {
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
      const actual =
        'key:\n' +
        '    key2: value'

      activeEditor.edit((builder) => builder.replace(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        actual))

        assert.strictEqual(formatYamlWrapper(), true)
    } else {
      assert.strictEqual(true, false)
    }
  })
})

suite("Test sortYamlWrapper", () => {
  test("should return false on invalid quotingType", async () => {
    const settings = vscode.workspace.getConfiguration("vscode-yaml-sort")
    await settings.update("quotingType", "`", vscode.ConfigurationTarget.Global)

    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const actual =
        'key:\n' +
        '  key2: value'

      activeEditor.edit((builder) => builder.replace(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        actual))

        assert.strictEqual(sortYamlWrapper(), false)
    } else {
      assert.strictEqual(true, false)
    }
    
    await settings.update("quotingType", "'", vscode.ConfigurationTarget.Global)
  })
  test("should return true on a valid yaml", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const actual =
        'key:\n' +
        '  key2: value'

      activeEditor.edit((builder) => builder.replace(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        actual))

        assert.strictEqual(sortYamlWrapper(), true)
    } else {
      assert.strictEqual(true, false)
    }
  })
  test("should return false on invalid selection", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const actual =
        'key:\n' +
        '  key2: value'

      activeEditor.edit((builder) => builder.replace(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        actual))
      
      activeEditor.selection = new vscode.Selection(0, 0, 0, 4)
      assert.strictEqual(sortYamlWrapper(), false)
    } else {
      assert.strictEqual(true, false)
    }
  })
  test("should remove yaml metadata tags (directives)", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
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
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        actual))
      
      await vscode.commands.executeCommand("vscode-yaml-sort.sortYaml")
      assert.strictEqual(activeEditor.document.getText(), expected)
    } else {
      assert.strictEqual(true, false)
    }
  })
})

suite("Test formatYaml", () => {
  test("should sort all yaml files in directory", () => {
    const actual = 
      'persons:\n' +
      '  bob:\n' +
      '    place: "Germany"\n' +
      '    age: 23\n' +
      '"animals":\n' +
      '  kitty:\n' +
      '    age: 3'

    let expected =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    assert.strictEqual(formatYaml(actual, false, 2, false, 500, false, "'"), expected)

    expected =
      '---\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    assert.strictEqual(formatYaml(actual, true, 2, false, 500, false, "'"), expected)
  })

  test("should return `null` on invalid yaml", () => {
    assert.strictEqual(formatYaml('key: 1\nkey: 1', true, 2, false, 500, false, "'"), null)
  })
})

suite("Test sortYaml", () => {
  test("should sort a given yaml document", async () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '  key: >\n' +
      '      This is a very long sentence\n' +
      '      that spans several lines in the YAML\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3\n'

    const expected =
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3\n' +
      'persons:\n' +
      '  bob:\n' +
      '    age: 23\n' +
      '    place: Germany\n' +
      '  key: |\n' +
      '    This is a very long sentence that spans several lines in the YAML'

    assert.strictEqual(sortYaml(actual, 0, 0, 2, false, false, 500, false, "'"), expected)
  })

  test("should put top level keyword `spec` before `data` when passing customsort=1", async () => {
    let actual =
      'data: data\n' +
      'spec: spec'

    let expected =
      'spec: spec\n' +
      'data: data\n'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, "'"), expected)

    actual =
      'data: data\n' +
      'spec:\n' +
      '  - aa: b'

    expected =
      'spec:\n' +
      '  - aa: b\n' +
      'data: data\n'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, "'"), expected)

    actual =
      'data:\n' +
      '  job: Developer\n' +
      '  skills:\n' +
      '    - pascal\n' +
      'spec:\n' +
      '  job: Boss\n' +
      '  name: Stuart'

    expected =
      'spec:\n' +
      '  job: Boss\n' +
      '  name: Stuart\n' +
      'data:\n' +
      '  job: Developer\n' +
      '  skills:\n' +
      '    - pascal\n'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, "'"), expected)

    actual =
      'data: data\n' +
      'spec:\n' +
      '  - a\n' +
      '  - b'

    expected =
      'spec:\n' +
      '  - a\n' +
      '  - b\n' +
      'data: data\n'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, "'"), expected)
  })

  test("should wrap words after 500 characters (`vscode-yaml-sort.lineWidth`)", () => {
    const actual =
      '- lorem ipsum:\n' +
      '    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut ' +
      'labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea ' +
      'rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor ' +
      'sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
      'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e"'

    const expected =
      '- lorem ipsum:\n' +
      '    text: >-\n' +
      '      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut ' +
      'labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ' +
      'ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor ' +
      'sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
      'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo\n' +
      '      dolores et e'

    assert.strictEqual(sortYaml(actual, 0, 0, 2, false, false, 500, false, "'"), expected)
  })

  test("should add an empty line before `spec`", () => {
    const actual =
      'spec: value\n' +
      'data:\n' +
      '  - a\n' +
      '  - b'

    const expected =
      'data:\n' +
      '  - a\n' +
      '  - b\n' +
      '\n' +
      'spec: value'

      assert.strictEqual(sortYaml(actual, 0, 2, 2, false, false, 500, false, "'"), expected)
  })
})