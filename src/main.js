/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2022 CINCHEO
 *                    https://www.cincheo.com
 *                    renaud.pawlak@cincheo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

if (!window.ideVersion) {
    window.ideVersion = "DEVELOPMENT";
}

if (!window.basePath) {
    window.basePath = '';
}

Vue.prototype.basePath = window.basePath;

Vue.prototype.$intersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {

        if (entry.target.id === '_top') {
            if (entry.isIntersecting) {
                ide.scrollDisabled = true;
                try {
                    ide.router.replace('')
                        .finally(() => {
                            ide.scrollDisabled = false;
                        });
                } catch (e) {
                    console.error(e);
                }
            }
            return;
        }

        let component = $c(entry.target);
        if (component && component.viewModel && component.viewModel.observeIntersections) {
            let revealAnimation = component.$eval(component.viewModel.revealAnimation, null);
            if (revealAnimation) {
                if (entry.isIntersecting) {
                    if (component.getContainer().hiddenBeforeAnimate) {
                        component.animate(
                            revealAnimation,
                            component.$eval(component.viewModel.revealAnimationDuration, null),
                            component.$eval(component.viewModel.revealAnimationDelay, null)
                        );
                    }
                } else {
                    if (component.$eval(component.viewModel.revealAnimationOccurrence, null) === 'always') {
                        component.getContainer().hiddenBeforeAnimate = true;
                    }
                }
            }
            component.$emit('@intersect', entry.isIntersecting);
        }
    });
});

Vue.prototype.$anchorIntersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        let component = $c(entry.target);
        if (component.viewModel.publicName) {
            // anchor intersects
            let navItem = applicationModel.navbar.navigationItems.find(nav => nav.kind === 'Anchor' && nav.anchor === component.viewModel.publicName);
            if (entry.isIntersecting) {
                ide.scrollDisabled = true;
                ide.router.replace('#' + component.viewModel.publicName)
                    .finally(() => {
                        ide.scrollDisabled = false;
                    });
            } else {
            }
        }
    });
}, {
    rootMargin: "-15% 0px -15% 0px"
});

if (!window.bundledApplicationModel) {
    window.onbeforeunload = function () {
        if (!ide.isInFrame() && ide.isFileDirty() && ide.isBrowserDirty()) {
            try {
                console.info("m1", ide.savedFileModel.replaceAll('\n', ''));
                console.info("m2", ide.getApplicationContent().replaceAll('\n', ''));
            } catch (e) {
                console.error(e);
            }
            return "";
        }
    }
}

let versionIndex = 1;

Vue.prototype.$eventHub = new Vue();

let parameters = new URLSearchParams(window.location.search);

let backendProtocol = 'http';

let userInterfaceName = parameters.get('ui');
if (!userInterfaceName) {
    userInterfaceName = 'default';
}

let backend = parameters.get('backend');
if (!backend) {
    backend = 'localhost:8085';
}
let baseUrl = backendProtocol + '://' + backend + '/web-api';

let mapKeys = function (object, mapFn) {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(key, object[key]);
        return result;
    }, {})
}

window.plugins = {};
let plugins = parameters.get('plugins');
if (plugins) {
    plugins = plugins.split(',');
}

function corsProxy(url) {
    return ide.sync.baseUrl + '/cors_proxy.php?url=' + encodeURIComponent(url);
}

window.addEventListener('resize', () => {
    Vue.prototype.$eventHub.$emit('screen-resized');
});

setInterval(() => {
    Vue.prototype.$eventHub.$emit('tick', ide.tick++);
    if ((ide.tick - 1) % 30 === 0) {
        ide.monitor('DATA', 'STORAGE', new Blob(Object.values(localStorage)).size);
    }
}, 1000);

window.addEventListener("message", (event) => {
    switch (event.data.type) {
        case 'SET':
            Tools.setTimeoutWithRetry(() => {
                if ($c(event.data.cid)) {
                    $c(event.data.cid).value = event.data.data;
                    window.parent.postMessage({
                        applicationName: applicationModel.name,
                        type: 'SET_RESULT',
                        cid: event.data.cid
                    }, '*');
                    return true;
                } else {
                    return false;
                }
            }, 10);
            break;
        case 'GET':
            window.parent.postMessage({
                applicationName: applicationModel.name,
                type: 'GET_RESULT',
                cid: event.data.cid,
                value: $c(event.data.cid).value
            }, '*');
            break;
    }

    // TODO: REMOVE THIS
    // if (event.data.type === 'APPLICATION_LOADED' && event.data.applicationName === 'models') {
    //     document.getElementById('models-iframe').contentWindow.postMessage(
    //         {
    //             type: 'SET',
    //             cid: 'select-0',
    //             data: 'contacts'
    //         },
    //         '*'
    //     );
    // }
    //
    // if (event.data.type === 'APPLICATION_RESULT' && event.data.applicationName === 'models') {
    //     console.info("got application result", event.data.value);
    // }
    //

}, false);

class IDE {

    icons = ['x'];

    globalEvents = [
        {
            value: 'component-hovered',
            text: 'args: [componentId, isHovered]'
        },
        {
            value: 'plugin-toggled',
            text: 'args: [plugin, isToggled]'
        },
        {
            value: 'route-changed',
            text: 'args: [from, to]'
        },
        {
            value: 'screen-resized',
            text: 'args: []'
        },
        {
            value: 'set-user',
            text: 'args: [user]'
        },
        {
            value: 'synchronized',
            text: 'args: [synchronizationResult]'
        },
        {
            value: 'tick',
            text: 'args: [tickValueInSeconds]'
        },

    ];

    tick = 0;
    locked = false;
    uis = [];
    attributes = {};
    editMode = false;
    domainModels = {};
    selectedComponentId = undefined;
    targetedComponentId = undefined;
    hoveredComponentId = undefined;
    clipboard = undefined;
    applicationLoaded = false;
    user = undefined;
    sync = undefined;
    colors = undefined;
    monitoredData = {};
    locales = {en: 'English'};
    currencies = [{"cc": "USD", "symbol": "US$", "name": "United States dollar"}];
    availablePlugins = [
        basePath+'assets/plugins/google-authentication.js',
        basePath+'assets/plugins/backend4dlite-connector.js'
    ];
    componentTools = [
        {type: "HttpConnector", label: "Http Endpoint", category: "data-sources"},
        {type: "CookieConnector", label: "Cookie", category: "data-sources"},
        {type: "LocalStorageConnector", label: "Storage", category: "data-sources"},
        {type: "DataMapper", label: "Data mapper", category: "data-sources"},

        {type: "TextView", label: "Text/HTML", category: "basic-components"},
        {type: "CheckboxView", label: "Checkbox", category: "basic-components"},
        {type: "SelectView", label: "Select", category: "basic-components"},
        {type: "InputView", label: "Input", category: "basic-components"},
        {type: "TextareaView", label: "Textarea", category: "basic-components"},
        {type: "ButtonView", label: "Button", category: "basic-components"},
        {type: "ImageView", label: "Image", category: "basic-components"},
        {type: "IconView", label: "Icon", category: "basic-components"},

        {type: "TableView", label: "Table", category: "advanced-components"},
        {type: "ChartView", label: "Chart", category: "advanced-components"},
        {type: "TimeSeriesChartView", label: "Time series", category: "advanced-components"},
        {type: "DialogView", label: "Dialog", category: "advanced-components"},
        {type: "PopoverView", label: "Popover", category: "advanced-components"},
        {type: "DatepickerView", label: "Date picker", category: "advanced-components"},
        {type: "TimepickerView", label: "Time picker", category: "advanced-components"},
        {type: "PaginationView", label: "Pagination", category: "advanced-components"},
        {type: "PdfView", label: "PDF Viewer", category: "advanced-components"},
        {type: "EmbedView", label: "Embed", category: "advanced-components"},
        {type: "CarouselView", label: "Carousel", category: "advanced-components"},
        {type: "ProgressView", label: "Progress", category: "advanced-components"},

        {type: "ContainerView", label: "Container", category: "layout"},
        {type: "SplitView", label: "Split", category: "layout"},
        {type: "CardView", label: "Card", category: "layout"},
        {type: "IteratorView", label: "Iterator", category: "layout"},
        {type: "TabsView", label: "Tabs", category: "layout"},
        {type: "CollapseView", label: "Collapse", category: "layout"},

        {type: "instance-form-builder", label: "Instance form", category: "builders"},
        {type: "collection-editor-builder", label: "Collection editor", category: "builders"},
        //{type: "login-form-builder", label: "Login form", category: "builders"},
        {type: "raw-builder", label: "Generic", category: "builders"}
    ];

    constructor() {
        this.sync = new Sync(() => {
                this.reportError("danger", "Authorization error", "This action is not permitted with the current credentials");
                this.setUser(undefined);
            },
            (result) => {
                if (result.error) {
                    this.reportError("danger", "Sync error", result.error);
                }
            },
            document.location.protocol + '//' + document.location.host + document.location.pathname + "/api"
        );
        this.attributes = {};
        if (localStorage.getItem('dlite.attributes') != null) {
            try {
                this.attributes = JSON.parse(localStorage.getItem('dlite.attributes'));
            } catch (e) {
                console.error('error reading attributes', e);
            }
        }
        Vue.prototype.$eventHub.$on('edit', (event) => {
            this.editMode = event;
            this.targetedComponentId = undefined;
        });
        this.locked = parameters.get('locked') === 'true';
        this.colors = {
            selection: '#0088AA',
            highlight: 'highlight'
        }
    }

    monitor(type, source, value) {
        if (value) {
            if (this.monitoredData[type] === undefined) {
                this.monitoredData[type] = [];
            }
            const data = this.monitoredData[type];
            const nowMoment = moment().startOf('minutes');
            const now = nowMoment.valueOf();
            if (data.length === 0) {
                data.push({timestamp: now, type: type, source: source, size: value});
            } else {
                if (type === 'DATA') {
                    if (data[data.length - 1].timestamp === now) {
                        data[data.length - 1].size = value;
                    } else {
                        data.push({timestamp: now, type: type, source: source, size: value});
                    }
                } else {
                    if (data[data.length - 1].timestamp === now) {
                        data[data.length - 1].size += value;
                    } else {
                        data.push({timestamp: now, type: type, source: source, size: value});
                    }
                }
                // data clean up
                const last = nowMoment.add(-60, 'minutes').valueOf();
                let lastIndex = 0;
                while (data[lastIndex].timestamp < last) {
                    lastIndex++;
                }
                if (lastIndex > 0) {
                    data.splice(0, lastIndex);
                }

            }
        }

    }

    setUser(user) {
        this.user = user;
        document.title = $tools.camelToLabelText(applicationModel.name) + (user ? ' [' + user.login + ']' : '');
        Vue.prototype.$eventHub.$emit('set-user', user);
    }

    registerSignInFunction(signInFunction) {
        Vue.prototype.$eventHub.$on('sign-in-request', signInFunction);
    }

    unregisterSignInFunction(signInFunction) {
        Vue.prototype.$eventHub.$off('sign-in-request', signInFunction);
    }

    /**
     * Triggers a sign-in request by emitting the global 'sign-in-request' event.
     */
    signInRequest() {
        Vue.prototype.$eventHub.$emit('sign-in-request');
    }

    reportError(level, title, description) {
        Vue.prototype.$eventHub.$emit('report-error', level, title, description);
    }

    getPluginIdentifier(plugin) {
        let chunks = plugin.split('/');
        return $tools.kebabToCamelCase(chunks[chunks.length - 1].split('.')[0], true);
    }

