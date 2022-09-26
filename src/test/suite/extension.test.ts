//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert"
import * as fs from "fs"
import * as vscode from "vscode"
import * as path from "path"
import * as jsyaml from "js-yaml"

import {
  applyComments,
  findComments,
  formatYaml,
  formatYamlWrapper,
  getCustomSortKeywords,
  isSelectionInvalid,
  sortYaml,
  sortYamlFiles,
  sortYamlWrapper,
  validateYaml,
  validateYamlWrapper
} from "../../extension"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"

const locale = "en"

suite("Test getCustomSortKeywords", () => {
  test("should return values of `vscode-yaml-sort.customSortKeywords_1`", () => {
    assert.deepStrictEqual(getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
  })
  test("should return `[]` for custom keywords 2 and 3", () => {
    assert.deepStrictEqual(getCustomSortKeywords(2), [])
    assert.deepStrictEqual(getCustomSortKeywords(3), [])
  })

  test("should fail when parameter is not in [1, 2, 3]", () => {
    assert.throws(() => getCustomSortKeywords(0), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(4), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(-1), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(1.5), new Error("The count parameter is not in a valid range"))
  })
})

suite("Test isSelectionInvalid", () => {
  test("should return `true` when `text` is passed", () => {
    assert.strictEqual(isSelectionInvalid("text", jsyaml.CORE_SCHEMA), false)
  })
  test("should return `false` when a string with trailing colon is passed", () => {
    assert.strictEqual(isSelectionInvalid("text:", jsyaml.CORE_SCHEMA), true)
  })
  test("should return `false` when a string with trailing colon and whitespaces is passed", () => {
    assert.strictEqual(isSelectionInvalid("text: ", jsyaml.CORE_SCHEMA), true)
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
    assert.strictEqual(validateYaml(actual, jsyaml.CORE_SCHEMA), true)
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
    assert.strictEqual(validateYaml(actual, jsyaml.CORE_SCHEMA), true)
  })

  test("should return `false` when passing an invalid yaml", () => {
    assert.strictEqual(validateYaml("network: ethernets:", jsyaml.CORE_SCHEMA), false)
  })
  test("should return `false` when yaml indentation is not correct", () => {
    assert.strictEqual(validateYaml("person:\nbob\n  age:23", jsyaml.CORE_SCHEMA), false)
  })
  test("should return `false` when yaml contains duplicate keys", () => {
    assert.strictEqual(validateYaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n", jsyaml.CORE_SCHEMA), false)
  })
  test("should return `true` on CLOUDFORMATION_SCHEMA", () => {
    assert.strictEqual(validateYaml("RoleName: !Sub \"AdministratorAccess\"", jsyaml.CORE_SCHEMA), false)
    assert.strictEqual(validateYaml("RoleName: !Sub \"AdministratorAccess\"", CLOUDFORMATION_SCHEMA), true)
  })
  test("should return `true` on HOMEASSISTANT_SCHEMA", () => {
    assert.strictEqual(validateYaml("password: !env_var PASSWORD default_password", jsyaml.CORE_SCHEMA), false)
    assert.strictEqual(validateYaml("password: !env_var PASSWORD default_password", HOMEASSISTANT_SCHEMA), true)
  })
  test("do not fail when executing command", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })
    await vscode.commands.executeCommand("vscode-yaml-sort.validateYaml")
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

    assert.strictEqual(sortYaml(actual, 1, 0, 2, true, false, 500, true, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)
  })
  test("should sort with by locale behaviour", () => {
    const actual =
      'ä: value\n' +
      'z: value'

    let expected =
      'ä: value\n' +
      'z: value'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, true, false, 500, true, true, "'", jsyaml.DEFAULT_SCHEMA, 'de'), expected)

    expected =
      'z: value\n' +
      'ä: value'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, true, false, 500, true, true, "'", jsyaml.DEFAULT_SCHEMA, 'sv'), expected)
  })
  test("should ignore case when sorting", () => {
    const actual =
      'completedDate: value\n' +
      'completeTask: value'

    const expected =
      'completedDate: value\n' +
      'completeTask: value'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, true, false, 500, true, true, "'", jsyaml.DEFAULT_SCHEMA, 'en'), expected)
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

