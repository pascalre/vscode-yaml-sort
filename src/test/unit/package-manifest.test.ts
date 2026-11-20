import { deepEqual, ok } from "assert"
import { readFileSync } from "fs"
import { join } from "path"

import { DEFAULT_CONFIGURATION, Settings } from "../../core/settings"

interface Manifest {
  activationEvents: string[]
  contributes: {
    commands: { command: string }[]
    configuration: { properties: Record<string, { default: unknown }> }
    menus: { commandPalette: { command: string, when: string }[] }
  }
}

// out/test/unit -> project root
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

suite("Test package.json - command palette", () => {
  const palette = manifest.contributes.menus.commandPalette

  test("should offer the editor commands in the command palette only for yaml files", () => {
    const editorCommands = manifest.contributes.commands
      .map((contribution) => contribution.command)
      .filter((command) => command !== "vscode-yaml-sort.sortYamlFilesInDirectory")

    for (const command of editorCommands) {
      ok(palette.some((entry) => entry.command === command && entry.when === "editorLangId == yaml"), command)
    }
  })
})

suite("Test package.json - configuration", () => {
  const properties = manifest.contributes.configuration.properties
  const prefix = `${Settings.SECTION}.`

  test("should declare every setting with the extension's section", () => {
    ok(Object.keys(properties).every((key) => key.startsWith(prefix)))
  })

  test("should declare the same defaults as the core settings", () => {
    const declared = Object.fromEntries(Object.entries(properties).map(([key, property]) => [key.slice(prefix.length), property.default]))

    deepEqual(declared, DEFAULT_CONFIGURATION)
  })
})
