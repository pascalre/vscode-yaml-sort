import { deepEqual, equal } from "assert"

import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { HOMEASSISTANT_SCHEMA } from "homeassistant-js-yaml-schema"
import { CORE_SCHEMA, DEFAULT_SCHEMA, FAILSAFE_SCHEMA, JSON_SCHEMA, Schema} from "js-yaml"

import { Settings } from "../../settings"

suite("Test Settings - getter", () => {
    const settings: Settings = new Settings();

    test("default value of customSortKeywords_1 is set to `['apiVersion', 'kind', 'metadata', 'spec', 'data']`", () => {
        deepEqual(settings.getCustomSortKeywords(1), ["apiVersion", "kind", "metadata", "spec", "data"])
    })

    test("default value of customSortKeywords_2 is set to `[]`", () => {
        deepEqual(settings.getCustomSortKeywords(2), [])
    })

    test("default value of customSortKeywords_3 is set to `[]`", () => {
        deepEqual(settings.getCustomSortKeywords(3), [])
    })

    test("default value of emptyLinesUntilLevel is set to `0`", () => {
        deepEqual(settings.emptyLinesUntilLevel, 0)
    })

    test("default value of forceQuotes is set to `false`", () => {
        deepEqual(settings.forceQuotes, false)
    })

    test("default value of indent is set to `2`", () => {
        deepEqual(settings.indent, 2)
    })

    test("default value of lineWidth is set to `500`", () => {
        deepEqual(settings.lineWidth, 500)
    })

    test("default value of locale is set to `en`", () => {
        deepEqual(settings.locale, "en")
    })

    test("default value of noArrayIndent is set to `false`", () => {
        deepEqual(settings.noArrayIndent, false)
    })

    test("default value of noCompatMode is set to `false`", () => {
        deepEqual(settings.noCompatMode, false)
    })

    test("default value of notifySuccess is set to `true`", () => {
        deepEqual(settings.notifySuccess, true)
    })

    test("default value of quotingType is set to `'`", () => {
        deepEqual(settings.getQuotingType(), "'")
    })

    test("default value of schema is set to `DEFAULT_SCHEMA`", () => {
        deepEqual(settings.getSchema(), DEFAULT_SCHEMA)
    })

    test("default value of sortOnSave is set to `0`", () => {
        deepEqual(settings.sortOnSave, 0)
    })

    test("default value of useCustomSortRecursively is set to `false`", () => {
        deepEqual(settings.useCustomSortRecursively, false)
    })

    test("default value of useLeadingDashes is set to `true`", () => {
        deepEqual(settings.useLeadingDashes, true)
    })
})

suite("Test Settings - getCustomSortKeywords()", () => {
    const settings: Settings = new Settings()

    test("when index is not in [1, 2, 3] return `[]`", () => {
        deepEqual(settings.getCustomSortKeywords(0), [])
    })
})

suite("Test Settings - getJsYamlSchemaFromString()", () => {
    test("when `HOMEASSISTANT_SCHEMA` is input return HOMEASSISTANT_SCHEMA", () => {
        deepEqual(Settings.getJsYamlSchemaFromString("HOMEASSISTANT_SCHEMA"), HOMEASSISTANT_SCHEMA as Schema)
    })

    test("when `CLOUDFORMATION_SCHEMA` is input return CLOUDFORMATION_SCHEMA", () => {
        deepEqual(Settings.getJsYamlSchemaFromString("CLOUDFORMATION_SCHEMA"), CLOUDFORMATION_SCHEMA as Schema)
    })

    test("when `CORE_SCHEMA` is input return CORE_SCHEMA", () => {
        deepEqual(Settings.getJsYamlSchemaFromString("CORE_SCHEMA"), CORE_SCHEMA)
    })

    test("when `FAILSAFE_SCHEMA` is input return FAILSAFE_SCHEMA", () => {
        deepEqual(Settings.getJsYamlSchemaFromString("FAILSAFE_SCHEMA"), FAILSAFE_SCHEMA)
    })

    test("when `JSON_SCHEMA` is input return JSON_SCHEMA", () => {
        deepEqual(Settings.getJsYamlSchemaFromString("JSON_SCHEMA"), JSON_SCHEMA)
    })

    test("when a non-valid schema is input return DEFAULT_SCHEMA", () => {
        deepEqual(Settings.getJsYamlSchemaFromString("DEFAULT_SCHEMA"), DEFAULT_SCHEMA)
    })
})

suite("Test Settings - doSortOnSave()", () => {
    const settings: Settings = new Settings()

    test("when sortOnSave is 0 should return true", () => {
        settings.sortOnSave = 0
        equal(settings.doSortOnSave(), true)
    })

    test("when sortOnSave is not in 1, 2, 3 should return false", () => {
        settings.sortOnSave = -1
        equal(settings.doSortOnSave(), false)
        settings.sortOnSave = 4
        equal(settings.doSortOnSave(), false)
    })
})
