import { GenericProcessor } from "./generic-processor"

export class BlockProcessor extends GenericProcessor {
  constructor(text: string) {
    // match a block scalar together with all its content lines.
    // a content line is empty or starts with at least as much whitespace as
    // the first content line, as defined by the yaml spec (see #188, #227)
    super("block", /(?<=:\s)([|>])[^\n]*\n([ \t]+)[^\n]*(?:\n(?:\2[^\n]*|[ \t]*(?=\n|$)))*/g, text)
  }
}
