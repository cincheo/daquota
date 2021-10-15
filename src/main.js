if (!window.ideVersion) {
    window.ideVersion = "DEVELOPMENT";
}

Vue.prototype.$intersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        console.info('intersection', entry.target.id);

        if (entry.target.id === '_top') {
            if (entry.isIntersecting) {
                ide.scrollDisabled = true;
                try {
                    ide.router.replace('')
                        .finally(() => {
                            console.info('scroll enabled again');
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
            console.info('anchor intersects', component.viewModel.publicName, ide.router);
            let navItem = applicationModel.navbar.navigationItems.find(nav => nav.kind === 'Anchor' && nav.anchor === component.viewModel.publicName);
            if (entry.isIntersecting) {
                ide.scrollDisabled = true;
                ide.router.replace('#' + component.viewModel.publicName)
                    .finally(() => {
                        console.info('scroll enabled again');
                        ide.scrollDisabled = false;
                    });
            } else {
            }
        }
    });
}, {
    rootMargin: "-15% 0px -15% 0px"
});

window.onbeforeunload = function() {
    if (ide.isFileDirty() && ide.isBrowserDirty()) {
        try {
            console.info("m1", ide.savedFileModel.replaceAll('\n', ''));
            console.info("m2", ide.getApplicationContent().replaceAll('\n', ''));
        } catch (e) {
            console.error(e);
        }
        return "";
    }
}

let orgConsoleError = console.error;
let argHandler = (arg) => {
    let message = '';
    if (typeof arg === 'string') {
        message += arg;
    }
    if (arg instanceof Error) {
        message += arg.name + ': ' + arg.message + (arg.stack ? ' ' + arg.stack : '');
    }
    return message;
}

console.error = function (arg1, arg2) {
    orgConsoleError.apply(console, arguments);
    if (ide.editMode) {
        Vue.prototype.$eventHub.$emit('on-error', Array.prototype.slice.call(arguments).map(arg => argHandler(arg)).join(', '));
        //alert(Array.prototype.slice.call(arguments).map(arg => argHandler(arg)).join(', '));
        return true;
    }
}

window.onerror = function (msg, url, linenumber) {
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
console.info("plugins", plugins);

window.addEventListener('resize', () => {
    Vue.prototype.$eventHub.$emit('screen-resized');
});

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

    if (event.data.type === 'APPLICATION_LOADED' && event.data.applicationName === 'models') {
        document.getElementById('models-iframe').contentWindow.postMessage(
            {
                type: 'SET',
                cid: 'select-0',
                data: 'contacts'
            },
            '*'
        );
    }

    if (event.data.type === 'APPLICATION_RESULT' && event.data.applicationName === 'models') {
        console.info("got application result", event.data.value);
    }


}, false);

class IDE {

    locked = false;
    uis = [];
    attributes = {};
    editMode = false;
    offlineMode = false;
    domainModels = {};
    selectedComponentId = undefined;
    targetedComponentId = undefined;
    hoveredComponentId = undefined;
    clipboard = undefined;
    applicationLoaded = false;
    user = undefined;
    authentication = false;
    sync = undefined;
    colors = undefined;
    availablePlugins = [
        'assets/plugins/google-authentication.js',
        'assets/plugins/backend4dlite-connector.js'
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
        {type: "ButtonView", label: "Button", category: "basic-components"},
        {type: "ImageView", label: "Image", category: "basic-components"},
        {type: "IconView", label: "Icon", category: "basic-components"},

        {type: "TableView", label: "Table", category: "advanced-components"},
        {type: "CardView", label: "Card", category: "advanced-components"},
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

        {type: "ContainerView", label: "Container", category: "layout"},
        {type: "SplitView", label: "Split", category: "layout"},
        {type: "IteratorView", label: "Iterator", category: "layout"},

        {type: "instance-form-builder", label: "Instance form", category: "builders"},
        {type: "collection-editor-builder", label: "Collection editor", category: "builders"},
        {type: "login-form-builder", label: "Login form", category: "builders"},
        {type: "raw-builder", label: "Generic", category: "builders"}
    ];

