import { equal } from "assert"

import { ArrayProcessor } from "../../../processor/array-processor"

suite("Test ArrayProcessor - preprocess()", () => {
  test("should find all array values", () => {
    const text = "test: [ \"CMD\", \"pg_isready\", \"-q\", \"-d\", \"DB_NAME\", \"-U\", \"DB_USER\" ]"
    const arrayprocessor = new ArrayProcessor(text)

    arrayprocessor.preprocess()

    equal(arrayprocessor.store.size, 1)
    equal(arrayprocessor.store.get("vscode-yaml-sort.array.0"), "[ \"CMD\", \"pg_isready\", \"-q\", \"-d\", \"DB_NAME\", \"-U\", \"DB_USER\" ]")
  })

  test("GitHub issue #129: False remove trailing quotes by Array Processor.", () => {
    const textExamples = [ "section: '*[a]'", "section: *[a]", "section: '[a]'", "section: [a]"]

    textExamples.forEach(text => {
      const arrayprocessor = new ArrayProcessor(text)
  
      arrayprocessor.preprocess()
      arrayprocessor.postprocess()
  
      equal(arrayprocessor.text, text)
    })
  })
})