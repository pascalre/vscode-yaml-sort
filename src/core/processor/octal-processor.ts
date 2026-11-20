import { GenericProcessor } from "./generic-processor"

export class OctalProcessor extends GenericProcessor {
  constructor(text: string) {
    // js-yaml loads a value like 0755 as the decimal number 755, which drops the leading zero of a file mode.
    // match it as value of a key or a list item, optionally followed by a comment
    super("octal", /(?<=(?::|^[ \t]*-)[ \t]+)0[0-7]{3}(?=[ \t]*(?:#.*)?$)/gm, text)
  }
}