    togglePlugin(plugin) {
        if (!applicationModel.plugins) {
            applicationModel.plugins = [];
        }
        if (applicationModel.plugins.indexOf(plugin) > -1) {
            applicationModel.plugins.splice(applicationModel.plugins.indexOf(plugin), 1);
            Vue.prototype.$eventHub.$emit('plugin-toggled', plugin, false);
            console.info("stopping plugin", this.getPluginIdentifier(plugin));
            if (window.plugins[this.getPluginIdentifier(plugin)]) {
                window.plugins[this.getPluginIdentifier(plugin)].stop();
            }
        } else {
            applicationModel.plugins.push(plugin);
            Vue.prototype.$eventHub.$emit('plugin-toggled', plugin, true);
            $tools.loadScript(plugin);
        }
    }

    pluginLoaded(pluginIdentifier) {
        console.info("starting plugin", pluginIdentifier);
        if (window.plugins[pluginIdentifier]) {
            window.plugins[pluginIdentifier].start();
        }
    }

    removeComponentTool(type) {
        let index = this.componentTools.findIndex(tool => tool.type === type);
        if (index > -1) {
            this.componentTools.splice(index, 1);
        }
    }

    isPluginActive(plugin) {
        return applicationModel.plugins && applicationModel.plugins.indexOf(plugin) > -1;
    }

    async start() {
        if (window.bundledApplicationModel && (typeof window.bundledApplicationModel === 'object')) {
            ide.locked = true;
            if (parameters.get('admin')) {
                await ide.loadUrl(basePath+'assets/apps/admin.dlite');
            } else {
                await ide.loadApplicationContent(window.bundledApplicationModel);
            }
        } else {
            if (parameters.get('src')) {
                if (parameters.get('src') === 'newFromClipboard') {
                    await this.createBlankProject();
                    this.docStep = 1;
                    this.editMode = true;
                    this.applicationLoaded = true;
                    setTimeout(() => {
                        ide.selectComponent('index');
                    }, 1000);
                } else {
                    await ide.loadUrl(parameters.get('src'));
                }
            } else {
                if ($tools.getCookie('hide-docs') !== 'true') {
                    this.docStep = 1;
                }
                await ide.loadUI();
            }
        }
        start();
    }

    setEditMode(editMode) {
        Vue.prototype.$eventHub.$emit('edit', editMode);
    }

    selectComponent(cid) {
        this.selectedComponentId = cid;
        setTimeout(() => {
            Vue.prototype.$eventHub.$emit('component-selected', cid);
        }, 100);
    }

    hoverComponent(cid) {
        if (this.hoveredComponentId) {
            Vue.prototype.$eventHub.$emit('component-hovered', this.hoveredComponentId, false);
        }
        this.hoveredComponentId = cid;
        if (cid) {
            Vue.prototype.$eventHub.$emit('component-hovered', cid, true);
        }
    }

    setAttribute(name, value) {
        this.attributes[name] = value;
        if (this.attributesWriterTimeout) {
            clearTimeout(this.attributesWriterTimeout);
        }
        this.attributesWriterTimeout = setTimeout(() => {
            this.attributesWriterTimeout = undefined;
            localStorage.setItem('dlite.attributes', JSON.stringify(this.attributes));
        }, 10);
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    getComponentIcon(type) {
        return `${basePath}assets/component-icons/${Tools.camelToKebabCase(type)}.png`
    }

    getApplicationContent() {
        return JSON.stringify({
            applicationModel: applicationModel,
            roots: components.getRoots()
        }, undefined, 2);
    }

    createFromJSON(targetLocation, data) {
        let viewModel;
        let dataComponentModel;
        const model = JSON.parse(data);
        ide.setTargetLocation(targetLocation);
        const modelParser = new ModelParser('tmpModel').parseJson(data);
        if (Array.isArray(model)) {
            viewModel = components.buildCollectionEditor(
                modelParser,
                modelParser.parsedClasses[0],
                undefined,
                false,
                'Table',
                true,
                true,
                true
            );
            dataComponentModel = viewModel.components[0];
        } else {
            dataComponentModel = viewModel = components.buildInstanceForm(modelParser, modelParser.parsedClasses[0]);
        }
        if (viewModel) {
            components.registerComponentModel(viewModel);
            components.setChild(targetLocation, viewModel);
            if (dataComponentModel) {
                $c(targetLocation.cid).$nextTick(() => {
                    $c(dataComponentModel.cid).setData(JSON.parse(data));
                });
            }
            if (ide.targetLocation && typeof ide.targetLocation.index === 'number') {
                let newTargetLocation = ide.targetLocation;
                newTargetLocation.index++;
                ide.setTargetLocation(newTargetLocation);
            }
        }
    }

    async save() {
        if (!userInterfaceName) {
            userInterfaceName = 'default';
        }
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }
        let formData = new FormData();
        const contents = this.getApplicationContent();
        formData.append('userInterfaceName', userInterfaceName);
        formData.append('model', contents);

        fetch(baseUrl + '/saveUserInterface', {
            method: "POST",
            body: formData
        });
    }

    isFileDirty() {
        return applicationModel && this.savedFileModel !== this.getApplicationContent();
    }

    isBrowserDirty() {
        return applicationModel && this.savedBrowserModel !== this.getApplicationContent();
    }

    async saveFile() {
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        const content = this.getApplicationContent();

        Tools.download(content.replaceAll("</script>", '<\\/script>'), userInterfaceName + ".dlite", "application/dlite");
        this.savedFileModel = content;
        Vue.prototype.$eventHub.$emit('application-saved');
    }

    async bundle(bundleParameters) {
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        const content = this.getApplicationContent();

        this.sync.bundle(content, applicationModel.name + '-bundle.zip', bundleParameters);
    }

    saveInBrowser() {
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        const content = this.getApplicationContent();

        let applications = JSON.parse(localStorage.getItem('dlite.ide.apps'));
        if (!applications) {
            applications = {};
        }

        applications[userInterfaceName] = content;
        localStorage.setItem('dlite.ide.apps', JSON.stringify(applications));

        let myApps = JSON.parse(localStorage.getItem('dlite.ide.myApps'));
        if (!myApps) {
            myApps = [];
        }

        let myApp = myApps.find(app => app.name == userInterfaceName);

        if (!myApp) {
            myApp = {};
            myApps.push(myApp);
            myApp.name = userInterfaceName;
            myApp.description = userInterfaceName;
            myApp.url = 'localstorage:' + userInterfaceName;
            myApp.icon = basePath+'assets/app-icons/no_image.png';
        }

        localStorage.setItem('dlite.ide.myApps', JSON.stringify(myApps));
        this.savedBrowserModel = content;
        Vue.prototype.$eventHub.$emit('application-saved');

    }

    loadFile(callback) {
        Tools.upload(content => {
            let contentObject = JSON.parse(content);
            this.loadApplicationContent(contentObject, callback);
        });
    }

    detachComponent(cid) {
        if (!cid) {
            throw new Error("undefined cid");
        }
        const parentComponentModel = components.getComponentModel(components.findParent(cid));
        const keyAndIndexInParent = components.getKeyAndIndexInParent(parentComponentModel, cid);
        if (keyAndIndexInParent.index > -1) {
            // array case
            parentComponentModel[keyAndIndexInParent.key].splice(keyAndIndexInParent.index, 1);
        } else {
            parentComponentModel[keyAndIndexInParent.key] = undefined;
        }
        this.selectComponent(undefined);
        this.hideOverlays();
        $tools.toast(
            $c('navbar'),
            'Component trashed',
            'Successfully moved component to the trash.',
            'success'
        );
    }

    deleteComponent(cid) {
        console.info('delete component', cid);
        if (!cid) {
            throw new Error("undefined cid");
        }
        const containerView = components.getContainerView(cid);
        if (containerView != null) {
            this.detachComponent(cid);
        }
        components.deleteComponentModel(cid);
        this.selectComponent(undefined);
    }

    copyComponent(cid) {
        console.info('copy component', cid);
        if (!cid) {
            throw new Error("undefined cid");
        }
        return navigator.clipboard.writeText(JSON.stringify($c(cid).viewModel, undefined, 2));
    }

    checkHTML(html) {
        const doc = document.createElement('div');
        doc.innerHTML = html;
        return (doc.innerHTML === html);
    }

    async loadUrl(url) {
        if (url.startsWith('localstorage:')) {
            try {
                let name = url.split(':')[1];
                let appsItem = localStorage.getItem('dlite.ide.apps');
                let apps = JSON.parse(appsItem);
                await this.loadApplicationContent(JSON.parse(apps[name]));
            } catch (e) {
                alert(`Source file at ${url} failed to be loaded.`);
                console.error(e);
                await this.loadUI();
            }
        } else {
            await fetch(url)
                .then(res => res.json())
                .then(async (json) => {
                    await this.loadApplicationContent(json);
                })
                .catch(async err => {
                    console.warn('direct application loading failed, retrying with proxy...', err);

                    await fetch(corsProxy(url))
                        .then(res => res.json())
                        .then(async (json) => {
                            await this.loadApplicationContent(json);
                        })
                        .catch(async err => {
                            console.error(err);
                            alert(`Source project file at ${corsProxy(url)} failed to be loaded. Check the URL or the CORS policies from the server.`);
                            await this.loadUI();
                        });

                });
        }
    }

    setStyleUrl(url, darkMode) {
        if (document.getElementById('bootstrap-css').href !== url) {
            document.getElementById('bootstrap-css').href = url;
        }
        applicationModel.bootstrapStylesheetUrl = url;
        applicationModel.darkMode = darkMode;
        let style = getComputedStyle(document.body);
        setTimeout(() => {
            PRIMARY = this.colors.primary = style.getPropertyValue('--primary').trim();
            SECONDARY = this.colors.secondary = style.getPropertyValue('--secondary').trim();
            SUCCESS = this.colors.success = style.getPropertyValue('--success').trim();
            INFO = this.colors.info = style.getPropertyValue('--info').trim();
            WARNING = this.colors.warning = style.getPropertyValue('--warning').trim();
            DANGER = this.colors.danger = style.getPropertyValue('--danger').trim();
            LIGHT = this.colors.light = style.getPropertyValue('--light').trim();
            DARK = this.colors.dark = style.getPropertyValue('--dark').trim();
            DARK_MODE = darkMode;
        }, 5000);
        Vue.prototype.$eventHub.$emit('style-changed');
    }

    setStyle(styleName, darkMode) {
        if (styleName === undefined) {
            this.setStyleUrl(basePath+"assets/ext/bootstrap@4.5.3.min.css", false);
        } else {
            this.setStyleUrl(basePath+`assets/ext/themes/${styleName}.css`, darkMode);
        }
    }

    isDarkMode() {
        return applicationModel.darkMode ? true : false;
    }

    setTargetMode() {
        if (!this.selectedComponentId) {
            console.warn("invalid state for setTargetMode");
            return;
        }
    }

    setTargetLocation(targetLocation) {
        this.targetLocation = targetLocation;
        setTimeout(() => {
            Vue.prototype.$eventHub.$emit('target-location-selected', targetLocation);
        }, 100);
    }

    getTargetLocation() {
        if (this.targetLocation) {
            return this.targetLocation;
        } else {
            if (this.selectedComponentId) {
                let model = $v(this.selectedComponentId);
                if (model.type === 'ContainerView') {
                    return {
                        cid: model.cid,
                        key: 'components',
                        index: model.components.length + 1
                    };
                } else {
                    let parent = $c(this.selectedComponentId)?.getParent();
                    if (parent && parent.viewModel.type === 'ContainerView') {
                        return {
                            cid: parent.viewModel.cid,
                            key: 'components',
                            index: parent.viewModel.components.map(c => c.cid).indexOf(this.selectedComponentId) + 1
                        };
                    }
                }
            }
        }
        return undefined;
    }

