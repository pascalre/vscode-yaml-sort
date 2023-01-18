import { equal, notEqual } from "assert"
import { Processor } from "../../../processor/processor"

suite("Test Processor - preprocess()", () => {
  test("text should be the same after pre- and postprocessing", () => {
    const text =
      'foo: {{ .Value }}\n' +
      '# comment\n' +
      'bar: baz'
    const processor = new Processor(text)

    processor.preprocess()

    notEqual(processor.text, text)

    const text2 =
      'foo: {{ .Value }}\n' +
      'bar: baz'
    processor.postprocess(text2)

    equal(processor.text, text)
  })
})
