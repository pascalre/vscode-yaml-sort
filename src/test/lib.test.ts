//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert"
import {
  getDelimiters,
  isSelectionInvalid,
  prependWhitespacesOnEachLine,
  removeLeadingLineBreakOfFirstElement,
  removeQuotesFromKeys,
  removeTrailingCharacters,
  splitYaml,
  replaceTabsWithSpaces,
  addNewLineBeforeRootKeywords
} from "../lib"

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

suite("Test removeTrailingCharacters", () => {
  const actual = "text"
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

suite("Test isSelectionInvalid", () => {
  test("should return `true` when `text` is passed", () => {
    assert.strictEqual(isSelectionInvalid("text"), false)
  })
  test("should return `false` when a string with trailing colon is passed", () => {
    assert.strictEqual(isSelectionInvalid("text:"), true)
  })
  test("should return `false` when a string with trailing colon and whitespaces is passed", () => {
    assert.strictEqual(isSelectionInvalid("text: "), true)
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
