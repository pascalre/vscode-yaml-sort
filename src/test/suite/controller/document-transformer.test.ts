import { equal, throws } from "assert"

import { formatDocuments, sortDocuments } from "../../../controller/document-transformer"

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

suite("Test DocumentTransformer - formatDocuments()", () => {
  test("should format every document and keep the delimiters", () => {
    equal(formatDocuments("---\nkey1:   value\n---\nkey2:   value"), "---\nkey1: value\n---\nkey2: value")
  })
})
