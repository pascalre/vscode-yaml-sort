import * as assert from "assert"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import jsyaml = require("js-yaml")
import { JsYamlAdapter } from "../../../adapter/js-yaml-adapter"
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
    const actual = "network: ethernets:"

    assert.throws(() => jsyamladapter.validateYaml(actual), jsyaml.YAMLException)
  })
  test("when indentation is not correct should throw YAMLException", () => {
    const actual = 
      "person:\n" +
      "bob\n" +
      "  age:23"

    assert.throws(() => jsyamladapter.validateYaml(actual), jsyaml.YAMLException)
  })
  test("when text contains duplicate key should throw YAMLException", () => {
    const actual = 
      "person:\n" +
      "  bob:\n" +
      "    age: 23\n" +
      "  bob:\n" +
      "    age: 25"

    assert.throws(() => jsyamladapter.validateYaml(actual), jsyaml.YAMLException)
  })
  test("when text is a yaml document using CLOUDFORMATION_SCHEMA and schema is CORE_SCHEMA should throw YAMLException", () => {
    const actual = "RoleName: !Sub \"AdministratorAccess\""
    jsyamladapter.settings.getSchema = function () {
      return jsyaml.CORE_SCHEMA
    }

    assert.throws(() => jsyamladapter.validateYaml(actual), jsyaml.YAMLException)
  })
  test("when text is a yaml document using CLOUDFORMATION_SCHEMA and schema is CLOUDFORMATION_SCHEMA should return true", () => {
    const actual = "RoleName: !Sub \"AdministratorAccess\""
    jsyamladapter.settings.getSchema = function () {
      return CLOUDFORMATION_SCHEMA
    }
    
    assert.strictEqual(jsyamladapter.validateYaml(actual), true)
  })
  test("when text is a yaml document using HOMEASSISTANT_SCHEMA and schema is CORE_SCHEMA should throw YAMLException", () => {
    const actual = "password: !env_var PASSWORD default_password"
    jsyamladapter.settings.getSchema = function () {
      return jsyaml.CORE_SCHEMA
    }

    assert.throws(() => jsyamladapter.validateYaml(actual), jsyaml.YAMLException)
  })
  test("when text is a yaml document using HOMEASSISTANT_SCHEMA and schema is HOMEASSISTANT_SCHEMA should return true", () => {
    const actual = "password: !env_var PASSWORD default_password"
    jsyamladapter.settings.getSchema = function () {
      return HOMEASSISTANT_SCHEMA
    }

    assert.strictEqual(jsyamladapter.validateYaml(actual), true)
  })
})

