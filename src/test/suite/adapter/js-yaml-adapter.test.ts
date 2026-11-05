import { equal, throws } from "assert"

import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import { CORE_SCHEMA, YAMLException } from "js-yaml"

import { JsYamlAdapter } from "../../../adapter/js-yaml-adapter"
import { Settings } from "../../../settings"

suite("Test JsYamlAdapter - validateYaml()", () => {
  const jsyamladapter = new JsYamlAdapter(new Settings())

  test("when text is a valid yaml document should return true", () => {
    const actual =
      "persons:\n" +
      "  bob:\n" +
      "    place: Germany\n" +
      "    age: 23\n" +
      "animals:\n" +
      "  kitty:\n" +
      "    age: 3"

    equal(jsyamladapter.validateYaml(actual), true)
  })

  test("when text are two seperated valid yaml documents should return true", () => {
    const actual =
      "persons:\n" +
      "  bob:\n" +
      "    place: Germany\n" +
      "    age: 23\n" +
      "---\n" +
      "animals:\n" +
      "  kitty:\n" +
      "    age: 3"

    equal(jsyamladapter.validateYaml(actual), true)
  })

  test("when text is an invalid yaml document should throw YAMLException", () => {
    const actual = "network: ethernets:"

    throws(() => jsyamladapter.validateYaml(actual), YAMLException)
  })
  test("when indentation is not correct should throw YAMLException", () => {
    const actual = 
      "person:\n" +
      "bob\n" +
      "  age:23"

    throws(() => jsyamladapter.validateYaml(actual), YAMLException)
  })
  test("when text contains duplicate key should throw YAMLException", () => {
    const actual = 
      "person:\n" +
      "  bob:\n" +
      "    age: 23\n" +
      "  bob:\n" +
      "    age: 25"

    throws(() => jsyamladapter.validateYaml(actual), YAMLException)
  })
  test("when text is a yaml document using CLOUDFORMATION_SCHEMA and schema is CORE_SCHEMA should throw YAMLException", () => {
    const actual = "RoleName: !Sub \"AdministratorAccess\""
    jsyamladapter.settings.getSchema = function () {
      return CORE_SCHEMA
    }

    throws(() => jsyamladapter.validateYaml(actual), YAMLException)
  })
  test("when text is a yaml document using CLOUDFORMATION_SCHEMA and schema is CLOUDFORMATION_SCHEMA should return true", () => {
    const actual = "RoleName: !Sub \"AdministratorAccess\""
    jsyamladapter.settings.getSchema = function () {
      return CLOUDFORMATION_SCHEMA
    }
    
    equal(jsyamladapter.validateYaml(actual), true)
  })
  test("when text is a yaml document using HOMEASSISTANT_SCHEMA and schema is CORE_SCHEMA should throw YAMLException", () => {
    const actual = "password: !env_var PASSWORD default_password"
    jsyamladapter.settings.getSchema = function () {
      return CORE_SCHEMA
    }

    throws(() => jsyamladapter.validateYaml(actual), YAMLException)
  })
  test("when text is a yaml document using HOMEASSISTANT_SCHEMA and schema is HOMEASSISTANT_SCHEMA should return true", () => {
    const actual = "password: !env_var PASSWORD default_password"
    jsyamladapter.settings.getSchema = function () {
      return HOMEASSISTANT_SCHEMA
    }

    equal(jsyamladapter.validateYaml(actual), true)
  })
})

suite("Test JsYamlAdapter - dumpYaml() with setting nullStyle", () => {
  const doc = { ValidFrom: null }
  // js-yaml writes an empty null value as 'key: ' (with a trailing space)
  const cases: [string, string][] = [
    ["lowercase", "ValidFrom: null"],
    ["canonical", "ValidFrom: ~"],
    ["uppercase", "ValidFrom: NULL"],
    ["camelcase", "ValidFrom: Null"],
    ["empty", "ValidFrom: "]
  ]

  cases.forEach(([style, expected]) => {
    test(`when nullStyle is '${style}' should print '${expected.replace("ValidFrom: ", "")}'`, () => {
      const settings = new Settings()
      settings.nullStyle = style
      equal(new JsYamlAdapter(settings).dumpYaml(doc, true, 0), expected)
    })
  })
})
