# Overview

Daquota (https://platform.daquota.io) is a low-code IDE to build local-first WEB/PWA apps.

Daquota is:

- Extensible: components and plugins can be modified and added to fit more needs.
- Local First: no strong dependencies to the cloud and allow offline work. You can start working without any account or connection, and save your work on your local hard drive. Read about the local-first principles and technologies [here](https://localfirstweb.dev/).
- Eco-design friendly: built-in resource monitoring, Local First to save network traffic and server resources, and many tools for helping impact calculation.

# Content

| Folder (click to open) | Description | 
| :-------------: | ------------- |
| [![templates](https://img.icons8.com/glyph-neue/100/FFFFFF/maintenance.png)](templates/README.md)<br>**[templates](apps/README.md)** | Daquota templates. Get started easily by adapting templates to your own requirements. |
| [![apps](https://img.icons8.com/glyph-neue/64/FFFFFF/thumbnails.png)](apps/README.md)<br>**[apps](apps/README.md)** | Daquota apps (tools, examples, demos). Open Source and free to use, copy and fork for your own projects. |
| [![eco-design](https://img.icons8.com/glyph-neue/64/FFFFFF/co2-reduction.png)](eco-design/README.md)<br>**[eco-design](eco-design/README.md)** | Daquota tools and apps for Eco Design. For instance, impact referentials or simulators to help developers building better apps with more responsible environmental impacts. |
| [![src](https://img.icons8.com/glyph-neue/64/FFFFFF/puzzle.png)](src/README.md)<br>**[src](src/README.md)** | (WIP) Web Components written in JavaScript with the Daquota API, which are packaged directly in the IDE or as plugins in Daquota apps. |

# Getting started

Daquota programs are editable with https://platform.daquota.io, and can be exported as ``*.json`` files,
which are the JSON descriptors of the apps. In order to open any app with Daquota, use the following link: ``https://platform.daquota.io?src=https://url-to-your-app-descriptor``.

- For example, to open the Boavizta database, which contains various GWP impacts, open the link [https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/eco-design/boavizta-database/boavizta-database.json](https://platform.daquota.io/?src=https://raw.githubusercontent.com/cincheo/daquota/main/eco-design/boavizta-database/boavizta-database.json).
- Then, modify the app by click on the ``edit`` button (pencil button, top/right corner of the page).
- When modified, save it to your own local disk (menu ``Project > Save as...``).
- Re-open your project whenever needed (go to ``https://platform.daquota.io``, and ``Project > Open...``).

There is no need for an account or any kind of registration to run or modify apps in this repository. By default, most apps are local first and your data will be saved locally in the browser's IndexedDB storage.
If you want to use the local-first data synchronization and share data accross devices and/or users, you will need to register on the platform. Registration is free for developers needing small amount of data. For other plans, see the license section.

# Contributing

More apps and eco-design tooling will be provided in the future. Contributions are welcome. 

# License

The IDE (https://platform.daquota.io) is free to use (development environment) and will remain so. In order to deploy compiled apps in a production envrionment, a commercial licence will be required.

Please contact us at info@cincheo.com for commercial licencing information and visit https://www.daquota.io
