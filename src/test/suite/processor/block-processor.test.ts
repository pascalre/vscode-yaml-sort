import { equal } from "assert"

import { BlockProcessor } from "../../../processor/block-processor"

suite("Test BlockProcessor - preprocess()", () => {
  test("should find all block values", () => {
    //
  })
  test("input string with block sequence > should be the same after pre and postprocessing", () => {
    const text =
      "foo:\n" +
      "  bar: >\n" +
      "    This is a long sentence\n" +
      "baz: bar"
  
    const blockprocessor = new BlockProcessor(text)

    blockprocessor.preprocess()

    equal(blockprocessor.store.size, 1)

    blockprocessor.postprocess()
    
    equal(blockprocessor.text, text)
  })

  test("input string with block sequence | should be the same after pre and postprocessing", () => {
    const text =
      "foo:\n" +
      "  bar: |\n" +
      "    This is a long sentence\n" +
      "baz: bar"
  
    const blockprocessor = new BlockProcessor(text)

    blockprocessor.preprocess()

    equal(blockprocessor.store.size, 1)

    blockprocessor.postprocess()
    
    equal(blockprocessor.text, text)
  })
})