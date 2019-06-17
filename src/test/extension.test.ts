//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { sort_yaml, validate_yaml } from '../extension';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    let unsorted_yaml = "persons:\n  bob:\n    age: 23\n    place: Germany\n  alice:\n    place: Germany\n    age: 21\nanimals:\n  kitty:\n    age: 3";
    let sorted_yaml = "animals:\n  kitty:\n    age: 3\npersons:\n  alice:\n    age: 21\n    place: Germany\n  bob:\n    age: 23\n    place: Germany\n";
    test("Test 1: YAML should be sorted.", function() {
        assert.equal(sort_yaml(unsorted_yaml), sorted_yaml);
    });

    test("Test 2: YAML is valid.", function() {
      assert.equal(validate_yaml(unsorted_yaml), true);
    });

    test("Test 3: Validation checks indentation.", function() {
      assert.equal(validate_yaml("person:\nbob\n  age:23"), false);
    });

    test("Test 4: Validation checks duplicate keys.", function() {
      assert.equal(validate_yaml("person:\n  bob:\n    age: 23\n  bob:\n    age: 25\n"), false);
    });

    let yaml_without_line_break_after_500_chars = "- lorem ipsum:\n    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e'";
    let yaml_with_line_break_after_500_chars = "- lorem ipsum:\n    text: >-\n      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo\n      dolores et e\n";
    test("Test 5: Maximum line with of 500.", function() {
      assert.equal(sort_yaml(yaml_without_line_break_after_500_chars), yaml_with_line_break_after_500_chars);
    });
});