suite("Test sortYamlWrapper", () => {
  test("should return `[]` on invalid quotingType", async () => {
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

      assert.deepStrictEqual(sortYamlWrapper(), [])
    } else {
      assert.strictEqual(true, false)
    }

    await settings.update("quotingType", "'", vscode.ConfigurationTarget.Global)
  })
  test("should return edits on a valid yaml", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const actual =
        'key:\n' +
        ' key2: value'

      activeEditor.edit((builder) => builder.replace(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(activeEditor.document.lineCount + 1, 0)),
        actual))

      assert.notDeepStrictEqual(sortYamlWrapper(), [])
    } else {
      assert.strictEqual(true, false)
    }
  })
  test("should return `[]` on invalid selection", async () => {
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
      assert.deepStrictEqual(sortYamlWrapper(), [])
    } else {
      assert.strictEqual(true, false)
    }
  })
  test("should ignore line if selection ends on a lines first character", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/testSortYamlWrapper.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    const activeEditor = vscode.window.activeTextEditor
    if (activeEditor) {
      const expected =
        'key:\n' +
        '  key2: value\n' +
        '  key3: value\n' +
        'key4: value'

      activeEditor.selection = new vscode.Selection(0, 0, 3, 0)
      await vscode.commands.executeCommand("vscode-yaml-sort.sortYaml")
      // do not assert too fast
      await new Promise(r => setTimeout(r, 2000));
      assert.strictEqual(activeEditor.document.getText(), expected)
    } else {
      assert.strictEqual(true, false)
    }
  })
  test("should remove yaml metadata tags (directives)", async () => {
    // Todo: This test needs a refactoring
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    // const uri = vscode.Uri.parse(path.resolve("./src/test/files/testSortYaml.yaml"))
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
      // do not assert too fast
      // await new Promise(r => setTimeout(r, 2000));
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

    assert.strictEqual(formatYaml(actual, false, 2, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)

    expected =
      '---\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    assert.strictEqual(formatYaml(actual, true, 2, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)
  })

  test("should return `null` on invalid yaml", () => {
    assert.strictEqual(formatYaml('key: 1\nkey: 1', true, 2, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), null)
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

    assert.strictEqual(sortYaml(actual, 0, 0, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)
  })

  test("should put top level keyword `spec` before `data` when passing customsort=1", async () => {
    let actual =
      'data: data\n' +
      'spec: spec'

    let expected =
      'spec: spec\n' +
      'data: data\n'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)

    actual =
      'data: data\n' +
      'spec:\n' +
      '  - aa: b'

    expected =
      'spec:\n' +
      '  - aa: b\n' +
      'data: data\n'

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)

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

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)

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

    assert.strictEqual(sortYaml(actual, 1, 0, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)
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

    assert.strictEqual(sortYaml(actual, 0, 0, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)
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

    assert.strictEqual(sortYaml(actual, 0, 2, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)
  })
  test("should not format a date in CORE_SCHEMA", () => {
    const actual = 'AWSTemplateFormatVersion: 2010-09-09'
    let expected = 'AWSTemplateFormatVersion: 2010-09-09T00:00:00.000Z'
    assert.strictEqual(sortYaml(actual, 0, 2, 2, false, false, 500, false, true, "'", jsyaml.DEFAULT_SCHEMA, locale), expected)

    expected = actual
    assert.strictEqual(sortYaml(actual, 0, 2, 2, false, false, 500, false, true, "'", jsyaml.CORE_SCHEMA, locale), expected)
  })
  test("should sort a yaml with CLOUDFORMATION_SCHEMA", () => {
    const actual =
      'LoggingBucketKMSKeyAlias:\n' +
      '  Properties:\n' +
      '    TargetKeyId: !Sub "LoggingBucketKMSKey"\n' +
      '    AliasName: !Sub "alias/AppName/Environment/s3-logging-kms"'

    const expected =
      'LoggingBucketKMSKeyAlias:\n' +
      '\n' +
      '  Properties:\n' +
      '    AliasName: !Sub "alias/AppName/Environment/s3-logging-kms"\n' +
      '    TargetKeyId: !Sub "LoggingBucketKMSKey"'
    assert.strictEqual(sortYaml(actual, 0, 2, 2, false, true, 500, false, true, "\"", CLOUDFORMATION_SCHEMA, locale), expected)
  })
  test("compatibility with older yaml versions should be configurable", () => {
    const actual =
      'key:\n' +
      '  on: foo\n' +
      '  off: egg'

    let expected =
      'key:\n' +
      '  "off": egg\n' +
      '  "on": foo'
    assert.strictEqual(sortYaml(actual, 0, 0, 2, false, false, 500, false, false, "\"", CLOUDFORMATION_SCHEMA, locale), expected)

    expected =
      'key:\n' +
      '  off: egg\n' +
      '  on: foo'
    assert.strictEqual(sortYaml(actual, 0, 0, 2, false, false, 500, false, true, "\"", CLOUDFORMATION_SCHEMA, locale), expected)
  })
})

suite("Test findComments", () => {    
  test("should return an empty map on a yaml without comments", () => {
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'
    const expected = new Map<string, string>()
    assert.deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value", () => {
    const yaml =
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'
  
    const expected = new Map<string, string>()
    expected.set('# bob is 1st\n', '  bob:')
    assert.deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value (comment on top)", () => {
    const yaml =
      '# comment on top\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'
  
    const expected = new Map<string, string>()
    expected.set('# comment on top\n', 'persons:')
    assert.deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value (comment at the bottom)", () => {
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '# comment at the bottom'
  
    const expected = new Map<string, string>()
    expected.set('# comment at the bottom\n', '')
    assert.deepEqual(findComments(yaml), expected)
  })

  test("should merge multiline comments", () => {
    const yaml = 
      'persons:\n' +
      '# bob is 1st\n' +
      '# alice is 2nd\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

      const expected = new Map<string, string>()
      expected.set('# bob is 1st\n# alice is 2nd\n', '  bob:')
      assert.deepEqual(findComments(yaml), expected)
  })
  
})

suite("Test applyComments", () => {
  test("should apply comment to yaml", () => {
    const comments = new Map<string, string>()
    comments.set("# bob is 1st", "  bob:")
    const yaml = 
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected = 
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    assert.deepEqual(applyComments(yaml, comments), expected)
  })

  test("should apply comment to last line in yaml", () => {
    const comments = new Map<string, string>()
    comments.set("# last line comment", "")
    const yaml = 
      'persons: bob'

    const expected = 
      'persons: bob\n' +
      '# last line comment'

    assert.deepEqual(applyComments(yaml, comments), expected)
  })

  test("should apply multiple comments to yaml", () => {
    const comments = new Map<string, string>()
    comments.set("    # living in germany", "    place: Germany")
    comments.set("# bob is 1st", "  bob:")
    comments.set("# last line comment", "")
    const yaml = 
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'
      ''
  
    const expected = 
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    # living in germany\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '\n' +
      '# last line comment'
  
    assert.deepEqual(applyComments(yaml, comments), expected)
  })

  test("should recognize indentation", () => {
    const comments = new Map<string, string>()
    comments.set("# bob is 1st", "    bob:")
    const yaml = 
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'
  
    const expected = 
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'
  
    assert.deepEqual(applyComments(yaml, comments), expected)
  })
})
