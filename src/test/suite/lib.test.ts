import { equal, throws} from "assert"

import {
  addNewLineBeforeRootKeywords,
  prependWhitespacesOnEachLine
} from "../../lib"
import { removeTrailingCharacters } from "../../util/yaml-util"

suite("Test removeTrailingCharacters", () => {
  const actual = "text"
  test("should return `t` when `t` and 0 are passed", () => {
    equal(removeTrailingCharacters("t", 0), "t")
  })
  test("should return `t` when `text` and 3 are passed", () => {
    equal(removeTrailingCharacters(actual, actual.length - 1 ), "t")
  })
  test("should return `tex` when `text` and 1 are passed", () => {
    equal(removeTrailingCharacters(actual, 1), "tex")
  })
  test("should return `` when `text` and 4 are passed", () => {
    equal(removeTrailingCharacters(actual, actual.length), "")
  })
  test("should throw an error when a negative input is passed", () => {
    throws(() => removeTrailingCharacters(actual, -1))
  })
  test("should throw an error when the count parameter is bigger than the text lenght", () => {
    throws(() => removeTrailingCharacters(actual, actual.length + 1))
  })
  const actual2 = "text\n"
  test("should return `text` when `text\\n` and 1 are passed", () => {
    equal(removeTrailingCharacters(actual2, 1), "text")
  })
  test("should return `text\\n` when `text\\n` and 0 are passed", () => {
    equal(removeTrailingCharacters(actual2, 0), actual2)
  })
})

suite("Test prependWhitespacesOnEachLine", () => {
  const actual = "text"
  test("should return `  text` when `text` and 2 are passed", () => {
    equal(prependWhitespacesOnEachLine(actual, 2), "  text")
  })
  test("should return `text` when `text` and 0 are passed", () => {
    equal(prependWhitespacesOnEachLine(actual, 0), "text")
  })
  test("should throw an error when a negative input is passed", () => {
    throws(() => prependWhitespacesOnEachLine(actual, -1))
  })
  const actual2 = "text\n"
  test("should return `  text\\n  ` when `text\\n` and 2 are passed", () => {
    equal(prependWhitespacesOnEachLine(actual2, 2), "  text\n  ")
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
    equal(addNewLineBeforeRootKeywords(actual), expected)
  })
})
