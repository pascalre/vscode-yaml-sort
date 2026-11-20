import { Settings } from "../settings"

/**
 * Replaces tabs in the indentation with spaces, because yaml does not allow tabs for indentation.
 */
export class TabsToSpacesProcessor {
  text: string
  settings: Settings

  constructor(text: string, settings = new Settings()) {
    this.text = text
    this.settings = settings
  }

  preprocess() {
    const spaces = " ".repeat(this.settings.indent)
    // only the indentation: a tab inside a value, e.g. in a quoted string, is part of the value
    this.text = this.text.replace(/^[ \t]+/gm, (indentation) => indentation.replace(/\t/g, spaces))
  }
}
