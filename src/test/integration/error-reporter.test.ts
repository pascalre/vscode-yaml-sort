import { deepEqual } from "assert"

import { spy } from "sinon"

import { ErrorReporter } from "../../vscode/error-reporter"
import { Severity } from "../../vscode/vs-code-adapter"

suite("Test ErrorReporter - handleError()", () => {
  test("should show the message of an error", () => {
    const errorReporter = new ErrorReporter()
    const showMessage = spy(errorReporter.vsCodeAdapter, "showMessage")

    errorReporter.handleError(new Error("broken"))

    deepEqual(showMessage.args, [[Severity.ERROR, "broken"]])
  })

  test("should show a thrown value that is no error instead of swallowing it", () => {
    const errorReporter = new ErrorReporter()
    const showMessage = spy(errorReporter.vsCodeAdapter, "showMessage")

    errorReporter.handleError("no error")

    deepEqual(showMessage.args, [[Severity.ERROR, "no error"]])
  })
})