    // TODO
    // startWebSocketConnection() {
    //     console.log("Starting connection to WebSocket Server");
    //     this.wsConnection = new WebSocket(`ws://${backend}/ws/`);
    //     this.wsConnection.onopen = (event) => {
    //         console.log(`Successfully connected to the ${backend} websocket server.`)
    //     };
    //
    //     this.wsConnection.onerror = (error) => {
    //         console.error(`Websocket with ${backend} encountered an error, closing :`, error);
    //         this.wsConnection.close();
    //     };
    //
    //     this.wsConnection.onclose = () => {
    //         console.error(`Websocket is closed, attempting to reopen in 2 seconds...`);
    //         setTimeout(() => {
    //             this.startWebSocketConnection();
    //         }, 2000);
    //     };
    //
    //     this.wsConnection.onmessage = (event) => {
    //         const data = JSON.parse(event.data);
    //         Vue.prototype.$eventHub.$emit(data.name, data);
    //     };
    // }

    renameComponent(oldName) {
        let newName = window.prompt("Component new name", oldName);
        if (newName) {
            if (newName === oldName) {
                return;
            }
            let component = components.getComponentModel(newName);
            if (!component) {
                component = components.getComponentModel(oldName);
                component.cid = newName;
                this.selectComponent(undefined);
                components.unregisterComponentModel(oldName);
                components.registerComponentModel(component);
                this.selectComponent(newName);
            } else {
                window.alert(`Component '${newName}' already exists`);
            }
            // let json = JSON.stringify(applicationModel);
            // json = json.replaceAll(new RegExp("'" + oldName + "'", "g"), newName);
            // json = json.replaceAll(new RegExp('"' + oldName + '"', "g"), newName);
            // this.loadApplicationContent({applicationModel: JSON.parse(json)});
        }
    }

    loadApplicationContent(contentObject, callback) {
        applicationModel = contentObject.applicationModel;
        if (applicationModel.name) {
            userInterfaceName = applicationModel.name;
            if (this.uis.indexOf(userInterfaceName) === -1) {
                this.uis.push(userInterfaceName);
            }
        }
        if (applicationModel.versionIndex !== versionIndex) {
            alert(`Application version index (${applicationModel.versionIndex}), does not match the IDE version index (${versionIndex}). Some features may not work properly or lack support.`);
        }
        applicationModel.navbar = contentObject.roots.find(c => c.cid === 'navbar');
        components.loadRoots(contentObject.roots);
        this.initApplicationModel();
        console.info("application loaded", applicationModel.name);
        this.applicationLoaded = true;
        Vue.prototype.$eventHub.$emit('application-loaded');
        let content = this.getApplicationContent();
        this.savedFileModel = content;
        this.savedBrowserModel = content;
        setTimeout(() => {
            window.parent.postMessage({
                applicationName: applicationModel.name,
                type: 'APPLICATION_LOADED'
            }, '*');
        });
        if (callback) {
            callback();
        }
    }

    createBlankProject() {
        console.info('creating blank project');
        applicationModel =
            {
                "navbar": {
                    "cid": "navbar",
                    "type": "NavbarView",
                    "brand": "App name",
                    "defaultPage": "index",
                    "navigationItems": [
                        {
                            "pageId": "index",
                            "label": "Index"
                        }
                    ],
                    "eventHandlers": []
                },
                "autoIncrementIds": {},
                "name": "default"
            };
        components.fillComponentModelRepository(applicationModel);
        let content = this.getApplicationContent();
        this.savedFileModel = content;
        this.savedBrowserModel = content;
        this.editMode = true;
        ide.uis = ["default"];
    }

    async loadUI() {
        this.createBlankProject();
    }

    initApplicationModel() {

        console.info("init application model", applicationModel.name);

        document.title = $tools.camelToLabelText(applicationModel.name) + (this.user ? '[' + this.user.login + ']' : '');

        if (parameters.get('styleUrl')) {
            ide.setStyleUrl(parameters.get('styleUrl'), parameters.get('darkMode'));
        } else {
            if (!applicationModel.bootstrapStylesheetUrl) {
                ide.setStyle("superhero", true);
            }

            if (applicationModel.bootstrapStylesheetUrl) {
                ide.setStyleUrl(applicationModel.bootstrapStylesheetUrl, applicationModel.darkMode);
            }
        }

        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        if (applicationModel.navbar && !applicationModel.navbar.eventHandlers) {
            applicationModel.navbar.eventHandlers = [];
        }

        if (ide.router) {

            let defaultPage = applicationModel.navbar.defaultPage || applicationModel.defaultPage || 'index';
            let navigationItems = applicationModel.navbar.navigationItems;

            ide.router.addRoute({path: "/", redirect: applicationModel.defaultPage});

            navigationItems.forEach(nav => {
                if (nav.pageId && nav.pageId !== "" && (nav.kind === undefined || nav.kind === "Page")) {
                    if (!ide.router.options.routes.find(route => route.name === nav.pageId)) {
                        ide.router.addRoute({
                            name: nav.pageId,
                            path: "/" + nav.pageId,
                            component: Vue.component('page-view')
                        });
                    }
                }
            });

            ide.router.addRoute({path: "*", redirect: defaultPage});

            if (!applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === ide.router.currentRoute.name)) {
                ide.router.push({name: defaultPage});
            }

        }

        if (applicationModel.synchronizationServerBaseUrl && document.location.host.indexOf('localhost') === -1) {
            this.sync.baseUrl = applicationModel.synchronizationServerBaseUrl;
        }

