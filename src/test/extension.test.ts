//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { sortYaml, validateYaml } from '../extension';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    let unsortedYaml = "persons:\n  bob:\n    age: 23\n    place: Germany\n  alice:\n    place: Germany\n    age: 21\nanimals:\n  kitty:\n    age: 3";
    let sortedYaml = "animals:\n  kitty:\n    age: 3\npersons:\n  alice:\n    age: 21\n    place: Germany\n  bob:\n    age: 23\n    place: Germany\n";
    test("Test 1: YAML should be sorted.", function() {
        assert.equal(sortYaml(unsortedYaml), sortedYaml);
    });

    test("Test 2: YAML is valid.", function() {
      assert.equal(validateYaml(unsortedYaml), true);
    });

    test("Test 3: Validation checks indentation.", function() {
      assert.equal(validateYaml("person:\nbob\n  age:23"), false);
    });

    test("Test 4: Validation checks duplicate keys.", function() {
      assert.equal(validateYaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n"), false);
    });

    let yamlWithoutLineBreakAfter500Chars = "- lorem ipsum:\n    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e'";
    let yamlWithLineBreakAfter500Chars = "- lorem ipsum:\n    text: >-\n      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo\n      dolores et e\n";
    test("Test 5: Maximum line width of 500.", function() {
      assert.equal(sortYaml(yamlWithoutLineBreakAfter500Chars), yamlWithLineBreakAfter500Chars);
    });

    let unsortedConfigMap = "data:\n  selector:\n    matchLabels:\n      tier: mysql\n      app: wordpress\n\napiVersion: v1\n\nkind: Deployment\nmetadata:\n  labels:\n    app: noc-configmap\n  name: noc-configmap\nspec:\n  selector:\n    matchLabels:\n      app: wordpress\n      tier: mysql\n";
    let sortedConfigMap = "apiVersion: v1\nkind: Deployment\nmetadata: \n  labels:\n    app: noc-configmap\n  name: noc-configmap\nspec: \n  selector:\n    matchLabels:\n      app: wordpress\n      tier: mysql\ndata: \n  selector:\n    matchLabels:\n      app: wordpress\n      tier: mysql\n";
    test("Test 6: Sort Configmap.", function() {
      assert.equal(sortYaml(unsortedConfigMap, true), sortedConfigMap);
    });


});