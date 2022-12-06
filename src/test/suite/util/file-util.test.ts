import * as assert from "assert"
import { FileUtil } from "../../../util/file-util"

suite("Test FileUtil - readFile()", () => {
  const fileutil = new FileUtil()

  test("when `file` is a path to an existing file should return the files content", () => {
    assert.strictEqual(fileutil.readFile("./src/test/suite/util/resources/readFile.txt"), "lorem impsum")
  })

  test("when `file` is a path to a non existing file should throw", () => {
    assert.throws(() => fileutil.readFile("nonexistent-path"), Error)
  })
})