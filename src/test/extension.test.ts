//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module "assert" provides assertion methods from node
import * as assert from "assert";
import { sortYaml, validateYaml } from "../extension";

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

  const unsortedYaml = `\
persons:
  bob:
    age: 23
    place: Germany
  alice:
    place: Germany
    age: 21
animals:
  kitty:
    age: 3
`;
  const sortedYaml = `\
animals:
  kitty:
    age: 3
persons:
  alice:
    age: 21
    place: Germany
  bob:
    age: 23
    place: Germany
`;
  test("Test 1: YAML should be sorted.", () => {
      assert.equal(sortYaml(unsortedYaml), sortedYaml);
  });

  test("Test 2: YAML is valid.", () => {
    assert.equal(validateYaml(unsortedYaml), true);
  });

  test("Test 3: Validation checks indentation.", () => {
    assert.equal(validateYaml("person:\nbob\n  age:23"), false);
  });

  test("Test 4: Validation checks duplicate keys.", () => {
    assert.equal(validateYaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n"), false);
  });

  const yamlWithoutLineBreakAfter500Chars = `\
- lorem ipsum:
    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut \
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea \
rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor \
sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna \
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e'
`;
  const yamlWithLineBreakAfter500Chars = `\
- lorem ipsum:
    text: >-
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut \
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et \
ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor \
sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna \
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
      dolores et e
`;
  test("Test 5: Maximum line width of 500.", () => {
    assert.equal(sortYaml(yamlWithoutLineBreakAfter500Chars), yamlWithLineBreakAfter500Chars);
  });

  const unsortedConfigMap = `\
data:
  selector:
    matchLabels:
      tier: mysql
      app: wordpress

apiVersion: v1

kind: Deployment
metadata:
  labels:
    app: noc-configmap
  name: noc-configmap
spec:
  selector:
    matchLabels:
      app: wordpress
      tier: mysql
`;
  const sortedConfigMap = `\
apiVersion: v1
kind: Deployment
metadata: 
  labels:
    app: noc-configmap
  name: noc-configmap
spec: 
  selector:
    matchLabels:
      app: wordpress
      tier: mysql
data: 
  selector:
    matchLabels:
      app: wordpress
      tier: mysql
`;
  test("Test 6: Sort Configmap.", () => {
    assert.equal(sortYaml(unsortedConfigMap, true), sortedConfigMap);
  });

});
