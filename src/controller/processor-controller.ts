import { ArrayProcessor } from "../processor/array-processor"
import { CommentProcessor } from "../processor/comment-processor"
import { HelmProcessor } from "../processor/helm-processor"
import { SpacingProcessor } from "../processor/spacing-processor"
import { Settings } from "../settings"

export class ProcessorController {
  arrayprocessor!: ArrayProcessor
  commentprocessor!: CommentProcessor
  helmprocessor!: HelmProcessor
  spacingprocessor!: SpacingProcessor
  text: string
  settings: Settings

  constructor(text: string, settings = new Settings()) {
    this.text = text
    this.settings = settings
  }

  preprocess() {
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

    this.spacingprocessor = new SpacingProcessor(this.text)
    this.spacingprocessor.postprocess()
    this.text = this.spacingprocessor.text
  }
}
