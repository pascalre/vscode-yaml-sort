import { equal } from "assert"

import { spy } from "sinon"

import { ErrorReporter } from "../../vscode/error-reporter"

suite("Test ErrorReporter - handleError()", () => {
  test("when input is of type error, should execute showMessage function", () => {
    const errorReporter = new ErrorReporter()
    const spyObject = spy(errorReporter.vsCodeAdapter, "showMessage")

    errorReporter.handleError("no error")
    equal(spyObject.called, false)

    errorReporter.handleError(new Error())
    equal(spyObject.called, true)
  })
})