import * as assert from "assert"
import { Settings } from "../../../settings"
import { formatYaml } from "../../../util/yaml-util"



suite("Test formatYaml", () => {
  test("should sort all yaml files in directory", () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: "Germany"\n' +
      '    age: 23\n' +
      '"animals":\n' +
      '  kitty:\n' +
      '    age: 3'

    let expected =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    const settings = new Settings()
    settings.getUseLeadingDashes = function () {
      return false
    }
    assert.strictEqual(formatYaml(actual, false, settings), expected)

    expected =
      '---\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    assert.strictEqual(formatYaml(actual, true, new Settings()), expected)
  })

  test("should return `null` on invalid yaml", () => {
    assert.strictEqual(formatYaml('key: 1\nkey: 1', true, new Settings()), null)
  })
})