import { deepEqual, ok } from "assert"
import { readFileSync } from "fs"
import { join } from "path"

interface Manifest {
  activationEvents: string[]
  contributes: { commands: { command: string }[] }
}

// out/test/suite -> project root
const manifest = JSON.parse(readFileSync(join(__dirname, "..", "..", "..", "package.json"), "utf-8")) as Manifest

suite("Test package.json - activation events", () => {
  test("should activate on every contributed command, required for VS Code before 1.74", () => {
    const commands = manifest.contributes.commands.map((contribution) => `onCommand:${contribution.command}`)

    deepEqual(manifest.activationEvents.filter((event) => event.startsWith("onCommand:")), commands)
  })

  test("should activate when a yaml document is opened, so the formatter is registered", () => {
    ok(manifest.activationEvents.includes("onLanguage:yaml"))
  })

  test("should not activate on startup in every workspace", () => {
    ok(!manifest.activationEvents.includes("onStartupFinished") && !manifest.activationEvents.includes("*"))
  })
})
