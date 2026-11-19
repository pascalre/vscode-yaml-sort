import { equal } from "assert"

import { HelmProcessor } from "../../../processor/helm-processor"

suite("Test GenericProcessor - replaceSubstituteWithValue()", () => {
  test("GitHub issue #154: Ensure a substitue is surrounded with the same quotation marks", () => {
    const text = "TABLE_SOURCES: 'vscode-yaml-sort.helm.0 TABLE'"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.0", "{{ LEVEL }}")

    const expected = "TABLE_SOURCES: '{{ LEVEL }} TABLE'"

    equal(helmprocessor.text, expected)
  })

  test("GitHub issue #130: dollar signs in a value must not be interpreted as replacement patterns", () => {
    const text = "label: vscode-yaml-sort.helm.0"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.0", "{{''$''}}")

    const expected = "label: {{''$''}}"

    equal(helmprocessor.text, expected)
  })
})

suite("Test GenericProcessor - substitutes with more than ten matches", () => {
  test("postprocess restores every value at its own key when more than ten substitutes exist", () => {
    // vscode-yaml-sort.helm.1 must not match the prefix of vscode-yaml-sort.helm.10 or .11
    const lines = Array.from({ length: 12 }, (_, i) => `key${i}: "{{ .Values.value${i} }}"`)
    const helmprocessor = new HelmProcessor(lines.join("\n"))

    helmprocessor.preprocess()
    // simulate sorting, which moves the higher substitutes in front of the lower ones
    helmprocessor.text = helmprocessor.text.split("\n").reverse().join("\n")
    helmprocessor.postprocess()

    equal(helmprocessor.text, [...lines].reverse().join("\n"))
  })
})
