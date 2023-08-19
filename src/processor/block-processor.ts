import { GenericProcessor } from "./generic-processor"

export class BlockProcessor extends GenericProcessor {
  constructor(text: string) {
    // option 1: match all following lines not containing a colon
    super("block", /(?!<)(?<=:\s)([|>])((?!:).|[\r\n])+(?=\n.+:)/g, text)
    // option 2: match all following lines starting with the same amount of spaces
    // super("block", /(?!<)(?<=:\s)([|>]).*\n(\s+).*(\n\2.*)+/g, text)
  }
}
