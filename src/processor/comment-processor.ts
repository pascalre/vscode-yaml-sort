export class CommentProcessor {
  comments: string[][] = []
  text: string
  lines: string[]

  constructor(text: string) {
    this.text = text.trim()
    this.lines = this.text.split("\n")
  }

  /**
   * Finds all full line comments in a given yaml (ignoring comments in the same line with code).
   * @param text Yaml document
   */
  findComments() {
    this.lines.forEach((line, index) => {
      if (CommentProcessor.isLineComment(line)) {
        this.addLineToComments(index)
      }
    })
  }

  static isLineComment(line: string) {
    return /^ *#/.test(line)
  }

  addLineToComments(index: number) {
    if (index < this.lines.length-1) {
      this.comments.push([this.lines[index], this.lines[index+1]])
    } else {
      this.comments.push([this.lines[index], 'vscode-yaml-sort.lastLine'])
    }
  }

  applyComments(text: string): string {
    this.text = text
    this.reverseComments()
    this.comments.forEach(comment => {
      this.applyComment(comment)
    })
    return this.text
  }

  reverseComments() {
    this.comments.reverse()
  }

  applyComment(comment: string[]) {
    if (comment[1] === "vscode-yaml-sort.lastLine") {
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
      const textAfter = this.text.slice(indexOfComment)
      const textBefore = this.text.slice(0, indexOfComment)
      this.text = `${textBefore}${comment[0]}\n${textAfter.trimEnd()}`
    }
  }

  getIndexOfString(text: string): number {
    if (text === "vscode-yaml-sort.lastLine") {
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

  searchExactMatch(text: string): number {
    return this.text.lastIndexOf(text)
  }

  searchFuzzyForTrimmedText(text: string): number {
    return this.searchExactMatch(text.trim())
  }

  searchFuzzyForKeyword(text: string): number {
    return this.searchExactMatch(text.split(":")[0])
  }

  static isCommentFound(index: number): boolean {
    return index !== -1
  }
}
