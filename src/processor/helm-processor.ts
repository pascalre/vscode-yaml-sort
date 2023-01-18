export class HelmProcessor {
  store: Map<string, string> = new Map()
  text: string

  constructor(text: string) {
    this.text = text
  }

  preprocess() {
    const helmValues = this.findHelmValues()
    if (helmValues) {
      for (const value of helmValues) {
        this.replaceValueWithSubstitue(value)
      }
    }
  }

  findHelmValues() {
    return this.text.match(/{{.*}}/g)
  }

  replaceValueWithSubstitue(value: string) {
    const substitue = `vscode-yaml-sort.helm.${this.store.size}`
    this.store.set(substitue, value)
    this.text = this.text.replace(value, substitue)
  }

  postprocess() {
    this.store.forEach((value: string, key: string) => {
      this.replaceSubstituteWithValue(key, value)
    })
  }

  replaceSubstituteWithValue(substitue: string, value: string) {
    const match = new RegExp("('|\")?" + substitue + "('|\")?")
    this.text = this.text.replace(match, value)
  }
}
