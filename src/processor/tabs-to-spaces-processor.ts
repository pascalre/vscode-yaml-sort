import { Settings } from "../settings"

export class TabsToSpacesProcessor {
  text: string
  settings = new Settings()

  constructor(text: string) {
    this.text = text
  }

  preprocess() {
    const spaces = " ".repeat(this.settings.indent)
    this.text = this.text.replace(/\t/mg, spaces)
  }
}

