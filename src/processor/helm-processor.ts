import { GenericProcessor } from "./generic-processor";

export class HelmProcessor extends GenericProcessor {
  constructor(text: string) {
    super("helm", /{{([^{]*)}}/g, text)
  }
}
