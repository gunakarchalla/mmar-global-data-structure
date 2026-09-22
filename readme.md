# MMAR Metamodeling Platform - Global Shared Datastructure Project

This project is part of the MMAR Metamodeling Platform, focusing on the global shared datastructure.

## Installation

The Global Shared Datastructure is not a module that must be installed. Other modules are depending on this module. To make it work, just install the Node Modules of the repository by running the following command in the root directory of the repository:

```bash
npm install
```

For further installation information of the entire platform, please refer to the readme of the [MMAR repository](https://github.com/MM-AR/mmar) or the Wiki Entry of the [MMAR Manual Installation](https://github.com/MM-AR/mmar/wiki/Manual-MMAR-Installation).

The consuming repositories resolve this one **from source**, through a `@gds` path alias
pointing at the sibling checkout, rather than installing it from a registry. It therefore
has to sit next to them, and a change here is visible to them immediately.

Nothing in this package may import a Node-only module: the two React clients bundle it for
the browser. Token signing and verification used to live here and broke that rule; they now
sit in `mmar-server`'s token service.


## More than the data structures

The classes are (de)serialised with `class-transformer`, so a consumer must import
`reflect-metadata` before anything else and revive with the static `fromJS` of the class
rather than with its own `plainToInstance` — the decorator metadata lives only in the
`class-transformer` copy this package resolves.

Three groups of rules live here as well, because the server and both clients have to agree
on them and had each grown their own version:

- **Attribute value validation** (`models/meta/Metamodel_attribute_values.ts`) —
  `attribute_value_violations` checks an attribute's default value and its facets against
  the regular expression of its attribute type, and `is_valid_pattern` checks the pattern
  itself. A pattern is applied as a whole-value match, and an absent or uncompilable one
  constrains nothing rather than rejecting everything. Facets are separated by
  `FACET_SEPARATOR`.
- **Table structure** (`models/instance/Instance_tables.ts`) — columns are numbered, cell
  rows are 0 based, and a position holds at most one cell. `table_violations` reports a
  table that breaks those rules; `table_rows`, `add_table_row`, `remove_table_row` and
  `move_table_row` are the operations that keep them.
- **Write differencing** (`models/write_difference.ts`) — `write_would_change` answers
  whether an incoming value differs from the stored one, so a write can carry only the
  fields that actually changed instead of the whole object.


## Contributing

We welcome contributions! Please follow these steps:

1. Fork the development branche of the repository you want to work on.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

Contributions must be documented to be merged into the project. If you contribute something to the project, please document the according changes into the Wiki, or the readme.

## License

This repository is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3. 

The GNU Affero General Public License (GNU AGPL) is a free, copyleft license published by the Free Software Foundation in November 2007, and based on the GNU GPL version 3 and the Affero General Public License. It is intended for software designed to be run over a network, adding a provision requiring that the corresponding source code of modified versions of the software be prominently offered to all users who interact with the software over a network (https://en.wikipedia.org/wiki/GNU_Affero_General_Public_License).

The GNU AGPL is specifically designed to ensure cooperation with the community in the case of network server software. The licenses for most software are designed to take away your freedom to share and change the works. By contrast, the GNU AGPL is intended to guarantee your freedom to share and change all versions of a program–to make sure it remains free software for all its users (https://www.gnu.org/licenses/agpl-3.0.en.html).

This means that any kind of published change done to the repository must be published again under the same license. For more information have a look at the LICENSE file.
