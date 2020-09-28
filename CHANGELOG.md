# Changelog
## 2.6.0
* (refs [#11](https://github.com/pascalre/vscode-yaml-sort/issues/11)) support line breaks

## 2.5.0
* Update manual
* Fix disappearing characters in custom sort

## 2.4.0
* Fix [CVE-2020-8203](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-8203)
* Fix [CVE-2020-8244](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-8244)

## 2.3.2
* (refs [#9](https://github.com/pascalre/vscode-yaml-sort/issues/9)) Sorting tab indented yaml removes code
* (refs [#12](https://github.com/pascalre/vscode-yaml-sort/issues/12)) trying to sort a nested dictionary results in removing it completely
* (refs [#13](https://github.com/pascalre/vscode-yaml-sort/issues/13)) sort drops value from key, when key in custom sort list
* Refactor code and add more test cases

## 2.3.1
* Fix [CVE-2020-7598](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-7598)

## 2.3.0
* (refs [#6](https://github.com/pascalre/vscode-yaml-sort/issues/6)) Support sorting files with delimiters with comment

## 2.2.0
* New command `Format YAML`
* New configuration `noArrayIndent`
* New configuration `useQuotesForSpecialKeywords`
* Refactored code and add more test cases

## 2.1.0
This version adds the possibility to sort only a selection.

## 2.0.1
(refs [#8](https://github.com/pascalre/vscode-yaml-sort/issues/8)) This version fixes the data type of `customSortKeywords`.

## 2.0.0
(refs [#8](https://github.com/pascalre/vscode-yaml-sort/issues/8)) The command `Sort Kubernetes Configmap` is no longer supported. You can use `Custom Sort 1` instead with the defaults of `vscode-yaml-sort.customSortKeywords_1`.
