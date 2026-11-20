import { equal } from "assert"

import { TabsToSpacesProcessor } from "../../../../core/processor/tabs-to-spaces-processor"

suite("Test TabsToSpacesPreprocessor - preprocess()", () => {
  const text = 
    "a-1:\n" +
    "\tb:\n" +
    "\t\td: g\n" +
    "\tc:\n" +
    "\t\td: g"

  const expected =
    "a-1:\n" +
    "  b:\n" +
    "    d: g\n" +
    "  c:\n" +
    "    d: g"

  const tabstospacespreprocessor = new TabsToSpacesProcessor(text)

  test("should replace all tabs with spaces", () => {
    tabstospacespreprocessor.preprocess()
    equal(tabstospacespreprocessor.text, expected)
  })
})

suite("Test TabsToSpacesPreprocessor - tabs inside values", () => {
  test("should keep tabs that are not part of the indentation, e.g. inside a quoted string", () => {
    const processor = new TabsToSpacesProcessor("a:\n\tb: \"x\ty\"")

    processor.preprocess()

    equal(processor.text, "a:\n  b: \"x\ty\"")
  })
})

