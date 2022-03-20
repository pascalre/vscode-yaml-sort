//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert"
import * as jsyaml from "js-yaml"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import {
  addNewLineBeforeKeywordsUpToLevelN,
  addNewLineBeforeRootKeywords,
  getDelimiters,
  getSchema,
  getYamlFilesInDirectory,
  prependWhitespacesOnEachLine,
  removeLeadingLineBreakOfFirstElement,
  removeQuotesFromKeys,
  removeTrailingCharacters,
  replaceTabsWithSpaces,
  splitYaml
} from "../../lib"

// Defines a Mocha test suite to group tests of similar kind together
suite("Test removeQuotesFromKeys", () => {
  test("should return `key: 1` when `'key': 1` is passed", () => {
    assert.strictEqual(removeQuotesFromKeys("'key': 1"), "key: 1")
  })
  test("should remove the quotes from multiple keywords", () => {
    assert.strictEqual(removeQuotesFromKeys("'key': 1\n'key2': 2"), "key: 1\nkey2: 2")
  })
  test("should remove the quotes from special keywords containing dots", () => {
    assert.strictEqual(removeQuotesFromKeys("'1.2.3': 1\n'key2': 2"), "1.2.3: 1\nkey2: 2")
  })
  test("should remove the quotes from special keywords containing colons", () => {
    assert.strictEqual(removeQuotesFromKeys("'1:2:3': 1\n'key2': 2"), "1:2:3: 1\nkey2: 2")
  })
})

suite("Test getSchema", () => {
  test("should return `HOMEASSISTANT_SCHEMA`", () => {
    assert.strictEqual(getSchema("HOMEASSISTANT_SCHEMA"), HOMEASSISTANT_SCHEMA)
  })
  test("should return `CLOUDFORMATION_SCHEMA`", () => {
    assert.strictEqual(getSchema("CLOUDFORMATION_SCHEMA"), CLOUDFORMATION_SCHEMA)
  })
  test("should return `CORE_SCHEMA`", () => {
    assert.strictEqual(getSchema("CORE_SCHEMA"), jsyaml.CORE_SCHEMA)
  })
  test("should return `DEFAULT_SCHEMA`", () => {
    assert.strictEqual(getSchema("DEFAULT_SCHEMA"), jsyaml.DEFAULT_SCHEMA)
  })
  test("should return `FAILSAFE_SCHEMA`", () => {
    assert.strictEqual(getSchema("FAILSAFE_SCHEMA"), jsyaml.FAILSAFE_SCHEMA)
  })
  test("should return `JSON_SCHEMA`", () => {
    assert.strictEqual(getSchema("JSON_SCHEMA"), jsyaml.JSON_SCHEMA)
  })
  test("should return `DEFAULT_SCHEMA`", () => {
    assert.strictEqual(getSchema(""), jsyaml.DEFAULT_SCHEMA)
  })
})

suite("Test removeTrailingCharacters", () => {
  const actual = "text"
  test("should return `t` when `t` and 0 are passed", () => {
    assert.strictEqual(removeTrailingCharacters("t", 0), "t")
  })
  test("should return `t` when `text` and 3 are passed", () => {
    assert.strictEqual(removeTrailingCharacters(actual, actual.length - 1 ), "t")
  })
  test("should return `tex` when `text` and 1 are passed", () => {
    assert.strictEqual(removeTrailingCharacters(actual, 1), "tex")
  })
  test("should return `` when `text` and 4 are passed", () => {
    assert.strictEqual(removeTrailingCharacters(actual, actual.length), "")
  })
  test("should throw an error when a negative input is passed", () => {
    assert.throws(() => removeTrailingCharacters(actual, -1))
  })
  test("should throw an error when the count parameter is bigger than the text lenght", () => {
    assert.throws(() => removeTrailingCharacters(actual, actual.length + 1))
  })
  const actual2 = "text\n"
  test("should return `text` when `text\\n` and 1 are passed", () => {
    assert.strictEqual(removeTrailingCharacters(actual2, 1), "text")
  })
  test("should return `text\\n` when `text\\n` and 0 are passed", () => {
    assert.strictEqual(removeTrailingCharacters(actual2, 0), actual2)
  })
})

suite("Test prependWhitespacesOnEachLine", () => {
  const actual = "text"
  test("should return `  text` when `text` and 2 are passed", () => {
    assert.strictEqual(prependWhitespacesOnEachLine(actual, 2), "  text")
  })
  test("should return `text` when `text` and 0 are passed", () => {
    assert.strictEqual(prependWhitespacesOnEachLine(actual, 0), "text")
  })
  test("should throw an error when a negative input is passed", () => {
    assert.throws(() => prependWhitespacesOnEachLine(actual, -1))
  })
  const actual2 = "text\n"
  test("should return `  text\\n  ` when `text\\n` and 2 are passed", () => {
    assert.strictEqual(prependWhitespacesOnEachLine(actual2, 2), "  text\n  ")
  })
})

