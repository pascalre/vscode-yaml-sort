import { deepStrictEqual, equal } from "assert"
import { CommentUtil } from "../../../util/comment-util"

suite("Test CommentUtil - findComments()", () => {
  test("should add all comments to array 'comments'", () => {
    const text =
      '#foo\n' +
      '#bar\n' +
      'lorem ipsum\n' +
      '#foo\n' +
      'dolor sit\n' +
      '  # foo\n' +
      'amet, consetetur\n' +
      '# baz'
    const commentutil = new CommentUtil(text)

    commentutil.findComments()

    equal(commentutil.comments.length, 5)
    deepStrictEqual(commentutil.comments[0], ["#foo", "#bar"])
    deepStrictEqual(commentutil.comments[1], ["#bar", "lorem ipsum"])
    deepStrictEqual(commentutil.comments[2], ["#foo", "dolor sit"])
    deepStrictEqual(commentutil.comments[3], ["  # foo", "amet, consetetur"])
    deepStrictEqual(commentutil.comments[4], ["# baz", "vscode-yaml-sort.lastLine"])
  })
})

suite("Test CommentUtil - isLineComment()", () => {
  test("when input is '# comment' should return true", () => {
    equal(CommentUtil.isLineComment("# comment"), true)
  })
  test("when input is '  # comment' should return true", () => {
    equal(CommentUtil.isLineComment("  # comment"), true)
  })
  test("when input is 'text # comment' should return false", () => {
    equal(CommentUtil.isLineComment("text # comment"), false)
  })
  test("when input is 'text' should return false", () => {
    equal(CommentUtil.isLineComment("text"), false)
  })
  test("when input is an empty string should return false", () => {
    equal(CommentUtil.isLineComment(""), false)
  })
})

suite("Test CommentUtil - addLineToComments()", () => {
  test("should add comments to array 'comments'", () => {
    const text =
      '#foo\n' +
      '#bar\n' +
      'lorem ipsum\n' +
      'dolor sit\n' +
      '#foo'
    const commentutil = new CommentUtil(text)

    equal(commentutil.lines.length, 5)

    commentutil.addLineToComments(0)
    const expected: string[][] = []
    expected.push(["#foo", "#bar"])
    deepStrictEqual(commentutil.comments, expected)

    commentutil.addLineToComments(1)
    expected.push(["#bar", "lorem ipsum"])
    deepStrictEqual(commentutil.comments, expected)

    commentutil.addLineToComments(4)
    expected.push(["#foo", "vscode-yaml-sort.lastLine"])
    deepStrictEqual(commentutil.comments, expected)
  })
})

suite("Test CommentUtil - applyComments()", () => {
  test("should apply all comments to a text", () => {
    const text =
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur"
    const commentutil = new CommentUtil(text)

    commentutil.comments.push(["#foo", "#bar"])
    commentutil.comments.push(["#bar", "lorem ipsum"])
    commentutil.comments.push(["#foo", "vscode-yaml-sort.lastLine"])

    const expected =
      "#foo\n" +
      "#bar\n" +
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur\n" +
      "#foo"

    equal(commentutil.applyComments(text), expected)
  })
})

suite("Test CommentUtil - reverseComments()", () => {
  test("should reverse entrys in comments", () => {
    const commentutil = new CommentUtil("")
    commentutil.comments.push(["key1", "value1"])
    commentutil.comments.push(["key2", "value2"])
    commentutil.comments.push(["key3", "value3"])
    const expected: string[][] = []
    expected.push(["key3", "value3"])
    expected.push(["key2", "value2"])
    expected.push(["key1", "value1"])

    commentutil.reverseComments()

    deepStrictEqual(commentutil.comments, expected)
  })
})

suite("Test CommentUtil - applyComment()", () => {
  test("should apply a comment at correct position", () => {
    const text =
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur"
    const commentutil = new CommentUtil(text)

    commentutil.applyComment(["#foo", "dolor sit"])

    const expected =
      "lorem ipsum\n" +
      "#foo\n" +
      "dolor sit\n" +
      "amet, consetetur"

    equal(commentutil.text, expected)
  })
})

suite("Test CommentUtil - append()", () => {
  test("should append newline and text to a given text", () => {
    const text = "lorem ipsum"
    const commentutil = new CommentUtil(text)

    commentutil.append("# comment")

    const expected =
      "lorem ipsum\n" +
      "# comment"

    equal(commentutil.text, expected)
  })
})

// TODO: add suit for insertCommentBetween

suite("Test CommentUtil - getIndexOfString()", () => {
  test("should return index of line", () => {
    const line = 'dolor sit'
    const text =
      'lorem ipsum\n' +
      `${line}\n` +
      'amet, consetetur'
    const commentutil = new CommentUtil(text)

    equal(commentutil.getIndexOfString(line), 12)
  })
})

// TODO: Add suite for search, searchExactMatch, searchFuzzyForTrimmedText, searchFuzzyForKeyword

suite("Test CommentUtil - isCommentFound()", () => {
  test("when index is -1 should return true", () => {
    equal(CommentUtil.isCommentFound(-1), false)
    equal(CommentUtil.isCommentFound(0), true)
  })
})

suite("Test CommentUtil - Issue 45", () => {
  // https://github.com/pascalre/vscode-yaml-sort/issues/45#issuecomment-1329161613
  test("should fuzzy find comments", () => {
    const text =
      '#begin comment\n' +
      'params:\n' +
      '  logon: test\n' +
      '  #variable meta data\n' +
      '  variableMetadata: env\\config_dev.yaml\n' +
      '  logFile: log-test.log\n' +
      '  logLevel: DEBUG\n' +
      '  chunkSize: 1000\n' +
      '  jobSize: 20\n' +
      '  schema: test\n' +
      '  #end comment'
    const commentutil = new CommentUtil(text)

    commentutil.findComments()
    const textWithoutComments =
      "params:\n" +
      "  chunkSize: 1000\n" +
      "  jobSize: 20\n" +
      "  logFile: 'log-test.log'\n" +
      "  logLevel: 'DEBUG'\n" +
      "  logon: 'test'\n" +
      "  schema: 'test'\n" +
      "  variableMetadata: 'env\\config_dev.yaml'"
    commentutil.applyComments(textWithoutComments)

    const expected =
      "#begin comment\n" +
      "params:\n" +
      "  chunkSize: 1000\n" +
      "  jobSize: 20\n" +
      "  logFile: 'log-test.log'\n" +
      "  logLevel: 'DEBUG'\n" +
      "  logon: 'test'\n" +
      "  schema: 'test'\n" +
      "  #variable meta data\n" +
      "  variableMetadata: 'env\\config_dev.yaml'\n" +
      "  #end comment"

    equal(commentutil.text, expected)
  })


  test("should work with trailing newline", () => {
    const text =
      'schema: test\n' +
      '#end comment\n'
    const commentutil = new CommentUtil(text)

    commentutil.findComments()
    const textWithoutComments = 'schema: test'
    commentutil.applyComments(textWithoutComments)

    const expected =
      'schema: test\n' +
      '#end comment'

    equal(commentutil.text, expected)
  })
})