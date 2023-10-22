export abstract class GenericProcessor {
  filter: string
  matcher: RegExp
  store: Map<string, string> = new Map()
  text: string

  constructor(filter: string, matcher: RegExp, text: string) {
    this.filter = filter
    this.matcher = matcher
    this.text = text
  }

  preprocess() {
    const matches = this.findMatches()
    if (matches) {
      for (const match of matches) {
        this.replaceValueWithSubstitute(match)
      }
    }
  }

  findMatches() {
    return this.text.match(this.matcher)
  }

  replaceValueWithSubstitute(value: string) {
    const substitue = `vscode-yaml-sort.${this.filter}.${this.store.size}`
    this.store.set(substitue, value)
    this.text = this.text.replace(value, substitue)
  }

  postprocess() {
    this.store.forEach((value: string, key: string) => {
      this.replaceSubstituteWithValue(key, value)
    })
  }

  replaceSubstituteWithValue(substitue: string, value: string) {
    const match = new RegExp(`('|")?${substitue}('|")?`)
    this.text = this.text.replace(match, value)
  }
}
