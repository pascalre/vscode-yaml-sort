import { GenericProcessor } from "./generic-processor"

export class OctalProcessor extends GenericProcessor {
  constructor(text: string) {
    super("octal", /(?<=:\s)(0[0-7]{3})$/gm, text)
  }
}
