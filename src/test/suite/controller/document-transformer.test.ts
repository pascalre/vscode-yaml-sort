import { equal, throws } from "assert"

import { YamlOperations, formatDocuments, sortDocuments } from "../../../controller/document-transformer"
import { YamlUtil } from "../../../util/yaml-util"

/**
 * Real yaml operations, except that sorting fails for every document containing the marker.
 */
const failingSortFor = (marker: string): YamlOperations => {
  const yamlutil = new YamlUtil()
  const original = yamlutil.sortYaml.bind(yamlutil)
  yamlutil.sortYaml = (text: string, customSort?: number) => (text.includes(marker) ? null : original(text, customSort))
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
  test("should return null instead of dropping the failing document", () => {
    const text = "---\nb: 1\na: 2\n---\nfail: 1\nc: 2\n---\ne: 1\nd: 2"

    equal(sortDocuments(text, { customSort: 0, isSelection: false }, failingSortFor("fail")), null)
  })

  test("should return null instead of an empty text for a selection", () => {
    // an empty result would replace the selection with nothing
    equal(sortDocuments("  fail: 1\n  a: 2", { customSort: 0, isSelection: true }, failingSortFor("fail")), null)
  })
})

suite("Test DocumentTransformer - formatDocuments()", () => {
  test("should format every document and keep the delimiters", () => {
    equal(formatDocuments("---\nkey1:   value\n---\nkey2:   value"), "---\nkey1: value\n---\nkey2: value")
  })
})
