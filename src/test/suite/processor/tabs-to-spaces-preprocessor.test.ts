import { equal } from "assert"
import { TabsToSpacesProcessor } from "../../../processor/tabs-to-spaces-processor"

suite("Test TabsToSpacesPreprocessor - preprocess()", () => {
  const text = 
    'a-1:\n' +
    '\tb:\n' +
    '\t\td: g\n' +
    '\tc:\n' +
    '\t\td: g'

  const expected =
    'a-1:\n' +
    '  b:\n' +
    '    d: g\n' +
    '  c:\n' +
    '    d: g'

  const tabstospacespreprocessor = new TabsToSpacesProcessor(text)

  test("should replace all tabs with spaces", () => {
    tabstospacespreprocessor.preprocess()
    equal(tabstospacespreprocessor.text, expected)
  })
})