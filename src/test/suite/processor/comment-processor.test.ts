import { deepEqual, equal } from "assert"

import { CommentProcessor } from "../../../processor/comment-processor"

suite("Test CommentProcessor - findComments()", () => {
  test("should add all comments to array 'comments'", () => {
    const text =
      "#foo\n" +
      "#bar\n" +
      "lorem ipsum\n" +
      "#foo\n" +
      "dolor sit\n" +
      "  # foo\n" +
      "amet, consetetur\n" +
      "# baz"
    const commentprocessor = new CommentProcessor(text)

    commentprocessor.findComments()

    equal(commentprocessor.store.length, 5)
    deepEqual(commentprocessor.store[0], ["#foo", "#bar"])
    deepEqual(commentprocessor.store[1], ["#bar", "lorem ipsum"])
    deepEqual(commentprocessor.store[2], ["#foo", "dolor sit"])
    deepEqual(commentprocessor.store[3], ["  # foo", "amet, consetetur"])
    deepEqual(commentprocessor.store[4], ["# baz", "vscode-yaml-sort.lastLine"])
  })
})

suite("Test CommentProcessor - isLineComment()", () => {
  test("when input is '# comment' should return true", () => {
    equal(CommentProcessor.isLineComment("# comment"), true)
  })
  test("when input is '  # comment' should return true", () => {
    equal(CommentProcessor.isLineComment("  # comment"), true)
  })
  test("when input is 'text # comment' should return false", () => {
    equal(CommentProcessor.isLineComment("text # comment"), false)
  })
  test("when input is 'text' should return false", () => {
    equal(CommentProcessor.isLineComment("text"), false)
  })
  test("when input is an empty string should return false", () => {
    equal(CommentProcessor.isLineComment(""), false)
  })
})

suite("Test CommentProcessor - addLineToComments()", () => {
  test("should add comments to array 'comments'", () => {
    const text =
      "#foo\n" +
      "#bar\n" +
      "lorem ipsum\n" +
      "dolor sit\n" +
      "#foo"
    const commentprocessor = new CommentProcessor(text)

    equal(commentprocessor.lines.length, 5)

    commentprocessor.addLineToComments(0)
    const expected: string[][] = []
    expected.push(["#foo", "#bar"])
    deepEqual(commentprocessor.store, expected)

    commentprocessor.addLineToComments(1)
    expected.push(["#bar", "lorem ipsum"])
    deepEqual(commentprocessor.store, expected)

    commentprocessor.addLineToComments(4)
    expected.push(["#foo", "vscode-yaml-sort.lastLine"])
    deepEqual(commentprocessor.store, expected)
  })
})

suite("Test CommentProcessor - applyComments()", () => {
  test("should apply all comments to a text", () => {
    const text =
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur"
    const commentprocessor = new CommentProcessor(text)

    commentprocessor.store.push(["#foo", "#bar"])
    commentprocessor.store.push(["#bar", "lorem ipsum"])
    commentprocessor.store.push(["#foo", "vscode-yaml-sort.lastLine"])
    commentprocessor.text = text

    const expected =
      "#foo\n" +
      "#bar\n" +
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur\n" +
      "#foo"

    equal(commentprocessor.postprocess(), expected)
  })
})

suite("Test CommentProcessor - reverseComments()", () => {
  test("should reverse entrys in comments", () => {
    const commentprocessor = new CommentProcessor("")
    commentprocessor.store.push(["key1", "value1"])
    commentprocessor.store.push(["key2", "value2"])
    commentprocessor.store.push(["key3", "value3"])
    const expected: string[][] = []
    expected.push(["key3", "value3"])
    expected.push(["key2", "value2"])
    expected.push(["key1", "value1"])

    commentprocessor.reverseComments()

    deepEqual(commentprocessor.store, expected)
  })
})

suite("Test CommentProcessor - applyComment()", () => {
  test("should apply a comment at correct position", () => {
    const text =
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur"
    const commentprocessor = new CommentProcessor(text)

    commentprocessor.applyComment(["#foo", "dolor sit"])

    const expected =
      "lorem ipsum\n" +
      "#foo\n" +
      "dolor sit\n" +
      "amet, consetetur"

    equal(commentprocessor.text, expected)
  })
})

suite("Test CommentProcessor - append()", () => {
  test("should append newline and text to a given text", () => {
    const text = "lorem ipsum"
    const commentprocessor = new CommentProcessor(text)

    commentprocessor.append("# comment")

    const expected =
      "lorem ipsum\n" +
      "# comment"

    equal(commentprocessor.text, expected)
  })
})

suite("Test CommentProcessor - insert()", () => {
  test("when comment is found should insert", () => {
    const text =
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur"
    const commentprocessor = new CommentProcessor(text)
    const comment = ["#foo", "dolor sit"]

    commentprocessor.insert(comment)
    
    const expected =
      "lorem ipsum\n" +
      "#foo\n" +
      "dolor sit\n" +
      "amet, consetetur"
    equal(commentprocessor.text, expected)
  })
  test("when comment is not found should do nothing", () => {
    const text =
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur"
    const commentprocessor = new CommentProcessor(text)
    const comment = ["#foo", "do not find"]

    commentprocessor.insert(comment)
    
    const expected =
      "lorem ipsum\n" +
      "dolor sit\n" +
      "amet, consetetur"
    equal(commentprocessor.text, expected)
  })
})

