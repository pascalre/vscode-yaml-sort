import { ArrayProcessor } from "./array-processor"
import { BlockProcessor } from "./block-processor"
import { CommentProcessor } from "./comment-processor"
import { HelmProcessor } from "./helm-processor"
import { OctalProcessor } from "./octal-processor"
import { SpacingProcessor } from "./spacing-processor"
import { TabsToSpacesProcessor } from "./tabs-to-spaces-processor"
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

  preprocess() {
    this.tabstospacespreprocessor = new TabsToSpacesProcessor(this.text, this.settings)
    this.tabstospacespreprocessor.preprocess()
    this.text = this.tabstospacespreprocessor.text

    if (this.settings.useBlockProcessor) {
      this.blockprocessor = new BlockProcessor(this.text)
      this.blockprocessor.preprocess()
      this.text = this.blockprocessor.text
    }

    if (this.settings.useArrayProcessor) {
      this.arrayprocessor = new ArrayProcessor(this.text)
      this.arrayprocessor.preprocess()
      this.text = this.arrayprocessor.text
    }

    if (this.settings.useHelmProcessor) {
      this.helmprocessor = new HelmProcessor(this.text)
      this.helmprocessor.preprocess()
      this.text = this.helmprocessor.text
    }

    if (this.settings.useOctalProcessor) {
      this.octalprocessor = new OctalProcessor(this.text)
      this.octalprocessor.preprocess()
      this.text = this.octalprocessor.text
    }

    if (this.settings.useCommentProcessor) {
      this.commentprocessor = new CommentProcessor(this.text)
      this.commentprocessor.findComments()
      this.text = this.commentprocessor.text
    }
  }

  postprocess() {
    if (this.settings.useCommentProcessor) {
      this.commentprocessor.text = this.text
      this.commentprocessor.postprocess()
      this.text = this.commentprocessor.text
    }

    if (this.settings.useOctalProcessor) {
      this.octalprocessor.text = this.text
      this.octalprocessor.postprocess()
      this.text = this.octalprocessor.text
    }

    if (this.settings.useHelmProcessor) {
      this.helmprocessor.text = this.text
      this.helmprocessor.postprocess()
      this.text = this.helmprocessor.text
    }

    if (this.settings.useArrayProcessor) {
      this.arrayprocessor.text = this.text
      this.arrayprocessor.postprocess()
      this.text = this.arrayprocessor.text
    }

    if (this.settings.useBlockProcessor) {
      this.blockprocessor.text = this.text
      this.blockprocessor.postprocess()
      this.text = this.blockprocessor.text
    }

    this.spacingprocessor = new SpacingProcessor(this.text, this.settings)
    this.spacingprocessor.postprocess()
    this.text = this.spacingprocessor.text
  }
}
