import { equal, throws } from "assert"

import { YamlOperations, formatDocuments, sortDocuments } from "../../../core/document-transformer"
import { Settings } from "../../../core/settings"
import { YamlUtil } from "../../../core/yaml-util"

/**
 * Real yaml operations, except that sorting fails for every document containing the marker.
 */
const failingSortFor = (marker: string): YamlOperations => {
  const yamlutil = new YamlUtil()
  const original = yamlutil.sortYaml.bind(yamlutil)
  yamlutil.sortYaml = (text: string, customSort?: number) => {
    if (text.includes(marker)) {
      throw new Error(`cannot sort ${marker}`)
    }
    return original(text, customSort)
  }
  return yamlutil
}

suite("Test DocumentTransformer - sortDocuments()", () => {
  test("should sort every document and keep the delimiters", () => {
    const text = "---\nb: 1\na: 2\n---\nd: 1\nc: 2"

    equal(sortDocuments(text, { customSort: 0, isSelection: false }), "---\na: 2\nb: 1\n---\nc: 2\nd: 1")
  })

  test("should not add leading dashes to a selection", () => {
    equal(sortDocuments("b: 1\na: 2", { customSort: 0, isSelection: true }), "a: 2\nb: 1")
  })

  test("should throw on invalid yaml", () => {
    throws(() => sortDocuments("a: [", { customSort: 0, isSelection: false }))
  })

  test("should throw when a selection ends with a colon", () => {
    throws(() => sortDocuments("key:", { customSort: 0, isSelection: true }), /YAML selection is invalid/)
  })
})

suite("Test DocumentTransformer - sortDocuments() when a document cannot be sorted", () => {
  test("should throw instead of dropping the failing document", () => {
    const text = "---\nb: 1\na: 2\n---\nfail: 1\nc: 2\n---\ne: 1\nd: 2"

    throws(() => sortDocuments(text, { customSort: 0, isSelection: false }, failingSortFor("fail")), /cannot sort fail/)
  })

  test("should throw instead of returning an empty text for a selection", () => {
    // an empty result would replace the selection with nothing
    throws(() => sortDocuments("  fail: 1\n  a: 2", { customSort: 0, isSelection: true }, failingSortFor("fail")), /cannot sort fail/)
  })
})

suite("Test DocumentTransformer - sortDocuments() with an indented selection (#53)", () => {
  test("should sort an indented selection and keep its indentation", () => {
    equal(sortDocuments("  b: 1\n  a: 2", { customSort: 0, isSelection: true }), "  a: 2\n  b: 1")
  })

  test("should sort an indented selection with nested keys", () => {
    const text = "  b:\n    y: 1\n    x: 2\n  a: 3"

    equal(sortDocuments(text, { customSort: 0, isSelection: true }), "  a: 3\n  b:\n    x: 2\n    'y': 1")
  })

  test("should sort the keys of indented list items", () => {
    const text = "    - type: angular\n      style: powerline\n    - type: aws\n      background: orange"

    equal(
      sortDocuments(text, { customSort: 0, isSelection: true }),
      "    - style: powerline\n      type: angular\n    - background: orange\n      type: aws"
    )
  })

  test("should keep a comment of an indented selection above its key", () => {
    const text = "  b: 1\n  # about a\n  a: 2"

    equal(sortDocuments(text, { customSort: 0, isSelection: true }), "  # about a\n  a: 2\n  b: 1")
  })
})

suite("Test DocumentTransformer - delimiters and directives", () => {
  const sort = (text: string, yaml?: YamlOperations) => sortDocuments(text, { customSort: 0, isSelection: false }, yaml)

  test("should add exactly one leading delimiter to several documents without one", () => {
    equal(sort("b: 1\n---\nd: 1\nc: 2"), "---\nb: 1\n---\nc: 2\nd: 1")
  })

  test("should keep every delimiter with its comment in front of its own document", () => {
    const text = "--- # first\nb: 1\n--- # second\nd: 1\nc: 2"

    equal(sort(text), "--- # first\nb: 1\n--- # second\nc: 2\nd: 1")
  })

  test("should drop only the leading delimiter when useLeadingDashes is false", () => {
    const yamlutil = new YamlUtil()
    yamlutil.settings.useLeadingDashes = false

    equal(sort("--- # first\nb: 1\n--- # second\nd: 1\nc: 2", yamlutil), "b: 1\n--- # second\nc: 2\nd: 1")
  })

  test("should keep an empty document", () => {
    equal(sort("---\n---\nb: 1\na: 2"), "---\n---\na: 2\nb: 1")
  })

  test("should keep yaml directives in front of the first document", () => {
    equal(sort("%YAML 1.2\n---\nb: 1\na: 2"), "%YAML 1.2\n---\na: 2\nb: 1")
  })

  test("should keep yaml directives when useLeadingDashes is false, because they require a delimiter", () => {
    const yamlutil = new YamlUtil()
    yamlutil.settings.useLeadingDashes = false

    equal(sort("%YAML 1.2\n---\nb: 1\n---\nd: 1\nc: 2", yamlutil), "%YAML 1.2\n---\nb: 1\n---\nc: 2\nd: 1")
  })

  test("should keep the delimiters of a selection as they are", () => {
    equal(sortDocuments("b: 1\n---\nd: 1\nc: 2", { customSort: 0, isSelection: true }), "b: 1\n---\nc: 2\nd: 1")
  })

  test("should format several documents without a leading delimiter", () => {
    equal(formatDocuments("b:   1\n---\na:   2"), "---\nb: 1\n---\na: 2")
  })
})

suite("Test DocumentTransformer - formatDocuments()", () => {
  test("should format every document and keep the delimiters", () => {
    equal(formatDocuments("---\nkey1:   value\n---\nkey2:   value"), "---\nkey1: value\n---\nkey2: value")
  })

  test("should throw on invalid yaml instead of dropping the document", () => {
    throws(() => formatDocuments("---\nkey1: value\n---\nkey2: [value"))
  })
})

suite("Test DocumentTransformer - injected settings", () => {
  test("should validate with the schema of the injected settings", () => {
    const settings = new Settings()
    settings.schema = Settings.getJsYamlSchemaFromString("CLOUDFORMATION_SCHEMA")

    equal(sortDocuments("b: !Ref x\na: 1", { customSort: 0, isSelection: false }, new YamlUtil(settings)), "---\na: 1\nb: !Ref x")
  })
})
