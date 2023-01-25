import { GenericProcessor } from "./generic-processor";

export class ArrayProcessor extends GenericProcessor {
  constructor(text: string) {
    super("array", /\[([^[]*)\]/g, text)
  }
}
