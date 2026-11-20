import { getInlineComment, isLineComment } from "./yaml-comment"

/** Anchor of a comment in the last line, which has no following line to stay above. */
export const LAST_LINE = "vscode-yaml-sort.lastLine"

export class CommentProcessor {
  store: string[][] = []
  inlineStore: string[][] = []
  text: string
  lines: string[]

  constructor(text: string) {
    this.text = text.trim()
    this.lines = this.text.split("\n")
  }

  /**
   * Remembers the comments. The text itself stays unchanged, js-yaml drops the comments.
   */
  preprocess() {
    this.findComments()
  }

  /**
   * Finds all comments in a given yaml. Stores full line comments with their following line
   * and inline comments with the code they belong to.
   * @param text Yaml document
   */
  findComments() {
    this.lines.forEach((line, index) => {
      if (isLineComment(line)) {
        this.addLineToComments(index)
      } else {
        this.addInlineCommentToStore(line)
      }
    })
  }

  addLineToComments(index: number) {
    if (index < this.lines.length-1) {
      this.store.push([this.lines[index], this.lines[index+1]])
    } else {
      this.store.push([this.lines[index], LAST_LINE])
    }
  }

  addInlineCommentToStore(line: string) {
    const comment = getInlineComment(line)

    if (comment !== undefined) {
      this.inlineStore.push([` ${comment}`, line.slice(0, line.length - comment.length).trimEnd()])
    }
  }

  postprocess(): string {
    this.reverseComments()
    this.store.forEach(comment => {
      this.applyComment(comment)
    })
    this.applyInlineComments()
    return this.text
  }

  reverseComments() {
    this.store.reverse()
  }

  applyInlineComments() {
    this.inlineStore.reverse()
    this.inlineStore.forEach(comment => {
      this.applyInlineComment(comment)
    })
  }

  applyInlineComment(comment: string[]) {
    const indexOfComment = this.getIndexOfString(comment[1])

    if (CommentProcessor.isCommentFound(indexOfComment)) {
      this.insertInlineIfNotContained(comment)
    }
  }

  insertInlineIfNotContained(comment: string[]) {
    const endOfLine = this.getEndOfLine(this.getIndexOfString(comment[1]))
    const textBefore = this.text.slice(0, endOfLine)
    const textAfter = this.text.slice(endOfLine)

    if (!textBefore.endsWith(comment[0])) {
      this.text = `${textBefore}${comment[0]}${textAfter}`
    }
  }

  getEndOfLine(index: number): number {
    const endOfLine = this.text.indexOf("\n", index)

    return endOfLine === -1 ? this.text.length : endOfLine
  }

  applyComment(comment: string[]) {
    if (comment[1] === LAST_LINE) {
      this.append(comment[0])
    } else {
      this.insert(comment)
    }
  }

  append(line: string) {
    this.text = `${this.text}\n${line}`
  }

  insert(comment: string[]) {
    const indexOfComment = this.getIndexOfString(comment[1])
    if (CommentProcessor.isCommentFound(indexOfComment)) {
      this.insertIfNotContained(comment)
    }
  }

  insertIfNotContained(comment: string[]) {
    const indexOfComment = this.getBeginningOfLine(this.getIndexOfString(comment[1]))
    const textAfter = this.text.slice(indexOfComment)
    const textBefore = this.text.slice(0, indexOfComment)

    if (!textBefore.endsWith(`${comment[0]}\n`)) {
      this.text = `${textBefore}${comment[0]}\n${textAfter.trimEnd()}`
    }
  }

  getBeginningOfLine(index: number): number {
    return this.text.lastIndexOf("\n", index) + 1
  }

  getIndexOfString(text: string): number {
    if (text === LAST_LINE) {
      return this.text.length
    } else {
      return this.search(text)
    }
  }

  search(text: string) {
    let result = this.searchExactMatch(text)
    if (CommentProcessor.isCommentFound(result)) {
      return result
    }

    result = this.searchFuzzyForTrimmedText(text)
    if (CommentProcessor.isCommentFound(result)) {
      return result
    }

    return this.searchFuzzyForKeyword(text)
  }

  /**
   * @param matches Condition for a line.
   * @returns The offset of the last line of the text that meets the condition, or -1.
   */
  findLastLine(matches: (line: string) => boolean): number {
    let result = -1
    let offset = 0
    for (const line of this.text.split("\n")) {
      if (matches(line)) {
        result = offset
      }
      offset += line.length + 1
    }
    return result
  }

  searchExactMatch(text: string): number {
    // an empty anchor keeps its previous behavior
    if (text === "") {
      return this.text.lastIndexOf(text)
    }
    // comments must be inserted above the exact matching line (see #221).
    // a substring search would also find `mysql5:` inside a deeper indented
    // line like `      mysql5:` of a `depends_on` block
    return this.findLastLine((line) => line === text)
  }

  searchFuzzyForTrimmedText(text: string): number {
    // like searchExactMatch(), but the line may have more or less
    // surrounding whitespaces than the anchor (see #139)
    const trimmedText = text.trim()
    return this.findLastLine((line) => line.trim() === trimmedText)
  }

  searchFuzzyForKeyword(text: string): number {
    // the value of a line may change while sorting, e.g. quotes are removed,
    // so search for the line with the same key in front of the first colon
    const key = text.split(":")[0]
    const sameKey = this.findLastLine((line) => line.startsWith(`${key}:`))
    if (CommentProcessor.isCommentFound(sameKey)) {
      return sameKey
    }
    const sameKeyIndented = this.findLastLine((line) => line.trim().startsWith(`${key.trim()}:`))
    if (CommentProcessor.isCommentFound(sameKeyIndented)) {
      return sameKeyIndented
    }
    // last resort, e.g. for a key that js-yaml quotes: rather misplace a comment than lose it
    return this.text.lastIndexOf(key)
  }

  static isCommentFound(index: number): boolean {
    return index !== -1
  }
}
