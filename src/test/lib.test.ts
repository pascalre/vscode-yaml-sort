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
} from "../lib"

// Defines a Mocha test suite to group tests of similar kind together
suite("Test removeQuotesFromKeys", () => {
  test("should return `key: 1` when `'key': 1` is passed to removeQuotesFromKeys()", () => {
    assert.equal(removeQuotesFromKeys("'key': 1"), "key: 1")
  })
  test("should remove the quotes from multiple keywords", () => {
    assert.equal(removeQuotesFromKeys("'key': 1\n'key2': 2"), "key: 1\nkey2: 2")
  })
  test("should remove the quotes from special keywords containing dots", () => {
    assert.equal(removeQuotesFromKeys("'1.2.3': 1\n'key2': 2"), "1.2.3: 1\nkey2: 2")
  })
  test("should remove the quotes from special keywords containing colons", () => {
    assert.equal(removeQuotesFromKeys("'1:2:3': 1\n'key2': 2"), "1:2:3: 1\nkey2: 2")
  })
})

suite("Test removeTrailingCharacters", () => {
  const text = "text"
  test("should return `tex` when `text` and 1 are passed", () => {
    assert.equal(removeTrailingCharacters(text, 1), "tex")
  })
  test("should return `` when `text` and 4 are passed", () => {
    assert.equal(removeTrailingCharacters(text, text.length), "")
  })
  test("should throw an error when a negative input is passed", () => {
    assert.throws(() => removeTrailingCharacters(text, -1))
  })
  test("should throw an error when the count parameter is bigger than the text lenght", () => {
    assert.throws(() => removeTrailingCharacters(text, text.length + 1))
  })
  const text2 = "text\n"
  test("should return `text` when `text\\n` and 1 are passed", () => {
    assert.equal(removeTrailingCharacters(text2, 1), "text")
  })
  test("should return `text\\n` when `text\\n` and 0 are passed", () => {
    assert.equal(removeTrailingCharacters(text2, 0), text2)
  })
})

suite("Test prependWhitespacesOnEachLine", () => {
  const text = "text"
  test("should return `  text` when `text` and 2 are passed", () => {
    assert.equal(prependWhitespacesOnEachLine(text, 2), "  text")
  })
  test("should return `text` when `text` and 0 are passed", () => {
    assert.equal(prependWhitespacesOnEachLine(text, 0), "text")
  })
  test("should throw an error when a negative input is passed", () => {
    assert.throws(() => prependWhitespacesOnEachLine(text, -1))
  })
  const text2 = "text\n"
  test("should return `  text\\n  ` when `text\\n` and 2 are passed", () => {
    assert.equal(prependWhitespacesOnEachLine(text2, 2), "  text\n  ")
  })
})

suite("Test splitYaml", () => {
  const singleYamlWithLeadingDashes = `\
---
- Orange
- Apple`
  const multipleYaml = `\
- Orange
- Apple
---
- Orange
- Apple`
  const multipleYamlWithLeadingDashes = `\
---
- Orange
- Apple
---
- Orange
- Apple`
  const multipleYamlWithComments = `\
--- # comment 1
- Orange
- Apple
--- text
- Orange
- Apple`
  test("should return the input string, when the input does not contain `---`", () => {
    const singleYaml = `\
- Orange
- Apple`
    assert.deepEqual(splitYaml(singleYaml), ["- Orange\n- Apple"])
  })
  test("should return the input document without the delimiters", () => {
    assert.deepEqual(splitYaml(singleYamlWithLeadingDashes), ["\n- Orange\n- Apple"])
  })
  test("should return an array with the yaml documents", () => {
    assert.deepEqual(splitYaml(multipleYaml), ["- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
  test("Split multiple yaml documents with leading dashes", () => {
    assert.deepEqual(splitYaml(multipleYamlWithLeadingDashes),
      ["\n- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
  test("Split multiple yaml documents with text behind delimiter", () => {
   assert.deepEqual(splitYaml(multipleYamlWithComments),
    ["\n- Orange\n- Apple\n", "\n- Orange\n- Apple"])
  })
})

suite("Test removeLeadingLineBreakOfFirstElement", () => {
  test("should remove only the first line break of an string array", () => {
    const delimiters = ["\ntext", "\ntext"]
    assert.deepEqual(removeLeadingLineBreakOfFirstElement(delimiters), ["text", "\ntext"])
  })
})

suite("Test getDelimiters", () => {
  let yaml = `
yaml: data
spec: spec
`
  test("should return `` when the input string does not contain a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    assert.equal(getDelimiters(yaml, true, false), "")
  })
  test("should return all delimiters except the first (return an empty string instead) when the input document starts with a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    yaml = `
--- text
yaml: data
---  #comment
spec: spec
`
    const delimiters = getDelimiters(yaml, true, false)
    assert.deepEqual(delimiters, ["", "\n---  #comment\n"])
  })
  test("Get each delimiter (empty selection, leading linebreak)", () => {
    yaml = `

--- text
yaml: data
---  #comment
spec: spec---

`
    const delimiters = getDelimiters(yaml, true, false)
    assert.deepEqual(delimiters, ["", "\n---  #comment\n"])
  })
  test("Get each delimiter (empty selection, leading text)", () => {
    yaml = `
bla
--- text
test: bla
`
    const delimiters = getDelimiters(yaml, true, false)
    assert.deepEqual(delimiters, ["", "\n--- text\n"])
  })
  test("Get each delimiter (with selection, leading delimiter)", () => {
    yaml = `
--- text
test: bla
`
    const delimiters = getDelimiters(yaml, false, false)
    assert.deepEqual(delimiters, ["--- text\n"])
  })
  test("Get each delimiter (with selection, leading text)", () => {
    yaml = `
bla
--- text
test: bla
`
    const delimiters = getDelimiters(yaml, false, false)
    assert.deepEqual(delimiters, ["", "\n--- text\n"])
  })

})

suite("Test isSelectionInvalid", () => {
  test("should return `true` when `text` is passed", () => {
    assert.equal(isSelectionInvalid("text"), false)
  })
  test("should return `false` when a string with trailing colon is passed", () => {
    assert.equal(isSelectionInvalid("text:"), true)
  })
  test("should return `false` when a string with trailing colon and whitespaces is passed", () => {
    assert.equal(isSelectionInvalid("text: "), true)
  })
})

suite("Test replaceTabsWithSpaces", () => {
    const text = `
a-1:
\tb:
\t\td: g
\tc:
\t\td: g`
    const textWithSpaces = `
a-1:
  b:
    d: g
  c:
    d: g`
  test("should replace all tabs with spaces", () => {
    assert.equal(replaceTabsWithSpaces(text, 2), textWithSpaces)
  })
})