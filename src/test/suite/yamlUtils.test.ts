import * as assert from "assert"
import { hasTextYamlKeys } from "../../adapter/js-yaml-adapter"

suite("Test hasTextYamlKeys", () => {
    test("when a text with no yaml keys is passed, `false` is returned", () => {
      assert.equal(hasTextYamlKeys(""), false)
    })
  
    test("when a text with yaml keys is passed, `true` is returned", () => {
      assert.equal(hasTextYamlKeys("api: v1"), true)
    })
  })