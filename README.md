# Overview

DLite (https://platform.dlite.io) is a low-code IDE to build WEB/PWA applications.

DLite is:

- Extensible: components and plugins can be modified and added to fit more needs.
- Local-first: no strong dependency to the cloud and allow offline work, you can start working without any account or connection, save your work on your local hard drive. Read about the local-first principles and technologies [here](https://localfirstweb.dev/).
- Eco-design friendly: built-in resource monitoring, local first to save network traffic and server resources, and many tools for helping impact calculation.

For more details about DLite and a complete explanation, please read ["Inside DLite: low-code components, model-driven tools, local-first and eco-design explained"](https://cincheo.com/2022/04/16/inside-dlite-low-code-components-model-driven-tools-local-first-and-eco-design-explained/).

# Goals and content

In this repository, you will find 3 kinds of Open Source artifacts:

- In the [src](src) folder: Web Components written in JavaScript with the DLite API, which are packaged directly or as plugins in DLite applications.
- In the [applications](applications) folder: DLite applications, which can be tools, examples, demos, free to use, copy and fork for your own projects.
- In the [ecodesign](ecodesign) folder: DLite tools and applications for ecodesign, typically, impact referentials or simulators to help developpers building better apps with more responsible environmental impacts.

# Getting started

DLite programs are editable with the https://platform.dlite.io, and can be exported as a ``*.dlite`` or ``*.json`` file,
which is basically the JSON descriptor of the application. There is no needs for an account or any kind of registration to play or modify any app in this repository. 

If you want to use the local-first data synchronization, you will need to register on the platform. Registration is free for developpers needing small amount of data. For other plans, see the license section.

# Contributing

More applications and ecodesign tooling will be provided in the future. Contributions are welcome. 

# License

The IDE (https://platform.dlite.io) is free to use (development environment) and will remain so. In order to deploy compiled applications in a production envrionment, a commercial licence will be required.

Please contact us at info@cincheo.com for commercial licencing information and visit https://www.dlite.io
