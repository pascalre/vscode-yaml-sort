//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert"
import {
  prependWhitespacesOnEachLine,
  removeQuotesFromKeys,
  removeTrailingCharacters,
  splitYaml,
} from "../lib"

// Defines a Mocha test suite to group tests of similar kind together
suite("Test removeQuotesFromKeys", () => {
  test("Test 1: Remove quotes from single keyword", () => {
    assert.equal(removeQuotesFromKeys("'key': 1"), "key: 1")
  })
  test("Test 2: Remove quotes from multiple keywords", () => {
    assert.equal(removeQuotesFromKeys("'key': 1\n'key2': 2"), "key: 1\nkey2: 2")
  })
  test("Test 3: Remove quotes from special keywords (with dot)", () => {
    assert.equal(removeQuotesFromKeys("'1.2.3': 1\n'key2': 2"), "1.2.3: 1\nkey2: 2")
  })
  test("Test 4: Remove quotes from special keywords (with colon)", () => {
    assert.equal(removeQuotesFromKeys("'1:2:3': 1\n'key2': 2"), "1:2:3: 1\nkey2: 2")
  })
})

suite("Test removeTrailingCharacters", () => {
  const text = "text"
  test("Test 1: Remove a single trailing character", () => {
    assert.equal(removeTrailingCharacters(text, 1), "tex")
  })
  test("Test 2: Remove all characters", () => {
    assert.equal(removeTrailingCharacters(text, text.length), "")
  })
  test("Test 3 Error on negative input value", () => {
    assert.throws(() => removeTrailingCharacters(text, -1))
  })
  test("Test 4: Error on input value bigger than text length", () => {
    assert.throws(() => removeTrailingCharacters(text, text.length + 1))
  })
  const text2 = "text\n"
  test("Test 5: Remove trailing line break", () => {
    assert.equal(removeTrailingCharacters(text2, 1), "text")
  })
  test("Test 6: Remove no characters", () => {
    assert.equal(removeTrailingCharacters(text2, 0), text2)
  })
})

suite("Test prependWhitespacesOnEachLine", () => {
  const text = "text"
  test("Test 1: Prepend two whitespaces to a line", () => {
    assert.equal(prependWhitespacesOnEachLine(text, 2), "  text")
  })
  test("Test 2: Prepend no whitespaces to a line", () => {
    assert.equal(prependWhitespacesOnEachLine(text, 0), "text")
  })
  test("Test 3: Error on negative input value", () => {
    assert.throws(() => prependWhitespacesOnEachLine(text, -1))
  })
  const text2 = "text\n"
  test("Test 4: Prepend whitespaces to multiple lines", () => {
    assert.equal(prependWhitespacesOnEachLine(text2, 2), "  text\n  ")
  })
})

suite("Test splitYaml", () => {
  const singleYaml = `\
- Orange
- Apple`
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

  test("Test 1: Split a single yaml", () => {
    assert.equal(splitYaml(singleYaml), ["- Orange\n- Apple"])
  })
  test("Test 2: Split a single yaml with leading dashes", () => {
    assert.equal(splitYaml(singleYamlWithLeadingDashes), ["- Orange\n- Apple\n"])
  })
  test("Test 3: Split multiple yaml documents", () => {
    assert.equal(splitYaml(multipleYaml), ["- Orange\n- Apple\n", "- Orange\n- Apple\n"])
  })
  test("Test 4: Split multiple yaml documents with leading dashes", () => {
    assert.equal(splitYaml(multipleYamlWithLeadingDashes),
      ["- Orange\n- Apple\n", "- Orange\n- Apple\n"])
  })
  test("Test 5: Split multiple yaml documents with text behind delimiter", () => {
   assert.equal(splitYaml(multipleYamlWithComments),
    ["- Orange\n- Apple\n", "- Orange\n- Apple\n"])
  })
})

suite("Test removeLeadingLineBreakOfFirstElement", () => {
  // To be implemented
})
