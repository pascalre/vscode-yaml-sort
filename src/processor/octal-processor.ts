import { GenericProcessor } from "./generic-processor"

export class OctalProcessor extends GenericProcessor {
  constructor(text: string) {
    super("octal", /0[0-7]{3}/g, text)
  }
}
