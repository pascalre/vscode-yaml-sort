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
  sortYaml,
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

  test("Test 7: getCustomSortKeywords", () => {
    assert.deepEqual(getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
    assert.throws(() => getCustomSortKeywords(0), new Error("The count parameter is not in a valid range"))
  })

  test("Test 8: isSelectionInvalid", () => {
    assert.equal(isSelectionInvalid("text"), false)
    assert.equal(isSelectionInvalid("text:"), true)
    assert.equal(isSelectionInvalid("text: "), true)
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
