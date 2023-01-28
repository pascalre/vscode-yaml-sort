import { ErrorUtil } from "../../../util/error-util"
import { spy } from "sinon"
import { equal } from "assert"

suite("Test ErrorUtil - handleError()", () => {
  test("when input is of type error, should execute showMessage function", () => {
    const errorutil = new ErrorUtil()
    const spyObject = spy(errorutil.vscodeadapter, "showMessage")

    errorutil.handleError("no error")
    equal(spyObject.called, false)

    errorutil.handleError(new Error())
    equal(spyObject.called, true)
  })
})