import * as assert from "assert"
import * as jsyaml from "js-yaml"
import { Settings } from "../../settings"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"

suite("Test Settings - getter", () => {
    const settings: Settings = new Settings();

    test("default value of customSortKeywords_1 is set to `['apiVersion', 'kind', 'metadata', 'spec', 'data']`", () => {
        assert.deepEqual(settings.getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
    })

    test("default value of customSortKeywords_2 is set to `[]`", () => {
        assert.deepEqual(settings.getCustomSortKeywords(2), [])
    })

    test("default value of customSortKeywords_3 is set to `[]`", () => {
        assert.deepEqual(settings.getCustomSortKeywords(3), [])
    })

    test("default value of emptyLinesUntilLevel is set to `0`", () => {
        assert.deepEqual(settings.getEmptyLinesUntilLevel(), 0)
    })

    test("default value of forceQuotes is set to `false`", () => {
        assert.deepEqual(settings.getForceQuotes(), false)
    })

    test("default value of indent is set to `2`", () => {
        assert.deepEqual(settings.getIndent(), 2)
    })

    test("default value of lineWidth is set to `500`", () => {
        assert.deepEqual(settings.getLineWidth(), 500)
    })

    test("default value of locale is set to `en`", () => {
        assert.deepEqual(settings.getLocale(), "en")
    })

    test("default value of noArrayIndent is set to `false`", () => {
        assert.deepEqual(settings.getNoArrayIndent(), false)
    })

    test("default value of noCompatMode is set to `false`", () => {
        assert.deepEqual(settings.getNoCompatMode(), false)
    })

    test("default value of notifySuccess is set to `true`", () => {
        assert.deepEqual(settings.getNotifySuccess(), true)
    })

    test("default value of quotingType is set to `'`", () => {
        assert.deepEqual(settings.getQuotingType(), "'")
    })

    test("default value of schema is set to `DEFAULT_SCHEMA`", () => {
        assert.deepEqual(settings.getSchema(), jsyaml.DEFAULT_SCHEMA)
    })

    test("default value of useCustomSortRecursively is set to `false`", () => {
        assert.deepEqual(settings.getUseCustomSortRecursively(), false)
    })

    test("default value of useLeadingDashes is set to `true`", () => {
        assert.deepEqual(settings.getUseLeadingDashes(), true)
    })
})

suite("Test Settings - getCustomSortKeywords()", () => {
    const settings: Settings = new Settings()

    test("when index is not in [1, 2, 3] return `[]`", () => {
        assert.deepEqual(settings.getCustomSortKeywords(0), [])
    })
})

suite("Test Settings - getJsYamlSchemaFromString()", () => {
    const settings: Settings = new Settings()

    test("when `HOMEASSISTANT_SCHEMA` is input return HOMEASSISTANT_SCHEMA", () => {
        assert.deepEqual(settings.getJsYamlSchemaFromString("HOMEASSISTANT_SCHEMA"), HOMEASSISTANT_SCHEMA as jsyaml.Schema)
    })

    test("when `CLOUDFORMATION_SCHEMA` is input return CLOUDFORMATION_SCHEMA", () => {
        assert.deepEqual(settings.getJsYamlSchemaFromString("CLOUDFORMATION_SCHEMA"), CLOUDFORMATION_SCHEMA as jsyaml.Schema)
    })

    test("when `CORE_SCHEMA` is input return jsyaml.CORE_SCHEMA", () => {
        assert.deepEqual(settings.getJsYamlSchemaFromString("CORE_SCHEMA"), jsyaml.CORE_SCHEMA)
    })

    test("when `FAILSAFE_SCHEMA` is input return jsyaml.FAILSAFE_SCHEMA", () => {
        assert.deepEqual(settings.getJsYamlSchemaFromString("FAILSAFE_SCHEMA"), jsyaml.FAILSAFE_SCHEMA)
    })

    test("when `JSON_SCHEMA` is input return jsyaml.JSON_SCHEMA", () => {
        assert.deepEqual(settings.getJsYamlSchemaFromString("JSON_SCHEMA"), jsyaml.JSON_SCHEMA)
    })

    test("when a non-valid schema is input return jsyaml.DEFAULT_SCHEMA", () => {
        assert.deepEqual(settings.getJsYamlSchemaFromString("DEFAULT_SCHEMA"), jsyaml.DEFAULT_SCHEMA)
    })
})