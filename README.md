# YAML Sort

This VS Code extension exposes the possibility to sort and validate yaml files.

## Configuration

This extension contributes the following settings:

* `vscode-yaml-sort.indent`: Indentation width in spaces.
* `vscode-yaml-sort.lineWidth`: Maximum line width for YAML files. Defaults to 500.
* `vscode-yaml-sort.useLeadingDashes`: Define if sorted YAML files should begin with leading dashes. Defaults to true.

## Commands

This extension contributes the following commands:

* `Sort YAML`: Sorts a given yaml in the current open editor tab
* `Validate YAML`: Validates a given yaml in the current open editor tab
* `Sort Kubernetes Configmap`: Sorts a given Kubernetes configmap ordering the top level keywords as following: apiVersion, kind, metadata, spec, data

**Enjoy!**

If you like this extension, please feel free to rate it on the marketplace.
