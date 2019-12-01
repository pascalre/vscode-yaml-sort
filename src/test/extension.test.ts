//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert"
import {
  getCustomSortKeywords,
  getDelimiters,
  isSelectionInvalid,
  prependWhitespacesOnEachLine,
  removeQuotesFromKeys,
  removeTrailingCharacters,
  sortYaml,
  splitYaml,
  validateYaml} from "../extension"

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

  const unsortedYaml = `\
persons:
  bob:
    place: Germany
    age: 23
animals:
  kitty:
    age: 3
`
  const sortedYaml = `\
animals:
  kitty:
    age: 3
persons:
  bob:
    age: 23
    place: Germany`
  test("Test 1: YAML should be sorted.", () => {
      assert.equal(sortYaml(unsortedYaml), sortedYaml)
  })

  test("Test 2: validateYaml.", () => {
    assert.equal(validateYaml(unsortedYaml), true)
    assert.equal(validateYaml("network: ethernets:"), false)
    // Validation checks indentation
    assert.equal(validateYaml("person:\nbob\n  age:23"), false)
    // Test 4: Validation checks duplicate keys
    assert.equal(validateYaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n"), false)
  })

  test("Test 5: Maximum line width of 500.", () => {
    const yamlWithoutLineBreakAfter500Chars = `\
- lorem ipsum:
    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut \
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea \
rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor \
sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna \
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e'
`

    const yamlWithLineBreakAfter500Chars = `\
- lorem ipsum:
    text: >-
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut \
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et \
ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor \
sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna \
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
      dolores et e`
    assert.equal(sortYaml(yamlWithoutLineBreakAfter500Chars), yamlWithLineBreakAfter500Chars)
  })

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

  test("Test 3.1: Split Yaml: single yaml", () => {
    assert.equal(splitYaml(singleYaml).toString, ["- Orange\n- Apple\n"].toString)
  })
  test("Test 3.2: Split Yaml: single yaml with leading dashes", () => {
    assert.equal(splitYaml(singleYamlWithLeadingDashes).toString, ["- Orange\n- Apple\n"].toString)
  })

  test("Test 3.3: Split Yaml: multiple yaml", () => {
    assert.equal(splitYaml(multipleYaml).toString, ["- Orange\n- Apple\n", "- Orange\n- Apple\n"].toString)
  })

  test("Test 3.4: Split Yaml: multiple yaml with leading dashes", () => {
    assert.equal(splitYaml(multipleYamlWithLeadingDashes).toString,
      ["- Orange\n- Apple\n", "- Orange\n- Apple\n"].toString)
  })

  test("Test 3.5: Split Yaml: multiple yaml with text behind delimiter", () => {
    assert.equal(splitYaml(multipleYamlWithComments).toString, ["- Orange\n- Apple\n", "- Orange\n- Apple\n"].toString)
  })

  test("Test 4: Custom sort.", () => {
    const yaml = `
data: data
spec: spec
`

    const customSortedYaml = `\
spec: spec
data: data
`
    assert.equal(sortYaml(yaml, 1), customSortedYaml)
  })

  test("Test 5: removeTrailingCharacters", () => {
    const text = "text"
    const text2 = "text\n"
    assert.equal(removeTrailingCharacters(text, 1), "tex")
    assert.equal(removeTrailingCharacters(text2, 1), "text")
    assert.equal(removeTrailingCharacters(text2, 0), text2)
    assert.equal(removeTrailingCharacters(text, text.length), "")
    assert.throws(() => removeTrailingCharacters(text, -1), new Error("The count parameter is not in a valid range"))
    assert.throws(() => removeTrailingCharacters(text, text.length + 1),
      new Error("The count parameter is not in a valid range"))
  })

  test("Test 6: prependWhitespacesOnEachLine", () => {
    let text = "text"
    assert.equal(prependWhitespacesOnEachLine(text, 2), "  text")
    assert.equal(prependWhitespacesOnEachLine(text, 0), "text")

    text = "text\n"
    assert.equal(prependWhitespacesOnEachLine(text, 2), "  text\n  ")
    assert.throws(() => prependWhitespacesOnEachLine(text, -1),
      new Error("The count parameter is not a positive number"))
  })

  test("Test 7: getCustomSortKeywords", () => {
    assert.deepEqual(getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
    assert.throws(() => getCustomSortKeywords(0), new Error("The count parameter is not in a valid range"))
  })

  test("Test 8: isSelectionInvalid", () => {
    assert.equal(isSelectionInvalid("text"), false)
    assert.equal(isSelectionInvalid("text:"), true)
    assert.equal(isSelectionInvalid("text: "), true)
  })

  test("Test 9: removeQuotesFromKeys", () => {
    assert.equal(removeQuotesFromKeys("'key': 1"), "key: 1")
    assert.equal(removeQuotesFromKeys("'key': 1\n'key2': 2"), "key: 1\nkey2: 2")
  })

  test("Test 10: getDelimiters", () => {
    let yaml = `
yaml: data
spec: spec
`
    assert.equal(getDelimiters(yaml, false), "")

    yaml = `
--- text
yaml: data
---  #comment
spec: spec
`

    let delimiters = getDelimiters(yaml, false)
    assert.equal(delimiters.length, 2)
    assert.equal(delimiters.shift(), "--- text\n")
    assert.equal(delimiters.pop(), "\n---  #comment\n")

    yaml = `

--- text
yaml: data
---  #comment
spec: spec---

`
    delimiters = getDelimiters(yaml, false)
    assert.equal(delimiters.length, 3)
    assert.equal(delimiters.shift(), "")
    assert.equal(delimiters.shift(), "--- text\n")
    assert.equal(delimiters.pop(), "\n---  #comment\n")

    yaml = `
bla
--- text
test: bla
`
    delimiters = getDelimiters(yaml, false)
    assert.equal(delimiters.shift(), "")
    assert.equal(delimiters.shift(), "--- text\n")
  })

})