suite("Test CommentProcessor - getIndexOfString()", () => {
  test("should return index of line", () => {
    const line = "dolor sit"
    const text =
      "lorem ipsum\n" +
      `${line}\n` +
      "amet, consetetur"
    const commentprocessor = new CommentProcessor(text)

    equal(commentprocessor.getIndexOfString(line), 12)
    equal(commentprocessor.getIndexOfString("vscode-yaml-sort.lastLine"), commentprocessor.text.length)
  })
})

suite("Test CommentProcessor - search()", () => {
  test("should return last index of text", () => {
    const text =
      "foo: lorem ipsum\n" +
      "bar: dolor sit\n" +
      "baz: amet, consetetur"
    const commentprocessor = new CommentProcessor(text)

    equal(commentprocessor.search("foo: lorem ipsum"), 0)
    equal(commentprocessor.search("  bar: dolor sit  "), 17)
    equal(commentprocessor.search("baz: \"amet, consetetur\""), 32)
  })
})

suite("Test CommentProcessor - searchExactMatch()", () => {
  test("should return last index of text", () => {
    const line = "bar: dolor sit"
    const text =
      "foo: lorem ipsum\n" +
      `${line}\n` +
      `${line}\n` +
      "baz: amet, consetetur"
    const commentprocessor = new CommentProcessor(text)

    equal(commentprocessor.searchExactMatch(line), 32)
  })
})

suite("Test CommentProcessor - searchFuzzyForTrimmedText()", () => {
  test("should return last index of keyword", () => {
    const line = "  bar: dolor sit  "
    const text =
      "foo: lorem ipsum\n" +
      `${line.trim()}\n` +
      "baz: amet, consetetur"
    const commentprocessor = new CommentProcessor(text)

    equal(commentprocessor.searchFuzzyForTrimmedText(line), 17)
  })
})

suite("Test CommentProcessor - searchFuzzyForKeyword()", () => {
  test("should return last index of keyword", () => {
    const line = "bar: dolor sit"
    const text =
      "foo: lorem ipsum\n" +
      `${line}\n` +
      "baz: amet, consetetur"
    const commentprocessor = new CommentProcessor(text)

    equal(commentprocessor.searchFuzzyForKeyword(line), 17)
  })
})

suite("Test CommentProcessor - isCommentFound()", () => {
  test("when index is -1 should return true", () => {
    equal(CommentProcessor.isCommentFound(-1), false)
    equal(CommentProcessor.isCommentFound(0), true)
  })
})

suite("Test CommentProcessor - insertIfNotContained()", () => {
  test("when comment is already contained it should not be inserted", () => {
    const text =
      "block:\n" +
      "  - |\n" +
      "    # comment 1\n" +
      "    some command"
    const commentprocessor = new CommentProcessor(text)

    commentprocessor.findComments()
    equal(commentprocessor.store.length, 1)

    commentprocessor.insertIfNotContained(commentprocessor.store[0])
    equal(commentprocessor.text, text)

    commentprocessor.text =
      "block:\n" +
      "  - |\n" +
      "    some command"
    commentprocessor.insertIfNotContained(commentprocessor.store[0])
    equal(commentprocessor.text, text)
    })
})

suite("Test CommentProcessor - Issue 45", () => {
  // https://github.com/pascalre/vscode-yaml-sort/issues/45#issuecomment-1329161613
  test("should fuzzy find comments", () => {
    const text =
      "#begin comment\n" +
      "params:\n" +
      "  logon: test\n" +
      "  #variable meta data\n" +
      "  variableMetadata: env\\config_dev.yaml\n" +
      "  logFile: log-test.log\n" +
      "  logLevel: DEBUG\n" +
      "  chunkSize: 1000\n" +
      "  jobSize: 20\n" +
      "  schema: test\n" +
      "  #end comment"
    const commentprocessor = new CommentProcessor(text)

    commentprocessor.findComments()
    const textWithoutComments =
      "params:\n" +
      "  chunkSize: 1000\n" +
      "  jobSize: 20\n" +
      "  logFile: 'log-test.log'\n" +
      "  logLevel: 'DEBUG'\n" +
      "  logon: 'test'\n" +
      "  schema: 'test'\n" +
      "  variableMetadata: 'env\\config_dev.yaml'"
    commentprocessor.text = textWithoutComments
    commentprocessor.postprocess()

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

    equal(commentprocessor.text, expected)
  })


  test("should work with trailing newline", () => {
    const text =
      "schema: test\n" +
      "#end comment\n"
    const commentprocessor = new CommentProcessor(text)

    commentprocessor.findComments()
    commentprocessor.text = "schema: test"
    commentprocessor.postprocess()

    const expected =
      "schema: test\n" +
      "#end comment"

    equal(commentprocessor.text, expected)
  })
})