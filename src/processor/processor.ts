import { CommentProcessor } from "./comment-processor"
import { HelmProcessor } from "./helm-processor"

export class Processor {
  text: string
  helmprocessor!: HelmProcessor
  commentprocessor!: CommentProcessor

  constructor(text: string) {
    this.text = text
  }

  preprocess() {
    this.helmprocessor = new HelmProcessor(this.text)
    this.helmprocessor.preprocess()
    this.text = this.helmprocessor.text

    this.commentprocessor = new CommentProcessor(this.text)
    this.commentprocessor.findComments()
    this.text = this.commentprocessor.text
  }

  postprocess(text: string) {
    this.commentprocessor.applyComments(text)
    this.text = this.commentprocessor.text

    this.helmprocessor.text = this.text
    this.helmprocessor.postprocess()
    this.text = this.helmprocessor.text
  }
}