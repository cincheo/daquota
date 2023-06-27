
# Overview

DLite (https://platform.dlite.io) is an extensible low-code platform to build web and mobile applications.

- Extensible: components and plugins can be modified and added to fit more needs.
- Local-first: no strong dependency to the cloud and allow offline work.
- Eco-design friendly: built-in resource monitoring, local first to save network traffic and server resources, and many tools for helping impact calculation.

For more details about DLite and a complete explanation, please read ["Inside DLite: low-code components, model-driven tools, local-first and eco-design explained"](https://cincheo.com/2022/04/16/inside-dlite-low-code-components-model-driven-tools-local-first-and-eco-design-explained/).

![Screenshot](https://github.com/cincheo/dlite/blob/main/src/assets/www/screenshot-met.png)

> The screenshot above shows demo application that implements a simple search engine using the Metropolitan Museum public API. This application is available in the applications directory.

# Getting started

DLite programs are editable online with the https://platform.dlite.io, and can be exported as a ``*.dlite`` or ``*.json`` file,
which is basically the JSON descriptor of the application. This JSON descriptor can be reloaded and edited any time on 
the platform. It can also be deployed on any web server and opened as a running application with the platform using 
a link of the following form:

`` https://platform.dlite.io?src=https://your-application-url ``

Check the applications directory for free and Open Source applications/examples to get started.

## License

Most example applications and components are Open Source for extensibility purposes, however, the global licensing model is still WIP.

The IDE (https://platform.dlite.io) is free to use (development environment) and will remain so. In order to deploy compiled applications in a production envrionment, a commercial licence will be required.

Please contact us at info@cincheo.com for commercial licencing information and visit https://www.dlite.io
