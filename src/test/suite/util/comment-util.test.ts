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

suite("Test CommentUtil - getIndexOfString()", () => {
  test("should return index of line", () => {
    const line = 'dolor sit'
    const text =
      'lorem ipsum\n' +
      line + '\n' +
      'amet, consetetur'
    const commentutil = new CommentUtil(text)

    equal(commentutil.getIndexOfString(line), 12)
  })
})

/*
suite("Test CommentUtil - findComments()", () => {
  test("should return an empty map on a yaml without comments", () => {
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'
    const expected = new Map<string, string>()
    deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value", () => {
    const yaml =
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected = new Map<string, string>()
    expected.set('# bob is 1st', '  bob:')
    deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value (comment on top)", () => {
    const yaml =
      '# comment on top\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected = new Map<string, string>()
    expected.set('# comment on top', 'persons:')
    deepEqual(findComments(yaml), expected)
  })

  test("should return a map with the line below the comment as key and the comment as value (comment at the bottom)", () => {
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '# comment at the bottom'

    const expected = new Map<string, string>()
    expected.set('# comment at the bottom', '')
    deepEqual(findComments(yaml), expected)
  })

  test("should merge multiline comments", () => {
    const yaml =
      'persons:\n' +
      '# bob is 1st\n' +
      '# alice is 2nd\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected = new Map<string, string>()
    expected.set('# bob is 1st\n# alice is 2nd', '  bob:')
    deepEqual(findComments(yaml), expected)
  })

})

suite("Test applyComments", () => {
  test("should apply comment to yaml", () => {
    const comments = new Map<string, string>()
    comments.set("# bob is 1st", "  bob:")
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected =
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    deepEqual(applyComments(yaml, comments), expected)
  })

  test("should apply comment to last line in yaml", () => {
    const comments = new Map<string, string>()
    comments.set("# last line comment", "")
    const yaml =
      'persons: bob'

    const expected =
      'persons: bob\n' +
      '# last line comment'

    deepEqual(applyComments(yaml, comments), expected)
  })

  test("should apply multiple comments to yaml", () => {
    const comments = new Map<string, string>()
    comments.set("    # living in germany", "    place: Germany")
    comments.set("# bob is 1st", "  bob:")
    comments.set("# last line comment", "")
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected =
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    # living in germany\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '\n' +
      '# last line comment'

    deepEqual(applyComments(yaml, comments), expected)
  })

  test("should recognize indentation", () => {
    const comments = new Map<string, string>()
    comments.set("# bob is 1st", "    bob:")
    const yaml =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    const expected =
      'persons:\n' +
      '# bob is 1st\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n'

    deepEqual(applyComments(yaml, comments), expected)
  })
})
*/