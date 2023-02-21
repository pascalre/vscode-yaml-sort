import { equal } from "assert"

import { OctalProcessor } from "../../../processor/octal-processor"

suite("Test OctalProcessor - preprocess()", () => {
  test("should find all octal values", () => {
    const text = "key: 0644"
    const octalprocessor = new OctalProcessor(text)

    octalprocessor.preprocess()

    equal(octalprocessor.store.size, 1)
    equal(octalprocessor.store.get("vscode-yaml-sort.octal.0"), "0644")
  })
})