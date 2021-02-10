//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert"
// import { workspace } from "vscode"
import {
  getCustomSortKeywords,
  sortYaml,
  validateYaml} from "../../extension"

suite("Test getCustomSortKeywords", () => {
  test("should return values of `vscode-yaml-sort.customSortKeywords_1`", () => {
    assert.deepEqual(getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
  })

  test("should fail when parameter is not in [1, 2, 3]", () => {
    assert.throws(() => getCustomSortKeywords(0), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(4), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(-1), new Error("The count parameter is not in a valid range"))
    assert.throws(() => getCustomSortKeywords(1.5), new Error("The count parameter is not in a valid range"))
  })
})

suite("Test validateYaml", () => {
  test("should return `true` when passing a valid yaml", () => {
    const actual = `\
persons:
  bob:
    place: Germany
    age: 23
animals:
  kitty:
    age: 3`
    assert.equal(validateYaml(actual), true)
  })

  test("should return `true` when passing two seperated valid yaml", () => {
    const actual = `\
persons:
  bob:
    place: Germany
    age: 23
---
animals:
  kitty:
    age: 3`
    assert.equal(validateYaml(actual), true)
  })

  test("should return `false` when passing an invalid yaml", () => {
    assert.equal(validateYaml("network: ethernets:"), false)
  })
  test("should return `false` when yaml indentation is not correct", () => {
    assert.equal(validateYaml("person:\nbob\n  age:23"), false)
  })
  test("should return `false` when yaml contains duplicate keys", () => {
    assert.equal(validateYaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n"), false)
  })
})

suite("Test sortYaml", () => {
  test("should sort a given yaml document", async () => {

    /* currently not supported with travis ci
    const settings = workspace.getConfiguration("vscode-yaml-sort")
    await settings.update("addNewLineAfterTopLevelKey", false, false)
    */

    const actual = `\
persons:
  bob:
    place: Germany
    age: 23
animals:
  kitty:
    age: 3
`
    const expected = `\
animals:
  kitty:
    age: 3
persons:
  bob:
    age: 23
    place: Germany`
    assert.equal(sortYaml(actual), expected)
  })

  test("should put top level keyword `spec` before `data` when passing customsort=1", async () => {
    /* currently not supported with travis ci
      const settings = workspace.getConfiguration("vscode-yaml-sort")
      await settings.update("addNewLineAfterTopLevelKey", false, false)
    */
    let actual = `
data: data
spec: spec
`
    let expected = `\
spec: spec
data: data
`
    assert.equal(sortYaml(actual, 1), expected)

    actual = `
data: data
spec:
  - aa: b
`
    expected = `\
spec:
  - aa: b
data: data
`
    assert.equal(sortYaml(actual, 1), expected)

    actual = `
data:
  job: Developer
  skills:
    - pascal
spec:
  job: Boss
  name: Stuart
`
    expected = `\
spec:
  job: Boss
  name: Stuart
data:
  job: Developer
  skills:
    - pascal
`
    assert.equal(sortYaml(actual, 1), expected)

    actual = `
data: data
spec:
  - a
  - b
`
    expected = `\
spec:
  - a
  - b
data: data
`
    assert.equal(sortYaml(actual, 1), expected)
  })

  test("should wrap words after 500 characters (`vscode-yaml-sort.lineWidth`)", () => {
    const actual = `\
- lorem ipsum:
    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut \
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea \
rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor \
sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna \
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e'
`

    const expected = `\
- lorem ipsum:
    text: >-
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut \
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et \
ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor \
sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna \
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
      dolores et e`
    assert.equal(sortYaml(actual), expected)
  })

  /* currently not supported with travis ci
  test("should add an empty line before `data`", async () => {
    const actual = `
data: data
spec:
  - a
  - b
`
    const expected = `\
spec:
  - a
  - b

data: data
`
    const settings = workspace.getConfiguration("vscode-yaml-sort")
    await settings.update("addNewLineAfterTopLevelKey", true, false)
    assert.equal(sortYaml(actual, 1), expected)
  })
  */

})