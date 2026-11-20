import { equal, match } from "assert"

import { HelmProcessor } from "../../../../core/processor/helm-processor"

suite("Test HelmProcessor - preprocess()", () => {
  test("should replace all helm values", () => {
    const text =
      "apiVersion: keycloak.org/v1alpha1\n" +
      "kind: KeycloakClient\n" +
      "metadata:\n" +
      "labels:\n" +
      "app: clientsso\n" +
      "name: {{ .Values.ui.environment.keycloakClientId }}\n" +
      "namespace: {{ required 'Keycloak namespace required' .Values.keycloak.namespace }}\n"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.preprocess()

    equal(helmprocessor.store.size, 2)
    equal(helmprocessor.store.get("vscode-yaml-sort.helm.0"), "{{ .Values.ui.environment.keycloakClientId }}")
    equal(helmprocessor.store.get("vscode-yaml-sort.helm.1"), "{{ required 'Keycloak namespace required' .Values.keycloak.namespace }}")
  })
})

suite("Test HelmProcessor - createSubstitute()", () => {
  test("should store each value under a consecutive substitute", () => {
    const helmprocessor = new HelmProcessor("")

    equal(helmprocessor.createSubstitute("{{ .a }}"), "vscode-yaml-sort.helm.0")
    equal(helmprocessor.createSubstitute("{{ .b }}"), "vscode-yaml-sort.helm.1")

    equal(helmprocessor.store.size, 2)
    equal(helmprocessor.store.get("vscode-yaml-sort.helm.0"), "{{ .a }}")
    equal(helmprocessor.store.get("vscode-yaml-sort.helm.1"), "{{ .b }}")
  })
})

suite("Test HelmProcessor - preprocess() keeps surrounding text", () => {
  test("should keep trailing newline character", () => {
    const helmprocessor = new HelmProcessor("foo: {{ .bar }}\n")

    helmprocessor.preprocess()

    equal(helmprocessor.text, "foo: vscode-yaml-sort.helm.0\n")
  })
})

suite("Test HelmProcessor - postprocess()", () => {
  test("text should be the same before preprocessing and after postprocessing", () => {
    const text =
      "apiVersion: keycloak.org/v1alpha1\n" +
      "kind: KeycloakClient\n" +
      "metadata:\n" +
      "labels:\n" +
      "app: clientsso\n" +
      "name: {{ .Values.ui.environment.keycloakClientId }}\n" +
      "namespace: {{ required 'Keycloak namespace required' .Values.keycloak.namespace }}\n"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.preprocess()

    match(helmprocessor.text, /vscode-yaml-sort.helm/)

    helmprocessor.postprocess()

    equal(helmprocessor.text, text)
  })
})

suite("Test HelmProcessor - replaceSubstituteWithValue()", () => {
  test("should replace substitute with optional quotation marks", () => {
    const text = 
      "key1: 'vscode-yaml-sort.helm.0'\n" +
      "key2: \"vscode-yaml-sort.helm.1\"\n" +
      "key3: vscode-yaml-sort.helm.2"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.0", "test0")
    helmprocessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.1", "test1")
    helmprocessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.2", "test2")

    const expected = 
      "key1: test0\n" +
      "key2: test1\n" +
      "key3: test2"

    equal(helmprocessor.text, expected)
  })
})

suite("Test HelmProcessor - GitHub issue #130", () => {
  test("preprocess should keep the quotation marks of a quoted helm value in the store", () => {
    const text = "section:\n  label: '{{''$''}}'"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.preprocess()

    equal(helmprocessor.store.size, 1)
    equal(helmprocessor.store.get("vscode-yaml-sort.helm.0"), "'{{''$''}}'")
    equal(helmprocessor.text, "section:\n  label: vscode-yaml-sort.helm.0")
  })

  test("postprocess should restore a quoted helm value containing a dollar sign", () => {
    const text = "section:\n  label: '{{''$''}}'"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.preprocess()
    helmprocessor.postprocess()

    equal(helmprocessor.text, text)
  })
})
suite("Test HelmProcessor - GitHub issue #283", () => {
  test("should keep double quotes around a helm value", () => {
    const text = "foo: \"{{ .Fighters}}\""
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.preprocess()
    helmprocessor.postprocess()

    equal(helmprocessor.text, text)
  })
})