        if (applicationModel.plugins) {
            applicationModel.plugins.forEach(plugin => {
                console.info("loading plugin", plugin);
                $tools.loadScript(plugin);
            });
        }

    }

    async authenticate(login, password) {
        console.info("authenticating user", login);
        let baseUrl = this.sync.baseUrl;
        if (applicationModel.authenticationServerBaseUrl) {
            baseUrl = applicationModel.authenticationServerBaseUrl;
        }
        const response = await fetch(`${baseUrl}/authenticate.php?user=${login}&password=${password}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        console.info("authentication result", result);
        if (result['authorized'] && result['user']) {
            this.setUser(result.user);
            this.synchronize();
        } else {
            this.setUser(undefined);
            ide.reportError("danger", "Authentication error", "Invalid user name or password");
        }
        this.storeCurrentUser();
        return result;
    }

    async signOut() {
        await this.synchronize();
        const userId = this.sync.userId;
        this.setUser(undefined);
        this.storeCurrentUser();
        let baseUrl = this.sync.baseUrl;
        if (applicationModel.authenticationServerBaseUrl) {
            baseUrl = applicationModel.authenticationServerBaseUrl;
        }
        const response = await fetch(`${baseUrl}/logout.php?user=${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        console.info("logout", result);
    }

    /**
     * Stores the current user in a cookie.
     */
    storeCurrentUser() {
        if (this.user == null) {
            Tools.deleteCookie("dlite.user");
        } else {
            Tools.setCookie("dlite.user", JSON.stringify(this.user));
        }
    }

    isInFrame() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    async synchronize() {
        if (!this.user) {
            return;
        }
        let lastSyncUserId = localStorage.getItem('dlite.lastSyncUserId');
        if (lastSyncUserId != null && lastSyncUserId != this.user.id) {
            // changed user - clear local storage data
            localStorage.clear();
        }
        try {
            this.sync.userId = this.user.login;
            let pullResult = await this.sync.pull();
            await this.sync.push();
            localStorage.setItem('dlite.lastSyncUserId', this.user.id);
            Vue.prototype.$eventHub.$emit('synchronized', pullResult);
        } catch (e) {
            this.reportError("danger", "Synchronization error", e.message);
            console.error('synchronization error', e);
        }
    }

    updateHoverOverlay(cid) {
        let hoverOverlay = document.getElementById('hoverOverlay');
        if (!hoverOverlay) {
            return;
        }
        if (!ide.editMode || !cid) {
            hoverOverlay.style.display = 'none';
        } else {
            let componentElement = document.getElementById(cid);
            if (!componentElement) {
                hoverOverlay.style.display = 'none';
                return;
            }
            let eventShieldOverlay = document.getElementById('eventShieldOverlay');
            const rect = componentElement.getBoundingClientRect();
            eventShieldOverlay.style.top = hoverOverlay.style.top = (rect.top - 2) + 'px';
            eventShieldOverlay.style.left = hoverOverlay.style.left = (rect.left - 2) + 'px';
            eventShieldOverlay.style.width = hoverOverlay.style.width = (rect.width + 4) + 'px';
            eventShieldOverlay.style.height = hoverOverlay.style.height = (rect.height + 4) + 'px';
            hoverOverlay.style.backgroundColor = this.colors.selection;
            if (ide.selectedComponentId == cid) {
                hoverOverlay.style.display = 'none';
            }
        }
    }

    showHoverOverlay() {
        let hoverOverlay = document.getElementById('hoverOverlay');
        if (!ide.editMode || !hoverOverlay) {
            return;
        }
        hoverOverlay.style.display = 'block';
    }

    updateSelectionOverlay(cid) {
        if (!cid) {
            return;
        }
        let selectionOverlay = document.getElementById('selectionOverlay');
        if (!ide.editMode || !selectionOverlay) {
            return;
        }
        let componentElement = document.getElementById(cid);
        if (!componentElement) {
            return;
        }
        const rect = componentElement.getBoundingClientRect();
        selectionOverlay.style.top = (rect.top - 2) + 'px';
        selectionOverlay.style.left = (rect.left - 2) + 'px';
        selectionOverlay.style.width = (rect.width + 4) + 'px';
        selectionOverlay.style.height = (rect.height + 4) + 'px';
        selectionOverlay.style.borderColor = this.colors.selection;
    }

    showSelectionOverlay() {
        let selectionOverlay = document.getElementById('selectionOverlay');
        if (!ide.editMode || !selectionOverlay) {
            return;
        }
        selectionOverlay.style.display = 'block';
    }

    hideOverlays() {
        let hoverOverlay = document.getElementById('hoverOverlay');
        if (hoverOverlay) {
            hoverOverlay.style.display = 'none';
        }
        let selectionOverlay = document.getElementById('selectionOverlay');
        if (selectionOverlay) {
            selectionOverlay.style.display = 'none';
        }
    }

}

let ide = new IDE();

function start() {
    Vue.component('main-layout', {
        template: `
        <div :style="infiniteScroll()?'height:100vh':''">

            <div id="eventShieldOverlay" draggable @dragstart="startDrag($event)"></div>
            
            <b-modal v-if="edit" id="models-modal" title="Model editor" size="xl">
              <b-embed id="models-iframe" :src="'?locked=true&src='+basePath+'assets/apps/models.dlite#/?embed=true'"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="storage-modal" title="Storage manager" size="xl">
              <b-embed id="storage-iframe" :src="'?locked=true&src='+basePath+'assets/apps/storage.dlite#/?embed=true'"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="settings-modal" title="Project settings" size="xl">
                <b-form-group label="Project file name" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="userInterfaceName" style="display:inline-block" size="sm" @change="changeName"></b-form-input>
                </b-form-group>

                <b-form-group label="Version" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                    description="Please use semantic versioning (major.minor.patch) - if undefined, version will be set to 0.0.0"
                >
                    <b-form-input v-model="viewModel.version" style="display:inline-block" size="sm"></b-form-input>
                </b-form-group>
               
                <b-form-group label="Synchronization server base URL" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="viewModel.synchronizationServerBaseUrl" style="display:inline-block" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group label="Authentication server base URL" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="viewModel.authenticationServerBaseUrl" style="display:inline-block" size="sm"></b-form-input>
                </b-form-group>
                
                <b-form-group label="Additional header code" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                    description="HTML code to be inserted in the header of the application once deployed (not in development mode) - to be used with caution"
                >
                    <b-form-textarea id="header" size="sm" :rows="20" 
                        v-model="viewModel.additionalHeaderCode"></b-form-textarea>
                </b-form-group>
            </b-modal> 

            <b-modal v-if="edit" id="bundle-modal" title="Bundle app" scrollable hide-footer size="md">
                <p> 
                    Create a bundle of a standalone WEB application, which you can deploy on your own HTTP server (Apache, Nginx, ...).
                </p>
                <b-button v-b-toggle.collapse-read-more variant="primary" size="sm" class="mb-2">Read more >></b-button>
                <b-collapse id="collapse-read-more" class="mt-2">
                    <h3>Installation - WEB app</h3>
                    <p>
                        In order to install your WEB application on your own server:
                        <ol>
                            <li>Generate and download the bundle, as a zip file (see the button below).</li>
                            <li>Upload the zip file on your server.</li>
                            <li>Unzip the content in the document root that corresponds to your domain (the zip contains an index.html file).</li>
                        </ol>
                    </p>
                    <p>Note: to allow authentication, user management, and data synchronization, the target server also requires PHP support (version >= 7.0).</p>
                </b-collapse>
                
                <b-alert show v-if="!user()" variant="danger">
                    <b-icon icon="exclamation-triangle" class="mr-2"></b-icon>
                    Generating a bundle requires an authorized user account. Please sign in or register to activate bundles.
                </b-alert>

                <b-alert show v-if="user() && !user().canGenerateBundle" variant="danger">
                    <b-icon icon="exclamation-triangle" class="mr-2"></b-icon>
                    Generating a bundle requires an authorized user account. Please request a deployment authorization for your domain.
                </b-alert>

                <hr/>
                
                <div v-if="user() && user().canGenerateBundle">
                
                    <b-form-group label="Is it an upgrade bundle?" label-cols-lg="auto"
                        label-size="sm" label-class="mb-0" class="mb-1"
                        description="Check this if you are generating a bundle to upgrade an already-installed site (in that case, the admin password and data directory are not required)"
                    >
                        <b-form-checkbox v-model="bundleParameters.upgrade" style="display:inline-block" size="sm"></b-form-checkbox>
                    </b-form-group>
                
                    <div v-if="!bundleParameters.upgrade">
                        <b-form-group label="Administration password" 
                            label-size="sm" label-class="mb-0" class="mb-1"
                            description="The administration login is 'admin', please choose a password for the administration of your application (including user account 
                            administration)"
                        >
                            <b-form-input type="password" v-model="bundleParameters.adminPassword" style="display:inline-block" size="sm"></b-form-input>
                        </b-form-group>
                        
                        <b-form-group label="Data directory" 
                            label-size="sm" label-class="mb-0" class="mb-1"
                            description="The directory (absolute path) where the application will store data on the server (must be read/write accessible by your Web server)"
                        >
                            <b-form-input v-model="bundleParameters.dataDirectory" style="display:inline-block" size="sm"></b-form-input>
                        </b-form-group>
                        
                        <b-form-group label="Use LDAP for authentication" label-cols-lg="auto"
                            label-size="sm" label-class="mb-0" class="mb-1"
                            description="Check this if you are indenting to use a LDAP server for authentication (in addition to the built-in authentication)"
                        >
                            <b-form-checkbox v-model="bundleParameters.ldap" style="display:inline-block" size="sm"></b-form-checkbox>
                        </b-form-group>

                        <b-card v-if="bundleParameters.ldap" header="LDAP configuration">
                            <b-form-group label="LDAP server" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="An IP or accessible name"
                            >
                                <b-form-input type="text" v-model="bundleParameters.ldapServer" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>

                            <b-form-group label="LDAP server port" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="An IP or accessible name"
                            >
                                <b-form-input type="number" v-model="bundleParameters.ldapServerPort" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>

                            <b-form-group label="LDAP protocol version" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                            >
                                <b-form-input type="number" v-model="bundleParameters.ldapProtocolVersion" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>

                            <b-form-group label="LDAP referrals" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                            >
                                <b-form-input type="number" v-model="bundleParameters.ldapReferrals" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>
                            
                            <b-form-group label="LDAP base DN" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="The LDAP base DN to be used to authenticate users"
                            >
                                <b-form-input v-model="bundleParameters.ldapBaseDN" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>
                            
                            <b-form-group label="LDAP admin UID" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="The LDAP admin user (mandatory to send emails to other LDAP users)"
                            >
                                <b-form-input v-model="bundleParameters.ldapAdminUID" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>

                            <b-form-group label="LDAP admin password" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="The LDAP admin user's password (mandatory to send emails to other LDAP users)"
                            >
                                <b-form-input v-model="bundleParameters.ldapAdminPassword" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>
                            
                        </b-card>
                    
                    </div>
                    <b-alert show v-else variant="warning">
                        <b-icon icon="info-circle" class="mr-2"></b-icon>
                        Before generating an upgrade bundle, do not omit to increase your app version number (in 'Files' > 'Project Settings') and to save your application file.
                    </b-alert>

                    
                    <b-button v-if="user()" @click="bundle" variant="primary" class="mx-auto my-2" :disabled="!(bundleParameters.upgrade || (bundleParameters.adminPassword && bundleParameters.dataDirectory))">
                        <b-icon icon="file-zip" class="mr-2"></b-icon>Generate and download bundle
                    </b-button>
                </div>
            </b-modal> 

            <b-modal v-if="edit" id="icon-chooser-modal" title="Choose an icon..." size="xl" scrollable static lazy @hidden="icons=[]" 
                @ok="$set(iconTargetComponent, iconTargetProp.name, selectedIcon)">
                    <b-form-input v-model="iconFilter" size="sm" class="w-25 mb-2 mx-auto" placeholder="Enter an icon name..."></b-form-input>
                    <div class="d-flex flex-wrap justify-content-center" style="gap: 0.5rem">
                    
                        <b-card v-for="(icon, i) in icons.filter(i=>i.indexOf(iconFilter)>-1)" 
                            :key="i"
                            footer-tag="footer" 
                            style="width: 10rem; cursor: pointer" 
                            :footer-bg-variant="icon === selectedIcon ? 'info' : ''"
                            :border-variant="icon === selectedIcon ? 'warning' : ''"
                            :footer-border-variant="icon === selectedIcon ? 'warning' : ''"
                            @click="selectedIcon=icon"
                        >
                            <b-card-text class="text-center"><b-icon :icon="icon"></b-icon></b-card-text>
                            <template #footer>
                                <div 
                                    :class="'text-center' + (icon === selectedIcon ? ' font-weight-bolder text-white' : '')"
                                >
                                    {{ icon }}
                                </div>
                            </template>
                        </b-card>
                    
                    </div>
            </b-modal> 

            <b-modal id="sign-in-modal" title="Sign in" size="sm" @ok="doSignIn">
                <b-form-group label="User login / email" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="userLogin" style="display:inline-block"></b-form-input>
                </b-form-group>
                <b-form-group label="User password" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="userPassword" type="password" style="display:inline-block" @keypress.native.enter="doSignIn"></b-form-input>
                </b-form-group>

            </b-modal> 
           
            <b-modal id="resource-monitoring-dialog" @shown="drawResourceMonitoring" variant="light" size="xl" hide-footer scrollable title="Application-level Resource Monitoring">
                Show last <b-select v-model="chartWindow" :options="[5, 10, 20, 30, 40, 50, 60]" size="sm" style="width:10rem" class="d-inline mx-1"></b-select> minutes
                <canvas id="chart_UPLOAD"></canvas>                    
                <canvas id="chart_DOWNLOAD"></canvas>                    
                <canvas id="chart_DATA"></canvas>                    
            </b-modal>                
              
            <b-button v-if="loaded && !edit && !isLocked()" pill size="sm" class="shadow" style="position:fixed; z-index: 10000; right: 1em; top: 1em" v-on:click="setEditMode(!edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
            <b-button v-if="loaded && edit && !isLocked()" pill size="sm" class="shadow show-mobile" style="position:fixed; z-index: 10000; right: 1em; top: 1em" v-on:click="$eventHub.$emit('edit', !edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
             
            <!-- MAIN IDE SECTION --> 
             
            <div class="d-flex flex-column vh-100"> 

            <!-- DOC -->
            
            <div v-if="loaded">
                <b-popover target="ide-navbar" title="Welcome to DLite" variant="info" custom-class="docPopover" trigger="manual" :show="docStep === 1" boundary="window" placement="bottom" @show="docStep === 1 ? true : $event.preventDefault()">
                
                        <div class="container">
                            <div class="text-center bg-dark py-3" style="border-radius: 1rem">
                                <img :src="basePath+'assets/images/logo-dlite-1-white.svg'" class="" style="width: 30%;"/>
                            </div>
                            <div v-if="newFromClipboard" class="mt-2">
                                Welcome to DLite. Paste the JSON from your clipboard in this new project (paste command in your browser's menu, or meta+v shortcut). Then, press the 'Next' button to get more tips.
                            </div> 
                            <div v-else class="mt-2">
                                Welcome to DLite. You can get started by pasting any JSON from your clipboard in this new project.
                            </div>
                            <div class="text-right mt-2">
                                <b-button size="sm" @click="docStep=100">Done</b-button>            
                                <b-button v-if="!(newFromClipboard && !showDocOnStartup)" size="sm" @click="docStep++">More tips >></b-button>            
                            </div>
                            <div v-if="!(newFromClipboard && !showDocOnStartup)" class="text-right mt-2">
                                <b-form-checkbox v-model="showDocOnStartup">
                                    Show this help on startup
                                </b-form-checkbox>                            
                            </div>
                        </div>    
                                
                </b-popover> 
    
                <b-popover target="ide-create-component-panel" title="Drag and drop components" variant="info" custom-class="docPopover" trigger="manual" :show="docStep === 2" boundary="window" placement="bottom" @show="docStep === 2 ? true : $event.preventDefault()">
                
                        <div class="container">
                            <div>
                                Drag and drop components from the left to the center part (your app). 
                            </div>
                            <div class="text-right mt-2">
                                <b-button size="sm" @click="docStep=100">Done</b-button>            
                                <b-button size="sm" @click="docStep++">More tips >></b-button>            
                            </div>
                        </div>    
                                
                </b-popover> 
    
                <b-popover target="ide-component-panel" title="Configure components" variant="info" custom-class="docPopover" trigger="manual" :show="docStep === 3" boundary="window" placement="bottom" @show="docStep === 3 ? true : $event.preventDefault()">
                
                        <div class="container">
                            <div>
                                Configure your components to adapt their style and behavior in the right panel. 
                            </div>
                            <div class="text-right mt-2">
                                <b-button size="sm" @click="docStep=100">Done</b-button>            
                                <b-button size="sm" @click="docStep++">More tips >></b-button>            
                            </div>
                        </div>    
                                
                </b-popover> 
    
                 <b-popover target="ide-play-button" title="Play your app" variant="info" custom-class="docPopover" trigger="manual" :show="docStep === 4" boundary="window" placement="bottom" @show="docStep === 4 ? true : $event.preventDefault()">
                
                        <div class="container">
                            <div>
                                Press the "play" button to see the app like it will be running, then press the "edit" button (top-right corner) to switch back to the edit mode.   
                            </div>
                            <div class="text-right mt-2">
                                <b-button size="sm" @click="docStep=100">Done</b-button>            
                            </div>
                        </div>    
                                
                </b-popover> 
            </div>
            
            <!-- IDE MENU -->
             
            <b-navbar v-if="edit && loaded" class="show-desktop shadow flex-shrink-0" ref="ide-navbar" id="ide-navbar" type="dark" variant="dark">
                <b-navbar-nav>
                    <b-navbar-brand :href="appBasePath">
                        <b-img :src="basePath+'assets/images/logo-dlite-2-white.svg'" alt="DLite" class="align-top" style="height: 1.5rem;"></b-img>
                    </b-navbar-brand>            
                    <b-nav-item-dropdown text="File" left lazy>
                        <b-dropdown-item :disabled="!isFileDirty()" @click="saveFile"><b-icon icon="download" class="mr-2"></b-icon>Save project file</b-dropdown-item>
                        <b-dropdown-item @click="loadFile2"><b-icon icon="upload" class="mr-2"></b-icon>Load project file</b-dropdown-item>
                        <b-dropdown-item :disabled="!isBrowserDirty()"  @click="saveInBrowser"><b-icon icon="download" class="mr-2"></b-icon>Save project in browser</b-dropdown-item>
                        <div class="dropdown-divider"></div>                    
                        <b-dropdown-item :disabled="!loggedIn" @click="synchronize"><b-icon icon="arrow-down-up" class="mr-2"></b-icon>Synchronize</b-dropdown-item>
                        <div class="dropdown-divider"></div>                    
                        <b-dropdown-item @click="openBundle"><b-icon icon="file-zip" class="mr-2"></b-icon>Bundle application</b-dropdown-item>
                        <div class="dropdown-divider"></div>                    
                        <b-dropdown-item @click="openSettings"><b-icon icon="gear" class="mr-2"></b-icon>Project settings</b-dropdown-item>
                    </b-nav-item-dropdown>
            
                    <b-nav-item-dropdown text="Edit" left lazy>
                        <b-dropdown-text tag="i">Use&nbsp;browser&nbsp;menu&nbsp;or&nbsp;keyboard to&nbsp;cut/copy/paste&nbsp;content</i></b-dropdown-text>
                        <div class="dropdown-divider"></div>
                        <b-dropdown-item @click="emptyTrash">Empty trash</b-dropdown-item>
                        <div v-if="selectedComponentId && compatibleComponentTypes().length > 0" class="dropdown-group">
                            <div class="dropdown-divider"></div>
                            <b-dropdown-item v-for="(componentType, i) of compatibleComponentTypes()" :key="i" @click="switchTo(componentType)">
                                <component-icon :type="componentType"/> Switch to {{ componentLabel(componentType) }}...
                            </b-dropdown-item>
                        </div>
                    </b-nav-item-dropdown>

                    <b-nav-item-dropdown text="View" left lazy>
                        <b-dropdown-form style="padding: 0px">
                            <b-form-checkbox switch v-model="jsonEditor"><div class="text-nowrap">Show JSON model</div></b-form-checkbox>                            
                        </b-dropdown-form>
                        <b-dropdown-form>
                            <b-form-checkbox switch v-model="showToolbar">Show toolbar</b-form-checkbox>                            
                        </b-dropdown-form>
                    </b-nav-item-dropdown>
    
                   <b-nav-item-dropdown text="Themes" left lazy>
                        <b-dropdown-item v-on:click="setStyle()">default</b-dropdown-item>
                        <b-dropdown-item v-on:click="setStyle('litera')">litera</b-dropdown-item>
                        <b-dropdown-item v-on:click="setStyle('lumen')">lumen</b-dropdown-item>
                        <b-dropdown-item v-on:click="setStyle('lux')">lux</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('materia')">materia</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('minty')">minty</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('pulse')">pulse</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('sandstone')">sandstone</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('simplex')">simplex</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('sketchy')">sketchy</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('slate', true)">slate</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('solar', true)">solar</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('spacelab')">spacelab</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('superhero', true)">superhero</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('united')">united</b-dropdown-item>                        
                        <b-dropdown-item v-on:click="setStyle('yeti')">yeti</b-dropdown-item>
                        <div class="dropdown-divider"></div>
                        <b-dropdown-form>
                            <b-form-group label="Bootstrap 4 stylesheet URL" label-for="dropdown-form-password">
                              <b-form-input
                                type="text"
                                size="sm"
                                style="width: 30rem"
                                placeholder="URL..."
                                v-model="bootstrapStylesheetUrl"
                              ></b-form-input>
                            </b-form-group>
                            <b-form-checkbox class="mb-3" v-model="darkMode">Dark mode</b-form-checkbox>                            
                            <b-button variant="primary" size="sm" @click="setStyleUrl">Apply</b-button>
                        </b-dropdown-form>
                        
<!--                        <b-dropdown-item>custom<b-input type="text" size="sm" v-model="viewModel.bootstrapStylesheetUrl"><b-button>Apply...</b-button></b-input></b-dropdown-item>                        -->
                  </b-nav-item-dropdown>

                    <b-nav-item-dropdown text="Tools" left lazy>
                        <b-dropdown-item @click="openModels"><b-icon icon="diagram3" class="mr-2"></b-icon>Model editor</b-dropdown-item>
                        <b-dropdown-item @click="openStorage"><b-icon icon="server" class="mr-2"></b-icon>Storage management</b-dropdown-item>
                        <b-dropdown-item v-b-modal.resource-monitoring-dialog><b-icon icon="lightning" class="mr-2"></b-icon>Application resource monitoring</b-dropdown-item>
                    </b-nav-item-dropdown>

                    <b-nav-item-dropdown text="Documentation" left lazy>
                        <b-dropdown-item @click="newFromClipboard=false;docStep=1"><b-icon-question-circle class="mr-2"/>Quick tour</b-dropdown-item>
                    </b-nav-item-dropdown>


<!--                   <b-nav-item-dropdown text="Plugins" left lazy>-->
<!--                        <b-dropdown-item v-for="plugin of availablePlugins()" v-on:click="togglePlugin(plugin)">-->
<!--                            <b-icon :icon="pluginState(plugin) ? 'check-circle' : 'circle'" class="mr-2"></b-icon> {{pluginLabel(plugin)}}-->
<!--                        </b-dropdown-item>-->
<!--                  </b-nav-item-dropdown>-->

                  <b-navbar-nav class="ml-auto">
                    <b-nav-form>
                        <b-button v-if="!loggedIn" class="float-right" size="sm" @click="signIn"><b-icon-person class="mr-2"></b-icon-person>Sign in</b-button>  
                        <div v-else class="float-right">
                            <div @click="signOut" style="cursor: pointer">
                                <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-2"></b-avatar>
                                <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-2"></b-avatar>
                                <span class="text-light">{{ user().email }}</span>
                            </div>
                        </div>          
                    </b-nav-form>                
                  </b-navbar-nav>
                 
                </b-navbar-nav>
                
            </b-navbar>

            <!-- IDE TOOLBAR -->

            <toolbar-panel :show="edit && loaded && showToolbar"></toolbar-panel>
                 
            <!-- APP CONTAINER -->     
                       
            <b-container id="platform-main-container" v-if="!loaded" fluid class="pt-3 flex-grow-1">
                <b-button v-if="!loggedIn" class="float-right" size="sm" @click="signIn"><b-icon-person class="mr-2"></b-icon-person>Sign in</b-button>
                <div v-if="loggedIn" class="text-right">
                    <div @click="signOut" style="cursor: pointer">
                        <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-2"></b-avatar>
                        <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-2"></b-avatar>
                        <span class="show-desktop text-light">{{ user().email }}</span>
                    </div>
                </div>          
                <b-container>
                    <div class="text-center">
                        <div class="show-desktop">
                            <a href="https://www.dlite.io">
                                <b-img :src="basePath+'assets/images/' + (darkMode ? 'logo-dlite-1-white.svg' : 'dlite_logo_banner.png')" style="width: 30%"></b-img>
                            </a>
                            <div class="mr-2">Version {{ version() }}</div>
                            <div style="font-size: 1.5rem; font-weight: lighter">Open Source low-code platform for frontend development</div>
                            <div class="mb-5" style="font-size: 1rem; font-style: italic">Leverage the Local-First Software paradigm and build apps MUCH faster with no limits</div>
                        </div>
                        <div class="show-mobile">
                            <b-img :src="basePath+'assets/images/' + (darkMode ? 'logo-dlite-1-white.svg' : 'dlite_logo_banner.png')" style="width: 60%"></b-img>
                            <div style="font-size: 1rem; font-weight: lighter">Low-code platform for frontend development</div>
                            <div class="mb-5" style="font-size: 0.8rem; font-style: italic">Build apps MUCH faster with no limits</div>
                        </div>
                        <b-button size="md" pill class="m-2" v-on:click="loadFile" variant="primary"><b-icon icon="upload" class="mr-2"></b-icon>Load project file</b-button>
                        <b-button size="md" pill class="m-2" v-on:click="blankProject" variant="secondary"><b-icon icon="arrow-right-square" class="mr-2"></b-icon>Start with a blank project</b-button>
                    </div>
                    <div class="text-center mt-2">
                        Or check out our <b-link href="#examples">examples and templates</b-link> (free to use and fork at will).
                    </div>
                    <div class="text-center mt-2">
                        New to dLite? Check out the <a href="https://www.dlite.io">official Web site</a>.
                    </div>
                    <div class="text-center">
                        Need some help to get started? Check out the <a href="https://www.dlite.io/#/tutorial">tutorial</a>.
                    </div>
                    <div class="text-center mt-2">
                        <b-button href="https://github.com/cincheo/dlite" variant="light">Github</b-button>
                    </div>
                </b-container>
                
                <a id="examples"></a>
                <h3 class="text-center mt-5 mb-0">Tools</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="appBasePath" :apps="coreApps.filter(app => app.category === 'tools')"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Search and APIs</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="appBasePath" :apps="coreApps.filter(app => app.category === 'api')"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Misc.</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="appBasePath" :apps="coreApps.filter(app => (app.category === 'family' || app.category === 'web'))"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Developer tools</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="appBasePath" :apps="coreApps.filter(app => app.category === 'developer-tools')"></apps-panel>
                <h3 v-if="myApps" class="text-center mt-4">My apps</h3>
                <apps-panel v-if="myApps" :basePath="appBasePath" :apps="myApps"></apps-panel>
                
                <p class="text-center mt-4">Copyright &copy; 2021-2022, <a target="_blank" href="https://cincheo.com/cincheo">CINCHEO</a></p>                        
            </b-container>            

            <div v-else :class="(this.viewModel.navbar.infiniteScroll == true && !edit)?'':('flex-grow-1 d-flex flex-row' + (edit?' overflow-hidden':' overflow-hidden'))">
                        
                <div v-if="edit" class="show-desktop" id="left-sidebar" ref="left-sidebar" :visible="edit"
                    no-header no-close-on-route-change shadow width="20em" 
                    style="overflow-y: auto"
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'"
                    >
                    <tools-panel></tools-panel>
                </div>
                
                <keep-alive>
                    <div ref="ide-main-container" 
                        id="ide-main-container"
                        style="overflow-y: auto"
                        :class="infiniteScroll()?'h-100 flex-grow-1':'flex-grow-1'"
                    >
    
                        <div v-if="edit" id="hoverOverlay"></div>
                        <div v-if="edit" id="selectionOverlay"></div>
                        
                        <builder-dialogs v-if="edit"></builder-dialogs>
    
                        <component-view v-for="dialogId in viewModel.dialogIds" :key="dialogId" :cid="dialogId" keyInParent="dialogIds" :inSelection="false"></component-view>
                        
                        <div id="root-container" 
                            class="h-100 d-flex flex-column" 
                            style="overflow-y: auto"
                            v-on:scroll="followScroll"
                        >
                            <a id="_top"></a>
                        
                            <component-view :cid="viewModel.navbar.cid" keyInParent="navbar" :inSelection="false"></component-view>
                            <div id="content" style="height: 100%; overflow-y: auto">
                                <slot v-bind:jsonEditor="jsonEditor" v-bind:edit="edit"></slot>
                            </div>
                        </div>    
                        
                    </div>
                </keep-alive>
                
                <div v-if="edit" class="show-desktop" id="right-sidebar" ref="right-sidebar" :visible="edit" 
                    style="overflow-y: auto"
                    no-header no-close-on-route-change shadow width="30em" 
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'" 
                >
                    <component-panel></component-panel>
                </div>
                
            </div>                
            
               <!-- status bar --> 
              <b-navbar v-if="showStatusBar()" class="shadow flex-shrink-0" ref="ide-statusbar" id="ide-statusbar" type="dark" variant="dark">
            
                  <b-navbar-nav :class="edit?'':'mx-auto'">
                    <span v-if="edit" class="mr-2 text-light small">dLite version {{ version() }}</span>
                    <span v-else class="text-light"><small>Powered by <a href="https://www.dlite.io" target="_blank">
                            <b-img :src="basePath+'assets/images/logo-dlite-2-white.svg'" class="align-top" style="height: 1.3rem;"></b-img>
                        </a> version {{ version() }}, <span class="text-nowrap">Copyright &copy; 2022, 
                        <a href="https://www.cincheo.com" target="_blank"><b>CINCHEO</b></a>&trade;
                    </span></small></span>
                  </b-navbar-nav>
                  
                  <b-navbar-nav v-if="edit" class="ml-auto">
                    <b-nav-form>
                        <div v-if="selectedComponentModel" class="d-flex flex-row align-items-center">
                        
                            <b-form-group v-if="!selectedComponentModel.dataSource || !selectedComponentModel.dataSource.startsWith('=')">
                                <b-input-group>
                                    <b-form-select size="sm"
                                        v-model="selectedComponentModel.dataSource" :options="selectableDataSources()"></b-form-select>
                                    <b-input-group-append>
                                      <b-button size="sm" variant="danger" @click="$set(selectedComponentModel, 'dataSource', undefined)">x</b-button>
                                      <b-button :variant="formulaButtonVariant" size="sm" @click="$set(selectedComponentModel, 'dataSource', '=')"><em>f(x)</em></b-button>
                                    </b-input-group-append>                        
                                </b-input-group>
                            </b-form-group>

                            <b-form-group v-else>
                                <b-input-group>
                                    <code-editor 
                                        containerStyle="min-width: 20rem; min-height: 0.8rem"
                                        :formula="true"
                                        v-model="selectedComponentModel.dataSource" 
                                        :contextComponent="{ target: selectedComponent(), showActions: false }"
                                        :contextObject="selectedComponentModel.dataSource"
                                    ></code-editor>
                                    <b-input-group-append>                                
                                        <b-button :variant="formulaButtonVariant" size="sm" @click="$set(selectedComponentModel, 'dataSource', undefined)"><em><del>f(x)</del></em></b-button>
                                    </b-input-group-append>                                    
                                </b-input-group>
                            </b-form-group>
 
                            <b-badge v-if="selectedComponentModel.field" variant="info" class="ml-2">
                                {{ selectedComponentModel.field }}
                            </b-badge>
                                    
                        </div>
                    </b-nav-form>
                  </b-navbar-nav>              
              </b-navbar>
            
          </div>
            
        </div>
        `,
        data: () => {
            return {
                viewModel: applicationModel,
                activePlugins: undefined,
                edit: ide.editMode,
                userInterfaceName: userInterfaceName,
                backend: backend,
                loaded: ide.applicationLoaded,
                darkMode: ide.isDarkMode(),
                formulaButtonVariant: ide.isDarkMode() ? 'outline-light' : 'outline-primary',
                coreApps: [],
                myApps: [],
                selectedComponentId: ide.selectedComponentId,
                selectedComponentModel: null,
                targetLocation: ide.targetLocation,
                bootstrapStylesheetUrl: applicationModel.bootstrapStylesheetUrl,
                loggedIn: ide.user !== undefined,
                timeout: undefined,
                shieldDisplay: undefined,
                eventShieldOverlay: undefined,
                errorMessages: [],
                command: '',
                userLogin: undefined,
                userPassword: undefined,
                icons: [],
                iconTargetComponent: null,
                iconTargetProp: null,
                selectedIcon: null,
                hoverIcon: null,
                iconFilter: '',
                bundleParameters: {
                    adminPassword: null,
                    dataDirectory: null,
                    ldap: false,
                    ldapServer: "localhost",
                    ldapServerPort: "389",
                    ldapProtocolVersion: "3",
                    ldapReferrals: "0",
                    ldapBaseDN: "dc=xxx,dc=yyy",
                    ldapAdminUID: "root",
                    ldapAdminPassword: ""
                },
                chartWindow: 5,
                showToolbar: false,
                jsonEditor: false,
                newFromClipboard: parameters.get('src') === 'newFromClipboard',
                docStep: ide.docStep
            }
        },
        computed: {
            appBasePath: function () {
                let p = window.location.pathname;
                let params = [];
                if (parameters.get('plugins')) {
                    params.push('plugins=' + parameters.get('plugins'));
                }
                if (params.length > 0) {
                    p += '?';
                }
                p += params.join('&');
                return p;
            },
            isActive(href) {
                return href === this.$root.currentRoute;
            },
            navbarHeight: function () {
                if (this.bootstrapStylesheetUrl) {
                    // noop
                }
                const navBar = document.getElementById('ide-navbar');
                let height = navBar ? navBar.offsetHeight : 0;
                ide.updateSelectionOverlay(ide.selectedComponentId);
                ide.updateHoverOverlay(ide.hoveredComponentId);
                return height;
            },
            statusbarHeight: function () {
                if (this.bootstrapStylesheetUrl) {
                    // noop
                }
                const statusBar = document.getElementById('ide-statusbar');
                let height = statusBar ? statusBar.offsetHeight : 0;
                ide.updateSelectionOverlay(ide.selectedComponentId);
                ide.updateHoverOverlay(ide.hoveredComponentId);
                return height;
            },
            showDocOnStartup: {
                get: function() {
                    return $tools.getCookie('hide-docs') !== 'true';
                },
                set: function(value) {
                    $tools.setCookie('hide-docs', !value);
                }
            }
        },
        watch: {
            $route(to, from) {
                this.$eventHub.$emit('route-changed', to, from);
                this.reactiveBindingsEnsured = false;
            },
            chartWindow: function () {
                this.drawResourceMonitoring();
            },
            jsonEditor: function() {
                if (this.jsonEditor) {
                    ide.hideOverlays();
                } else {
                    ide.updateSelectionOverlay(ide.selectedComponentId);
                }
            }
        },
        created: function () {
            Vue.prototype.$eventHub.$on('sign-in-request', () => {
                if (Vue.prototype.$eventHub._events['sign-in-request'].length === 1) {
                    // default sign in
                    this.$root.$emit('bv::show::modal', 'sign-in-modal');
                }
            });
            Vue.prototype.$eventHub.$on('report-error', (level, tittle, description) => {
                this.$bvToast.toast(description, {
                    title: tittle,
                    variant: level,
                    autoHideDelay: 2000,
                    solid: true
                });
            });
            this.$eventHub.$on('icon-chooser', (viewModel, prop) => {
                let show = () => {
                    this.iconTargetComponent = viewModel;
                    this.iconTargetProp = prop;
                    this.selectedIcon = viewModel[prop.name];
                    this.icons = ide.icons;
                    this.$root.$emit('bv::show::modal', 'icon-chooser-modal');
                };
                if (ide.icons.length < 20) {
                    $tools.loadScript(basePath+"assets/lib/bv-icons.js", () => {
                        show();
                    });
                } else {
                    show();
                }
            });
            this.$eventHub.$on('set-user', (user) => {
                this.loggedIn = user !== undefined;
                if (this.loggedIn) {
                    this.$root.$emit('bv::hide::modal', 'sign-in-modal');
                }
            });
            this.$eventHub.$on('edit', (event) => {
                this.edit = event;
                this.applySplitConfiguration();
            });
            this.$eventHub.$on('application-loaded', () => {
                console.info("application-loaded");
                this.loaded = true;
                if (applicationModel) {
                    this.viewModel = applicationModel;
                }
                this.applySplitConfiguration();
            });
            this.$eventHub.$on('application-saved', () => {
                console.info("application-saved");
                this.$forceUpdate();
            });
            this.$eventHub.$on('style-changed', () => {
                this.darkMode = ide.isDarkMode();
                this.formulaButtonVariant = ide.isDarkMode() ? 'outline-light' : 'outline-primary';
                Vue.nextTick(() => {
                    document.querySelectorAll('.gutter').forEach(e => e.style.backgroundColor = ide.isDarkMode() ? '#666' : '#DDD');
                });
                // hack to wait that the new style renders
                setTimeout(() => {
                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                    setTimeout(() => {
                        this.bootstrapStylesheetUrl = "$";
                        this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                        ide.updateSelectionOverlay(ide.selectedComponentId);
                        setTimeout(() => {
                            this.bootstrapStylesheetUrl = "$";
                            this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                            ide.updateSelectionOverlay(ide.selectedComponentId);
                            setTimeout(() => {
                                this.bootstrapStylesheetUrl = "$";
                                this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                                ide.updateSelectionOverlay(ide.selectedComponentId);
                                setTimeout(() => {
                                    this.bootstrapStylesheetUrl = "$";
                                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                                    ide.updateSelectionOverlay(ide.selectedComponentId);
                                }, 5000);
                            }, 2000);
                        }, 500);
                    }, 300);
                }, 300);
            });
            this.$eventHub.$on('screen-resized', () => {
                // hack to force the navbar height to be calculated
                setTimeout(() => {
                    this.bootstrapStylesheetUrl = "$";
                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                }, 300);
            });
            this.$eventHub.$on('component-selected', (cid) => {
                this.selectedComponentId = cid;
                if (this.selectedComponentId) {
                    this.selectedComponentModel = $v(this.selectedComponentId);
                } else {
                    this.selectedComponentModel = null;
                }
            });
            this.$eventHub.$on('target-location-selected', (targetLocation) => {
                this.targetLocation = targetLocation;
            });
            this.$eventHub.$on('component-selected', (cid) => {
                this.selectedComponentId = cid;
            });
        },
        mounted: async function () {

            this.eventShieldOverlay = document.getElementById('eventShieldOverlay');

            document.addEventListener("paste", pasteEvent => {
                if (!ide.editMode) {
                    return;
                }
                if (document.activeElement && document.activeElement.tagName.toLowerCase() !== 'body') {
                    return;
                }
                let targetLocation = ide.getTargetLocation();
                if (!targetLocation) {
                    return;
                }
                this.retrieveDataFromClipboard(pasteEvent, async (data, type) => {
                    let viewModel;
                    let dataComponentModel;
                    let b64;
                    switch (type) {
                        case 'text':
                            try {
                                console.info("creating text (possibly json) from clipboard");
                                const model = JSON.parse(data);
                                if (model.cid && model.type) {
                                    const template = components.registerTemplate(model);
                                    components.setChild(ide.getTargetLocation(), template);
                                } else {
                                    const modelParser = new ModelParser('tmpModel').parseJson(data);
                                    if (Array.isArray(model)) {
                                        viewModel = components.buildCollectionEditor(
                                            modelParser,
                                            modelParser.parsedClasses[0],
                                            undefined,
                                            false,
                                            'Table',
                                            true,
                                            true,
                                            true
                                        );
                                        dataComponentModel = viewModel.components[0];
                                    } else {
                                        dataComponentModel = viewModel = components.buildInstanceForm(modelParser, modelParser.parsedClasses[0]);
                                    }
                                }
                            } catch (e) {
                                console.info("creating text view from clipboard", e);
                                viewModel = components.createComponentModel("TextView");
                                viewModel.tag = 'div';
                                viewModel.text = data;
                            }
                            break;
                        case 'html':
                            console.info("creating html view from clipboard");
                            viewModel = components.createComponentModel("TextView");
                            viewModel.tag = 'div';
                            viewModel.text = data;
                            break;
                        case 'image':
                            b64 = await this.blobToBase64(data);
                            console.info("creating image from clipboard");
                            viewModel = components.createComponentModel("ImageView");
                            viewModel.src = b64;
                            viewModel.display = "fluid";
                            break;
                        case 'pdf':
                            b64 = await this.blobToBase64(data);
                            console.info("creating pdf from clipboard");
                            viewModel = components.createComponentModel("PdfView");
                            viewModel.documentPath = b64;
                            viewModel.class = "w-100";
                            viewModel.page = 1;
                            break;
                    }
                    if (viewModel) {
                        components.registerComponentModel(viewModel);
                        components.setChild(targetLocation, viewModel);
                        ide.selectComponent(viewModel.cid);
                        if (dataComponentModel) {
                            this.$nextTick(() => {
                                $c(dataComponentModel.cid).setData(JSON.parse(data));
                            });
                        }
                        if (ide.targetLocation && typeof ide.targetLocation.index === 'number') {
                            let newTargetLocation = ide.targetLocation;
                            newTargetLocation.index++;
                            ide.setTargetLocation(newTargetLocation);
                        }
                    }

                });
            });

            document.addEventListener("copy", copyEvent => {
                if (!ide.editMode) {
                    return;
                }
                if (document.activeElement.tagName.toUpperCase() === 'INPUT' || document.activeElement.tagName.toUpperCase() === 'TEXTAREA') {
                    return;
                }
                if (ide.selectedComponentId) {
                    ide.copyComponent(ide.selectedComponentId);
                }
            });

            document.addEventListener("cut", copyEvent => {
                if (!ide.editMode) {
                    return;
                }
                if (document.activeElement.tagName.toUpperCase() === 'INPUT' || document.activeElement.tagName.toUpperCase() === 'TEXTAREA') {
                    return;
                }
                if (ide.selectedComponentId) {
                    ide.copyComponent(ide.selectedComponentId);
                    ide.deleteComponent();
                }
            });

            document.addEventListener("keydown", ev => {

                if (ev.metaKey) {
                    switch (ev.key) {
                        case 'S':
                        case 's':
                            this.saveFile();
                            ev.preventDefault()
                            break;
                    }
                }

            });

            window.addEventListener('mousewheel', this.followScroll);

            // TODO: ADD scroll event listener on main container for iframes

            const findComponent = (x, y) => {
                const display = this.eventShieldOverlay.style.display;
                this.eventShieldOverlay.style.display = 'none';
                let el = document.elementFromPoint(x, y);
                while (el && !el.classList.contains('component-container')) {
                    el = el.parentElement;
                }
                this.eventShieldOverlay.style.display = display;
                if (el) {
                    return el.id.substring(3);
                } else {
                    return undefined;
                }
            }

            window.addEventListener('mousemove', ev => {
                if (!this.edit) {
                    this.eventShieldOverlay.style.display = 'none';
                    return;
                }
                if (ev.buttons) {
                    return;
                }
                const cid = findComponent(ev.clientX, ev.clientY);
                if (cid) {
                    ide.hoverComponent(cid);
                    if (ide.selectedComponentId !== ide.hoveredComponentId) {
                        this.eventShieldOverlay.style.display = 'block';
                    } else {
                        this.eventShieldOverlay.style.display = 'none';
                    }
                } else {
                    this.eventShieldOverlay.style.display = 'none';
                    ide.updateHoverOverlay(undefined);
                    ide.hoverComponent(undefined);
                }
            });

            let mousedownCid;

            window.addEventListener('mousedown', ev => {
                if (!this.edit) {
                    return;
                }
                mousedownCid = findComponent(ev.clientX, ev.clientY);
            });

            window.addEventListener('mouseup', ev => {
                if (!this.edit) {
                    return;
                }
                const cid = findComponent(ev.clientX, ev.clientY);
                try {
                    if (cid && cid === mousedownCid) {
                        ide.selectComponent(cid);
                        const hoverOverlay = document.getElementById('hoverOverlay');
                        hoverOverlay.style.backgroundColor = '';
                        this.eventShieldOverlay.style.display = 'none';
                    }
                } finally {
                    mousedownCid = undefined;
                }
            });

            const url = basePath+'assets/apps/core-apps.json';
            this.coreApps = await fetch(url, {
                method: "GET"
            }).then(response => response.json());
            try {
                this.myApps = JSON.parse(localStorage.getItem('dlite.ide.myApps'));
            } catch (e) {
                // swallow
            }
            try {
                let userCookie = Tools.getCookie("dlite.user");
                if (userCookie) {
                    ide.setUser(JSON.parse(userCookie));
                    ide.synchronize();
                } else {
                    ide.setUser(undefined);
                }
            } catch (e) {
                console.error(e);
            }

            if (plugins) {
                plugins.forEach(plugin => {
                    $tools.loadScript(plugin);
                });
            }

            this.applySplitConfiguration();

        },
        updated: function () {
            Vue.nextTick(() => {
                //console.info('GLOBAL UPDATED', this.loaded, this.edit);
                this.$eventHub.$emit('main-updated', this.loaded, this.edit);
                if (this.loaded && !this.edit && !this.reactiveBindingsEnsured) {
                    this.reactiveBindingsEnsured = true;
                    components.ensureReactiveBindings();
                    //console.info("OBSERVING", document.getElementById("_top"));
                    this.$intersectionObserver.observe(document.getElementById("_top"));
                }
            });

        },
        methods: {
            blobToBase64: function (blob) {
                return new Promise((resolve, _) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            },
            retrieveDataFromClipboard: function (pasteEvent, callback) {
                let items = pasteEvent.clipboardData.items;

                for (let i = 0; i < items.length; i++) {
                    console.info(items[i].type);

                    let dataType;

                    if (items[i].type.indexOf("image") !== -1) {
                        dataType = "image";
                    }
                    if (items[i].type.indexOf("pdf") !== -1) {
                        dataType = "pdf";
                    }
                    if (!dataType) {
                        continue;
                    }


                    let blob = items[i].getAsFile();

                    if (blob.size > 100000) {
                        this.$bvToast.toast(`Do not try to embed content larger than 100Ko, it will make your app file fatter and 
                                            will not take advantage of image caching. Please, reduce your image size by using appropriate 
                                            formats such as SVG, JPG or PNG, and/or make your images available through a public URL.`,
                            {
                                title: "Blocked feature (not eco-design friendly)",
                                variant: 'danger',
                                noAutoHide: true,
                                solid: true
                            }
                        );

                        return;
                    } else {
                        this.$bvToast.toast(`Embedding raw data (images, PDFs, json) in applications is not recommended for 
                                            production but is allowed up to 60Ko content.`,
                            {
                                title: "Not eco-design friendly",
                                variant: 'warning',
                                noAutoHide: true,
                                solid: true
                            }
                        );
                    }

                    if (typeof callback === "function") {
                        callback(blob, dataType);
                    }
                    return;
                }
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("text/html") === -1) continue;
                    if (typeof callback === "function") {
                        items[i].getAsString(s => callback(s, 'html'));
                    }
                }
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("text/plain") === -1) continue;
                    if (typeof callback === "function") {
                        items[i].getAsString(s => callback(s, 'text'));
                    }
                }

            },
            showStatusBar() {
                return this.loaded && (!window.bundledApplicationModel || this.edit);
            },
            selectedComponent() {
                if (this.selectedComponentId) {
                    return $c(this.selectedComponentId);
                } else {
                    return undefined;
                }
            },
            selectableDataSources() {
                return Tools.arrayConcat(['', '$parent'], components.getComponentIds().filter(cid => document.getElementById(cid)).sort());
            },
            compatibleComponentTypes() {
                const viewModel = $v(this.selectedComponentId);
                let componentTypes = [];
                if (viewModel) {
                    if (components.types.find(type => type.name === viewModel.type)?.switchable) {
                        componentTypes = components.compatibleComponentTypes(viewModel.dataType);
                        const index = componentTypes.indexOf(viewModel.type);
                        if (index !== -1) {
                            componentTypes.splice(index, 1);
                        }
                    }
                }
                return componentTypes;
            },
            componentIcon(componentType) {
                return ide.getComponentIcon(componentType);
            },
            componentLabel(componentType) {
                return componentType;
            },
            switchTo(componentType) {
                const viewModel = $v(this.selectedComponentId);
                if (viewModel) {
                    const dataModel = $d(this.selectedComponentId);
                    viewModel.type = componentType;
                    ide.selectComponent(undefined);
                    ide.selectComponent(this.selectedComponentId);
                    this.$nextTick(() => {
                        if (!viewModel.dataSource) {
                            $c(this.selectedComponentId).dataModel = dataModel;
                        }
                    });
                }
            },
            applySplitConfiguration() {
                Vue.nextTick(() => {
                    if (this.splitInstance) {
                        try {
                            this.splitInstance.destroy();
                        } catch (e) {
                            console.warn('error destroying split instance');
                        }
                        this.splitInstance = undefined;
                    }
                    if (!this.edit || !this.loaded) {
                        return;
                    }
                    let sizes = ide.getAttribute('ide.splitters.sizes');
                    if (!sizes) {
                        sizes = [15, 65, 20];
                    }
                    try {
                        this.splitInstance = Split(['#left-sidebar', '#ide-main-container', '#right-sidebar'], {
                            direction: 'horizontal',
                            gutterSize: 6,
                            // minSize: 0,
                            sizes: sizes,
                            onDrag: () => {
                                ide.updateSelectionOverlay(ide.selectedComponentId);
                                ide.setAttribute('ide.splitters.sizes', this.splitInstance.getSizes())
                            }
                        });
                        document.querySelectorAll('.gutter').forEach(e => e.style.backgroundColor = ide.isDarkMode() ? '#666' : '#DDD');

                    } catch (e) {
                        console.error('splitters: error in applying split configuration', e);
                    }
                });
            },
            infiniteScroll() {
                return !this.edit && (this.viewModel.navbar.infiniteScroll == true);
            },
            isFileDirty: function () {
                return ide.isFileDirty();
            },
            isBrowserDirty: function () {
                return ide.isBrowserDirty();
            },
            version() {
                return window.ideVersion;
            },
            changeName() {
                userInterfaceName = this.userInterfaceName;
            },
            availablePlugins() {
                return ide.availablePlugins;
            },
            togglePlugin(plugin) {
                ide.togglePlugin(plugin);
                this.activePlugins = applicationModel.plugins;
                ide.setEditMode(false);
                setTimeout(() => {
                    ide.setEditMode(true);
                    setTimeout(() => {
                        this.$bvToast.toast(`Plugin ${this.pluginLabel(plugin)} ${this.pluginState(plugin) ? 'activated' : 'deactivated'}.`, {
                            title: `Plugin ${this.pluginState(plugin) ? 'activated' : 'deactivated'}`,
                            variant: 'info',
                            autoHideDelay: 3000,
                            solid: true
                        });
                    }, 500);
                }, 500);
            },
            pluginLabel(plugin) {
                let chunks = plugin.split('/');
                return $tools.kebabToLabelText(chunks[chunks.length - 1].split('.')[0]);
            },
            pluginState(plugin) {
                if (!this.activePlugins) {
                    this.activePlugins = applicationModel.plugins;
                }
                return this.activePlugins && this.activePlugins.indexOf(plugin) > -1;
            },
            evalCommand() {
                let result = eval(this.command);
                if (result) {
                    if (typeof result === 'string') {
                        alert(result);
                    } else {
                        try {
                            alert(JSON.stringify(result, undefined, 2));
                        } catch (e) {
                            let output = '';
                            for (let property in result) {
                                if (result[property] !== Object(result[property])) {
                                    output += property + ': ' + result[property] + '\n';
                                }
                            }
                            alert(output);
                        }
                    }
                }
            },
            hasTrashedComponents() {
                return components.hasTrashedComponents();
            },
            emptyTrash() {
                components.emptyTrash();
            },
            isLocked() {
                return ide.locked;
            },
            setEditMode(editMode) {
                ide.setEditMode(editMode);
            },
            openModels: function () {
                // ensure that the default model has been seeded
                components.getModels();
                this.$root.$emit('bv::show::modal', 'models-modal');
            },
            openStorage: function () {
                this.$root.$emit('bv::show::modal', 'storage-modal');
            },
            openSettings: function () {
                this.$root.$emit('bv::show::modal', 'settings-modal');
            },
            openBundle: function () {
                this.$root.$emit('bv::show::modal', 'bundle-modal');
            },
            bundle: function () {
                ide.bundle(this.bundleParameters);
            },
            followScroll: function () {
                if (!this.timeout) {
                    this.shieldDisplay = this.eventShieldOverlay.style.display;
                }
                this.eventShieldOverlay.style.display = 'none';
                ide.updateHoverOverlay(ide.hoveredComponentId);
                ide.updateSelectionOverlay(ide.selectedComponentId);
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = undefined;
                }
                this.timeout = setTimeout(() => {
                    this.eventShieldOverlay.style.display = this.shieldDisplay;
                }, 100);
            },
            startDrag: function (evt) {
                const cid = ide.hoveredComponentId;
                ide.hoverComponent(undefined);
                evt.dataTransfer.dropEffect = 'move';
                evt.dataTransfer.effectAllowed = 'all';
                evt.dataTransfer.setData('cid', cid);
                evt.dataTransfer.setDragImage(
                    document.getElementById(cid),
                    5,
                    5
                );
            },
            user() {
                return ide.user;
            },
            signIn() {
                ide.signInRequest();
            },
            signOut() {
                if (confirm("Are you sure you want to sign out?")) {
                    ide.signOut();
                }
            },
            doSignIn: function () {
                ide.authenticate(this.userLogin, this.userPassword);
            },
            async synchronize() {
                ide.synchronize();
            },
            onSelectionOverlayClicked(event) {
                event.source.style.backgroundColor = 'none';
                //event.source.style.pointerEvents = 'none';
                //event.stopPropagation();
            },
            selectedComponentType() {
                const c = components.getComponentModel(this.selectedComponentId);
                return c ? c.type : undefined;
            },
            hideComponentCreatedModal() {
                this.$root.$emit('bv::hide::modal', 'create-component-modal');
            },
            loadFile() {
                ide.loadFile(() => {
                    this.$eventHub.$emit('edit', false);
                    ide.selectComponent('navbar');
                });
            },
            saveFile() {
                ide.saveFile();
            },
            loadFile2() {
                ide.loadFile();
            },
            saveInBrowser() {
                ide.saveInBrowser();
            },
            blankProject() {
                this.loaded = true;
                ide.selectComponent('index');
                this.applySplitConfiguration();
            },
            setStyle(value, darkMode) {
                ide.setStyle(value, darkMode);
            },
            setStyleUrl() {
                ide.setStyleUrl(this.bootstrapStylesheetUrl, this.darkMode);
            },
            drawResourceMonitoring() {
                this.drawResourceChart('UPLOAD');
                this.drawResourceChart('DOWNLOAD');
                this.drawResourceChart('DATA', 'AVERAGE');
            },
            drawResourceChart(resourceType, operation) {
                const key = 'chart_' + resourceType;
                if (this[key]) {
                    this[key].destroy();
                    this[key] = undefined;
                }
                Chart.defaults.borderColor = ide.isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                Chart.defaults.color = ide.isDarkMode() ? '#eee' : '#666';

                const ctx = document.getElementById(key).getContext('2d');

                const startDate = moment().startOf('minutes').add(1, 'minutes');
                const labels = [];
                const dates = [];
                let date = startDate.add(-this.chartWindow, 'minutes');
                let values = [];
                let ts1;
                let ts2;
                for (let i = 0; i < this.chartWindow; i++) {
                    ts1 = date.valueOf();
                    date = date.add(1, 'minutes');
                    ts2 = date.valueOf();
                    dates.push(ts2);
                    labels.push(date.format('hh:mm'));
                    if (ide.monitoredData[resourceType] && Array.isArray(ide.monitoredData[resourceType])) {
                        if (operation === 'AVERAGE') {
                            // average
                            const samples = ide.monitoredData[resourceType].filter(d => d.timestamp >= ts1 && d.timestamp < ts2);
                            const avg = samples.length > 0 ? samples.reduce((a, b) => a + b.size, 0) / samples.length : 0;
                            values.push(avg / 1000);
                        } else {
                            // sum is the default
                            values.push(ide.monitoredData[resourceType].filter(d => d.timestamp >= ts1 && d.timestamp < ts2)
                                .reduce((a, b) => a + b.size, 0) / 1000)
                        }
                    } else {
                        values.push(0);
                    }
                }

                console.info('dates', dates);
                console.info('labels', labels);
                console.info('values', values);

                this[key] = new Chart(ctx, {
                    type: operation === 'AVERAGE' ? 'bar' : 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: resourceType,
                            data: values,
                            borderWidth: 1,
                            backgroundColor: ide.isDarkMode() ? 'rgba(100, 200, 255, 0.5)' : 'rgba(0, 0, 255, 0.5)',
                            borderColor: ide.isDarkMode() ? 'rgba(100, 200, 255)' : 'rgb(0, 0, 255)',
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 3,
                        // onResize: function(chart, size) {
                        //     console.info("resize", chart, size);
                        // },
                        legend: {
                            labels: {
                                fontColor: Chart.defaults.color
                                //fontSize: 18
                            }
                        },
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    color: Chart.defaults.borderColor
                                },
                                ticks: {
                                    fontColor: Chart.defaults.color
                                },
                                time: {
                                    tooltipFormat: 'll'
                                },
                                scaleLabel: {
                                    display: true,
                                    fontColor: Chart.defaults.color
                                }
                            }],
                            yAxes: [{
                                gridLines: {
                                    color: Chart.defaults.borderColor
                                },
                                ticks: {
                                    fontColor: Chart.defaults.color
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'KBytes',
                                    fontColor: Chart.defaults.color
                                }
                            }]
                        }
                    }
                });
            }
        }
    });

    Vue.component('page-view', {
        template: `
            <main-layout v-slot="slotProps">
                <data-editor-panel v-if="slotProps.jsonEditor && slotProps.edit" 
                    ref="editor"
                    :standalone="true" 
                    :dataModel="viewModel" 
                    size="sm" 
                    panelClass="mb-1" 
                    panelStyle="height:100%" 
                    :showLineNumbers="true" 
                    :readOnly="true"
                    @update-data="onUpdateJson" 
                    @change-cursor="onChangeCursor"
                    @init-editor="onInitEditor" 
                />
                <component-view v-else :cid="viewModel ? viewModel.cid : undefined" :inSelection="false" />
            </main-layout>
        `,
        data: () => {
            return {
                viewModel: undefined
            }
        },
        created: function () {
            //this.fetchModel();
            this.$eventHub.$on('application-loaded', () => {
                return this.fetchModel();
            });
        },
        mounted: function () {
            if (!applicationModel.bootstrapStylesheetUrl) {
                ide.setStyle("slate", true);
                let content = ide.getApplicationContent();
                ide.savedFileModel = content;
                ide.savedBrowserModel = content;
            }
            return this.fetchModel();
        },
        beforeDestroy() {
            let events = this.viewModel["events"];
            for (let eventName in events) {
                this.$eventHub.$off(eventName);
            }
        },
        watch: {
            $route(to, from) {
                return this.fetchModel();
            }
        },
        methods: {
            onInitEditor() {
                console.info('slot props changed');
                this.createMarkers();
            },
            onUpdateJson(data) {
            },
            getJsonEntryValue(jsonEntry) {
               return jsonEntry.split(':')[1].split('"')[1];
            },
            findCid(row, json) {
                const rows = json.split(/\r\n|\r|\n/);
                const spaceCount = rows[row].search(/\S|$/);
                let currentRow = row;
                let currentSpaceCount;

                // forward search for cid
                while (currentRow < rows.length && (currentSpaceCount = rows[currentRow].search(/\S|$/)) >= spaceCount) {
                    if (currentSpaceCount === spaceCount) {
                        if (rows[currentRow].trim().startsWith('"cid"')) {
                            return this.getJsonEntryValue(rows[currentRow]);
                        }
                    }
                    currentRow++;
                }

                // backward search
                currentRow = row - 1;
                while (currentRow > 0) {
                    currentSpaceCount = rows[currentRow].search(/\S|$/);
                    if (currentSpaceCount <= spaceCount) {
                        if (rows[currentRow].trim().startsWith('"cid"')) {
                            return this.getJsonEntryValue(rows[currentRow]);
                        }
                    }
                    currentRow--;
                }
            },
            onChangeCursor(cursor, json) {
                const cid = this.findCid(cursor.row, json);
                if (cid !== undefined && cid !== ide.selectedComponentId) {
                    ide.selectComponent(cid);
                }
                this.createMarkers();
            },
            fetchModel: async function () {
                let pageModel = components.getComponentModel(this.$route.name);
                if (pageModel == null) {
                    pageModel = components.createComponentModel('ContainerView');
                    components.registerComponentModel(pageModel, this.$route.name);
                    components.fillComponentModelRepository(pageModel);
                }
                this.viewModel = pageModel;
            },
            createMarkers: function() {
                const editor = this.$refs['editor'].getEditor();
                const prevMarkers = editor.session.getMarkers();
                if (prevMarkers) {
                    const prevMarkersArr = Object.keys(prevMarkers);
                    for (let item of prevMarkersArr) {
                        editor.session.removeMarker(prevMarkers[item].id);
                    }
                }
                let text = editor.getSession().getValue();
                const rows = text.split(/\r\n|\r|\n/);
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    if (row.trim().startsWith('"cid"')) {
                        editor.session.addMarker(
                            new ace.Range(i, $tools.indexOf(row, '"', 3), i, row.length - 1),
                            this.getJsonEntryValue(row) === ide.selectedComponentId ? "primary-marker" : "secondary-marker",
                            "text"
                        );
                    }
                }
            }
        }
    });

    let routes = [];

    let defaultPage = applicationModel.navbar.defaultPage || applicationModel.defaultPage || 'index';
    routes.push({path: "/", redirect: defaultPage});

    applicationModel.navbar.navigationItems.forEach(nav => {
        routes.push({
            name: nav.pageId,
            path: "/" + nav.pageId,
            component: Vue.component('page-view')
        });
    });

    routes.push({path: "*", redirect: defaultPage});

    const router = new VueRouter({
        routes: routes,
        linkActiveClass: "active",
        scrollBehavior(to, from, savedPosition) {
            if (!ide.scrollDisabled) {
                if (to.hash) {
                    return {
                        selector: to.hash,
                        behavior: 'smooth'
                    }
                } else if (savedPosition) {
                    return {
                        selector: savedPosition.hash,
                        behavior: 'smooth'
                    };
                } else {
                    return {
                        x: 0,
                        y: 0,
                        behavior: 'smooth'
                    }
                }
            }
        }
    });
    ide.router = router;

    new Vue({
        router
    }).$mount("#app");
}

ide.start();
