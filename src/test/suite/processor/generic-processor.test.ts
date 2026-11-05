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
