import { ArrayProcessor } from "../processor/array-processor"
import { BlockProcessor } from "../processor/block-processor"
import { CommentProcessor } from "../processor/comment-processor"
import { HelmProcessor } from "../processor/helm-processor"
import { OctalProcessor } from "../processor/octal-processor"
import { SpacingProcessor } from "../processor/spacing-processor"
import { TabsToSpacesProcessor } from "../processor/tabs-to-spaces-processor"
import { Settings } from "../settings"

export class ProcessorController {
  arrayprocessor!: ArrayProcessor
  blockprocessor!: BlockProcessor
  commentprocessor!: CommentProcessor
  helmprocessor!: HelmProcessor
  octalprocessor!: OctalProcessor
  spacingprocessor!: SpacingProcessor
  tabstospacespreprocessor!: TabsToSpacesProcessor
  text: string
  settings: Settings

  constructor(text: string, settings = new Settings()) {
    this.text = text
    this.settings = settings
  }

  /**
   * Runs a processors `preprocess()` and adopts the processed text.
   */
  private runPreprocessor<T extends { text: string, preprocess(): void }>(processor: T): T {
    processor.preprocess()
    this.text = processor.text
    return processor
  }

  /**
   * Runs a processors `postprocess()` on the current text and adopts the result.
   */
  private runPostprocessor<T extends { text: string, postprocess(): void }>(processor: T): void {
    processor.text = this.text
    processor.postprocess()
    this.text = processor.text
  }

  preprocess() {
    this.tabstospacespreprocessor = this.runPreprocessor(new TabsToSpacesProcessor(this.text))

    if (this.settings.useBlockProcessor) {
      this.blockprocessor = this.runPreprocessor(new BlockProcessor(this.text))
    }

    if (this.settings.useArrayProcessor) {
      this.arrayprocessor = this.runPreprocessor(new ArrayProcessor(this.text))
    }

    if (this.settings.useHelmProcessor) {
      this.helmprocessor = this.runPreprocessor(new HelmProcessor(this.text))
    }

    if (this.settings.useOctalProcessor) {
      this.octalprocessor = this.runPreprocessor(new OctalProcessor(this.text))
    }

    if (this.settings.useCommentProcessor) {
      // the CommentProcessor does not extend the GenericProcessor and uses findComments() instead of preprocess()
      this.commentprocessor = new CommentProcessor(this.text)
      this.commentprocessor.findComments()
      this.text = this.commentprocessor.text
    }
  }

  postprocess() {
    if (this.settings.useCommentProcessor) {
      this.runPostprocessor(this.commentprocessor)
    }

    if (this.settings.useOctalProcessor) {
      this.runPostprocessor(this.octalprocessor)
    }

    if (this.settings.useHelmProcessor) {
      this.runPostprocessor(this.helmprocessor)
    }

    if (this.settings.useArrayProcessor) {
      this.runPostprocessor(this.arrayprocessor)
    }

    if (this.settings.useBlockProcessor) {
      this.runPostprocessor(this.blockprocessor)
    }

    this.spacingprocessor = new SpacingProcessor(this.text)
    this.runPostprocessor(this.spacingprocessor)
  }
}
