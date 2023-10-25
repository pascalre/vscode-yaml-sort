import { equal } from "assert"

import { OctalProcessor } from "../../../processor/octal-processor"

suite("Test OctalProcessor - preprocess()", () => {
  test("should find one octal values", () => {
    const text = "key: 0644"
    const octalprocessor = new OctalProcessor(text)

    octalprocessor.preprocess()

    equal(octalprocessor.store.size, 1)
    equal(octalprocessor.store.get("vscode-yaml-sort.octal.0"), "0644")
  })

  test("should find multiple octal values", () => {
    const text =
      "key: 0644\n" +
      "key2:\n" +
      "  x: 0655\n" +
      "  y: 065574\n" +
      "  z: 0123"
    const octalprocessor = new OctalProcessor(text)

    octalprocessor.preprocess()

    equal(octalprocessor.store.size, 3)
    equal(octalprocessor.store.get("vscode-yaml-sort.octal.0"), "0644")
    equal(octalprocessor.store.get("vscode-yaml-sort.octal.1"), "0655")
    equal(octalprocessor.store.get("vscode-yaml-sort.octal.2"), "0123")
  })



  test("GitHub issue #159: Sort YAML converts 00000000-0000-0000-0000-000000000001 to vscode-yaml-sort.octal.00000-0000-0000-0000-000000000001", () => {
    const text =
      "game:\n" +
      "  core:\n" +
      "    shardId: 00000000-0000-0000-0000-000000000001"
    const octalprocessor = new OctalProcessor(text)

    octalprocessor.preprocess()

    equal(octalprocessor.store.size, 0)
  })
})