import { Settings } from "../settings"

export class SpacingProcessor {
  text: string
  settings: Settings

  constructor(text: string, settings = new Settings()) {
    this.text = text
    this.settings = settings
  }

  postprocess() {
    let level = 0
    let result = this.text

    while (level < this.settings.emptyLinesUntilLevel) {
      if (level === 0) {
        result = result.replace(/\n[^\s].*:/g, "\n$&")
      } else {
        const matcher = this.getMatcher(level)
        result = result.replace(matcher, "\n$&")
      }
      level++
    }

    this.text = result
  }

  getMatcher(level: number) {
    const spaces = this.settings.indent * level
    return new RegExp(`\\n {${spaces}}[\\w-]*:`, "g")
  }
}
