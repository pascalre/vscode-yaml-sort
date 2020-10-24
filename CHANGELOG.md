# Changelog
## 2.7.1 - October 24, 2020
* (refs [#10](https://github.com/pascalre/vscode-yaml-sort/issues/10)) Use custom sort recursively on the whole file
* Fix wrong name of new configuration

## 2.7.0 - October 14, 2020
* (refs [#10](https://github.com/pascalre/vscode-yaml-sort/issues/10)) Use custom sort recursively on the whole file
* New configuration `vscode-yaml-sort.useCustomSortRecursively` will use the custom sort keywords recursively on a file, when using custom sort

## 2.6.0 - September 28, 2020
* (refs [#11](https://github.com/pascalre/vscode-yaml-sort/issues/11)) support line breaks
* New configuration `addNewLineAfterTopLevelKey` makes it possible to add a line break between top level keywords.

## 2.5.0 - September 27, 2020
* Update manual
* Fix disappearing characters in custom sort

## 2.4.0 - September 26, 2020
* Fix [CVE-2020-8203](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-8203)
* Fix [CVE-2020-8244](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-8244)

## 2.3.2 - September 26, 2020
* (refs [#9](https://github.com/pascalre/vscode-yaml-sort/issues/9)) Sorting tab indented yaml removes code
* (refs [#12](https://github.com/pascalre/vscode-yaml-sort/issues/12)) Trying to sort a nested dictionary results in removing it completely
* (refs [#13](https://github.com/pascalre/vscode-yaml-sort/issues/13)) Sort drops value from key, when key in custom sort list
* Refactor code and add more test cases

## 2.3.1 - April 04, 2020
* Fix [CVE-2020-7598](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-7598)

## 2.3.0 - December 01, 2019
* (refs [#6](https://github.com/pascalre/vscode-yaml-sort/issues/6)) Support sorting files with delimiters with comment

## 2.2.0 - November 03, 2019
* New command `Format YAML` allows to format yaml without sorting.
* New configuration `noArrayIndent`
* New configuration `useQuotesForSpecialKeywords`
* Refactor code and add more test cases

## 2.1.0 - October 26, 2019
* Add the possibility to sort only a selection.

## 2.0.1 - October 22, 2019
* (refs [#8](https://github.com/pascalre/vscode-yaml-sort/issues/8)) Configurable manual sort order
* Fix the data type of `customSortKeywords`.

## 2.0.0 - October 11, 2019
* (refs [#8](https://github.com/pascalre/vscode-yaml-sort/issues/8)) Configurable manual sort order
* The command `Sort Kubernetes Configmap` is no longer supported
* New command `Custom Sort 1` with the defaults of `customSortKeywords_1` replaces `Sort Kubernetes Configmap`.
* New configuration `customSortKeywords_1`

## 1.3.0 - September 29, 2019
* (refs [#7](https://github.com/pascalre/vscode-yaml-sort/issues/7)) Keys could not be resorted: expected a single document in the stream, but found more

## 1.2.0 - June 25, 2019
* (refs [#3](https://github.com/pascalre/vscode-yaml-sort/issues/3)) kubernetes friendly sort

## 1.1.0 - June 17, 2019
* (refs [#5](https://github.com/pascalre/vscode-yaml-sort/issues/5)) Allow for configuration of line length

## 1.0.1 - June 15, 2019
* (refs [#1](https://github.com/pascalre/vscode-yaml-sort/issues/1)) Sort happens only once in editor life

## 1.0.0 - May 09, 2019
* Initial Release