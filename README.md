# Rich body macros + Custom config editor sample app

[![Atlassian license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square)](LICENSE)

This is an example [Forge](https://developer.atlassian.com/platform/forge/) app that demonstrates the new [Rich body macro](https://developer.atlassian.com/platform/forge/using-rich-text-bodied-macros/) and [Custom macro configuration](https://developer.atlassian.com/platform/forge/add-custom-configuration-to-a-macro/) features.

It shows how to:

- Set up rich body macros in your app's manifest
- Set up custom macro configuration using both UI Kit and Custom UI
- Insert a macro body, and update configuration parameters in the custom macro configuration
- Define an `adfExport` function that accesses and returns the macro body

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/getting-started/) for instructions to get set up.

## Installation

- Register the app by running:

```shell
forge register
```

- Build and deploy the app by running:

```shell
npm install
npm run build
forge deploy
```

- Install the app in an Atlassian site by running:

```shell
forge install
```

## License

Copyright (c) 2024 Atlassian and others.
Apache 2.0 licensed, see [LICENSE](LICENSE) file.

[![From Atlassian](https://raw.githubusercontent.com/atlassian-internal/oss-assets/master/banner-cheers.png)](https://www.atlassian.com)
