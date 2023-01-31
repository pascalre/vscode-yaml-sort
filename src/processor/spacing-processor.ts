import { Settings } from "../settings"

export class SpacingProcessor {
  text: string
  settings = new Settings()

  constructor(text: string) {
    this.text = text
  }

  postprocess() {
    return this.addNewLineBeforeKeywords()
  }

  addNewLineBeforeKeywords(): string {
    let level = 0;
    let result = this.text;

    while (level < this.settings.emptyLinesUntilLevel) {
      if (level === 0) {
        result = result.replace(/\n[^\s].*:/g, "\n$&")
      } else {
        let spaces = " ".repeat(this.settings.indent)
        spaces = spaces.repeat(level)
        const matcher = new RegExp(`\n${spaces}[\\w-]*:`, "g")
        result = result.replace(matcher, "\n$&")
      }
      level++;
    }

    return result;
  }
}
