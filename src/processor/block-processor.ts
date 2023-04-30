import { GenericProcessor } from "./generic-processor"

export class BlockProcessor extends GenericProcessor {
  constructor(text: string) {
    super("block", /(?!<)(?<=:\s+)([|>])((?!:).|[\r\n])+/g, text)
  }
}
