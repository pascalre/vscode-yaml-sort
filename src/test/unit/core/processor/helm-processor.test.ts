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
    const helmProcessor = new HelmProcessor(text)

    helmProcessor.preprocess()

    equal(helmProcessor.store.size, 2)
    equal(helmProcessor.store.get("vscode-yaml-sort.helm.0"), "{{ .Values.ui.environment.keycloakClientId }}")
    equal(helmProcessor.store.get("vscode-yaml-sort.helm.1"), "{{ required 'Keycloak namespace required' .Values.keycloak.namespace }}")
  })
})

suite("Test HelmProcessor - createSubstitute()", () => {
  test("should store each value under a consecutive substitute", () => {
    const helmProcessor = new HelmProcessor("")

    equal(helmProcessor.createSubstitute("{{ .a }}"), "vscode-yaml-sort.helm.0")
    equal(helmProcessor.createSubstitute("{{ .b }}"), "vscode-yaml-sort.helm.1")

    equal(helmProcessor.store.size, 2)
    equal(helmProcessor.store.get("vscode-yaml-sort.helm.0"), "{{ .a }}")
    equal(helmProcessor.store.get("vscode-yaml-sort.helm.1"), "{{ .b }}")
  })
})

suite("Test HelmProcessor - preprocess() keeps surrounding text", () => {
  test("should keep trailing newline character", () => {
    const helmProcessor = new HelmProcessor("foo: {{ .bar }}\n")

    helmProcessor.preprocess()

    equal(helmProcessor.text, "foo: vscode-yaml-sort.helm.0\n")
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
    const helmProcessor = new HelmProcessor(text)

    helmProcessor.preprocess()

    match(helmProcessor.text, /vscode-yaml-sort.helm/)

    helmProcessor.postprocess()

    equal(helmProcessor.text, text)
  })
})

suite("Test HelmProcessor - replaceSubstituteWithValue()", () => {
  test("should replace substitute with optional quotation marks", () => {
    const text = 
      "key1: 'vscode-yaml-sort.helm.0'\n" +
      "key2: \"vscode-yaml-sort.helm.1\"\n" +
      "key3: vscode-yaml-sort.helm.2"
    const helmProcessor = new HelmProcessor(text)

    helmProcessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.0", "test0")
    helmProcessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.1", "test1")
    helmProcessor.replaceSubstituteWithValue("vscode-yaml-sort.helm.2", "test2")

    const expected = 
      "key1: test0\n" +
      "key2: test1\n" +
      "key3: test2"

    equal(helmProcessor.text, expected)
  })
})

suite("Test HelmProcessor - GitHub issue #130", () => {
  test("preprocess should keep the quotation marks of a quoted helm value in the store", () => {
    const text = "section:\n  label: '{{''$''}}'"
    const helmProcessor = new HelmProcessor(text)

    helmProcessor.preprocess()

    equal(helmProcessor.store.size, 1)
    equal(helmProcessor.store.get("vscode-yaml-sort.helm.0"), "'{{''$''}}'")
    equal(helmProcessor.text, "section:\n  label: vscode-yaml-sort.helm.0")
  })

  test("postprocess should restore a quoted helm value containing a dollar sign", () => {
    const text = "section:\n  label: '{{''$''}}'"
    const helmProcessor = new HelmProcessor(text)

    helmProcessor.preprocess()
    helmProcessor.postprocess()

    equal(helmProcessor.text, text)
  })
})
suite("Test HelmProcessor - GitHub issue #283", () => {
  test("should keep double quotes around a helm value", () => {
    const text = "foo: \"{{ .Fighters}}\""
    const helmProcessor = new HelmProcessor(text)

    helmProcessor.preprocess()
    helmProcessor.postprocess()

    equal(helmProcessor.text, text)
  })
})