    constructor() {
        if (document.location.host.indexOf('localhost') > -1) {
            this.sync = new Sync('http://localhost:8888');
        } else {
            this.sync = new Sync(document.location.protocol + '//' + document.location.host);
        }
        this.attributes = {};
        this.setAttribute('leftSidebarState', 'open');
        this.setAttribute('rightSidebarState', 'open');
        Vue.prototype.$eventHub.$on('edit', (event) => {
            this.editMode = event;
            console.info("switch edit", this.editMode);
            this.targetedComponentId = undefined;
            document.querySelectorAll(".targeted").forEach(element => element.classList.remove("targeted"));
            if (this.editMode) {
                document.querySelector(".root-container").classList.add("targeted");
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
        this.locked = parameters.get('locked') === 'true';
        this.colors = {
            selection: '#0088AA',
            highlight: 'highlight'
        }
    }

    setUser(user) {
        if (!this.authentication) {
            this.setAuthentication(true);
        }
        this.user = user;
        Vue.prototype.$eventHub.$emit('set-user', user);
    }

    setAuthentication(signInFunction) {
        let authentication = !!signInFunction;
        this.signIn = signInFunction;
        this.authentication = authentication;
        Vue.prototype.$eventHub.$emit('authentication', authentication);
        if (!authentication) {
            this.user = undefined;
            Vue.prototype.$eventHub.$emit('set-user', undefined);
        }
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
        await ide.connectToServer();

        if (window.bundledApplicationModel) {
            ide.locked = true;
            await ide.loadApplicationContent(window.bundledApplicationModel);
        } else {
            if (parameters.get('src')) {
                console.info("src", parameters.get('src'));
                await ide.loadUrl(parameters.get('src'));
            } else {
                await ide.loadUI();
            }
        }
        start();
    }

    setEditMode(editMode) {
        Vue.prototype.$eventHub.$emit('edit', editMode);
    }

    selectComponent(cid) {
        console.info("ide.select", cid);
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
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    getComponentIcon(type) {
        return `assets/component-icons/${Tools.camelToKebabCase(type)}.png`
    }

    getApplicationContent() {
        return JSON.stringify({
            applicationModel: applicationModel,
            roots: components.getRoots()
        }, undefined, 2);
    }

    async save() {
        if (!userInterfaceName) {
            userInterfaceName = 'default';
        }
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
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

        const content = this.getApplicationContent();

        // const options = {
        //     types: [
        //         {
        //             description: 'DLite applications',
        //             accept: {
        //                 'application/dlite': ['.dlite']
        //             },
        //         },
        //     ],
        //     suggestedName: userInterfaceName + ".dlite"
        // };
        // const fileHandle = await window.showSaveFilePicker(options);
        //
        // const writable = await fileHandle.createWritable();
        // await writable.write(contents);
        // await writable.close();

        Tools.download(content.replaceAll("</script>", '<\\/script>'), userInterfaceName + ".dlite", "application/dlite");
        this.savedFileModel = content;
        Vue.prototype.$eventHub.$emit('application-saved');
    }

    saveInBrowser() {
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;

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
            myApp.icon = 'assets/app-icons/no_image.png';
        }

        localStorage.setItem('dlite.ide.myApps', JSON.stringify(myApps));
        this.savedBrowserModel = content;
        Vue.prototype.$eventHub.$emit('application-saved');

    }

    loadFile(callback) {
        // const pickerOpts = {
        //     types: [
        //         {
        //             description: 'DLite applications',
        //             accept: {
        //                 'application/dlite': ['.dlite']
        //             }
        //         },
        //     ],
        //     excludeAcceptAllOption: true,
        //     multiple: false
        // };
        // // open file picker
        // window.showOpenFilePicker(pickerOpts).then(([fileHandle]) => {
        //     fileHandle.getFile().then(fileData => {
        //         fileData.text().then(content => {
        //             console.info("loaded", content);
        //             let contentObject = JSON.parse(content);
        //             this.loadApplicationContent(contentObject, callback);
        //         })
        //     })
        // });
        Tools.upload(content => {
            console.info("loaded", content);
            let contentObject = JSON.parse(content);
            this.loadApplicationContent(contentObject, callback);
        });
    }

    detachComponent(cid) {
        if (!cid) {
            throw new Error("undefined cid");
        }
        // TODO: first change component models only, then detach
        const containerView = components.getContainerView(cid);
        console.info("deleting", containerView.cid, this.selectedComponent)
        let parentComponentModel = components.getComponentModel(containerView.$parent.cid)
        let keyInParent = containerView.keyInParent;
        if (Array.isArray(parentComponentModel[keyInParent])) {
            if (containerView.indexInKey === undefined) {
                Vue.prototype.$bvToast.toast("Cannot remove component - undefined index for array key", {
                    title: `Component not removed`,
                    variant: 'warning',
                    autoHideDelay: 3000,
                    solid: false
                });

                throw new Error("undefined index for array key");
            }
            parentComponentModel[keyInParent].splice(containerView.indexInKey, 1);
        } else {
            parentComponentModel[keyInParent] = undefined;
        }
        this.selectComponent(undefined);
        this.hideOverlays();
        // Vue.prototype.$bvToast.toast("Successfully moved component to the trash.", {
        //     title: `Component trashed`,
        //     variant: 'success',
        //     autoHideDelay: 2000,
        //     solid: false
        // });
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
        localStorage.setItem('dlite.clipboard', JSON.stringify($c(cid).viewModel));
    }

    pasteComponent() {
        console.info('paste');
        if (localStorage.getItem('dlite.clipboard') == null) {
            throw new Error("empty clipboard");
        }
        if (!this.getTargetLocation()) {
            throw new Error("no target location");
        }
        const template = components.registerTemplate(JSON.parse(localStorage.getItem('dlite.clipboard')));
        components.setChild(ide.getTargetLocation(), template);
    }

    async loadUrl(url) {
        if (url.startsWith('localstorage:')) {
            try {
                let name = url.split(':')[1];
                console.info("name", name);
                let appsItem = localStorage.getItem('dlite.ide.apps');
                console.info("appsItem", appsItem);
                let apps = JSON.parse(appsItem);
                console.info("apps", apps);
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
                    console.info("loadurl", json);
                    await this.loadApplicationContent(json);
                })
                .catch(async err => {
                    console.error(err);
                    alert(`Source project file at ${url} failed to be loaded. Check the URL or the CORS policies from the server.`);
                    await this.loadUI();
                });
        }
    }

    createAndLoad(userInterfaceName) {
        if (userInterfaceName) {
            let url = window.location.origin + window.location.pathname + "?ui=" + userInterfaceName;
            if (backend) {
                url += '&backend=' + backend;
            }
            window.location.href = url;
        }
    }

    load(userInterfaceName, pageName) {
        if (userInterfaceName) {
            let url = undefined;
            if (pageName) {
                url = window.location.origin + window.location.pathname + "?ui=" + userInterfaceName + "#/" + pageName;
            } else {
                url = window.location.origin + window.location.pathname + "?ui=" + userInterfaceName;
            }
            if (url) {
                if (backend) {
                    url += '&backend=' + backend;
                }
                window.location.href = url;
            }
        }
    }

    setStyleUrl(url, darkMode) {
        console.info("set style", url, darkMode);
        if (document.getElementById('bootstrap-css').href !== url) {
            document.getElementById('bootstrap-css').href = url;
        }
        applicationModel.bootstrapStylesheetUrl = url;
        applicationModel.darkMode = darkMode;
        let style = getComputedStyle(document.body);
        setTimeout(() => {
            PRIMARY = this.colors.primary = style.getPropertyValue('--primary');
            SECONDARY = this.colors.secondary = style.getPropertyValue('--secondary');
            SUCCESS = this.colors.success = style.getPropertyValue('--success');
            INFO = this.colors.info = style.getPropertyValue('--info');
            WARNING = this.colors.warning = style.getPropertyValue('--warning');
            DANGER = this.colors.danger = style.getPropertyValue('--danger');
            LIGHT = this.colors.light = style.getPropertyValue('--light');
            DARK = this.colors.dark = style.getPropertyValue('--dark');
            DARK_MODE = darkMode;
        }, 5000);
        Vue.prototype.$eventHub.$emit('style-changed');
    }

    setStyle(styleName, darkMode) {
        if (styleName === undefined) {
            this.setStyleUrl("assets/ext/bootstrap@4.5.3.min.css", false);
        } else {
            this.setStyleUrl(`assets/ext/themes/${styleName}.css`, darkMode);
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
        // if (this.targetedComponentId) {
        document.querySelectorAll(".targeted").forEach(element => element.classList.remove("targeted", "targeted-bg-dark", "targeted-bg"));
        if (this.targetedComponentId === this.selectedComponentId) {
            document.querySelector(".root-container").classList.add("targeted");
            this.targetedComponentId = undefined;
            Vue.prototype.$eventHub.$emit('component-targeted', undefined);
        } else {
            this.targetedComponentId = this.selectedComponentId;
            Vue.prototype.$eventHub.$emit('component-targeted', this.targetedComponentId);
            try {
                components.getHtmlElement(this.targetedComponentId).classList.add("targeted");
                components.getHtmlElement(this.targetedComponentId).classList.add(this.isDarkMode() ? "targeted-bg-dark" : "targeted-bg");
            } catch (e) {
            }
        }
        // } else {
        //     this.targetedComponentId = this.selectedComponentId;
        //     Vue.prototype.$eventHub.$emit('component-targeted', this.targetedComponentId);
        //     try {
        //         components.getHtmlElement(this.targetedComponentId).classList.add("targeted");
        //     } catch (e) {
        //     }
        // }

    }

    setTargetLocation(targetLocation) {
        this.targetLocation = targetLocation;
        setTimeout(() => {
            Vue.prototype.$eventHub.$emit('target-location-selected', targetLocation);
        }, 100);
    }

    getTargetLocation() {
        return this.targetLocation;
    }

    startWebSocketConnection() {
        console.log("Starting connection to WebSocket Server");
        this.wsConnection = new WebSocket(`ws://${backend}/ws/`);
        this.wsConnection.onopen = (event) => {
            console.log(`Successfully connected to the ${backend} websocket server.`)
        };

        this.wsConnection.onerror = (error) => {
            console.error(`Websocket with ${backend} encountered an error, closing :`, error);
            this.wsConnection.close();
        };

        this.wsConnection.onclose = () => {
            console.error(`Websocket is closed, attempting to reopen in 2 seconds...`);
            setTimeout(() => {
                this.startWebSocketConnection();
            }, 2000);
        };

        this.wsConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            Vue.prototype.$eventHub.$emit(data.name, data);
        };
    }

    loadApplicationContent(contentObject, callback) {
        console.info("loading", contentObject);
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
        console.info("application loaded", applicationModel);
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

    async connectToServer() {
        await fetch(baseUrl + '/uis', {
            method: "GET"
        })
            .then(response => response.json())
            .then(async uis => {
                console.log("uis", JSON.stringify(uis, null, 4));
                ide.uis = uis;
                this.offlineMode = false;
                Vue.prototype.$eventHub.$emit('offline-mode', false);
                try {
                    ide.startWebSocketConnection();
                } catch (e) {
                    console.error(e);
                }
                await this.fetchDomainModel();
            })
            .catch(error => {
                console.error("error connecting to server", error);
                this.offlineMode = true;
                Vue.prototype.$eventHub.$emit('offline-mode', true);
            });
    }

    createBlankProject() {
        console.error('creating blank project');
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
        if (this.offlineMode) {
            this.createBlankProject();
        } else {
            await fetch(baseUrl + '/index/?ui=' + userInterfaceName, {
                method: "GET",
                mode: "cors"
            })
                .then(response => response.json())
                .then(contentObject => {

                    if (contentObject != null) {
                        this.loadApplicationContent(contentObject);
                    }
                });
        }
    }

    getDomainModel(serverBaseUrl) {
        if (!serverBaseUrl) {
            serverBaseUrl = baseUrl;
        }
        if (this.domainModels[serverBaseUrl] === undefined) {
            this.fetchDomainModel(serverBaseUrl);
        }
        return this.domainModels[serverBaseUrl] === undefined ? {} : this.domainModels[serverBaseUrl];
    }


    async fetchDomainModel(serverBaseUrl) {
        if (!serverBaseUrl) {
            serverBaseUrl = baseUrl;
        }
        await fetch(serverBaseUrl + '/model', {
            method: "GET"
        })
            .then(response => response.json())
            .then(model => {
                console.log("model", JSON.stringify(model, null, 4));
                this.domainModels[serverBaseUrl] = model;
            })
            .catch(error => {
                this.domainModels[serverBaseUrl] = {};
            });
    }

    initApplicationModel() {

        console.info("init application model", applicationModel);

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

        if (applicationModel.navbar && !applicationModel.navbar.eventHandlers) {
            applicationModel.navbar.eventHandlers = [];
        }

        if (ide.router) {

            let defaultPage = applicationModel.navbar.defaultPage || applicationModel.defaultPage || 'index';
            let navigationItems = applicationModel.navbar.navigationItems;

            ide.router.addRoute({path: "/", redirect: applicationModel.defaultPage});

            navigationItems.forEach(nav => {
                if (nav.pageId && nav.pageId !== "" && (nav.kind === undefined || nav.kind === "Page")) {
                    console.info("add route to page '" + nav.pageId + "'");
                    ide.router.addRoute({
                        name: nav.pageId,
                        path: "/" + nav.pageId,
                        component: Vue.component('page-view')
                    });
                }
            });

            ide.router.addRoute({path: "*", redirect: defaultPage});

            if (!applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === ide.router.currentRoute.name)) {
                ide.router.push({name: defaultPage});
            }

            console.info('initialized application router', ide.router);
        }

        if (applicationModel.plugins) {
            applicationModel.plugins.forEach(plugin => {
                console.info("loading plugin", plugin);
                $tools.loadScript(plugin);
            });
        }

    }

    async synchronize() {
        if (!this.user) {
            return;
        }
        let lastSyncUserId = localStorage.getItem('dlite.lastSyncUserId');
        if (lastSyncUserId != null && lastSyncUserId != this.user.id) {
            console.info("changed user - clear local storage data");
            localStorage.clear();
        }
        try {
            this.sync.userId = this.user.email;
            let pullResult = await this.sync.pull();
            await this.sync.push();
            localStorage.setItem('dlite.lastSyncUserId', this.user.id);
            Vue.prototype.$eventHub.$emit('synchronized', pullResult);
        } catch (e) {
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
        <div>

            <div id="eventShieldOverlay" draggable @dragstart="startDrag($event)"></div>
            
            <b-modal v-if="edit" id="models-modal" title="Model editor" size="xl">
              <b-embed id="models-iframe" src="?locked=true&src=assets/apps/models.dlite#/?embed=true"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="storage-modal" title="Storage manager" size="xl">
              <b-embed id="storage-iframe" src="?locked=true&src=assets/apps/storage.dlite#/?embed=true"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="settings-modal" title="Project settings" size="xl">
                <b-form-group label="Project file name" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                >
                    <b-form-input v-model="userInterfaceName" style="display:inline-block" size="sm" @change="changeName"></b-form-input>
                </b-form-group>
                <b-form-group label="Additional header code" label-for="header" 
                    label-size="sm" label-class="mb-0" class="mb-1"
                    description="HTML code to be inserted in the header of the application once deployed (not in development mode) - to be used with caution"
                >
                    <b-form-textarea id="header" size="sm" :rows="20" 
                        v-model="viewModel.additionalHeaderCode"></b-form-textarea>
                </b-form-group>
            </b-modal> 
            
            <b-button v-if="!edit && !isLocked()" pill size="sm" class="shadow" style="position:fixed; z-index: 10000; right: 1em; top: 1em" v-on:click="setEditMode(!edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
            <b-button v-if="edit && !isLocked()" pill size="sm" class="shadow show-mobile" style="position:fixed; z-index: 10000; right: 1em; top: 1em" v-on:click="$eventHub.$emit('edit', !edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
             
            <b-navbar :style="'visibility: ' + (edit && loaded ? 'visible' : 'hidden')" class="show-desktop shadow" ref="ide-navbar" id="ide-navbar" type="dark" variant="dark" fixed="top">
                <b-navbar-nav>
                    <b-navbar-brand :href="basePath">
                        <b-img :src="'assets/images/logo-dlite-2-white.svg'" alt="DLite" class="align-top" style="height: 1.5rem;"></b-img>
                    </b-navbar-brand>            
                  <b-nav-item-dropdown text="File" left lazy>
                    <b-dropdown-item :disabled="!isFileDirty()" @click="saveFile"><b-icon icon="download" class="mr-2"></b-icon>Save project file</b-dropdown-item>
                    <b-dropdown-item @click="loadFile2"><b-icon icon="upload" class="mr-2"></b-icon>Load project file</b-dropdown-item>
                    <b-dropdown-item :disabled="!isBrowserDirty()"  @click="saveInBrowser"><b-icon icon="download" class="mr-2"></b-icon>Save project in browser</b-dropdown-item>
                    <div v-show="!offlineMode" class="dropdown-divider"></div>                    
                    <b-dropdown-item v-show="!offlineMode" @click="save" class="mr-2"><b-icon icon="cloud-upload" class="mr-2"></b-icon>Save project to the server</b-dropdown-item>
                    <b-dropdown-item v-show="!offlineMode" @click="load" class="mr-2"><b-icon icon="cloud-download" class="mr-2"></b-icon>Load project from the server</b-dropdown-item>
                    <div class="dropdown-divider"></div>                    
                    <b-dropdown-item :disabled="!loggedIn" @click="synchronize"><b-icon icon="arrow-down-up" class="mr-2"></b-icon>Synchronize</b-dropdown-item>
                    <div class="dropdown-divider"></div>                    
                    <b-dropdown-item @click="openSettings"><b-icon icon="gear" class="mr-2"></b-icon>Project settings</b-dropdown-item>
                  </b-nav-item-dropdown>
            
                  <b-nav-item-dropdown text="Edit" left lazy>
                    <b-dropdown-item :disabled="selectedComponentId ? undefined : 'disabled'" @click="copyComponent">Copy</b-dropdown-item>
                    <b-dropdown-item :disabled="canPaste() ? undefined : 'disabled'" @click="pasteComponent">Paste</b-dropdown-item>
                    <b-dropdown-item :disabled="selectedComponentId ? undefined : 'disabled'" @click="detachComponent"><b-icon icon="trash" class="mr-2"></b-icon>Trash</b-dropdown-item>
                    <div class="dropdown-divider"></div>
                    <b-dropdown-item @click="emptyTrash">Empty trash</b-dropdown-item>
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
                  </b-nav-item-dropdown>

                  <b-nav-item-dropdown text="Tools" left lazy>
                    <b-dropdown-item @click="openModels"><b-icon icon="diagram3" class="mr-2"></b-icon>Model editor</b-dropdown-item>
                    <b-dropdown-item @click="openStorage"><b-icon icon="server" class="mr-2"></b-icon>Storage management</b-dropdown-item>
                  </b-nav-item-dropdown>

                   <b-nav-item-dropdown text="Plugins" left lazy>
                        <b-dropdown-item v-for="plugin of availablePlugins()" v-on:click="togglePlugin(plugin)">
                            <b-icon :icon="pluginState(plugin) ? 'check-circle' : 'circle'" class="mr-2"></b-icon> {{pluginLabel(plugin)}}
                        </b-dropdown-item>
                  </b-nav-item-dropdown>

                  <b-navbar-nav class="ml-auto" v-if="authentication">
                    <b-nav-form>
                        <b-button v-if="!loggedIn" class="float-right" @click="signIn">Sign in</b-button>  
                        <div v-else class="float-right">
                            <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-3"></b-avatar>
                            <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-3"></b-avatar>
                            <span class="text-light">{{ user().email }}</span>
                        </div>          
                    </b-nav-form>                
                  </b-navbar-nav>
                 
                </b-navbar-nav>
                
            </b-navbar>
            
            
           <!-- status bar --> 
          <b-navbar :style="'visibility: ' + (edit && loaded ? 'visible' : 'hidden')" class="show-desktop shadow" ref="ide-statusbar" id="ide-statusbar"  toggleable="lg" type="dark" variant="dark" fixed="bottom">
        
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        
            <b-collapse id="nav-collapse" is-nav>
        
              <b-navbar-nav>
                <span class="mr-2">dLite version {{ version() }}</span>
                <b-nav-form v-if="errorMessages.length > 0" style="font-size: smaller; color: white">
                    <b-icon icon="exclamation-circle-fill" variant="danger"></b-icon>&nbsp;<div>{{ errorMessages.length + ' error(s)' }}</div>&nbsp;<div>{{ lastErrorMessage() }}</div>
                </b-nav-form>
        
              </b-navbar-nav>
              
              <b-navbar-nav class="ml-auto">
                <b-nav-form>
                  <b-form-input size="sm" class="mr-sm-2" placeholder="Command" v-model="command" v-on:keyup.enter="evalCommand"></b-form-input>
                  <b-button size="sm" class="my-2 my-sm-0" @click="evalCommand"><b-icon icon="play"></b-icon></b-button>
                </b-nav-form>
              </b-navbar-nav>              
            </b-collapse>
          </b-navbar>
            
            <b-container id="platform-main-container" v-if="offlineMode && !loaded" fluid class="pt-3">
                <b-button v-if="authentication && !loggedIn" class="float-right" @click="signIn">Sign in</b-button>
                <div v-if="authentication && loggedIn" class="text-right">
                    <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-3"></b-avatar>
                    <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-3"></b-avatar>
                    <span class="show-desktop text-light">{{ user().email }}</span>
                </div>          
                <b-container>
                    <div class="text-center">
                        <div class="show-desktop">
                            <a href="https://www.dlite.io">
                                <b-img :src="'assets/images/' + (darkMode ? 'logo-dlite-1-white.svg' : 'dlite_logo_banner.png')" style="width: 30%"></b-img>
                            </a>
                            <div class="mr-2">Version {{ version() }}</div>
                            <div style="font-size: 1.5rem; font-weight: lighter">Low-code platform for frontend development</div>
                            <div class="mb-5" style="font-size: 1rem; font-style: italic">Leverage the Local-First Software paradigm and build apps MUCH faster with no limits</div>
                        </div>
                        <div class="show-mobile">
                            <b-img :src="'assets/images/' + (darkMode ? 'logo-dlite-1-white.svg' : 'dlite_logo_banner.png')" style="width: 60%"></b-img>
                            <div style="font-size: 1rem; font-weight: lighter">Low-code platform for frontend development</div>
                            <div class="mb-5" style="font-size: 0.8rem; font-style: italic">Build apps MUCH faster with no limits</div>
                        </div>
                        <b-button size="md" pill class="m-2" v-on:click="loadFile" variant="primary"><b-icon icon="upload" class="mr-2"></b-icon>Load project file</b-button>
                        <b-button size="md" pill class="m-2" v-on:click="blankProject" variant="secondary"><b-icon icon="arrow-right-square" class="mr-2"></b-icon>Start with a blank project</b-button>
                    </div>
                    <div class="text-center mt-2">
                        Or check out our <b-link href="#examples">examples and templates</b-link> (free to use and fork at will).
                    </div>
                    <b-card class="mt-4 d-none">
                        <p class="text-center">Or connect to a DLite server:</p>
                        <b-form-input v-model="backend" size="md" :state="!offlineMode" v-b-tooltip.hover title="Server address"></b-form-input>
                        <b-button size="md" pill class="mt-2 float-right" v-on:click="connect" variant="outline-primary"><b-icon icon="cloud-plus" class="mr-2"></b-icon>Connect</b-button>
                    </b-card>
                    <div class="text-center mt-2">
                        New to dLite? Check out the <a href="https://www.dlite.io">official Web site</a>.
                    </div>
                    <div class="text-center">
                        Need some help to get started? Check out the <a href="https://www.dlite.io/#/tutorial">tutorial</a>.
                    </div>
                </b-container>
                
                <a id="examples"></a>
                <h3 class="text-center mt-5 mb-0">Tools</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => app.category === 'tools')"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Search and APIs</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => app.category === 'api')"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Misc.</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => (app.category === 'family' || app.category === 'web'))"></apps-panel>
                <h3 class="text-center mt-4 mb-0">Developer tools</h3>
                <div class="text-center" style="font-weight: lighter; font-style: italic">Extendable at will for your own needs</div>
                <apps-panel :basePath="basePath" :apps="coreApps.filter(app => app.category === 'developer-tools')"></apps-panel>
                <h3 v-if="myApps" class="text-center mt-4">My apps</h3>
                <apps-panel v-if="myApps" :basePath="basePath" :apps="myApps"></apps-panel>
                
                <p class="text-center mt-4">Copyright &copy; 2021, <a target="_blank" href="https://cincheo.com/cincheo">CINCHEO</a></p>                        
            </b-container>            

            <div v-else>
                        
                <b-sidebar v-if="edit" class="left-sidebar show-desktop" id="left-sidebar" ref="left-sidebar" title="Left sidebar" :visible="isRightSidebarOpened()"
                    no-header no-close-on-route-change shadow width="20em" 
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'"
                    :style="'padding-top: ' + navbarHeight + 'px; padding-bottom: ' + statusbarHeight + 'px'"
                    >
                    <tools-panel></tools-panel>
                </b-sidebar>
                <b-sidebar v-if="edit" class="show-mobile" id="left-sidebar-mobile" ref="left-sidebar-mobile" :visible="false"
                    shadow width="20em" 
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'" >
                    <mobile-tools-panel></mobile-tools-panel>
                </b-sidebar>
                <b-sidebar v-if="edit" class="right-sidebar show-desktop" id="right-sidebar" ref="right-sidebar" title="Right sidebar" :visible="isRightSidebarOpened()" 
                    no-header no-close-on-route-change shadow width="30em" 
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'" 
                    :style="'padding-top: ' + navbarHeight + 'px; padding-bottom: ' + statusbarHeight + 'px'"
                    >
                    <component-panel></component-panel>
                </b-sidebar>
                <b-container ref="ide-main-container" fluid class="p-0">

                    <div v-if="edit" id="hoverOverlay"></div>
                    <div v-if="edit" id="selectionOverlay"></div>
                    
                    <b-button v-if="edit" v-b-toggle.left-sidebar-mobile pill size="sm" class="shadow show-mobile" style="position:fixed; z-index: 300; left: -1em; top: 50%; opacity: 0.5"><b-icon icon="list"></b-icon></b-button>
                
                    <builder-dialogs v-if="edit"></builder-dialogs>

                    <b-modal id="component-modal" static scrollable hide-footer>
                        <template #modal-title>
                            <h6>Component properties</h6>
                            <component-icon :type="selectedComponentType()"></component-icon> {{ selectedComponentId }}
                        </template>
                        <component-panel :modal="true"></component-panel>
                    </b-modal>

                    <b-modal id="create-component-modal" title="Create component" static scrollable hide-footer>
                        <create-component-panel @componentCreated="hideComponentCreatedModal" initialCollapse="all"></create-component-panel>
                    </b-modal>

                    <component-view v-for="dialogId in viewModel.dialogIds" :key="dialogId" :cid="dialogId" keyInParent="dialogIds" :inSelection="false"></component-view>
                    
                    <div id="root-container" :class="'root-container' + (edit?' targeted':'')" :style="'position: relative; ' + (edit ? 'padding-top: ' + navbarHeight + 'px;' + 'padding-bottom: ' + statusbarHeight + 'px; height: 100vh; overflow: auto' : '')" v-on:scroll="followScroll">
                        <a id="_top"></a>
                    
                        <component-view :cid="viewModel.navbar.cid" keyInParent="navbar" :inSelection="false"></component-view>
                        <div id="content">
                            <slot></slot>
                        </div>
                    </div>    
                    
                </b-container>
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
                coreApps: [],
                myApps: [],
                selectedComponentId: ide.selectedComponentId,
                targetLocation: ide.targetLocation,
                bootstrapStylesheetUrl: applicationModel.bootstrapStylesheetUrl,
                offlineMode: ide.offlineMode,
                loggedIn: ide.user !== undefined,
                authentication: false,
                timeout: undefined,
                shieldDisplay: undefined,
                eventShieldOverlay: undefined,
                errorMessages: [],
                command: ''
            }
        },
        computed: {
            basePath: function () {
                let p = window.location.pathname;
                let params = [];
                if (parameters.get('user')) {
                    params.push('user=' + parameters.get('user'));
                }
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
                    console.info('computing navbarHeight');
                }
                const navBar = document.getElementById('ide-navbar');
                let height = navBar ? navBar.offsetHeight : 0;
                ide.updateSelectionOverlay(ide.selectedComponentId);
                ide.updateHoverOverlay(ide.hoveredComponentId);
                return height;
            },
            statusbarHeight: function () {
                if (this.bootstrapStylesheetUrl) {
                    console.info('computing statusbar');
                }
                const statusBar = document.getElementById('ide-statusbar');
                let height = statusBar ? statusBar.offsetHeight : 0;
                ide.updateSelectionOverlay(ide.selectedComponentId);
                ide.updateHoverOverlay(ide.hoveredComponentId);
                return height;
            }
        },
        watch: {
            $route(to, from) {
                this.$eventHub.$emit('route-changed', to, from);
            }
        },
        created: function () {
            this.$eventHub.$on('authentication', (authentication) => {
                this.authentication = authentication;
            });
            this.$eventHub.$on('set-user', (user) => {
                this.loggedIn = user !== undefined;
            });
            this.$eventHub.$on('edit', (event) => {
                this.edit = event;
            });
            this.$eventHub.$on('application-loaded', () => {
                console.info("application-loaded");
                this.loaded = true;
                if (applicationModel) {
                    this.viewModel = applicationModel;
                }
            });
            this.$eventHub.$on('application-saved', () => {
                console.info("application-saved");
                this.$forceUpdate();
            });
            this.$eventHub.$on('style-changed', () => {
                this.darkMode = ide.isDarkMode();
                // hack to wait that the new style renders
                setTimeout(() => {
                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                    setTimeout(() => {
                        this.bootstrapStylesheetUrl = "$";
                        this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                        setTimeout(() => {
                            this.bootstrapStylesheetUrl = "$";
                            this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                            setTimeout(() => {
                                this.bootstrapStylesheetUrl = "$";
                                this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                                setTimeout(() => {
                                    this.bootstrapStylesheetUrl = "$";
                                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                                }, 5000);
                            }, 2000);
                        }, 500);
                    }, 300);
                }, 300);
            });
            this.$eventHub.$on('screen-resized', () => {
                console.info('screen-resized');
                // hack to force the navbar height to be calculated
                setTimeout(() => {
                    this.bootstrapStylesheetUrl = "$";
                    this.bootstrapStylesheetUrl = applicationModel.bootstrapStylesheetUrl;
                }, 300);
            });
            this.$eventHub.$on('component-selected', (cid) => {
                this.selectedComponentId = cid;
            });
            this.$eventHub.$on('offline-mode', (offlineMode) => {
                this.offlineMode = offlineMode;
            });
            this.$eventHub.$on('target-location-selected', (targetLocation) => {
                this.targetLocation = targetLocation;
            });
            this.$eventHub.$on('component-selected', (cid) => {
                this.selectedComponentId = cid;
            });
            this.$eventHub.$on('on-error', (message) => {
                this.errorMessages.push(message);
            });
        },
        mounted: async function () {

            this.eventShieldOverlay = document.getElementById('eventShieldOverlay');

            window.addEventListener('mousewheel', this.followScroll);

            // TODO: ADD scroll event listener on main container for iframes !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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
                if (!this.edit || ev.buttons) {
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
                console.info("mouseup", ev, cid, mousedownCid);
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

            if (this.offlineMode) {
                const url = 'assets/apps/core-apps.json';
                console.info("core apps url", url);
                this.coreApps = await fetch(url, {
                    method: "GET"
                }).then(response => response.json());
                try {
                    this.myApps = JSON.parse(localStorage.getItem('dlite.ide.myApps'));
                } catch (e) {
                    // swallow
                }
            }
            //setTimeout(() => initGoogle(), 200);
            if (document.location.host.split(':')[0] == 'localhost') {
                if (parameters.get('user') === 'dev-alt') {
                    ide.setUser({
                        id: 'dev-alt',
                        firstName: 'Dev',
                        lastName: '2nd',
                        email: 'dev-alt@cincheo.com'
                    });
                } else {
                    ide.setUser({
                        id: 'dev',
                        firstName: 'Dev',
                        lastName: '1st',
                        email: 'dev@cincheo.com'
                    });
                }
                ide.synchronize();
            }

            if (plugins) {
                plugins.forEach(plugin => {
                    console.info("loading plugin", plugin);
                    $tools.loadScript(plugin);
                });
            }

        },
        updated: function () {
            if (this.updatedTimeout) {
                clearTimeout(this.updatedTimeout);
            }
            this.updatedTimeout = setTimeout(() => {
                console.info('GLOBAL UPDATED', this.loaded, this.edit);
                this.$eventHub.$emit('main-updated', this.loaded, this.edit);
                if (this.loaded && !this.edit && !this.reactiveBindingsEnsured) {
                    this.reactiveBindingsEnsured = true;
                    components.ensureReactiveBindings();
                    console.info("OBSERVING", document.getElementById("_top"));
                    this.$intersectionObserver.observe(document.getElementById("_top"));
                }
            }, 200);
        },
        methods: {
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
            lastErrorMessage() {
                if (this.errorMessages.length > 0) {
                    return Tools.truncate(this.errorMessages[this.errorMessages.length - 1], 80).replace(/(\r\n|\n|\r)/gm, "");
                } else {
                    return '';
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
                this.$root.$emit('bv::show::modal', 'models-modal');
            },
            openStorage: function () {
                this.$root.$emit('bv::show::modal', 'storage-modal');
            },
            openSettings: function () {
                this.$root.$emit('bv::show::modal', 'settings-modal');
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
                if (ide.authentication) {
                    ide.signIn();
                }
            },
            async synchronize() {
                ide.synchronize();
            },
            onSelectionOverlayClicked(event) {
                console.info("COUCOU");
                event.source.style.backgroundColor = 'none';
                //event.source.style.pointerEvents = 'none';
                //event.stopPropagation();
            },
            selectedComponentType() {
                const c = components.getComponentModel(this.selectedComponentId);
                return c ? c.type : undefined;
            },
            hideComponentCreatedModal() {
                console.info("hide modal");
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
            async save() {
                ide.save(userInterfaceName);
            },
            async load() {
                ide.createAndLoad(userInterfaceName);
            },
            detachComponent() {
                ide.detachComponent(this.selectedComponentId);
                ide.selectComponent(undefined);
            },
            deleteComponent() {
                ide.deleteComponent(this.selectedComponentId);
            },
            copyComponent() {
                ide.copyComponent(this.selectedComponentId);
            },
            pasteComponent() {
                ide.pasteComponent();
            },
            canPaste() {
                return this.targetLocation;
            },
            blankProject() {
                this.loaded = true;
                ide.selectComponent('navbar');
            },
            connect() {
                backend = this.backend;
                ide.createAndLoad("default");
            },
            toggleLeftSidebar: function (forceClose) {
                const sidebar = document.getElementById('left-sidebar');
                const sidebarOuter = sidebar.parentElement;
                console.info("toggleLeftSidebar", forceClose);

                if (forceClose == true || this.isLeftSidebarOpened()) {
                    sidebarOuter.classList.remove('open-sidebar');
                    sidebarOuter.classList.add('close-sidebar');
                    ide.setAttribute('leftSidebarState', 'close');
                    console.info("LEFT CLOSED");
                } else {
                    sidebarOuter.classList.remove('close-sidebar');
                    sidebarOuter.classList.add('open-sidebar');
                    sidebar.style.display = 'flex';
                    ide.setAttribute('leftSidebarState', 'open');
                    console.info("LEFT OPENED");
                }
            },
            toggleRightSidebar: function (forceClose) {
                const sidebar = document.getElementById('right-sidebar');
                const sidebarOuter = sidebar.parentElement;
                console.info("toggleRightSidebar", forceClose);

                if (forceClose == true || this.isRightSidebarOpened()) {
                    sidebarOuter.classList.remove('open-sidebar');
                    sidebarOuter.classList.add('close-sidebar');
                    ide.setAttribute('rightSidebarState', 'close');
                    console.info("RIGHT CLOSED");
                } else {
                    sidebarOuter.classList.remove('close-sidebar');
                    sidebarOuter.classList.add('open-sidebar');
                    sidebar.style.display = 'flex';
                    ide.setAttribute('rightSidebarState', 'open');
                    console.info("RIGHT OPENED");
                }
            },
            isLeftSidebarOpened() {
                return this.edit && ide.getAttribute('leftSidebarState') === 'open';
            },
            isRightSidebarOpened() {
                return this.edit && ide.getAttribute('rightSidebarState') === 'open';
            },
            setStyle(value, darkMode) {
                ide.setStyle(value, darkMode);
            }
        }
    });

    Vue.component('page-view', {
        template: `
            <div>
                <main-layout>
                    <component-view :cid="viewModel ? viewModel.cid : undefined" :inSelection="false" />
                </main-layout>
            </div>
        `,
        data: () => {
            return {
                viewModel: undefined,
                edit: ide.editMode
            }
        },
        created: function () {
            this.fetchModel();
        },
        mounted: function () {
            if (!applicationModel.bootstrapStylesheetUrl) {
                ide.setStyle("slate", true);
                let content = ide.getApplicationContent();
                ide.savedFileModel = content;
                ide.savedBrowserModel = content;
            }
        },
        beforeDestroy() {
            console.info("destroying component")
            let events = this.viewModel["events"];
            for (let eventName in events) {
                this.$eventHub.$off(eventName);
            }
        },
        watch: {
            $route(to, from) {
                this.fetchModel();
            }
        },
        methods: {
            fetchModel: async function () {
                let pageModel = components.getComponentModel(this.$route.name);
                if (pageModel == null) {
                    // if (ide.offlineMode) {
                    pageModel = components.createComponentModel('ContainerView');
                    components.registerComponentModel(pageModel, this.$route.name);
                    // } else {
                    //     let url = `${baseUrl}/page?ui=${userInterfaceName}&pageId=${this.$route.name}`;
                    //     console.log("fetch page", url);
                    //     pageModel = await fetch(url, {
                    //         method: "GET"
                    //     }).then(response => response.json());
                    //     console.log("component for page '" + this.$route.name + "'", JSON.stringify(pageModel, null, 4));
                    //     if (pageModel == null || pageModel.type == null) {
                    //         console.log("auto create container for page '" + this.$route.name + "'");
                    //         pageModel = components.createComponentModel('ContainerView');
                    //         components.registerComponentModel(pageModel, this.$route.name);
                    //     }
                    // }
                    components.fillComponentModelRepository(pageModel);
                }
                this.viewModel = pageModel;
                console.info("viewModel.cid", this.viewModel.cid);
            }
        }
    });

    let routes = [];

    let defaultPage = applicationModel.navbar.defaultPage || applicationModel.defaultPage || 'index';
    routes.push({path: "/", redirect: defaultPage});

    applicationModel.navbar.navigationItems.forEach(nav => {
        console.info("add route to page '" + nav.pageId + "'");
        routes.push({
            name: nav.pageId,
            path: "/" + nav.pageId,
            component: Vue.component('page-view')
        });
    });

    routes.push({path: "*", redirect: defaultPage});

    console.log("building router", routes);

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