suite("Test splitYaml", () => {
  test("should return the input string, when the input does not contain `---`", () => {
    const actual = `\
- Orange
- Apple`
    assert.deepStrictEqual(splitYaml(actual), ["- Orange\n- Apple"])
  })
  test("should return the input document without the delimiters", () => {
    const actual = `\
---
- Orange
- Apple`
    assert.deepStrictEqual(splitYaml(actual), ["\n- Orange\n- Apple"])
  })
  test("should return an array with the yaml documents", () => {
    const actual = `\
- Orange
- Apple
---
- Orange
- Apple`
    assert.deepStrictEqual(splitYaml(actual), ["- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
  test("Split multiple yaml documents with leading dashes", () => {
    const actual = `\
---
- Orange
- Apple
---
- Orange
- Apple`

    assert.deepStrictEqual(splitYaml(actual),
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
   assert.deepStrictEqual(splitYaml(actual),
    ["\n- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
})

suite("Test removeLeadingLineBreakOfFirstElement", () => {
  test("should remove only the first line break of an string array", () => {
    const actual = ["\ntext", "\ntext"]
    assert.deepStrictEqual(removeLeadingLineBreakOfFirstElement(actual), ["text", "\ntext"])
  })
})

suite("Test getDelimiters", () => {
  let doc = `
yaml: data
spec: spec
`
  test("should return `` when the input string does not contain a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    assert.equal(getDelimiters(doc, true, false), "")
  })
  test("should return all delimiters except the first (return an empty string instead) when the input document starts with a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    doc = `
--- text
yaml: data
---  #comment
spec: spec
`
    const actual = getDelimiters(doc, true, false)
    assert.deepStrictEqual(actual, ["", "\n---  #comment\n"])
  })
  test("should add leading dashes when useLeadingDashes=true and given document does not have leading dashes", () => {
    doc = `
foo: bar
---
foo2: baz
`
    const actual = getDelimiters(doc, true, true)
    assert.deepStrictEqual(actual, ["---\n", "\n---\n"])
  })
  test("Get each delimiter (empty selection, leading linebreak)", () => {
    doc = `

--- text
yaml: data
---  #comment
spec: spec---

`
    const actual = getDelimiters(doc, true, false)
    assert.deepStrictEqual(actual, ["", "\n---  #comment\n"])
  })
  test("Get each delimiter (empty selection, leading text)", () => {
    doc = `
bla
--- text
test: bla
`
    const actual = getDelimiters(doc, true, false)
    assert.deepStrictEqual(actual, ["", "\n--- text\n"])
  })
  test("Get each delimiter (with selection, leading delimiter)", () => {
    doc = `
--- text
test: bla
`
    const actual = getDelimiters(doc, false, false)
    assert.deepEqual(actual, ["--- text\n"])
  })
  test("Get each delimiter (with selection, leading text)", () => {
    doc = `
bla
--- text
test: bla
`
    const actual = getDelimiters(doc, false, false)
    assert.deepEqual(actual, ["", "\n--- text\n"])
  })
})

suite("Test replaceTabsWithSpaces", () => {
    const actual = `
a-1:
\tb:
\t\td: g
\tc:
\t\td: g`
    const expected = `
a-1:
  b:
    d: g
  c:
    d: g`
  test("should replace all tabs with spaces", () => {
    assert.strictEqual(replaceTabsWithSpaces(actual, 2), expected)
  })
  test("should throw error when count is smaller than `1`", () => {
    assert.throws(() => replaceTabsWithSpaces(actual, 0))
  })
})

suite("Test addNewLineBeforeRootKeywords", () => {
  test("should add an empty line before each top level keyword, but only if they appear after a new line", () => {
    const actual = `data:
  key: value
spec: value
`
    const expected = `data:
  key: value

spec: value
`
    assert.strictEqual(addNewLineBeforeRootKeywords(actual), expected)
  })
})

suite("Test addNewLineForKeywordsUntilLevel", () => {
  test("should add an empty line before each top level keyword, but only if they appear after a new line", () => {
    const actual = `data:
  key:
    key: value
spec: value
`
    let expected = `data:
  key:
    key: value

spec: value
`
    assert.strictEqual(addNewLineBeforeKeywordsUpToLevelN(1, 2, actual), expected)

    expected = `data:

  key:
    key: value

spec: value
`
    assert.strictEqual(addNewLineBeforeKeywordsUpToLevelN(2, 2, actual), expected)
  })

  test("should recognize keywords containing the char -", () => {
    const actual = `data:
  key:
    key: value
  sp-ec: value
`
    const expected = `data:

  key:
    key: value

  sp-ec: value
`
    assert.strictEqual(addNewLineBeforeKeywordsUpToLevelN(2, 2, actual), expected)
  })
})

suite("Test getYamlFilesInDirectory", () => {
  test("should list all files with extension *.yaml or *.yml in a directory and all its subdirectories", () => {
    const expected =   [
      './src/test/files/getYamlFilesInDirectory/file.yaml',
      './src/test/files/getYamlFilesInDirectory/file.yml',
      './src/test/files/getYamlFilesInDirectory/file2.yaml',
      './src/test/files/getYamlFilesInDirectory/folder1/file.yaml',
      './src/test/files/getYamlFilesInDirectory/folder1/file2.yaml',
      './src/test/files/getYamlFilesInDirectory/folder2/file.yaml'
    ]
    assert.deepStrictEqual(getYamlFilesInDirectory("./src/test/files/getYamlFilesInDirectory"), expected)
  })

})