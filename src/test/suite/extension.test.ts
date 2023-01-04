//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import { deepStrictEqual, strictEqual, notDeepStrictEqual, equal, deepEqual } from "assert"
import { Uri, workspace, window, commands, Position, Range, Selection } from "vscode"
import { resolve } from "path"

import { Settings } from "../../settings"
import { applyComments, findComments, hasTextYamlKeys, isSelectionInvalid, splitYaml } from "../../util/yaml-util"
import { sortYamlWrapper } from "../../controller"

suite("Test getCustomSortKeywords", () => {
  test("should return values of `vscode-yaml-sort.customSortKeywords_1`", () => {
    const settings = new Settings()
    settings.getCustomSortKeywords = function () {
      return ["apiVersion", "kind", "metadata", "spec", "data"]
    }
    deepStrictEqual(settings.getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
  })
  test("should return `[]` for custom keywords 2 and 3", () => {
    deepStrictEqual(new Settings().getCustomSortKeywords(2), [])
    deepStrictEqual(new Settings().getCustomSortKeywords(3), [])
  })

  test("should return [] when parameter is not in [1, 2, 3]", () => {
    deepStrictEqual(new Settings().getCustomSortKeywords(0), [])
    deepStrictEqual(new Settings().getCustomSortKeywords(4), [])
    deepStrictEqual(new Settings().getCustomSortKeywords(-1), [])
    deepStrictEqual(new Settings().getCustomSortKeywords(1.5), [])
  })
})

suite("Test isSelectionInvalid", () => {
  test("should return `true` when `text` is passed", () => {
    strictEqual(isSelectionInvalid("text"), false)
  })
  test("should return `false` when a string with trailing colon is passed", () => {
    strictEqual(isSelectionInvalid("text:"), true)
  })
  test("should return `false` when a string with trailing colon and whitespaces is passed", () => {
    strictEqual(isSelectionInvalid("text: "), true)
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

      deepStrictEqual(sortYamlWrapper(), [])
    } else {
      strictEqual(true, false)
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

      notDeepStrictEqual(sortYamlWrapper(), [])
    } else {
      strictEqual(true, false)
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
      deepStrictEqual(sortYamlWrapper(), [])
    } else {
      strictEqual(true, false)
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
      strictEqual(activeEditor.document.getText(), expected)
    } else {
      strictEqual(true, false)
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
      strictEqual(activeEditor.document.getText(), expected)
    } else {
      strictEqual(true, false)
    }
  })
})


suite("Test hasTextYamlKeys", () => {
  test("when a text with no yaml keys is passed, `false` is returned", () => {
    equal(hasTextYamlKeys(""), false)
  })

  test("when a text with yaml keys is passed, `true` is returned", () => {
    equal(hasTextYamlKeys("api: v1"), true)
  })
})


suite("Test splitYaml", () => {
  test("should return the input string, when the input does not contain `---`", () => {
    const actual = `\
- Orange
- Apple`
    deepStrictEqual(splitYaml(actual), ["- Orange\n- Apple"])
  })
  test("should return the input document without the delimiters", () => {
    const actual = `\
---
- Orange
- Apple`
    deepStrictEqual(splitYaml(actual), ["\n- Orange\n- Apple"])
  })
  test("should return an array with the yaml documents", () => {
    const actual = `\
- Orange
- Apple
---
- Orange
- Apple`
    deepStrictEqual(splitYaml(actual), ["- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
  test("Split multiple yaml documents with leading dashes", () => {
    const actual = `\
---
- Orange
- Apple
---
- Orange
- Apple`

    deepStrictEqual(splitYaml(actual),
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
    deepStrictEqual(splitYaml(actual),
      ["\n- Orange\n- Apple\n", "\n- Orange\n- Apple"])
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
    deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value", () => {
    const yaml =
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected = new Map<string, string>()
    expected.set('# bob is 1st', '  bob:')
    deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value (comment on top)", () => {
    const yaml =
      '# comment on top\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected = new Map<string, string>()
    expected.set('# comment on top', 'persons:')
    deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value (comment at the bottom)", () => {
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '# comment at the bottom'

    const expected = new Map<string, string>()
    expected.set('# comment at the bottom', '')
    deepEqual(findComments(yaml), expected)
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
    expected.set('# bob is 1st\n# alice is 2nd', '  bob:')
    deepEqual(findComments(yaml), expected)
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

    deepEqual(applyComments(yaml, comments), expected)
  })

  test("should apply comment to last line in yaml", () => {
    const comments = new Map<string, string>()
    comments.set("# last line comment", "")
    const yaml =
      'persons: bob'

    const expected =
      'persons: bob\n' +
      '# last line comment'

    deepEqual(applyComments(yaml, comments), expected)
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

    const expected =
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    # living in germany\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '\n' +
      '# last line comment'

    deepEqual(applyComments(yaml, comments), expected)
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

    deepEqual(applyComments(yaml, comments), expected)
  })
})
