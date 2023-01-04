import { strictEqual, throws, equal, deepStrictEqual, deepEqual } from "assert"
import {
  addNewLineBeforeKeywordsUpToLevelN,
  addNewLineBeforeRootKeywords,
  prependWhitespacesOnEachLine,
  replaceTabsWithSpaces
} from "../../lib"
import { getDelimiters, removeTrailingCharacters } from "../../util/yaml-util"

suite("Test removeTrailingCharacters", () => {
  const actual = "text"
  test("should return `t` when `t` and 0 are passed", () => {
    strictEqual(removeTrailingCharacters("t", 0), "t")
  })
  test("should return `t` when `text` and 3 are passed", () => {
    strictEqual(removeTrailingCharacters(actual, actual.length - 1 ), "t")
  })
  test("should return `tex` when `text` and 1 are passed", () => {
    strictEqual(removeTrailingCharacters(actual, 1), "tex")
  })
  test("should return `` when `text` and 4 are passed", () => {
    strictEqual(removeTrailingCharacters(actual, actual.length), "")
  })
  test("should throw an error when a negative input is passed", () => {
    throws(() => removeTrailingCharacters(actual, -1))
  })
  test("should throw an error when the count parameter is bigger than the text lenght", () => {
    throws(() => removeTrailingCharacters(actual, actual.length + 1))
  })
  const actual2 = "text\n"
  test("should return `text` when `text\\n` and 1 are passed", () => {
    strictEqual(removeTrailingCharacters(actual2, 1), "text")
  })
  test("should return `text\\n` when `text\\n` and 0 are passed", () => {
    strictEqual(removeTrailingCharacters(actual2, 0), actual2)
  })
})

suite("Test prependWhitespacesOnEachLine", () => {
  const actual = "text"
  test("should return `  text` when `text` and 2 are passed", () => {
    strictEqual(prependWhitespacesOnEachLine(actual, 2), "  text")
  })
  test("should return `text` when `text` and 0 are passed", () => {
    strictEqual(prependWhitespacesOnEachLine(actual, 0), "text")
  })
  test("should throw an error when a negative input is passed", () => {
    throws(() => prependWhitespacesOnEachLine(actual, -1))
  })
  const actual2 = "text\n"
  test("should return `  text\\n  ` when `text\\n` and 2 are passed", () => {
    strictEqual(prependWhitespacesOnEachLine(actual2, 2), "  text\n  ")
  })
})

suite("Test getDelimiters", () => {
  let doc = `
yaml: data
spec: spec
`
  test("should return `` when the input string does not contain a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    equal(getDelimiters(doc, true, false), "")
  })
  test("should return all delimiters except the first (return an empty string instead) when the input document starts with a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    doc = `
--- text
yaml: data
---  #comment
spec: spec
`
    const actual = getDelimiters(doc, true, false)
    deepStrictEqual(actual, ["", "\n---  #comment\n"])
  })
  test("should add leading dashes when useLeadingDashes=true and given document does not have leading dashes", () => {
    doc = `
foo: bar
---
foo2: baz
`
    const actual = getDelimiters(doc, true, true)
    deepStrictEqual(actual, ["---\n", "\n---\n"])
  })
  test("Get each delimiter (empty selection, leading linebreak)", () => {
    doc = `

--- text
yaml: data
---  #comment
spec: spec---

`
    const actual = getDelimiters(doc, true, false)
    deepStrictEqual(actual, ["", "\n---  #comment\n"])
  })
  test("Get each delimiter (empty selection, leading text)", () => {
    doc = `
bla
--- text
test: bla
`
    const actual = getDelimiters(doc, true, false)
    deepStrictEqual(actual, ["", "\n--- text\n"])
  })
  test("Get each delimiter (with selection, leading delimiter)", () => {
    doc = `
--- text
test: bla
`
    const actual = getDelimiters(doc, false, false)
    deepEqual(actual, ["--- text\n"])
  })
  test("Get each delimiter (with selection, leading text)", () => {
    doc = `
bla
--- text
test: bla
`
    const actual = getDelimiters(doc, false, false)
    deepEqual(actual, ["", "\n--- text\n"])
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
    strictEqual(replaceTabsWithSpaces(actual, 2), expected)
  })
  test("should throw error when count is smaller than `1`", () => {
    throws(() => replaceTabsWithSpaces(actual, 0))
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
    strictEqual(addNewLineBeforeRootKeywords(actual), expected)
  })
})

suite("Test addNewLineBeforeKeywordsUpToLevelN", () => {
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
    strictEqual(addNewLineBeforeKeywordsUpToLevelN(1, 2, actual), expected)

    expected = `data:

  key:
    key: value

spec: value
`
    strictEqual(addNewLineBeforeKeywordsUpToLevelN(2, 2, actual), expected)
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

    strictEqual(addNewLineBeforeKeywordsUpToLevelN(2, 2, actual), expected)
  })

  test("should recognize keywords containing spaces", () => {
    const actual = 
      'data:\n' +
      '  key:\n' +
      '    key: value\n' +
      'foo bar: value'

    const expected = 
    'data:\n' +
    '\n' +
    '  key:\n' +
    '    key: value\n' +
    '\n' +
    'foo bar: value'

    strictEqual(addNewLineBeforeKeywordsUpToLevelN(2, 2, actual), expected)
  })
})
