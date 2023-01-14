import { JsYamlAdapter } from "../adapter/js-yaml-adapter"
import { Settings } from "../settings"

export class CommentUtil {
  settings: Settings
  jsyamladapter: JsYamlAdapter
  comments: string[][] = []
  text: string
  lines: string[]

  constructor(text: string, settings = new Settings()) {
    this.text = text
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
    const indexOfComment = this.getIndexOfString(comment[1])
    if (comment[1] !== "vscode-yaml-sort.lastLine") {
      const textBefore = this.text.slice(0, indexOfComment)
      const textAfter = this.text.slice(indexOfComment)
      this.text = `${textBefore}${comment[0]}\n${textAfter}`
    } else {
      this.text = `${this.text}\n${comment[0]}`
    }
  }

  getIndexOfString(text: string): number {
    if (text === "vscode-yaml-sort.lastLine") {
      return this.text.length
    } else {
      return this.text.search(text)
    }
  }
}
