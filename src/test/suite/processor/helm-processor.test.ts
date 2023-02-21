import { equal, match } from "assert"

import { HelmProcessor } from "../../../processor/helm-processor"

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

suite("Test HelmProcessor - findMatches()", () => {
  test("should return all matches of helm values", () => {
    const text =
      "apiVersion: keycloak.org/v1alpha1\n" +
      "kind: KeycloakClient\n" +
      "metadata:\n" +
      "labels:\n" +
      "app: clientsso\n" +
      "name: {{ .Values.ui.environment.keycloakClientId }}\n" +
      "namespace: {{ required 'Keycloak namespace required' .Values.keycloak.namespace }}\n"
    const helmprocessor = new HelmProcessor(text)
    const helmValues = helmprocessor.findMatches()

    equal(helmValues?.length, 2)
    equal(helmValues?.at(0), "{{ .Values.ui.environment.keycloakClientId }}")
    equal(helmValues?.at(1), "{{ required 'Keycloak namespace required' .Values.keycloak.namespace }}")
  })
})

suite("Test HelmProcessor - replaceValueWithSubstitue()", () => {
  test("should replace first match", () => {
    const text =
      "foo: bar\n" +
      "bar: baz\n" +
      "baz: foo2"
    const helmprocessor = new HelmProcessor(text)

    equal(helmprocessor.store.size, 0)

    helmprocessor.replaceValueWithSubstitue("bar")

    equal(helmprocessor.store.size, 1)
    match(helmprocessor.text, /foo: vscode-yaml-sort.helm.0/)

    helmprocessor.replaceValueWithSubstitue("baz")
    helmprocessor.replaceValueWithSubstitue("foo2")

    equal(helmprocessor.store.size, 3)

    const expected =
      "foo: vscode-yaml-sort.helm.0\n" +
      "bar: vscode-yaml-sort.helm.1\n" +
      "baz: vscode-yaml-sort.helm.2"

    equal(helmprocessor.text, expected)
  })
  test("should keep trailing newline character", () => {
    const text = "foo: bar\n"
    const helmprocessor = new HelmProcessor(text)

    helmprocessor.replaceValueWithSubstitue("bar")

    const expected = "foo: vscode-yaml-sort.helm.0\n"

    equal(helmprocessor.text, expected)
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
