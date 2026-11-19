import { deepEqual } from "assert"

import { splitDocuments } from "../../../util/yaml-text"

suite("Test splitDocuments()", () => {
  test("should return a single document without delimiter when the text contains no `---`", () => {
    deepEqual(splitDocuments("- Orange\n- Apple"), { directives: "", documents: [{ content: "- Orange\n- Apple" }] })
  })

  test("should keep the leading delimiter with the first document", () => {
    deepEqual(splitDocuments("---\n- Orange"), { directives: "", documents: [{ delimiter: "---", content: "- Orange" }] })
  })

  test("should keep every delimiter including its comment with its own document", () => {
    deepEqual(splitDocuments("--- # one\na: 1\n--- text\nb: 2"), {
      directives: "",
      documents: [
        { delimiter: "--- # one", content: "a: 1\n" },
        { delimiter: "--- text", content: "b: 2" },
      ],
    })
  })

  test("should return a first document without delimiter when the text does not start with `---`", () => {
    deepEqual(splitDocuments("a: 1\n---\nb: 2").documents, [{ content: "a: 1\n" }, { delimiter: "---", content: "b: 2" }])
  })

  test("should keep an empty document", () => {
    deepEqual(splitDocuments("---\n---\na: 1").documents, [{ delimiter: "---", content: "" }, { delimiter: "---", content: "a: 1" }])
  })

  test("should return directives separately from the documents", () => {
    deepEqual(splitDocuments("%YAML 1.2\n%TAG ! tag:example.com,2000:\n---\na: 1"), {
      directives: "%YAML 1.2\n%TAG ! tag:example.com,2000:\n",
      documents: [{ delimiter: "---", content: "a: 1" }],
    })
  })
})
