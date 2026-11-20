import { ArrayProcessor } from "./array-processor"
import { BlockProcessor } from "./block-processor"
import { CommentProcessor } from "./comment-processor"
import { HelmProcessor } from "./helm-processor"
import { OctalProcessor } from "./octal-processor"
import { SpacingProcessor } from "./spacing-processor"
import { TabsToSpacesProcessor } from "./tabs-to-spaces-processor"
import { Settings } from "../settings"

/**
 * A processor that hides parts of a document from js-yaml and restores them afterwards.
 */
interface ReversibleProcessor {
  text: string
  preprocess(): void
  postprocess(): void
}

/**
 * Runs the processors around loading and dumping a document with js-yaml.
 *
 * `preprocess()` applies the enabled processors in a fixed order, `postprocess()` restores their
 * values in the reverse order, so a processor always sees the text the way it left it.
 */
export class ProcessorPipeline {
  text: string
  settings: Settings
  private applied: ReversibleProcessor[] = []

  constructor(text: string, settings = new Settings()) {
    this.text = text
    this.settings = settings
  }

  /**
   * @returns Factories for the enabled processors, in the order of preprocessing.
   */
  private enabledProcessors(): ((text: string) => ReversibleProcessor)[] {
    const processors: [boolean, (text: string) => ReversibleProcessor][] = [
      [this.settings.useBlockProcessor, (text) => new BlockProcessor(text)],
      [this.settings.useArrayProcessor, (text) => new ArrayProcessor(text)],
      [this.settings.useHelmProcessor, (text) => new HelmProcessor(text)],
      [this.settings.useOctalProcessor, (text) => new OctalProcessor(text)],
      [this.settings.useCommentProcessor, (text) => new CommentProcessor(text)],
    ]
    return processors.filter(([enabled]) => enabled).map(([, create]) => create)
  }

  preprocess() {
    const tabsToSpaces = new TabsToSpacesProcessor(this.text, this.settings)
    tabsToSpaces.preprocess()
    this.text = tabsToSpaces.text
    // each processor works on the text the previous one left
    this.applied = this.enabledProcessors().map((create) => {
      const processor = create(this.text)
      processor.preprocess()
      this.text = processor.text
      return processor
    })
  }

  postprocess() {
    // add empty lines first: the hidden values, e.g. the content of block scalars, must not get
    // any, and comments are put directly above their key afterwards
    const spacing = new SpacingProcessor(this.text, this.settings)
    spacing.postprocess()
    this.text = spacing.text

    for (const processor of [...this.applied].reverse()) {
      processor.text = this.text
      processor.postprocess()
      this.text = processor.text
    }
  }
}
