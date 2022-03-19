
# Overview

DLite (https://platform.dlite.io) is an Open Source low-code platform to build web and mobile applications.

DLite supports local-first design by providing a server API for syncing users data and sharing data with other users. 

When creating a new app, a DLite programmer defines a program model using the IDE, in three main steps. 

- Step 1: select components and place them into the page (click or drag and drop from the left-hand panel).  
- Step 2: style and configure components by selecting the values in the configuration panel (on the right). 
- Step 3: when applicable, bind the components to the data sources (see the data connectors), and configure the events to 
trigger actions upon user interactions.

DLite components are reactive, which means that they instantly change when changing their configuration (viewModel) 
or data they depend on (dataModel).

All component properties allow the use of JavaScript formulas, so that components can dynamically change their aspects 
and behaviors depending on the data, properties, events, or other components states. 

DLite programs are editable on-line with the https://platform.dlite.io, and can be exported as a *.dlite file,
which is basically the JSON descriptor of the application. This JSON descriptor can be reloaded and edited any time on 
the platform. It can also be deployed on any web server and opened as a running application with the platform using 
a link of the following form:

`` https://platform.dlite.io?src=https://your-application-url ``

# Available components

DLite comes with many easy-to-use built-in components for all kind of applications. Most components wrap BootstrapVue 
components, for cross-browser compatibility and full responsive support.

## Basic components

| Component | Description |
| --------- | ----------- |
| **Text** | Create multi-line text inputs with support for auto height sizing, minimum and maximum number of rows, and contextual states. |
| **Checkbox** | For cross browser consistency, use Bootstrap's custom checkbox input to replace the browser default checkbox input. It is built on top of semantic and accessible markup, so it is a solid replacement for the default checkbox input. |
| **Button** | Use Bootstrap's custom button component for actions in forms, dialogs, and more. Includes support for a handful of contextual variations, sizes, states, and more. |
| **Input** | Create various type inputs such as: text, password, number, url, email, search, range, date and more. It provides support for all HTML 5 input types (text, password, email, number, url, tel, search, date, datetime, datetime-local, month, week, time, range, or color) and has built-in support for labels, validation, placeholders, ... |
| **Select** | Bootstrap custom select using custom styles. Optionally specify options based on an array, array of objects, or an object. |
| **Image** | documentation and examples for opting images into responsive behavior (so they never become larger than their parent elements), optionally adding lightweight styles to them — all via props. |
| **Icon** | Direct access to all BoostrapVue icons with various styling options. |

## Advanced components

| Component | Description |
| --------- | ----------- |
| **Table** | The table component is a wrapper of a BootstrapVue table, for displaying tabular data. It supports pagination, filtering, sorting, custom rendering, various style options, events, and asynchronous data |
| **Navbar** | By default, all applications have a navbar component, which allows the definition of pages, and handle builtin user authentication, and data-synchronization features. |
| **Card** | Use Bootstrap cards in your applications for nice layouts. |
| **Dialog** | Dialogs are streamlined, but flexible dialog prompts. They support a number of use cases from user notification to completely custom content and feature a handful of helpful sub-components, sizes, variants, accessibility, and more. |
| **Popover** | The popover feature, which provides a tooltip-like behavior, can be easily applied to any interactive element.
| **Pagination** | Quick first, previous, next, last, and page buttons for pagination control of another component (a table or other iterators). |
| **Datepicker** | A custom date picker input form control. |
| **Timepicker** | A custom time picker input form control. |
| **Chart** | Build charts based on data. |
| **Time-series chart** | Build time series charts based on time series data. |
| **PDF Viewer** | Embed a PDF document in the application (depends on native browser support). |
| **Embeds** | Embed another application through HTML iframe. |
| **Carousel** | The carousel is a slideshow for cycling through a series of content, built with CSS 3D transforms. It works with a series of images, text, or custom markup. It also includes support for previous/next controls and indicators. |

## Layout components

| Component | Description |
| --------- | ----------- |
| **Container** | A component that contains other components. |
| **Split** | Split the space in 2 sub-components with a horizontal or vertical layout. An interactive splitter can be enabled. |
| **Iterator** | Iterate on a data array and repeat component(s) for each data element. |
| **Tabs** | Create a widget of tabbable panes of local content. The tabs component is built upon navs and cards internally, and provides full keyboard navigation control of the tabs. |

## Data connectors

| Component | Description |
| --------- | ----------- |
| **HTTP endpoint** | Bind to an HTTP endpoint (JavaScript fetch API). |
| **Cookie** | Bind to a cookie (read/write). |
| **Storage** | Bind to a local storage item (read/write). |
| **Data mapper** | Transform (map/filter/reduce) the data of the source into another format. |

## Builders

| Builder | Description |
| --------- | ----------- |
| **Instance form** | Create a form from a class model (with an input for each field). |
| **Collection editor** | Create an entire UI to perform CURD operation on a given array of instances. |
| **Raw** | Create components from a JSON descriptor (view model). |

# Implementation notes

- The current implementation of DLite is wrapping BootstrapVue (https://bootstrap-vue.org/) for building the components, 
which means that is it compatible with Vue 2.x and Bootstrap 4.
 
- The current implementation does not use NPM and ES6 modules on purpose. The idea is to master and reflect all 
direct and indirect dependencies to third-party libraries and fully use CDN cache capabilities.

- The current implementation does not use Vue syntax (*.vue files) on purpose, in order to loosen framework dependencies
in case of a future migration/modernization/extension.


# API

Since it allows JavaScript formulas in component properties, DLite comes with a handy API to access components, data, 
and configuration. It also provides some utility functions for various use cases. Note that users can also use the 
JavaScript official APIs at their own risks.

*Global functions/variables*

| Function/variable | Description |
| -------- | ----------- |
| `$c(componentId)` | Get the component for the given ID |
| `$d(componentOrId)` | Get the data model of a component |
| `$v(componentOrId)` | Get the view model of a component (the view model contains all the properties) |

*Available on any component*

| Function/variable | Description |
| -------- | ----------- |
| `dataModel` | The data model of a component |
| `viewModel` | Get a date from an object representing a date |
| `moment(date)` | Access to the moment.js API in any component |

*Collaboration functions*

Except for the `logInWithCredentials` and `clearSyncDescriptor` functions, all these require to be logged in to the server.

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$collab` | `synchronize()` | Synchronize all the data to the server for the current user |
| `$collab` | `share(key, targetUserId)` | Share a data with another user |
| `$collab` | `unshare(key, targetUserId)` | Cancel the sharing of a data with another user |
| `$collab` | `sendMail(targetUserId, subject, message)` | Send an email |
| `$collab` | `clearSyncDescriptor(key = undefined)` | Clear the local data (will be synced again from the server) |
| `$collab` | `deleteRemote(key)` | Delete a data, locally and remotely on the server |
| `$collab` | `logInWithCredentials(login, password)` | Log in |
| `$collab` | `getLoggedUser()` | Get the logged user object |
| `$collab` | `logOut()` | Log out |

*Array functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `arrayConcat(array, arrayOrItem)` | Array concatenation |
| `$tools` | `arrayMove(arr, fromIndex, toIndex)` | Move an element in an array  |
| `$tools` | `getStoredArray(key)` | Get the array from the local storage |
| `$tools` | `setStoredArray(key, array)` | Store the array to the local storage |
| `$tools` | `addToStoredArray(key, data)` | Add an element to a stored array |
| `$tools` | `removeFromStoredArray(key, data)` | Remove an element from a stored array |
| `$tools` | `replaceInStoredArray(key, data)` | Replace an element in a stored array |
| `$tools` | `range(start, end)` | Create an integer range |
| `$tools` | `characterRange(startChar, endChar)` | Create a characters range |
| `$tools` | `series(initialData, nextFunction: (data, series, index) => data, size = undefined)` | Generate a series out of an initial element and a next function |

*Color functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `defaultColor(index, opacity)` | Get one of the default colors |

*Conversion functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `camelToKebabCase(str)` | Camel to kebab |
| `$tools` | `camelToSnakeCase(str)` | Camel to snake |
| `$tools` | `camelToLabelText(str, lowerCase = false)` | Camel to label |
| `$tools` | `kebabToCamelCase(str, lowerCase = false)` | Kebab to camel |
| `$tools` | `kebabToLabelText(str, lowerCase = false)` | Kebab to label |
| `$tools` | `snakeToCamelCase(str, lowerCase = false)` | Snake to camel |
| `$tools` | `snakeToLabelText(str, lowerCase = false)` | Snake to label |
| `$tools` | `csvToArray(csv, separator, hasHeaders, headers)` | Convert a CSV table to an array of objects |
| `$tools` | `arrayToCsv(array, separator, keys, headers)` | Convert an array of objects to a CSV table |
| `$tools` | `convertImage(sourceImage, dataCallback, quality = 0.5, maxWidth = 800, outputMimeType = 'image/jpg')` | Convert an image to the output format/type |


*Date functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `now()` | The current date |
| `$tools` | `date(date)` | Get a date from an object representing a date |
| `$tools` | `datetime(date)` | Get a date with time from an object representing a date |
| `$tools` | `time(date)` | Get a time from an object representing a date |
| `$tools` | `dateRange(dateStart, dateEnd, step, stepKind)` | Create an array containing a range of dates |
| `$tools` | `diffBusinessDays(firstDate, secondDate)` | Get the count of business days between two dates |
| `this` | `moment(date)` | Access to the moment.js API in any component |

*IO and navigation functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `loadScript(url, callback)` | Dynamically load a JavaScript program |
| `$tools` | `deleteCookie(name)` | Delete a cookie |
| `$tools` | `getCookie(name)` | Get a cookie |
| `$tools` | `setCookie(name, value, expirationDate)` | Set a cookie |
| `$tools` | `download(data, filename, type)` | Download a file with the given data as the content |
| `$tools` | `upload(callback, resultType = 'text', maxSize = undefined, sizeExceededCallback = undefined, conversionOptions = undefined)` | Upload a file that the user will choose from the local computer |
| `$tools` | `postFileToServer(postUrl, file, onLoadCallback = undefined)` |  |
| `$tools` | `redirect(ui, page)` |  |
| `$tools` | `go(page)` | Go to a given page, as defined by the main navbar component |

*String functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `linkify(text)` |  |
| `$tools` | `validateEmail(email)` |  |
| `$tools` | `isValidEmail(email)` |  |
| `$tools` | `isNotEmpty(string)` |  |
| `$tools` | `truncate(str, size)` |  |

*UI functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `toast(component, title, message, variant = null)` |  |

*Utility functions*

| Object | Function | Description |
| ------ | -------- | ----------- |
| `$tools` | `uuid()` |  |
| `$tools` | `setTimeoutWithRetry(handler, retries, interval)` |  |
| `$tools` | `toSimpleName(qualifiedName)` |  |
| `$tools` | `functionBody(f)` |  |
| `$tools` | `functionParams(f)` |  |
| `$tools` | `inputType(type)` |  |
| `$tools` | `diff(array, fields)` |  |
| `$tools` | `fireCustomEvent(eventName, element, data)` |  |
| `$tools` | `cloneData(data)` |  |
| `$tools` | `rect(component)` |  |
| `$tools` | `remSize()` |  |

# Distribution

## Self-hosted application

To give access to a self-hosted application through the platform, first deploy your application to your own server. 
Make sure that https is enabled and that CORS allows platform.dlite.io. Then access your application with:

`` https://platform.dlite.io?src=https://your-application-url ``

## Self-hosted server

To enable user management and synchronization, you need a PHP server stack. For Apache2:

- Apache2 version >= 2.4 (mod PHP)
- PHP version 7, module php-zip
- Sendmail version >=8 + php.ini configuration to unable sendmail
- A DATA directory (read/write accessible for Apache)

## License

DLite is Open Source and licensed under the AGPL.

Please contact us at info@cincheo.com for commercial licencing information and visit https://www.dlite.io
