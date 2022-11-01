import * as assert from "assert"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import jsyaml = require("js-yaml")
import { JsYamlAdapter } from "../../../adapter/js-yaml-adapter"
import { sortYaml } from "../../../extension"
import { Settings } from "../../../settings"

suite("Test JsYamlAdapter - validateYaml()", () => {
  const jsyamladapter = new JsYamlAdapter(new Settings())
  test("when text is a valid yaml document should return true", () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'
    assert.strictEqual(jsyamladapter.validateYaml(actual), true)
  })

  test("when text are two seperated valid yaml documents should return true", () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '---\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'
    assert.strictEqual(jsyamladapter.validateYaml(actual), true)
  })

  test("when text is an invalid yaml document should throw YAMLException", () => {
    assert.throws(() => jsyamladapter.validateYaml("network: ethernets:"), jsyaml.YAMLException)
  })
  test("when indentation is not correct should throw YAMLException", () => {
    assert.throws(() => jsyamladapter.validateYaml("person:\nbob\n  age:23"), jsyaml.YAMLException)
  })
  test("when text contains duplicate key should throw YAMLException", () => {
    assert.throws(() => jsyamladapter.validateYaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n"), jsyaml.YAMLException)
  })
  test("when text is a yaml document using CLOUDFORMATION_SCHEMA and schema is CORE_SCHEMA should throw YAMLException", () => {
    jsyamladapter.settings.getSchema = function () {
      return jsyaml.CORE_SCHEMA
    }
    assert.throws(() => jsyamladapter.validateYaml("RoleName: !Sub \"AdministratorAccess\""), jsyaml.YAMLException)
  })
  test("when text is a yaml document using CLOUDFORMATION_SCHEMA and schema is CLOUDFORMATION_SCHEMA should return true", () => {
    jsyamladapter.settings.getSchema = function () {
      return CLOUDFORMATION_SCHEMA
    }
    assert.strictEqual(jsyamladapter.validateYaml("RoleName: !Sub \"AdministratorAccess\""), true)
  })
  test("when text is a yaml document using HOMEASSISTANT_SCHEMA and schema is CORE_SCHEMA should throw YAMLException", () => {
    jsyamladapter.settings.getSchema = function () {
      return jsyaml.CORE_SCHEMA
    }
    assert.throws(() => jsyamladapter.validateYaml("password: !env_var PASSWORD default_password"), jsyaml.YAMLException)
  })
  test("when text is a yaml document using HOMEASSISTANT_SCHEMA and schema is HOMEASSISTANT_SCHEMA should return true", () => {
    jsyamladapter.settings.getSchema = function () {
      return HOMEASSISTANT_SCHEMA
    }
    assert.strictEqual(jsyamladapter.validateYaml("password: !env_var PASSWORD default_password"), true)
  })
})

suite("Test dumpYaml", () => {

  test("when useCustomSortRecursively is set to `true` should recursively use customSort", async () => {
    const actual =
      'keyword1: value\n' +
      'keyword: value\n' +
      'keyword2: value\n' +
      'data:\n' +
      '  apiVersion: value\n' +
      '  keyword: value\n' +
      '  data: value\n' +
      '  kind: value\n' +
      'kind: value'

    const expected =
      'kind: value\n' +
      'data:\n' +
      '  apiVersion: value\n' +
      '  kind: value\n' +
      '  data: value\n' +
      '  keyword: value\n' +
      'keyword: value\n' +
      'keyword1: value\n' +
      'keyword2: value'

    const settings = new Settings()
    settings.getUseCustomSortRecursively = function () {
      return true
    }
    assert.strictEqual(sortYaml(actual, 1, settings), expected)
  })

  test("when locale is `en` should sort character `ä` over `z`", () => {
    const actual =
      'ä: value\n' +
      'z: value'

    const expected =
      'ä: value\n' +
      'z: value'

    const settings = new Settings()
    settings.getLocale = function () {
      return "en"
    }
    settings.getUseCustomSortRecursively = function () {
      return true
    }
    assert.strictEqual(sortYaml(actual, 1, settings), expected)
  })

  test("when locale is `sv` should sort character `z` over `ä`", () => {
    const actual =
      'ä: value\n' +
      'z: value'

    const expected =
      'z: value\n' +
      'ä: value'

    const settings = new Settings()
    settings.getLocale = function () {
      return "sv"
    }
    assert.strictEqual(sortYaml(actual, 1, settings), expected)
  })

  test("should ignore case when sorting", () => {
    const actual =
      'completedDate: value\n' +
      'completeTask: value'

    const expected =
      'completedDate: value\n' +
      'completeTask: value'

    const settings = new Settings()
    settings.getUseCustomSortRecursively = function () {
      return true
    }
    assert.strictEqual(sortYaml(actual, 1, settings), expected)
  })

})
