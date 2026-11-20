import { GenericProcessor } from "./generic-processor"

export class HelmProcessor extends GenericProcessor {
  constructor(text: string) {
    // if a helm value is wrapped in quotation marks, they must be part of the match.
    // otherwise, js-yaml removes them while dumping, which produces invalid yaml (see #130)
    super("helm", /'{{[^{]*}}'|"{{[^{]*}}"|{{[^{]*}}/g, text)
  }
}
