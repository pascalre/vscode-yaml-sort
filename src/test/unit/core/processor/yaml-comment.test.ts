import { equal } from "assert"

import { getInlineComment, isLineComment } from "../../../../core/processor/yaml-comment"

suite("Test isLineComment()", () => {
  test("when input is '# comment' should return true", () => {
    equal(isLineComment("# comment"), true)
  })
  test("when input is '  # comment' should return true", () => {
    equal(isLineComment("  # comment"), true)
  })
  test("when input is 'text # comment' should return false", () => {
    equal(isLineComment("text # comment"), false)
  })
  test("when input is 'text' should return false", () => {
    equal(isLineComment("text"), false)
  })
  test("when input is an empty string should return false", () => {
    equal(isLineComment(""), false)
  })
})


suite("Test getInlineComment()", () => {
  const detectionCases: { line: string, expectedComment: string | undefined }[] = [
    { line: "key: value # comment", expectedComment: "# comment" },
    { line: "key: \"value # quoted\"", expectedComment: undefined },
    { line: "key: 'value # quoted'", expectedComment: undefined },
    { line: "key: value#noComment", expectedComment: undefined },
    { line: "key: \"a\" # comment", expectedComment: "# comment" },
    { line: "# full line comment", expectedComment: undefined },
    // an apostrophe inside a plain value does not start a quoted value
    { line: "key: it's fine # comment", expectedComment: "# comment" },
    { line: "key: don't # comment 'quoted'", expectedComment: "# comment 'quoted'" },
    // escaped quotes do not end a quoted value
    { line: "key: \"a \\\" # b\" # comment", expectedComment: "# comment" },
    { line: "key: 'a '' # b' # comment", expectedComment: "# comment" },
    { line: "- 'a # b' # comment", expectedComment: "# comment" },
    { line: "key: [\"a # b\", 'c # d'] # comment", expectedComment: "# comment" }
  ]

  detectionCases.forEach(({ line, expectedComment }) => {
    test(`should only detect comments outside of quotes: ${line}`, () => {
      equal(getInlineComment(line), expectedComment)
    })
  })
})
