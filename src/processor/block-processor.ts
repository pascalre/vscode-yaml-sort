import { GenericProcessor } from "./generic-processor"

export class BlockProcessor extends GenericProcessor {
  constructor(text: string) {
    super("block", /([|>])((?!:).|[\r\n])+/g, text)
  }
}
