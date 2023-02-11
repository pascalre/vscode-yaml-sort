import { deepEqual, equal } from "assert"
import { SpacingProcessor } from "../../../processor/spacing-processor"

suite("Test SpacingProcessor - getMatcher()", () => {
  test("should return regex with correct number of spaces", () => {
    const spacingprocessor = new SpacingProcessor("")
    const actual = /\n {4}[\w-]*:/g
    const expected = spacingprocessor.getMatcher(2)
    deepEqual(actual, expected)
  })
})

suite("Test SpacingProcessor - addNewLineBeforeKeywords()", () => {
  test("should add an empty line before `spec`", () => {
    const text =
      'spec: value\n' +
      'data:\n' +
      '  - a\n' +
      '  - b'
    const spacingprocessor = new SpacingProcessor(text)
    spacingprocessor.settings.emptyLinesUntilLevel = 2

    const expected =
      'spec: value\n' +
      '\n' +
      'data:\n' +
      '  - a\n' +
      '  - b'

    equal(spacingprocessor.addNewLineBeforeKeywords(), expected)
  })
  test("should add an empty line before each top level keyword, but only if they appear after a new line", () => {
    const text = 
      'data:\n' +
      '  key:\n' +
      '    key: value\n' +
      'spec: value'
    const spacingprocessor = new SpacingProcessor(text)
    spacingprocessor.settings.emptyLinesUntilLevel = 1
    spacingprocessor.settings.indent = 2
    let expected = 
      'data:\n' +
      '  key:\n' +
      '    key: value\n' +
      '\n' +
      'spec: value'

    equal(spacingprocessor.addNewLineBeforeKeywords(), expected)

    spacingprocessor.settings.emptyLinesUntilLevel = 2

    expected = 
      'data:\n' +
      '\n' +
      '  key:\n' +
      '    key: value\n' +
      '\n' +
      'spec: value'

    equal(spacingprocessor.addNewLineBeforeKeywords(), expected)
  })

  test("should recognize keywords containing the char -", () => {
    const text = 
      'data:\n' +
      '  key:\n' +
      '    key: value\n' +
      '  sp-ec: value'
    const spacingprocessor = new SpacingProcessor(text)
    spacingprocessor.settings.emptyLinesUntilLevel = 2
    spacingprocessor.settings.indent = 2
    const expected = 
      'data:\n' +
      '\n' +
      '  key:\n' +
      '    key: value\n' +
      '\n' +
      '  sp-ec: value'

    equal(spacingprocessor.addNewLineBeforeKeywords(), expected)
  })

  test("should recognize keywords containing spaces", () => {
    const text = 
      'data:\n' +
      '  key:\n' +
      '    key: value\n' +
      'foo bar: value'
    const spacingprocessor = new SpacingProcessor(text)
    spacingprocessor.settings.emptyLinesUntilLevel = 2
    spacingprocessor.settings.indent = 2

    const expected = 
      'data:\n' +
      '\n' +
      '  key:\n' +
      '    key: value\n' +
      '\n' +
      'foo bar: value'

    equal(spacingprocessor.addNewLineBeforeKeywords(), expected)
  })
})