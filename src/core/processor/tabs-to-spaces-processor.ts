import { Settings } from "../settings"

export class TabsToSpacesProcessor {
  text: string
  settings: Settings

  constructor(text: string, settings = new Settings()) {
    this.text = text
    this.settings = settings
  }

  preprocess() {
    const spaces = " ".repeat(this.settings.indent)
    this.text = this.text.replace(/\t/mg, spaces)
  }
}

