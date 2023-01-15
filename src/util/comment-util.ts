import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Settings } from "../settings"

export class CommentUtil {
  settings: Settings
  jsyamladapter: JsYamlAdapter
  comments: string[][] = []
  text: string
  lines: string[]

  constructor(text: string, settings = new Settings()) {
    this.text = text.trim()
    this.lines = this.text.split("\n")
    this.settings = settings
    this.jsyamladapter = new JsYamlAdapter(settings)
  }

  /**
   * Finds all full line comments in a given yaml (ignoring comments in the same line with code).
   * @param text Yaml document
   */
  findComments() {
    this.lines.forEach((line, index) => {
      if (CommentUtil.isLineComment(line)) {
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
      this.insertCommentBetween(comment)
    }
  }

  append(line: string) {
    this.text = `${this.text}\n${line}`
  }

  insertCommentBetween(comment: string[]) {
    const indexOfComment = this.getIndexOfString(comment[1])
    if (CommentUtil.isCommentFound(indexOfComment)) {
      const textAfter = this.text.slice(indexOfComment)
      if (textAfter.trim() === "") {
        this.append(comment[0])
      } else {
        const textBefore = this.text.slice(0, indexOfComment)
        this.text = `${textBefore}${comment[0]}\n${textAfter}`
      }
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
    if (CommentUtil.isCommentFound(result)) {
      return result
    }

    result = this.searchFuzzyForTrimmedText(text)
    if (CommentUtil.isCommentFound(result)) {
      return result
    }

    return this.searchFuzzyForKeyword(text)
  }

  searchExactMatch(text: string): number {
    return this.text.lastIndexOf(text)
  }

  searchFuzzyForTrimmedText(text: string): number {
    return this.text.lastIndexOf(text.trim())
  }

  searchFuzzyForKeyword(text: string): number {
    return this.text.lastIndexOf(text.split(":")[0])
  }

  static isCommentFound(index: number): boolean {
    return index !== -1
  }
}
