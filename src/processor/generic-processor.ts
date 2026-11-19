/**
 * Base class for processors that protect parts of a yaml document from js-yaml.
 *
 * `preprocess()` replaces every match of `matcher` with a unique substitute
 * (`vscode-yaml-sort.<filter>.<n>`), `postprocess()` puts the original values back
 * after the document was loaded, sorted and dumped.
 */
export abstract class GenericProcessor {
  filter: string
  matcher: RegExp
  store: Map<string, string> = new Map()
  text: string

  /**
   * @param filter  Name of the processor, used inside the substitute.
   * @param matcher Global regular expression matching the values to protect.
   * @param text    Yaml document to process.
   */
  constructor(filter: string, matcher: RegExp, text: string) {
    this.filter = filter
    this.matcher = matcher
    this.text = text
  }

  /**
   * Replaces every match with a substitute. The replacement happens at the position
   * of the match itself, so an identical string elsewhere in the document stays untouched.
   */
  preprocess() {
    this.text = this.text.replace(this.matcher, (match) => this.createSubstitute(match))
  }

  /**
   * Stores a value and returns the substitute that represents it.
   * @param value Original value.
   * @returns The substitute for the value.
   */
  createSubstitute(value: string): string {
    const substitute = `vscode-yaml-sort.${this.filter}.${this.store.size}`
    this.store.set(substitute, value)
    return substitute
  }

  postprocess() {
    this.store.forEach((value: string, key: string) => {
      this.replaceSubstituteWithValue(key, value)
    })
  }

  /**
   * Replaces a substitute, including quotation marks js-yaml may have added, with its value.
   * @param substitute Substitute created by `createSubstitute()`.
   * @param value      Original value.
   */
  replaceSubstituteWithValue(substitute: string, value: string) {
    const escaped = substitute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // the lookahead ensures that `...helm.1` does not match the prefix of `...helm.10`
    const unquoted = `${escaped}(?!\\d)`
    const match = new RegExp(`'${unquoted}'|"${unquoted}"|${unquoted}`)
    // use a replacer function so that dollar signs in the value are inserted
    // literally and are not interpreted as replacement patterns (see #130)
    this.text = this.text.replace(match, () => value)
  }
}
