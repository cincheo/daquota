
# Overview

DLite (https://platform.dlite.io) is an extensible low-code platform to build web and mobile applications.

![Screenshot](https://github.com/cincheo/dlite/blob/main/src/assets/www/screenshot-met.png)

> The screenshot above shows demo application that implements a simple search engine using the Metropolitan Museum public API. This application is available in the applications directory.

DLite supports local-first design by providing a server API for syncing users data and sharing data with other users. 

When creating a new app, a DLite programmer defines a program model using the IDE, in three main steps. 

- Step 1: select components and place them into the page (click or drag and drop from the left-hand panel).  
- Step 2: style and configure components by selecting the values in the configuration panel (on the right). 
- Step 3: when applicable, bind the components to the data sources (see the data connectors), and configure the events to 
trigger actions upon user interactions.

All component properties allow the use of JavaScript formulas, so that components can dynamically change depending on 
the data, properties, events, or other components states. 

Last but not least, DLite is promoting and encouraging eco-design. Local-first development and built-in resource 
monitoring aim at helping eco-design. 

For more details about DLite and a complete explanation, please read ["Inside DLite: low-code components, model-driven tools, local-first and eco-design explained"](https://cincheo.com/2022/04/16/inside-dlite-low-code-components-model-driven-tools-local-first-and-eco-design-explained/).

# Extensibility

DLite comes with many easy-to-use Open Source built-in components for all kind of applications. Most components wrap BootstrapVue 
components, for cross-browser compatibility and full responsive support.

Most components are Open Source and can be extended and modified to fit any organization needs.

Also, new components and plugins can be created easily (doc to be written).

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
