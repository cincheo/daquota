/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
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

console.info('Loading DLite...');

window.ideVersion = window.ideVersion || "DEVELOPMENT";
window.basePath = window.basePath || '';

Vue.prototype.basePath = window.basePath;

let localForage = window.localforage;

let $t = function (key, ...args) {
    let format = (str, ...args) => {
        return str.replace(/{([0-9]+)}/g, function (match, index) {
            return typeof args[index] == 'undefined' ? match : args[index];
        });
    };

    let lang = navigator.language.split('-')[0];
    let i18n = $c('shared')['i18n'];
    if (!i18n) {
        return key;
    }
    if (!i18n[lang]) {
        lang = Object.keys(i18n)[0];
        if (!lang) {
            return key;
        }
    }
    let value = i18n[lang][key];
    return value ? format(value, ...args) : key;
}

let $tc = function (key, count, ...args) {
    let format = (str, ...args) => {
        str = str.split(' | ');
        if (str.length > 1) {
            if (count === 0) {
                str = str[0];
            } else if (count === 1) {
                if (str.length === 2) {
                    str = str[0];
                } else {
                    str = str[1];
                }
            } else {
                if (str.length === 2) {
                    str = str[1];
                } else {
                    str = str[2];
                }
            }
        } else {
            str = str[0];
        }

        return str.replace(/{([0-9]+)}/g, function (match, index) {
            return typeof args[index] == 'undefined' ? match : args[index];
        }).replace(/{(count|n)}/g, function (match) {
            return typeof count == 'undefined' ? match : count;
        });
    };

    let lang = navigator.language.split('-')[0];
    let i18n = $c('shared')['i18n'];
    if (!i18n) {
        return key;
    }
    if (!i18n[lang]) {
        lang = Object.keys(i18n)[0];
        if (!lang) {
            return key;
        }
    }
    let value = i18n[lang][key];
    return value ? format(value, ...args) : key;
}

Vue.prototype.$intersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {

        if (entry.target.id === '_top') {
            if (entry.isIntersecting) {
                ide.scrollDisabled = true;
                try {
                    if (ide.router.currentRoute.hash !== '') {
                        ide.router.replace('')
                            .finally(() => {
                                ide.scrollDisabled = false;
                            });
                    }
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

ace.config.set('basePath', basePath + 'assets/ext/ace-editor/');

if (!window.bundledApplicationModel) {
    window.onbeforeunload = function () {
        if (!ide.isInFrame() && ide.isFileDirty() && ide.isBrowserDirty() && ide.applicationLoaded) {
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

window.$eventHub = Vue.prototype.$eventHub = new Vue();

let parameters = new URLSearchParams(window.location.search);

let backendProtocol = 'http';

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

    energyMeter = new EnergyMeter().registerValueHandler(value => ide.monitor('CPU', 'CPU', value * 100));

    selectedApplication = undefined;
    selectedVersion = undefined;
    tick = 0;
    locked = false;
    disablePropPanelInterception = false;
    attributes = {};
    editMode = false;
    domainModels = {};
    selectedComponentId = undefined;
    targetedComponentId = undefined;
    hoveredComponentId = undefined;
    componentStates = {shared: false};
    clipboard = undefined;
    applicationLoaded = false;
    user = undefined;
    sync = undefined;
    colors = undefined;
    monitoredData = {};
    locales = {en: 'English'};
    currencies = [{"cc": "USD", "symbol": "US$", "name": "United States dollar"}];
    commandManager = new CommandManager();
    availablePlugins = [
        basePath + 'assets/plugins/keycloak-authentication.js'
        //basePath + 'assets/plugins/backend4dlite-connector.js'
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
        {type: "TagsView", label: "Tags", category: "advanced-components"},
        {type: "DialogView", label: "Dialog", category: "advanced-components"},
        {type: "PopoverView", label: "Popover", category: "advanced-components"},
        {type: "DatepickerView", label: "Date picker", category: "advanced-components"},
        {type: "TimepickerView", label: "Time picker", category: "advanced-components"},
        {type: "PaginationView", label: "Pagination", category: "advanced-components"},
        {type: "PdfView", label: "PDF Viewer", category: "advanced-components"},
        {type: "EmbedView", label: "Embed", category: "advanced-components"},
        {type: "CarouselView", label: "Carousel", category: "advanced-components"},
        {type: "ProgressView", label: "Progress", category: "advanced-components"},
        {type: "ApplicationView", label: "App", category: "advanced-components"},

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
        if (window.location.host === 'platform.dlite.io') {
            this.auth = 'keycloak';
        } else {
            this.auth = parameters.get('auth') || (window.keycloak === true ? 'keycloak' : undefined);
        }
        console.info('authentication mode: ' + this.auth, window.location.host);
        this.sync = new Sync(() => {
                this.reportError("danger", "Authorization error", "This action is not permitted with the current credentials");
                this.setUser(undefined);
            },
            (result) => {
                if (result.error) {
                    this.reportError("danger", "Sync error", result.error);
                }
            },
            document.location.protocol + '//' + document.location.host + document.location.pathname + (document.location.pathname.endsWith("/") ? "" : "/") + "api",
            headers => {
                if (this.keycloak) {
                    headers['Authorization'] = 'Bearer ' + this.keycloak.token;
                }
                return headers;
            }
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
        };

        Vue.prototype.$eventHub.$on('component-renamed', (newName, oldName) => {
            for (let viewModel of components.getComponentModels()) {
                components.applyRenaming(viewModel, oldName, newName);
            }
        });

        $tools.onChildApplicationMessage('*', 'error', (level, title, description) => {
            this.reportError(level, title, description);
        });

        setInterval(() => {
            Vue.prototype.$eventHub.$emit('tick', this.tick++);
            if ((this.tick - 1) % 30 === 0) {
                this.monitorData();
            }
        }, 1000);
    }

    async findAllApps() {
        const allApps = [];
        let apps = await localForage.getItem('dlite.myapps');
        apps.forEach(app => {
            allApps.push($tools.cloneData(app));
        });
        const keys = await ide.getMatchingLocalStorageKeys('dlite.appstore::.*');
        const items = await Promise.all(
            keys.map(key => localForage.getItem(key))
        );
        items.map(item => item[0]).filter(version => version).forEach(version => {
                if (!allApps.find(app => app.id === version.appId)) {
                    allApps.push({
                        name: version.name,
                        id: version.appId,
                        source: 'appstore'
                    });
                }
            }
        );
        return allApps;
    }

    async findAllVersions(appId) {
        console.info('find all version for ' + appId);
        const allVersions = [];
        let keys = await ide.getMatchingLocalStorageKeys('dlite.myapps.versions::' + appId + '::.*');
        console.info('local keys', keys);
        let items = await Promise.all(
            keys.map(key => localForage.getItem(key))
        );
        items.map(items => items[0]).filter(version => version).forEach(version => {
                allVersions.push(
                    $tools.cloneData(version)
                );
            }
        );
        keys = await ide.getMatchingLocalStorageKeys('dlite.appstore::' + appId + '-.*');
        items = await Promise.all(
            keys.map(key => localForage.getItem(key))
        );
        items.map(item => item[0]).filter(version => version).forEach(version => {
                if (!allVersions.find(v => v.version === version)) {
                    allVersions.push(
                        $tools.cloneData(version)
                    );
                }
            }
        );
        console.info("versions", allVersions);
        return allVersions;
    }

    isBundled() {
        return !!window.bundledApplicationModel;
    }

    getKeycloakConfiguration() {
        if (!this._kcConf) {
            this._kcConf = {
                KC_URL: parameters.get('KC_URL') || window['KC_URL'] || (window.location.host === 'platform.dlite.io' ? 'https://sso.dlite.io/auth' : 'http://localhost:8080/auth'),
                KC_REALM: parameters.get('KC_REALM') || window['KC_REALM'] || (window.location.host === 'platform.dlite.io' ? 'elite' : 'dlite'),
                KC_CLIENT_ID: parameters.get('KC_CLIENT_ID') || window['KC_CLIENT_ID'] || (window.location.host === 'platform.dlite.io' ? 'dlite-platform' : 'dlite-dev'),
            }
        }
        return this._kcConf;
    }

    initKeycloak(callback) {
        let initOptions = {
            url: this.getKeycloakConfiguration()['KC_URL'],
            realm: this.getKeycloakConfiguration()['KC_REALM'],
            clientId: this.getKeycloakConfiguration()['KC_CLIENT_ID'],
            onLoad: 'login-required',
            checkLoginIframeInterval: 1
        }
        this.keycloak = Keycloak(initOptions);
        this.keycloak.init({onLoad: initOptions.onLoad}).then(async (auth) => {
            if (!auth) {
                window.location.reload();
            } else {
                const tokenInfos = this.keycloak['idTokenParsed'];
                console.info('token', tokenInfos);
                ide.setUser({
                    id: tokenInfos.sid,
                    firstName: tokenInfos.given_name,
                    lastName: tokenInfos.family_name,
                    login: tokenInfos.email,
                    email: tokenInfos.email,
                    imageUrl: undefined
                });

                // let userDto = await this.fetch("GET", "apex-iam", "/iam/accounts/email/" + tokenInfos['email'])
                //     .then(data => data.result);
                //
                // if (window === window.top) {
                //     this.fetch("PUT", "apex-iam", `/iam/accounts/${userDto.id}/last-connection-instant`);
                // }
                //
                // // console.log("tokeninfos => ", tokenInfos);
                // this.loggedUser = await User.init(userDto)
                // this.eventHub.$emit('userLogged', { loggedUser: this.loggedUser });
                // this.run(callback);
                if (callback) {
                    await callback();
                }
            }
        });

        ide.registerSignInFunction(this.keycloak.login);

        //Token Refresh
        setInterval(() => {
            this.keycloak.updateToken(5).then((refreshed) => {
                if (refreshed) {
                    //console.info('Token refreshed' + refreshed);
                } else {
                    //console.warn('Token not refreshed, valid for '
                    //    + Math.round(this.keycloak.tokenParsed.exp + this.keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
                }
            }).catch((error) => {
                console.error('Failed to refresh token', error);
            });
        }, 6000)
        //}

    }

    forceRender() {
        $c('shared')?.forceRender();
        $c($c('navbar')?.activeNavItem()?.pageId)?.forceRender();
    }

    updateDataSources() {
        components.getComponentModels().forEach(model => {
            if (model.type === 'ApplicationView' || model.type.endsWith('Connector')) {
                $c(model.cid)?.update();
            }
        })
    }

    monitor(type, source, value) {
        if (value) {
            //console.error('monitor add value', source, value);
            if (this.monitoredData[type] === undefined) {
                this.monitoredData[type] = [];
            }
            const data = this.monitoredData[type];
            const nowMoment = moment().startOf('minutes');
            const now = nowMoment.valueOf();
            if (data.length === 0) {
                data.push({timestamp: now, type: type, source: source, size: value, count: 1});
            } else {
                if (type === 'DATA') {
                    if (data[data.length - 1].timestamp === now) {
                        data[data.length - 1].size = value;
                    } else {
                        data.push({timestamp: now, type: type, source: source, size: value, count: 1});
                    }
                } else {
                    if (data[data.length - 1].timestamp === now) {
                        data[data.length - 1].size += value;
                        data[data.length - 1].count++;
                    } else {
                        data.push({timestamp: now, type: type, source: source, size: value, count: 1});
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

    monitorData() {
        let dataSize = 0;
        for (let c of components.getComponentModels()) {
            if (!c.dataSource) {
                try {
                    dataSize += JSON.stringify($d(c.cid)).length;
                } catch (e) {
                    // swallow
                }
            }
        }
        dataSize += JSON.stringify(applicationModel).length;
        ide.monitor('DATA', 'STORAGE', dataSize);
    }

    getTopComponentDataSizes(dataKind, topCount) {
        let topComponentsDataSizes = components.getComponentModels();
        topComponentsDataSizes = topComponentsDataSizes.map(c => {
            let value = 0;
            if (dataKind === 'DATA') {
                if (!c.dataSource) {
                    try {
                        value = JSON.stringify($d(c.cid)).length;
                    } catch (e) {
                        // swallow
                    }
                }
            } else {
                value = JSON.stringify(c, (key, value) => {
                    if (value?.cid && value.cid !== c.cid) {
                        return undefined;
                    } else {
                        return value;
                    }
                }).length;
            }

            return {
                cid: c.cid,
                value: value / 1000
            }

        });
        topComponentsDataSizes.sort((a, b) => b.value - a.value);
        console.info('TOP', topComponentsDataSizes);
        return topComponentsDataSizes.slice(0, topCount);
    }

    setUser(user) {
        this.user = user;
        if (applicationModel?.name) {
            document.title = $tools.camelToLabelText(applicationModel.name) + (user ? ' [' + user.login + ']' : '');
        }
        if (this.user) {
            ide.sync.userId = user.login;
            ide.sync.isGroupMember('#app-store-tmp').then(result => {
                if (result === true) {
                    this.user.roles = ['APP_STORE_MANAGER'];
                }
                Vue.prototype.$eventHub.$emit('set-user', user);
            });
        }
    }

    async impersonate(userId) {
        if (!userId) {
            this.sync.realUserId = undefined;
            this.setUser(this._realUser);
            await ide.synchronize();
        } else {
            this.sync.realUserId = this.sync.userId;
            this._realUser = this.user;
            this.setUser({
                id: userId,
                firstName: userId.split('@')[0].split('.').at(0),
                lastName: userId.split('@')[0].split('.').at(-1),
                login: userId,
                email: userId,
                imageUrl: undefined
            });
            await ide.synchronize();
        }
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
        console.error(level, title, description);
        $tools.notifyParentApplication('error', level, title, description);
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

    encodeModel(model) {
        if (!model) {
            return '';
        }
        if (typeof model !== 'string') {
            model = JSON.stringify(model);
        }
        return plantumlEncoder.encode(model);
    }

    decodeModel(encodedModel) {
        if (!encodedModel || encodedModel === '') {
            return undefined;
        }
        return plantumlDecoder.decode(encodedModel);
    }

    isPluginActive(plugin) {
        return applicationModel.plugins && applicationModel.plugins.indexOf(plugin) > -1;
    }

    isEmbeddedApplication() {
        return (parameters.get('src') && parameters.get('src').startsWith('$parent~'));
    }

    isEditableEmbeddedApplication() {
        return (parameters.get('src') && parameters.get('src').startsWith('$parent~') && parameters.get('locked') === 'false');
    }

    embeddingApplicationView() {
        if (this.isEmbeddedApplication()) {
            return window.parent.$c(parameters.get('src').split('~')[1]);
        } else {
            return undefined;
        }
    }

    static getRootWindow() {
        let rootWindow = window;
        while (rootWindow.parent && rootWindow.parent !== rootWindow) {
            rootWindow = rootWindow.parent;
        }
        return rootWindow;
    }

    async start() {
        console.error('Starting DLite application...');
        const doStart = async () => {
            const loadApp = async () => {
                if (this.isEmbeddedApplication()) {
                    // case of an application contained in another app (read the model from the parent app application view component)
                    const applicationView = this.embeddingApplicationView();
                    await ide.loadApplicationContent(JSON.parse(ide.decodeModel(applicationView.getEncodedModel())));
                } else {
                    if (window.bundledApplicationModel && (typeof window.bundledApplicationModel === 'object')) {
                        ide.locked = true;
                        if (parameters.get('admin')) {
                            await ide.loadUrl(basePath + 'assets/apps/admin.dlite');
                        } else {
                            await ide.loadApplicationContent(window.bundledApplicationModel);
                        }
                    } else {
                        if (parameters.get('src')) {
                            try {
                                if (parameters.get('src').startsWith('$app~')) {
                                    const chunks = parameters.get('src').split('~');
                                    const appId = chunks.at(-2);
                                    const version = chunks.at(-1);
                                    const versions = ide.findAllVersions(appId)
                                    const versionObject = version === 'latest' ? versions.at(-1) : versions.find(v => v.version === version);
                                    await ide.loadApplicationContent(JSON.parse(versionObject.model));
                                    ide.selectedApplication = ide.findAllApps().filter(app => app.id === appId)[0];
                                    ide.selectedVersion = versionObject;
                                    Vue.prototype.$eventHub.$emit('app-selected', ide.selectedApplication, ide.selectedVersion);
                                } else {
                                    if (parameters.get('src') === '_blank') {
                                        await this.createBlankProject();
                                        this.editMode = true;
                                        this.applicationLoaded = true;
                                        setTimeout(() => {
                                            ide.selectComponent('index');
                                        }, 1000);
                                    } else {
                                        let decodedModel = ide.decodeModel(parameters.get('src'));
                                        decodedModel = JSON.parse(decodedModel);
                                        if (decodedModel.applicationModel && decodedModel.roots) {
                                            await ide.loadApplicationContent(decodedModel);
                                        } else {
                                            await this.createBlankProject();
                                            this.editMode = true;
                                            this.applicationLoaded = true;
                                            setTimeout(() => {
                                                ide.selectComponent('index');
                                                ide.createFromModel(decodedModel);
                                            }, 1000);
                                        }
                                    }
                                }
                            } catch (e) {
                                await ide.loadUrl(parameters.get('src'));
                            }
                        } else {
                            if ($tools.getCookie('hide-docs') !== 'true') {
                                this.docStep = 1;
                            }
                            await ide.loadUI();
                        }
                    }
                }
                start();
            }
            if (ide.auth === 'keycloak') {
                ide.initKeycloak(loadApp);
            } else {
                await loadApp();
            }
        };
        if (parameters.get('extraScript')) {
            $tools.loadScript(parameters.get('extraScript'), doStart);
        } else {
            await doStart();
        }
    }

    setEditMode(editMode) {
        if (editMode) {
            this.setFocusedEmbedded(true);
        }
        Vue.prototype.$eventHub.$emit('edit', editMode);
    }

    isFocusedEmbedded() {
        if (ide.isEmbeddedApplication()) {
            const applicationContainer = window.parent.document.getElementById(ide.embeddingApplicationView().cid);
            return applicationContainer.classList.contains("full-window");
        } else {
            return false;
        }
    }

    setFocusedEmbedded(focused) {
        if (ide.isEmbeddedApplication()) {
            const applicationContainer = window.parent.document.getElementById(ide.embeddingApplicationView().cid);
            if (focused) {
                if (!applicationContainer.classList.contains("full-window")) {
                    window.parent.ide.hideOverlays();
                    applicationContainer.classList.add("full-window");
                }
            } else {
                if (applicationContainer.classList.contains("full-window")) {
                    window.parent.ide.hideOverlays();
                    applicationContainer.classList.remove("full-window");
                    if (this.isApplicationViewDirty()) {
                        ide.saveInApplicationView(ide.embeddingApplicationView());
                    }
                }
            }
        }

    }

    selectComponent(cid, options) {
        this.selectedComponentId = cid;
        setTimeout(() => {
            Vue.prototype.$eventHub.$emit('component-selected', cid, options);
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

    getComponentIconFromModel(model) {
        switch (model.type) {
            case 'ContainerView':
                if (model.form) {
                    return this.getComponentIcon('InstanceFormBuilder');
                }
            default:
                return this.getComponentIcon(model.type);
        }
    }

    createBlankApplicationContent(applicationName, version) {
        const applicationModel = ide.createBlankApplicationModel(applicationName);
        applicationModel.versionIndex = versionIndex;
        applicationModel.version = version || '0.0.0';

        return JSON.stringify({
            applicationModel: applicationModel,
            roots: [applicationModel.navbar]
        });
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

    isFileDirty() {
        return applicationModel && this.savedFileModel !== this.getApplicationContent();
    }

    isBrowserDirty() {
        return applicationModel && this.savedBrowserModel !== this.getApplicationContent();
    }

    isApplicationViewDirty() {
        return applicationModel && this.savedApplicationViewModel !== this.getApplicationContent();
    }

    async saveFile() {
        applicationModel.versionIndex = versionIndex;
        if (!applicationModel.name) {
            applicationModel.name = 'default';
        }
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        const content = this.getApplicationContent();

        Tools.download(content.replaceAll("</script>", '<\\/script>'), applicationModel.name + ".dlite", "application/dlite");
        this.savedFileModel = content;
        Vue.prototype.$eventHub.$emit('application-saved');
    }

    getPublicLink() {
        applicationModel.versionIndex = versionIndex;
        if (!applicationModel.name) {
            applicationModel.name = 'default';
        }
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        const content = this.getApplicationContent().replaceAll("</script>", '<\\/script>');

        return document.location.protocol + '//' + document.location.host + document.location.pathname + "?src=" + ide.encodeModel(content);
    }

    getApplicationLink(applicationVersion) {
        return document.location.protocol + '//' + document.location.host + document.location.pathname + "?src=$app~" + applicationVersion.appId + "~" + applicationVersion.version;
    }

    // old version (to remove)
    async oldBundle(bundleParameters) {
        applicationModel.versionIndex = versionIndex;
        if (!applicationModel.name) {
            applicationModel.name = 'default';
        }
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        const newApplicationModel = JSON.parse(JSON.stringify(applicationModel));
        if (bundleParameters['keycloak'] === true) {
            if (!newApplicationModel.additionalHeaderCode) {
                newApplicationModel.additionalHeaderCode = '';
            }
            newApplicationModel.additionalHeaderCode += `
                %%BEGIN_SCRIPT%%
                window.keycloak=true;
                window.KC_URL='${bundleParameters['keycloakUrl']}';
                window.KC_REALM='${bundleParameters['keycloakRealm']}';
                window.KC_CLIENT_ID='${bundleParameters['keycloakClientId']}';
                %%END_SCRIPT%%
                `
        }

        const content = JSON.stringify({
            applicationModel: newApplicationModel,
            roots: components.getRoots()
        }, undefined, 2);
        ;

        this.sync.bundle(content, newApplicationModel.name + '-bundle.zip', bundleParameters);
    }

    async bundle(applicationVersion, bundleParameters, install) {
        const newApplicationContent = JSON.parse(applicationVersion.model);
        newApplicationContent.applicationModel.version = applicationVersion.appVersion;
        newApplicationContent.applicationModel.name = applicationVersion.appId.split('-')[0];
        if (bundleParameters['keycloak'] === true) {
            if (!newApplicationContent.applicationModel.additionalHeaderCode) {
                newApplicationContent.applicationModel.additionalHeaderCode = '';
            }
            newApplicationContent.applicationModel.additionalHeaderCode += `
                %%BEGIN_SCRIPT%%
                window.keycloak=true;
                window.KC_URL='${bundleParameters['keycloakUrl']}';
                window.KC_REALM='${bundleParameters['keycloakRealm']}';
                window.KC_CLIENT_ID='${bundleParameters['keycloakClientId']}';
                %%END_SCRIPT%%
                `
        }
        const content = JSON.stringify(newApplicationContent, null, 2);
        const result = await this.sync.bundle(
            content,
            newApplicationContent.applicationModel.name.replaceAll(' ', '_') + '-bundle.zip',
            bundleParameters,
            install
        );
        if (install && result?.result) {
            this.reportError('success', 'Success', 'Your bundle was deployed in dLite cloud. Please check that it is accessible as expected.')
        }
    }

    saveInApplicationView(applicationView) {
        applicationModel.versionIndex = versionIndex;
        if (!applicationModel.name) {
            applicationModel.name = 'default';
        }
        if (!applicationModel.version) {
            applicationModel.version = '0.0.0';
        }

        const content = this.getApplicationContent();
        console.info("saving in application view", content);
        applicationView.setModel(content);
        this.savedApplicationViewModel = content;
    }

    async clearLocalStorageKeys(queryString) {
        const keys = await this.getMatchingLocalStorageKeys(queryString);
        return Promise.all(keys.map(key => localStorage.removeItem(key)));
    }

    async getMatchingLocalStorageKeys(queryString) {
        let matchingKeys = [];
        const queryOwnerSplit = queryString.split(Sync.USER_SEP_REGEXP);
        const queryChunks = queryOwnerSplit[0].split("::");
        const keys = await localForage.keys();
        for (let i = 0, len = keys.length; i < len; ++i) {
            const ownerSplit = keys[i].split(Sync.USER_SEP_REGEXP);
            const chunks = ownerSplit[0].split("::");
            if (chunks.length !== queryChunks.length) {
                continue;
            }
            if (chunks.every((chunk, index) => new RegExp('^' + queryChunks[index] + '$').test(chunk))) {
                matchingKeys.push(keys[i]);
            }
        }
        return matchingKeys;
    }

    loadFile(callback) {
        Tools.upload(content => {
            let contentObject = JSON.parse(content);
            this.loadApplicationContent(contentObject, () => {
                if (this.isEmbeddedApplication()) {
                    ide.saveInApplicationView(ide.embeddingApplicationView());
                }
                if (callback) {
                    callback();
                }
            });
        }, undefined, 1024 * 10000);
    }

    // detachComponent(cid) {
    //     if (!cid) {
    //         throw new Error("undefined cid");
    //     }
    //     const parentComponentModel = components.getComponentModel(components.findParent(cid));
    //     const keyAndIndexInParent = components.getKeyAndIndexInParent(parentComponentModel, cid);
    //     if (keyAndIndexInParent.index > -1) {
    //         // array case
    //         parentComponentModel[keyAndIndexInParent.key].splice(keyAndIndexInParent.index, 1);
    //     } else {
    //         parentComponentModel[keyAndIndexInParent.key] = undefined;
    //     }
    //     components.cleanParentId(cid);
    //     this.selectComponent(undefined);
    //     this.hideOverlays();
    //     $tools.toast(
    //         $c('navbar'),
    //         'Component trashed',
    //         'Successfully moved component to the trash.',
    //         'success'
    //     );
    // }

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
        // if (url.startsWith('localstorage:')) {
        //     try {
        //         let name = url.split(':')[1];
        //         let appsItem = localStorage.getItem('dlite.ide.apps');
        //         let apps = JSON.parse(appsItem);
        //         await this.loadApplicationContent(JSON.parse(apps[name]));
        //     } catch (e) {
        //         alert(`Source file at ${url} failed to be loaded.`);
        //         console.error(e);
        //         await this.loadUI();
        //     }
        // } else {
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
        // }
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
        if (styleName === undefined || styleName === 'default') {
            ide.commandManager.execute(new SetStyleUrl(basePath + "assets/ext/bootstrap@4.6.2.min.css", false));
        } else {
            ide.commandManager.execute(new SetStyleUrl(basePath + `assets/ext/themes/${styleName}.css`, darkMode));
        }
    }

    isDarkMode() {
        return applicationModel.darkMode ? true : false;
    }

    setComponentDataModel(cid, dataModel) {
        if (dataModel) {
            $c('navbar').$nextTick(() => {
                $c(cid).setData(dataModel);
            });
        }
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

    setNextTargetLocation() {
        if (this.targetLocation && typeof this.targetLocation.index === 'number') {
            let newTargetLocation = this.targetLocation;
            newTargetLocation.index++;
            this.setTargetLocation(newTargetLocation);
        }
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
                        index: model.components.length
                    };
                } else {
                    let parent = components.getComponentModel(components.findParent(this.selectedComponentId));
                    if (parent && parent.type === 'ContainerView') {
                        return {
                            cid: parent.cid,
                            key: 'components',
                            index: parent.components.map(c => c.cid).indexOf(this.selectedComponentId) + 1
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
            if (!/^[a-zA-Z0-9_-]+$/i.test(newName)) {
                window.alert(`Invalid component name: '${newName}'`);
                return;
            }
            let component = components.getComponentModel(newName);
            if (!component) {
                component = components.getComponentModel(oldName);
                if (component) {
                    Vue.prototype.$eventHub.$emit('before-component-renamed', newName, oldName);
                    component.cid = newName;
                    this.selectComponent(undefined);
                    components.unregisterComponentModel(oldName);
                    components.registerComponentModel(component);
                    this.selectComponent(newName);
                    Vue.prototype.$eventHub.$emit('component-renamed', newName, oldName);
                }
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
        applicationModel = window.applicationModel = contentObject.applicationModel;
        if (!applicationModel.name) {
            applicationModel.name = 'default';
        }
        if (applicationModel.versionIndex !== versionIndex) {
            alert(`Application version index (${applicationModel.versionIndex}), does not match the IDE version index (${versionIndex}). Some features may not work properly or lack support.`);
        }
        applicationModel.navbar = contentObject.roots.find(c => c.cid === 'navbar');
        components.loadRoots(contentObject.roots);
        this.initApplicationModel();
        this.applicationLoaded = true;
        Vue.prototype.$eventHub.$emit('application-loaded');
        let content = this.getApplicationContent();
        this.savedFileModel = content;
        this.savedBrowserModel = content;
        this.savedApplicationViewModel = content;
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

    createBlankApplicationModel(applicationName) {
        return {
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
            "name": applicationName ? applicationName : "default"
        };
    }

    createBlankProject() {
        console.info('creating blank project');
        applicationModel = window.applicationModel = this.createBlankApplicationModel("default");
        components.fillComponentModelRepository(applicationModel);
        let content = this.getApplicationContent();
        this.savedFileModel = content;
        this.savedBrowserModel = content;
        this.editMode = true;
    }

    async loadUI() {
        this.createBlankProject();
    }

    createFromModel(model) {
        let viewModel;
        let dataComponentModel;
        if (model.cid && model.type) {
            ide.commandManager.beginGroup();
            const template = ide.commandManager.execute(new RegisterTemplate(model));
            ide.commandManager.execute(new SetChild(ide.getTargetLocation(), template.cid));
            ide.commandManager.endGroup();
        } else {
            const modelParser = new ModelParser('tmpModel').buildModel(model);

            if (Array.isArray(model)) {
                ide.commandManager.beginGroup();
                viewModel = ide.commandManager.execute(new BuildCollectionEditor(
                    modelParser,
                    modelParser.parsedClasses[0],
                    undefined,
                    false,
                    'Table',
                    true,
                    true,
                    true
                ));
                dataComponentModel = viewModel.components[0];
            } else {
                ide.commandManager.beginGroup();
                dataComponentModel = viewModel = ide.commandManager.execute(new BuildInstanceForm(modelParser, modelParser.parsedClasses[0]));
            }
        }
        if (viewModel) {
            ide.commandManager.execute(new SetChild(ide.getTargetLocation(), viewModel.cid));
            if (dataComponentModel) {
                ide.commandManager.execute(new SetComponentDataModel(dataComponentModel.cid, model));
            }
            ide.commandManager.endGroup();
            ide.selectComponent(viewModel.cid);
            ide.setNextTargetLocation();
        }

    }

    initStyle() {
        if (parameters.get('styleUrl')) {
            this.setStyleUrl(parameters.get('styleUrl'), parameters.get('darkMode'));
        } else {
            if (this.isEmbeddedApplication() && window.parent.applicationModel.bootstrapStylesheetUrl) {
                this.setStyleUrl(window.parent.applicationModel.bootstrapStylesheetUrl, window.parent.applicationModel.darkMode);
            }
            if (applicationModel.bootstrapStylesheetUrl) {
                this.setStyleUrl(applicationModel.bootstrapStylesheetUrl, applicationModel.darkMode);
            } else {
                this.setStyle("dlite", true);
            }
        }
    }

    initApplicationModel() {

        console.info("init application model", applicationModel.name);

        document.title = $tools.camelToLabelText(applicationModel.name) + (this.user ? '[' + this.user.login + ']' : '');

        this.initStyle();

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
            await this.synchronize();
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
        this.setUser(undefined)
        if (ide.auth === 'keycloak') {
            ide.keycloak.logout({
                redirectUri: window.location.href
            });
        } else {
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
        if (this._syncing) {
            return;
        }
        this._syncing = true;
        let lastSyncUserId = await localForage.getItem('dlite.lastSyncUserId');
        if (lastSyncUserId != null && lastSyncUserId != this.user.id) {
            // changed user - clear local storage data
            console.info('clearing local storage because user changed');
            await localForage.clear();
        }
        try {
            this.sync.userId = this.user.login;
            let pullResult = await this.sync.pull();
            await this.sync.push();
            await localForage.setItem('dlite.lastSyncUserId', this.user.id);
            Vue.prototype.$eventHub.$emit('synchronized', pullResult);
        } catch (e) {
            this.reportError("danger", "Synchronization error", e.message);
            console.error('synchronization error', e);
        }
        this._syncing = false;
    }

    updateHoverOverlay(cid) {
        let hoverOverlay = document.getElementById('hoverOverlay');
        if (!hoverOverlay) {
            return;
        }
        if (!ide.editMode || !cid) {
            hoverOverlay.style.display = 'none';
        } else {
            let componentElement = ide.getComponentElement(cid);
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
                eventShieldOverlay.style.height = hoverOverlay.style.height = '4px';
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

    getComponentElement(cid) {
        return document.getElementById('ccc-' + cid) || document.getElementById(cid);
    }

    updateSelectionOverlay(cid) {
        if (!cid) {
            return;
        }
        let selectionOverlay = document.getElementById('selectionOverlay');
        if (!ide.editMode || !selectionOverlay) {
            return;
        }
        let componentElement = this.getComponentElement(cid);
        if (!componentElement) {
            return;
        }
        const mainRect = document.body.getBoundingClientRect();
        const rect = componentElement.getBoundingClientRect();
        const x1 = Math.min(Math.max(rect.left, mainRect.left), mainRect.left + mainRect.width);
        const y1 = Math.min(Math.max(rect.top, mainRect.top), mainRect.top + mainRect.height - 6);
        const x2 = Math.min(rect.left + rect.width, mainRect.left + mainRect.width);
        const y2 = Math.min(rect.top + rect.height, mainRect.top + mainRect.height - 4);

        selectionOverlay.style.left = (x1) + 'px';
        selectionOverlay.style.top = (y1) + 'px';
        selectionOverlay.style.width = (x2 - x1) + 'px';
        selectionOverlay.style.height = (y2 - y1) + 'px';
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

    magicContext = undefined;

    magicWand(model, dataSource, showConfiguration) {
        let viewModel;
        let dataComponentModel;
        let targetLocation = ide.getTargetLocation();
        if (!targetLocation) {
            ide.reportError('warning', 'Invalid action', 'No target location selected');
            return;
        }
        if (model.cid && model.type) {
            const template = components.registerTemplate(model);
            components.setChild(ide.getTargetLocation(), template);
        } else {
            console.info('parsing model');
            const modelParser = new ModelParser('tmpModel').buildModel(model);
            console.info('model', modelParser);

            if (Array.isArray(model)) {
                console.info('collection');
                if (model.length === 0) {
                    ide.reportError('warning', 'Invalid action', 'Cannot build an editor when data is an empty array');
                    return;
                }

                if (showConfiguration) {
                    this.magicContext = {
                        model, modelParser, dataSource
                    }
                    $c('navbar').$bvModal.show('collection-editor-builder');
                } else {
                    ide.commandManager.beginGroup();
                    viewModel = ide.commandManager.execute(new BuildCollectionEditor(
                        modelParser,
                        modelParser.parsedClasses[0],
                        undefined,
                        false,
                        'Table',
                        true,
                        true,
                        true,
                        false,
                        dataSource
                    ));
                    dataComponentModel = viewModel.components[0];
                }
            } else {
                console.info('instance');
                if (Object.keys(model).length === 0) {
                    console.warn('empty object');
                    ide.reportError('warning', 'Invalid action', 'Cannot build an editor when data is an empty object');
                    return;
                }

                if (showConfiguration) {
                    this.magicContext = {
                        model, modelParser, dataSource
                    }
                    $c('navbar').$bvModal.show('instance-form-builder');
                } else {
                    dataComponentModel = viewModel = ide.commandManager.execute(new BuildInstanceForm(
                        modelParser,
                        modelParser.parsedClasses[0],
                        false,
                        false,
                        dataSource
                    ));
                }
            }
        }

        if (viewModel) {
            ide.commandManager.execute(new SetChild(targetLocation, viewModel.cid));
            ide.commandManager.endGroup();
            if (dataComponentModel) {
                ide.setComponentDataModel(container.cid, model);
            }
            ide.setNextTargetLocation();


            // // components.registerComponentModel(viewModel);
            // // components.setChild(targetLocation, viewModel);
            // ide.selectComponent(viewModel.cid);
            // if (dataComponentModel) {
            //     $c('navbar').$nextTick(() => {
            //         $c(dataComponentModel.cid).setData(model);
            //     });
            // }
        }

        // if (ide.targetLocation && typeof ide.targetLocation.index === 'number') {
        //     let newTargetLocation = ide.targetLocation;
        //     newTargetLocation.index++;
        //     ide.setTargetLocation(newTargetLocation);
        // }

    }

}

let ide = window.ide = new IDE();

function start() {
    Vue.component('main-layout', {
        template: `
        <div :style="infiniteScroll()?'height:100vh':''">

            <div id="eventShieldOverlay" draggable @dragstart="startDrag($event)" style="cursor: grab"></div>

            <b-modal v-if="edit" id="open-project-modal" 
                :title="loaded?'Open project':'Welcome to dLite IDE'" 
                size="xl"
                :no-close-on-esc="!loaded" 
                :no-close-on-backdrop="!loaded"
                :hide-header-close="!loaded"
                body-class="p-0"
                :ok-title="openModalOkTitle()" 
                :ok-disabled="openModalOkDisabled()" 
                @ok="selection?loadSelectedApplication():createApplication()"
                :cancel-title="!loaded?'Blank workspace':undefined"
                @cancel="cancelOpenModal"
            >
                <b-overlay :show="modalLoading" opacity="0">
                    <template v-if="!loaded" #overlay>
                        <div class="text-center">
                            <a href="https://www.dlite.io">
                                <b-img :src="basePath+'assets/images/' + (darkMode ? 'logo-dlite-1-white.svg' : 'dlite_logo_banner.png')" style="width: 30%"></b-img>
                            </a>
                            <div class="mr-2">Version {{ version() }}</div>
                            <b-spinner></b-spinner>
                        </div>
                    </template>
                    <b-embed v-show="!modalLoading" class="animate__animated animate__fadeIn" style="'--animate-duration: 2000ms" 
                        :src="'?locked=false&embed=true&mode=open'+(loaded?'&hideNewProject=true':'')+'&showNavBar=true&src='+basePath+'assets/apps/app-manager.dlite#/'"
                    />
                </b-overlay>
            </b-modal> 

            <b-modal v-if="edit" 
                id="new-project-modal" title="New Project" size="xl" 
                class="h-75"
                body-class="p-0"
                :ok-title="openModalOkTitle()" 
                :ok-disabled="openModalOkDisabled()" 
                @ok="createApplication"
            >
                <b-overlay :show="modalLoading" opacity="0">
                    <b-embed v-show="!modalLoading" class="animate__animated animate__fadeIn" style="--animate-duration: 2000ms" 
                        :src="'?locked=true&embed=true&src='+basePath+'assets/apps/app-manager.dlite#/create'"
                    />
                </b-overlay>
            </b-modal> 

            <b-modal v-if="edit" id="project-manager-modal" title="Project manager" size="xl" 
                body-class="p-0"
                hide-footer
            >
                <b-overlay :show="modalLoading" opacity="0">
                    <b-embed v-show="!modalLoading" class="animate__animated animate__fadeIn" style="--animate-duration: 2000ms" 
                        :src="'?locked=true&embed=true&src='+basePath+'assets/apps/app-manager.dlite#/manage'"
                    />
                </b-overlay>
            </b-modal> 

            <b-modal v-if="edit" id="share-modal" title="Share application" size="xl" 
                hide-footer
                body-class="p-0"
            >
                <b-overlay :show="modalLoading" opacity="0">
                    <b-embed v-show="!modalLoading" class="animate__animated animate__fadeIn" style="--animate-duration: 2000ms" 
                        :src="'?locked=false&embed=true&mode=open&src='+basePath+'assets/apps/app-manager.dlite#/share?appId='+selectedApplication?.id+'&versionId='+selectedVersion?.id"
                    />
                </b-overlay>
            </b-modal> 

            <b-modal v-if="edit" id="save-modal" title="Save project" size="xl" 
                hide-footer
                body-class="p-0"
            >
                <b-overlay :show="modalLoading" opacity="0">
                    <!-- @application-saved (ignored) @close-dialog -->
                    <b-embed v-show="!modalLoading" class="animate__animated animate__fadeIn" style="--animate-duration: 2000ms" 
                        :src="'?locked=false&embed=true&mode=open&src='+basePath+'assets/apps/app-manager.dlite#/edit'"
                    />
                </b-overlay>
            </b-modal> 
            
            <b-modal v-if="edit && appStoreManager" 
                id="project-publisher-modal" title="Publish and deploy projects" size="xl" 
                class="h-75"
                body-class="p-0"
                ok-only
                ok-title="Close" 
                @ok="bundle"
            >
                <b-overlay :show="modalLoading" opacity="0">
                    <b-embed v-show="!modalLoading" class="animate__animated animate__fadeIn" style="--animate-duration: 2000ms" 
                        :src="'?locked=true&embed=true&src='+basePath+'assets/apps/app-manager.dlite#/review'"
                    />
                </b-overlay>
            </b-modal> 
            
            
            <b-modal v-if="edit" id="models-modal" title="Model editor" size="xl">
              <b-embed :src="'?locked=true&src='+basePath+'assets/apps/models.dlite#/?embed=true'"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="storage-modal" title="Storage manager" size="xl">
              <b-embed :src="'?locked=true&src='+basePath+'assets/apps/storage.dlite#/?embed=true'"></b-embed>
            </b-modal> 

            <b-modal v-if="edit" id="settings-modal" title="Project settings" size="xl">
                <b-card no-body>
                    <b-tabs pills card>
                        <b-tab title="Information">
                            <b-form-group label="Project name" label-for="header" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                            >
                                <b-form-input v-model="viewModel.name" style="display:inline-block" size="sm" @change="changeName"></b-form-input>
                            </b-form-group>
            
                            <b-form-group label="Version" label-for="header" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="Please use semantic versioning (major.minor.patch) - if undefined, version will be set to 0.0.0"
                            >
                                <b-form-input v-model="viewModel.version" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>
                        </b-tab>
                        <b-tab title="Advanced">
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
                        </b-tab>
                    </b-tabs>
                </b-card>
            
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
                        
                        <b-form-group label="Use Keycloak for authentication" label-cols-lg="auto"
                            label-size="sm" label-class="mb-0" class="mb-1"
                            description="Check this if want to replace the default built-in authentication with Keycloak (you will need a Keycloak server available)"
                        >
                            <b-form-checkbox v-model="bundleParameters.keycloak" style="display:inline-block" size="sm"></b-form-checkbox>
                        </b-form-group>

                        <b-card v-if="bundleParameters.keycloak" header="Keycloak configuration">
                            <b-form-group label="Keycloak url" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="The keycloak URL"
                            >
                                <b-form-input v-model="bundleParameters.keycloakUrl" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>
                            <b-form-group label="Realm" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="The Keycloak realm to be used"
                            >
                                <b-form-input v-model="bundleParameters.keycloakRealm" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>
                            <b-form-group label="Client ID" 
                                label-size="sm" label-class="mb-0" class="mb-1"
                                description="The Keycloak OAuth2 client identifier to be used (must match the deployment URL of the app)"
                            >
                                <b-form-input v-model="bundleParameters.keycloakClientId" style="display:inline-block" size="sm"></b-form-input>
                            </b-form-group>
                        </b-card>
                        
                        <b-form-group v-if="!bundleParameters.keycloak" label="Use LDAP for authentication" label-cols-lg="auto"
                            label-size="sm" label-class="mb-0" class="mb-1"
                            description="Check this if you are intending to use a LDAP server for authentication (in addition to the built-in authentication)"
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
                @ok="$set(iconTargetComponent, iconTargetPropName, selectedIcon)">
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
                <b-row>
                    <b-col cols="6">
                        <canvas class="w-100 h-100" id="chart_CPU"></canvas>                    
                    </b-col>
                    <b-col cols="6">
                        <canvas class="w-100 h-100" id="chart_DATA"></canvas>                    
                    </b-col>
                </b-row>
                <b-row>
                    <b-col cols="6">
                        <canvas class="w-100 h-100" id="chart_COMPONENTS_DATA"></canvas>                    
                    </b-col>
                    <b-col cols="6">
                        <canvas class="w-100 h-100" id="chart_COMPONENTS_MODELS"></canvas>                    
                    </b-col>
                </b-row>
                <b-row>
                    <b-col cols="6">
                        <canvas class="w-100 h-100" id="chart_UPLOAD"></canvas>                    
                    </b-col>
                    <b-col cols="6">
                        <canvas class="w-100 h-100" id="chart_DOWNLOAD"></canvas>                    
                    </b-col>
                </b-row>
            </b-modal>                
              
            <b-button v-if="loaded && !edit && !isLocked() && !hideEditButton()" 
                pill size="sm" class="shadow" 
                :variant="embedded ? 'warning' : ''" 
                style="position:fixed; z-index: 10000; right: 1em; top: 1em" 
                v-on:click="setEditMode(!edit)"><b-icon :icon="edit ? 'play' : 'pencil'"/>
            </b-button>
            <b-button v-if="loaded && edit && !isLocked()" pill 
                size="sm" 
                class="shadow show-mobile" 
                :variant="embedded ? 'warning' : ''" style="position:fixed; z-index: 10000; right: 1em; top: 1em" 
                v-on:click="$eventHub.$emit('edit', !edit)"><b-icon :icon="edit ? 'play' : 'pencil'"/>
            </b-button>
             
            <!-- MAIN IDE SECTION --> 
             
            <div class="d-flex flex-column vh-100"> 

            <!-- DOC -->
            
            <div v-if="loaded && edit">
                <b-popover target="ide-navbar" title="Welcome to DLite" variant="info" custom-class="docPopover" trigger="manual" :show="docStep === 1" boundary="window" placement="bottom" @show="docStep === 1 ? true : $event.preventDefault()">
                
                        <div class="container">
                            <div class="text-center bg-dark py-3" style="border-radius: 1rem">
                                <img :src="basePath+'assets/images/logo-dlite-1-white.svg'" class="" style="width: 30%;"/>
                            </div>
                            <div v-if="newFromClipboard" class="mt-2">
                                Welcome to DLite. Paste the JSON from your clipboard in this new project (paste command in your browser's menu, or ^v shortcut). Then, press the 'Next' button to get more tips.
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
                        <b-img :src="basePath+'assets/images/logo-dlite-2-white.svg'" alt="DLite" class="align-middle" style="height: 1.5rem; position: relative; top: -0.3rem"></b-img>
                    </b-navbar-brand>            
                    <b-nav-item-dropdown text="Project" left lazy>
                        <b-dropdown-item @click="newProject"><b-icon icon="file" class="mr-2"></b-icon>New project...</b-dropdown-item>
                        <b-dropdown-item @click="openProject"><b-icon icon="folder2-open" class="mr-2"></b-icon>Open project...</b-dropdown-item>
                        <b-dropdown-item @click="loadFile2"><b-icon icon="cloud-upload" class="mr-2"></b-icon>Import snapshot file</b-dropdown-item>
                        <b-dropdown-divider/>
                        <b-dropdown-item :disabled="!isBrowserDirty()" @click="saveInBrowser"><b-icon icon="download" class="mr-2"></b-icon>Save project</b-dropdown-item>
                        <b-dropdown-item :disabled="!isFileDirty()" @click="saveFile"><b-icon icon="cloud-download" class="mr-2"></b-icon>Export snapshot file</b-dropdown-item>
                        <b-dropdown-divider/>
                        <b-dropdown-item :disabled="!selectedVersion" @click="shareApplication"><b-icon icon="reply-all" flip-h class="mr-2"></b-icon>Share application</b-dropdown-item>
                        <b-dropdown-form v-if="selectedVersion" class="p-0 dropdown-item">
                            <div class="d-flex flex-row align-items-center">Quick&nbsp;link:&nbsp;<b-form-input v-model="applicationLink" size="sm" style="width: 50ch" onClick="this.setSelectionRange(0, this.value.length)"></b-form-input>
                            <b-button variant="secondary" size="sm" :href="applicationLink" target="_blank" class="ml-2"><b-icon-box-arrow-up-right /> Open</b-button></div>
                        </b-dropdown-form>
                        <b-dropdown-item @click="openBundle"><b-icon icon="file-zip" class="mr-2"></b-icon>Bundle application</b-dropdown-item>
                        <b-dropdown-divider/>
<!--                        <b-dropdown-item @click="openSettings"><b-icon icon="gear" class="mr-2"></b-icon>Project settings</b-dropdown-item>-->
                        <b-dropdown-item @click="close"><b-icon-file-x class="mr-2"/>Close project</b-dropdown-item>
                        <b-dropdown-item @click="signOut"><b-icon-box-arrow-right class="mr-2"/>Sign out</b-dropdown-item>
                    </b-nav-item-dropdown>
            
                    <b-nav-item-dropdown text="Edit" left lazy>
                        <b-dropdown-text class="px-2 dropdown-item" tag="i">Use&nbsp;browser&nbsp;menu&nbsp;or&nbsp;keyboard to&nbsp;cut/copy/paste&nbsp;content</i></b-dropdown-text>
                        <b-dropdown-divider/>
                        <b-dropdown-item @click="commandManager.undo()" :disabled="!commandManager.canUndo()"><b-icon-arrow90deg-left rotate="-45" class="mr-2"/>Undo (^Z)</b-dropdown-item>
                        <b-dropdown-item @click="commandManager.redo()" :disabled="!commandManager.canRedo()"><b-icon-arrow90deg-right rotate="45" class="mr-2"/>Redo (^Y)</b-dropdown-item>
                        <b-dropdown-divider/>
                        <b-dropdown-item :disabled="!selectedComponentId" @click="magicWand"><b-icon-stars class="mr-2"/>Build data editor</b-dropdown-item>
                        <b-dropdown-item @click="emptyTrash">Empty trash</b-dropdown-item>
                        <div v-if="selectedComponentId && compatibleComponentTypes().length > 0" class="dropdown-group">
                            <b-dropdown-divider/>
                            <b-dropdown-item v-for="(componentType, i) of compatibleComponentTypes()" :key="i" @click="switchTo(componentType)">
                                <component-icon :type="componentType"/> Switch to {{ componentLabel(componentType) }}...
                            </b-dropdown-item>
                        </div>
                    </b-nav-item-dropdown>

                    <b-nav-item-dropdown text="View" left lazy>
                        <b-dropdown-form class="p-0 px-2 dropdown-item">
                            <b-form-checkbox switch v-model="jsonEditor"><div class="text-nowrap">Show JSON model</div></b-form-checkbox>                            
                        </b-dropdown-form>
                        <b-dropdown-form class="p-0 px-2 dropdown-item">
                            <b-form-checkbox switch v-model="showToolbar">Show toolbar</b-form-checkbox>                            
                        </b-dropdown-form>
                    </b-nav-item-dropdown>
    
                   <b-nav-item-dropdown text="Themes" left lazy>
                        <b-dropdown-form class="px-2">
                            <b-button class="mt-1" v-on:click="setStyle()">default</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('dlite', true)">dlite</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('cerulean')">cerulean</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('cosmo')">cosmo</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('cyborg', true)">cyborg</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('darkly', true)">darkly</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('flatly')">flatly</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('journal')">journal</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('litera')">litera</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('lumen')">lumen</b-button>
                            <b-button class="mt-1" v-on:click="setStyle('lux')">lux</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('materia')">materia</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('minty')">minty</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('pulse')">pulse</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('sandstone')">sandstone</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('simplex')">simplex</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('sketchy')">sketchy</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('slate', true)">slate</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('solar', true)">solar</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('spacelab')">spacelab</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('superhero', true)">superhero</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('united')">united</b-button>                        
                            <b-button class="mt-1" v-on:click="setStyle('yeti')">yeti</b-button>
                        </b-dropdown-form>
                        <b-dropdown-divider/>
                        <b-dropdown-form class="px-2">
                            <b-form-group class="dropdown-item" label="Bootstrap 4 stylesheet URL" label-for="dropdown-form-password">
                              <b-form-input
                                type="text"
                                size="sm"
                                style="width: 30rem"
                                placeholder="URL..."
                                v-model="bootstrapStylesheetUrl"
                              ></b-form-input>
                            </b-form-group>
                            <b-form-checkbox class="mb-3 dropdown-item" v-model="darkMode">Dark mode</b-form-checkbox>                            
                            <b-button variant="primary" size="sm" @click="setStyleUrl">Apply</b-button>
                        </b-dropdown-form>
                        
<!--                        <b-dropdown-item>custom<b-input type="text" size="sm" v-model="viewModel.bootstrapStylesheetUrl"><b-button>Apply...</b-button></b-input></b-dropdown-item>                        -->
                    </b-nav-item-dropdown>

                    <b-nav-item-dropdown text="Tools" left lazy>
                        <b-dropdown-item @click="openProjectManager"><b-icon icon="grid3x3-gap" class="mr-2"></b-icon>My app manager...</b-dropdown-item>
                        <b-dropdown-item @click="openModels"><b-icon icon="diagram3" class="mr-2"></b-icon>Model editor...</b-dropdown-item>
                        <b-dropdown-item @click="openStorage"><b-icon icon="server" class="mr-2"></b-icon>Storage management...</b-dropdown-item>
                        <b-dropdown-item v-b-modal.resource-monitoring-dialog><b-icon icon="lightning" class="mr-2"></b-icon>Application resource monitoring...</b-dropdown-item>
                        <b-dropdown-item v-if="appStoreManager" @click="openProjectPublisher"><b-icon icon="grid3x3-gap" class="mr-2"></b-icon>Review/publish apps...</b-dropdown-item>
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
                        <b-button v-if="!loggedIn" size="sm" @click="signIn"><b-icon-person class="mr-2"></b-icon-person>Sign in</b-button>  
                        <template v-else>
                            <b-nav-item-dropdown right lazy toggle-class="p-0">
                                <template #button-content> 
                                    <span style="cursor: pointer">
                                        <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-2"></b-avatar>
                                        <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-2"></b-avatar>
                                        <span class="text-light">{{ user().email }}</span>
                                    </span>
                                </template>
                                <b-dropdown-item @click="impersonate">
                                    <b-icon-person-bounding-box class="mr-2"/>
                                    {{ impersonating ? 'Stop impersonating': 'Impersonate...' }}
                                </b-dropdown-item>
                                <b-dropdown-item @click="signOut">
                                    <b-icon-box-arrow-right class="mr-2"/>
                                    Sign out                            
                                </b-dropdown-item>
                            </b-nav-item-dropdown>
                            
                            <b-nav-form>
                                <b-button v-if="loggedIn" title="Synchronize user data"
                                    class="d-inline ml-2" size="sm" pill @click="synchronize"><b-icon-arrow-repeat/>
                                </b-button> 
                            </b-nav-form> 
                        </template>          
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
            </b-container>            

            <div v-else :class="(this.viewModel.navbar.infiniteScroll == true && !edit)?'':('flex-grow-1 d-flex flex-row' + (edit?' overflow-hidden border-top border-2':' overflow-hidden'))">
                        
                <div v-if="edit" class="show-desktop p-1" id="left-sidebar" ref="left-sidebar" :visible="edit"
                    no-header no-close-on-route-change shadow width="20em" 
                    style="overflow-y: auto"
                    :bg-variant="darkMode ? 'dark' : 'light'" :text-variant="darkMode ? 'light' : 'dark'"
                >
                    <tools-panel 
                        :applicationModel="viewModel"
                        :selectedApplication="selectedApplication" 
                        :selectedVersion="selectedVersion" 
                        :darkMode="darkMode" 
                    />
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
                            :class="'h-100 d-flex '+(viewModel.navbar.vertical ? 'vertical-layout' : 'flex-column')" 
                            style="overflow-y: auto"
                            v-on:scroll="followScroll"
                        >
                            <a id="_top"></a>
                        
                            <component-view :cid="viewModel.navbar.cid" keyInParent="navbar" :inSelection="false"></component-view>
                            <div id="content" style="height: 100%; overflow-y: auto;">
                                <keep-alive>
                                    <component-view cid="shared" keyInParent="shared" :inSelection="false"/>
                                </keep-alive>
                                <slot v-bind:jsonEditor="jsonEditor" v-bind:searchMode="searchMode" v-bind:edit="edit"></slot>
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
                        </a> version {{ version() }}, <span class="text-nowrap">Copyright &copy; 2021-2023, 
                        <a href="https://www.cincheo.com" target="_blank"><b>CINCHEO</b></a>&trade;
                    </span></small></span>
                  </b-navbar-nav>
                  
                  <b-navbar-nav v-if="edit" class="ml-auto">
                    <b-nav-form>
                    <energy-meter :energyMeter="energyMeter" v-b-modal.resource-monitoring-dialog></energy-meter>
<!--                        <div v-if="selectedComponentModel" class="d-flex flex-row align-items-center">-->
<!--                        -->
<!--                            <b-form-group v-if="!selectedComponentModel.dataSource || !selectedComponentModel.dataSource.startsWith('=')">-->
<!--                                <b-input-group>-->
<!--                                    <b-form-select size="sm"-->
<!--                                        v-model="selectedComponentModel.dataSource" :options="selectableDataSources()"></b-form-select>-->
<!--                                    <b-input-group-append>-->
<!--                                      <b-button size="sm" variant="danger" @click="$set(selectedComponentModel, 'dataSource', undefined)">x</b-button>-->
<!--                                      <b-button :variant="formulaButtonVariant" size="sm" @click="$set(selectedComponentModel, 'dataSource', '=')"><em>f(x)</em></b-button>-->
<!--                                    </b-input-group-append>                        -->
<!--                                </b-input-group>-->
<!--                            </b-form-group>-->

<!--                            <b-form-group v-else>-->
<!--                                <b-input-group>-->
<!--                                    <code-editor -->
<!--                                        containerStyle="min-width: 20rem; min-height: 0.8rem"-->
<!--                                        :formula="true"-->
<!--                                        v-model="selectedComponentModel.dataSource" -->
<!--                                        :contextComponent="{ target: selectedComponent(), showActions: false }"-->
<!--                                        :contextObject="selectedComponentModel.dataSource"-->
<!--                                    ></code-editor>-->
<!--                                    <b-input-group-append>                                -->
<!--                                        <b-button :variant="formulaButtonVariant" size="sm" @click="$set(selectedComponentModel, 'dataSource', undefined)"><em><del>f(x)</del></em></b-button>-->
<!--                                    </b-input-group-append>                                    -->
<!--                                </b-input-group>-->
<!--                            </b-form-group>-->
<!-- -->
<!--                            <b-badge v-if="selectedComponentModel.field" variant="info" class="ml-2">-->
<!--                                {{ selectedComponentModel.field }}-->
<!--                            </b-badge>-->
<!--                                    -->
<!--                        </div>-->
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
                backend: backend,
                loaded: ide.applicationLoaded,
                darkMode: ide.isDarkMode(),
                formulaButtonVariant: ide.isDarkMode() ? 'outline-light' : 'outline-primary',
                selectedComponentId: ide.selectedComponentId,
                //selectedComponentModel: null,
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
                iconTargetPropName: null,
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
                showToolbar: true,
                jsonEditor: false,
                searchMode: false,
                newFromClipboard: parameters.get('src') === 'newFromClipboard',
                docStep: ide.docStep,
                commandManager: ide.commandManager,
                selectedApplication: ide.selectedApplication,
                selectedVersion: ide.selectedVersion,
                createdApplication: undefined,
                modalLoading: false,
                selection: false,
                tmpSelectedApplication: undefined,
                tmpSelectedVersion: undefined,
                appStoreManager: undefined,
                impersonating: false
            }
        },
        computed: {
            embedded: function () {
                return ide.isEmbeddedApplication();
            },
            applicationLink: function () {
                return ide.getApplicationLink(this.selectedVersion);
            },
            energyMeter: function () {
                return ide.energyMeter;
            },
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
                get: function () {
                    return $tools.getCookie('hide-docs') !== 'true';
                },
                set: function (value) {
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
            jsonEditor: function () {
                if (this.jsonEditor) {
                    ide.hideOverlays();
                } else {
                    this.searchMode = false;
                    ide.updateSelectionOverlay(ide.selectedComponentId);
                    ide.showSelectionOverlay();
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
                    autoHideDelay: level === 'danger' ? undefined : 4000,
                    solid: true
                });
            });
            this.$eventHub.$on('icon-chooser', (viewModel, propName) => {
                let show = () => {
                    this.iconTargetComponent = viewModel;
                    this.iconTargetPropName = propName;
                    this.selectedIcon = viewModel[propName];
                    this.icons = ide.icons;
                    this.$root.$emit('bv::show::modal', 'icon-chooser-modal');
                };
                if (ide.icons.length < 20) {
                    $tools.loadScript(basePath + "assets/lib/bv-icons.js", () => {
                        show();
                    });
                } else {
                    show();
                }
            });
            this.$eventHub.$on('set-user', (user) => {
                console.info('user set-user', user);
                this.loggedIn = user !== undefined;
                if (this.loggedIn) {
                    this.appStoreManager = user.roles?.includes('APP_STORE_MANAGER');
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
            this.$eventHub.$on('app-selected', (application, version) => {
                this.selectedApplication = application;
                this.selectedVersion = version;
            });
            $tools.onChildApplicationMessage('app-manager', 'app-selected', (application, version) => {
                console.info('app selected', application, version);
                if (this.selection && application) {
                    this.tmpSelectedApplication = application;
                    this.tmpSelectedVersion = version;
                } else {
                    this.tmpSelectedApplication = undefined;
                    this.tmpSelectedVersion = undefined;
                }
            });
            $tools.onChildApplicationMessage('app-manager', 'app-creating', (application) => {
                if (application && application.name && application.version && application.description && application.versionDescription && application.id) {
                    this.createdApplication = application;
                } else {
                    this.createdApplication = undefined;
                }
            });
            $tools.onChildApplicationMessage('app-manager', 'get-app-info', () => {
                return {
                    app: this.selectedApplication ?
                        this.selectedApplication :
                        {
                            name: applicationModel.name,
                            description: "No description"
                        },
                    model: ide.getApplicationContent()
                };
            });
            $tools.onChildApplicationMessage('app-manager', 'page-changed', (pageId) => {
                switch (pageId) {
                    case 'create':
                        this.selection = false;
                        break;
                    default:
                        this.selection = true;
                }
            });
            $tools.onChildApplicationMessage('app-manager', 'application-ready', () => {
                this.modalLoading = false;
            });
            $tools.onChildApplicationMessage('app-manager', 'close-dialog', (dialog) => {
                this.$root.$emit('bv::hide::modal', dialog);
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
                                ide.createFromModel(model);
                                return;
                            } catch (e) {
                                try {
                                    console.info("trying to parse CSV from clipboard");
                                    const result = Papa.parse(data, {
                                        header: true,
                                        transformHeader: (header, index) => {
                                            if (!header) {
                                                return 'parsed-field-' + index;
                                            } else {
                                                return header
                                            }
                                        }
                                    });
                                    if (result.errors.length === 0 && result.data.length > 0) {
                                        ide.createFromModel(result.data);
                                        return;
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                                console.info("creating text view from clipboard", e);
                                ide.commandManager.beginGroup();
                                viewModel = ide.commandManager.execute(new CreateComponent("TextView"));
                                ide.commandManager.execute(new SetProperty(viewModel.cid, 'tag', 'div'));
                                ide.commandManager.execute(new SetProperty(viewModel.cid, 'text', data));
                            }
                            break;
                        case 'json':
                            console.info("creating text (possibly json) from clipboard");
                            const model = JSON.parse(data);
                            ide.createFromModel(model);
                            return;
                        case 'csv':
                            console.info("trying to parse CSV from clipboard", data);
                            const result = Papa.parse(data, {
                                header: true,
                                transformHeader: (header, index) => {
                                    if (!header) {
                                        return 'parsed-field-' + index;
                                    } else {
                                        return header
                                    }
                                }
                            });
                            if (result.data && result.data.length > 0) {
                                ide.createFromModel(result.data);
                            }
                            if (result.errors.length > 0) {
                                console.error('Some errors where detected during CSV parsing', result);
                                ide.reportError(result.data.length > 0 ? 'warning' : 'error', 'CSV parsing errors',
                                    'Your csv data was parsed with ' + result.errors.length + ' error(s).');
                            }
                            return;
                        case 'html':
                            console.info("creating html view from clipboard");
                            ide.commandManager.beginGroup();
                            viewModel = ide.commandManager.execute(new CreateComponent("TextView"));
                            ide.commandManager.execute(new SetProperty(viewModel.cid, 'tag', 'div'));
                            ide.commandManager.execute(new SetProperty(viewModel.cid, 'text', data));
                            break;
                        case 'image':
                            b64 = await this.blobToBase64(data);
                            console.info("creating image from clipboard");
                            ide.commandManager.beginGroup();
                            viewModel = ide.commandManager.execute(new CreateComponent("ImageView"));
                            ide.commandManager.execute(new SetProperty(viewModel.cid, 'src', b64));
                            ide.commandManager.execute(new SetProperty(viewModel.cid, 'display', "fluid"));
                            break;
                        case 'pdf':
                            b64 = await this.blobToBase64(data);
                            console.info("creating pdf from clipboard");
                            ide.commandManager.beginGroup();
                            viewModel = ide.commandManager.execute(new CreateComponent("PdfView"));
                            ide.commandManager.execute(new SetProperty(viewModel.cid, 'documentPath', b64));
                            ide.commandManager.execute(new SetProperty(viewModel.cid, 'class', "w-100"));
                            ide.commandManager.execute(new SetProperty(viewModel.cid, 'page', "1"));
                            break;
                        default:
                            console.info("ignore type", type);
                    }
                    if (viewModel) {
                        ide.commandManager.execute(new SetChild(targetLocation, viewModel.cid));
                        if (dataComponentModel) {
                            ide.commandManager.execute(new SetComponentDataModel(dataComponentModel.cid, JSON.parse(data)));
                        }
                        ide.commandManager.endGroup();
                        ide.selectComponent(viewModel.cid);
                        ide.setNextTargetLocation();
                    }

                });
            });

            document.addEventListener("copy", copyEvent => {
                if (!ide.editMode) {
                    return;
                }
                if (
                    document.activeElement.tagName.toUpperCase() === 'INPUT'
                    || document.activeElement.tagName.toUpperCase() === 'TEXTAREA'
                ) {
                    return;
                }
                if (
                    window.getSelection()
                    && (typeof window.getSelection().focusNode?.textContent === 'string')
                    && window.getSelection().type === 'Range'
                ) {
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
                if (ev.key === 'Escape') {
                    if (this.jsonEditor) {
                        this.jsonEditor = false;
                        this.searchMode = false;
                    }
                }
                if (ev.metaKey && !ev.shiftKey) {
                    switch (ev.key) {
                        case 'S':
                        case 's':
                            if (window.bundledApplicationModel) {
                                return;
                            }
                            ev.preventDefault()
                            if (this.selectedApplication && this.selectedVersion && !ev.ctrlKey) {
                                this.saveApplication();
                            } else {
                                this.saveFile();
                            }
                            break;
                        case 'Z':
                        case 'z':
                            if (!ide.editMode) {
                                return;
                            }
                            ev.preventDefault();
                            if (ide.commandManager.canUndo()) {
                                ide.commandManager.undo();
                            }
                            break;
                        case 'Y':
                        case 'y':
                            if (!ide.editMode) {
                                return;
                            }
                            ev.preventDefault();
                            if (ide.commandManager.canRedo()) {
                                ide.commandManager.redo();
                            }
                            break;
                        case 'f':
                        case 'F':
                            if (!ide.editMode) {
                                return;
                            }
                            if (!this.jsonEditor) {
                                this.jsonEditor = true;
                                this.searchMode = true;
                                ev.preventDefault();
                            }
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
                    this.eventShieldOverlay.style.display = 'block';
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
                    }
                } finally {
                    mousedownCid = undefined;
                }
            });

            try {
                if (ide.auth !== 'keycloak') {
                    let userCookie = Tools.getCookie("dlite.user");
                    if (userCookie) {
                        ide.setUser(JSON.parse(userCookie));
                        await ide.synchronize();
                    } else {
                        ide.setUser(undefined);
                    }
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
            ide.commandManager.disableHistory = false;

            if (!this.loaded) {
                if (ide.user) {
                    this.openProject();
                } else {
                    this.signIn();
                }
            }

            this.appStoreManager = ide.user?.roles?.includes("APP_STORE_MANAGER");

        },
        updated: function () {
            Vue.nextTick(() => {
//                console.info('GLOBAL UPDATED', this.loaded, this.edit);
                this.$eventHub.$emit('main-updated', this.loaded, this.edit);
                if (this.loaded && !this.edit && !this.reactiveBindingsEnsured) {
                    this.reactiveBindingsEnsured = true;
                    components.ensureReactiveBindings();
                    //console.info("OBSERVING", document.getElementById("_top"));
                    this.$intersectionObserver.observe(document.getElementById("_top"));
                    $c($c('navbar').activeNavItem()?.pageId)?.forceRender();
                }
            });

        },
        methods: {
            close() {
                window.location.href = '';
            },
            hideEditButton() {
                return (!this.edit && this.embedded && !window.parent.ide.editMode) && parameters.get('locked') !== 'false';
            },
            magicWand: function () {
                ide.magicWand($d(this.selectedComponentId), this.selectedComponentId, true);
            },
            blobToBase64: function (blob) {
                return new Promise((resolve, _) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            },
            getPastedItemType: function (item) {
                let dataType;
                if (item.type === "text/plain") {
                    dataType = "text";
                }
                if (item.type === "text/html") {
                    dataType = "html";
                }
                if (item.type.indexOf("image") !== -1) {
                    dataType = "image";
                }
                if (item.type.indexOf("pdf") !== -1) {
                    dataType = "pdf";
                }
                if (item.type.indexOf("json") !== -1) {
                    dataType = "json";
                }
                if (item.type.indexOf("csv") !== -1) {
                    dataType = "csv";
                }
                return dataType;
            },
            retrieveDataFromClipboard: async function (pasteEvent, callback) {
                let items = pasteEvent.clipboardData.items;
                const supportedItemTypes = ['pdf', 'cvs', 'json', 'html', 'text', 'image'];
                const pastedItems = [];

                for (let i = 0; i < items.length; i++) {
                    const itemType = this.getPastedItemType(items[i]);
                    if (itemType) {
                        pastedItems.push({
                            itemType: itemType,
                            item: items[i],
                            typeIndex: supportedItemTypes.indexOf(itemType)
                        });
                    }
                }
                pastedItems.sort((item1, item2) => item1.typeIndex - item2.typeIndex);

                if (pastedItems.length === 0) {
                    this.$bvToast.toast(
                        `The clipboard does not contain any supported type to be pasted in an application.`,
                        {
                            title: "Unsupported type",
                            variant: 'danger',
                            noAutoHide: true,
                            solid: true
                        }
                    );
                } else {

                    pastedItems.forEach(orderedItem => {

                        let blob = orderedItem.item.getAsFile();

                        if (blob === null) {
                            orderedItem.item.getAsString(s => callback(s, orderedItem.itemType));
                        } else {

                            if (blob.size > 10000000) {
                                this.$bvToast.toast(`Object too large. Please, reduce your image size by using appropriate 
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
                                this.$bvToast.toast(`Embedding raw data (images, PDFs, json, csv) in applications is not recommended for 
                                                production and will consume a lot of resources. Please, reduce your impacts by using appropriate 
                                                formats such as SVG, JPG or PNG, and/or make your images available through a public URL. Use 
                                                the application resource monitor to detect resource issues and try to fix them ASAP`,
                                    {
                                        title: "Not eco-design friendly",
                                        variant: 'warning',
                                        noAutoHide: true,
                                        solid: true
                                    }
                                );
                            }
                            switch (orderedItem.itemType) {
                                case 'csv':
                                case 'json':
                                case 'text':
                                    (new Promise((resolve, _) => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => resolve(reader.result);
                                        reader.readAsText(blob);
                                    })).then(data => callback(data, orderedItem.itemType));
                                    break;
                                default:
                                    callback(blob, orderedItem.itemType);
                            }
                        }
                    });

                }
            },
            showStatusBar() {
                if (!this.loaded) {
                    return false;
                }
                if (this.edit) {
                    return true;
                }
                if (window.bundledApplicationModel || ide.isEmbeddedApplication()) {
                    return false;
                } else {
                    return true;
                }
            },
            selectedComponent() {
                if (this.selectedComponentId) {
                    return $c(this.selectedComponentId);
                } else {
                    return undefined;
                }
            },
            selectableDataSources() {
                return Tools.arrayConcat(['', '$parent'], components.getComponentIds().filter(cid => components.isComponentInActivePage(cid)).sort());
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
                    if (components.getSwitchHandler(viewModel.type, componentType)) {
                        components.getSwitchHandler(viewModel.type, componentType)(this.selectedComponentId);
                    }
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
                return ide.isBrowserDirty() || !this.selectedApplication;
            },
            version() {
                return window.ideVersion;
            },
            changeName() {
                // TODO
                throw new Error('not implemented');
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
            cancelOpenModal() {
                this.selection = false;
                if (!this.loaded) {
                    this.blankProject();
                }
            },
            openModalOkDisabled() {
                if (this.selection) {
                    return !this.tmpSelectedApplication;
                } else {
                    return !this.createdApplication;
                }
            },
            openModalOkTitle() {
                if (this.selection) {
                    if (this.tmpSelectedApplication && this.tmpSelectedVersion) {
                        return 'Open' + ' (' + this.tmpSelectedApplication.name + '-' + this.tmpSelectedVersion.version + ')';
                    } else if (this.tmpSelectedApplication && this.tmpSelectedApplication.appVersion && !this.tmpSelectedVersion) {
                        return 'Open/clone' + ' (' + this.tmpSelectedApplication.name + '-' + this.tmpSelectedApplication.appVersion + ')';
                    } else {
                        return 'Open';
                    }
                } else {
                    return 'Create' + (this.createdApplication ? ' (' + this.createdApplication.name + '-' + this.createdApplication.version + ')' : '')
                }
            },
            newProject: function () {
                this.modalLoading = true;
                this.$root.$emit('bv::show::modal', 'new-project-modal');
            },
            openProject: function () {
                this.modalLoading = true;
                this.selection = true;
                this.$root.$emit('bv::show::modal', 'open-project-modal');
            },
            openProjectManager: function () {
                this.modalLoading = true;
                this.$root.$emit('bv::show::modal', 'project-manager-modal');
            },
            openProjectPublisher: function () {
                this.modalLoading = true;
                this.$root.$emit('bv::show::modal', 'project-publisher-modal');
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
            shareApplication: function () {
                this.modalLoading = true;
                this.$root.$emit('bv::show::modal', 'share-modal');
            },
            saveApplication: function () {
                this.modalLoading = true;
                this.$root.$emit('bv::show::modal', 'save-modal');
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
                    ide.getComponentElement(cid),
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
                    return ide.signOut();
                }
            },
            impersonate() {
                if (this.impersonating) {
                    this.impersonating = false;
                    ide.impersonate();
                } else {
                    const email = prompt("Enter an email to impersonate. Note that you need the administration rights of the person's tenant for this operation to be successful.");
                    if (ide.sync.isValidUserName(email)) {
                        const tenant = email.split('@')[1];
                        ide.sync.isGroupMember('#admin#' + tenant).then(result => {
                            if (result) {
                                ide.impersonate(email);
                                this.impersonating = true;
                            } else {
                                ide.reportError('danger', 'Error', 'You are not authorized to impersonate this user.');
                            }
                        });
                    }
                }
            },
            doSignIn: function () {
                ide.authenticate(this.userLogin, this.userPassword);
            },
            async synchronize() {
                return ide.synchronize();
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
                if (this.selectedApplication) {
                    this.viewModel.name = this.selectedApplication.name;
                }
                if (this.selectedVersion) {
                    this.viewModel.version = this.selectedVersion.version;
                }
                ide.saveFile();
            },
            loadFile2() {
                ide.loadFile(() => {
                    this.viewModel = applicationModel;
                    if (this.selectedApplication) {
                        this.viewModel.name = this.selectedApplication.name;
                    }
                    if (this.selectedVersion) {
                        this.viewModel.version = this.selectedVersion.version;
                    }
                    if (this.selectedApplication && this.selectedVersion) {
                        ide.savedBrowserModel = undefined;
                    }
                });
            },
            loadSelectedApplication() {
                let contentObject = undefined;
                if (this.tmpSelectedApplication && this.tmpSelectedVersion) {
                    this.selectedApplication = this.tmpSelectedApplication;
                    this.selectedVersion = this.tmpSelectedVersion;
                    this.selection = false;
                    this.tmpSelectedApplication = undefined;
                    this.tmpSelectedVersion = undefined;
                    contentObject = JSON.parse(this.selectedVersion.model);
                } else if (this.tmpSelectedApplication && this.tmpSelectedApplication.appVersion) {
                    contentObject = JSON.parse(this.tmpSelectedApplication.model);
                }
                if (contentObject) {
                    ide.loadApplicationContent(contentObject, () => {
                        if (ide.isEmbeddedApplication()) {
                            ide.saveInApplicationView(ide.embeddingApplicationView());
                        }
                    });
                }
            },
            createApplication() {
                this.tmpSelectedApplication = {
                    id: this.createdApplication.id,
                    name: this.createdApplication.name,
                    description: this.createdApplication.description,
                    icon: this.createdApplication.icon,
                    linkIcon: this.createdApplication.linkIcon,
                    tags: this.createdApplication.tags
                };

                this.tmpSelectedVersion = {
                    id: this.createdApplication.id + '-' + this.createdApplication.version,
                    version: this.createdApplication.version,
                    appId: this.createdApplication.id,
                    model: ide.createBlankApplicationContent(this.createdApplication.name, this.createdApplication.version)
                };
                this.loadSelectedApplication();
            },
            saveInBrowser() {
                this.modalLoading = true;
                this.$root.$emit('bv::show::modal', 'save-modal');
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
                ide.monitorData();
                this.drawResourceChart(
                    ide.isDarkMode() ? [255, 200, 100] : [200, 127, 0],
                    'CPU',
                    'Energy / CPU',
                    'AVERAGE'
                );
                this.drawResourceChart(
                    ide.isDarkMode() ? [100, 200, 255] : [0, 0, 255],
                    'UPLOAD',
                    'Data upload'
                );
                this.drawResourceChart(
                    ide.isDarkMode() ? [100, 200, 255] : [0, 0, 255],
                    'DOWNLOAD',
                    'Data download'
                );
                this.drawResourceChart(
                    ide.isDarkMode() ? [0, 127, 127] : [0, 127, 127],
                    'DATA',
                    'Data / memory',
                    'AVERAGE',
                    'BAR'
                );
                this.drawComponentsChart(
                    ide.isDarkMode() ? [127, 127, 127] : [127, 127, 127],
                    'COMPONENTS_DATA',
                    'Top component data',
                    ide.getTopComponentDataSizes('DATA', 20)
                );
                this.drawComponentsChart(
                    ide.isDarkMode() ? [127, 127, 127] : [127, 127, 127],
                    'COMPONENTS_MODELS',
                    'Top component models',
                    ide.getTopComponentDataSizes('MODEL', 20)
                );
            },
            drawResourceChart(graphColor, resourceType, title, operation, graphType) {
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
                            const avg = samples.length > 0 ? samples.reduce((a, b) => a + (b.size / b.count), 0) / samples.length : 0;
                            values.push(avg);
                        } else {
                            // sum is the default
                            values.push(ide.monitoredData[resourceType].filter(d => d.timestamp >= ts1 && d.timestamp < ts2)
                                .reduce((a, b) => a + b.size, 0));
                        }
                    } else {
                        values.push(0);
                    }
                }

                console.info('dates', dates);
                console.info('labels', labels);
                console.info('values', values);

                this[key] = new Chart(ctx, {
                    type: graphType === 'BAR' ? 'bar' : 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: resourceType,
                            data: values.map(value => {
                                switch (resourceType) {
                                    case 'CPU':
                                        return value;
                                    default:
                                        // we show KB
                                        return value / 1000;
                                }
                            }),
                            borderWidth: 1,
                            backgroundColor: `rgba(${graphColor[0]}, ${graphColor[1]}, ${graphColor[2]}, 0.5)`,
                            borderColor: `rgba(${graphColor[0]}, ${graphColor[1]}, ${graphColor[2]})`,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: title
                            },
                            legend: {
                                display: false
                            }
                        },
                        //aspectRatio: 3,
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
                            y: {
                                min: 0,
                                max: resourceType === 'CPU' ? 100 : undefined,
                                ticks: {
                                    callback: function (value, index, ticks) {
                                        switch (resourceType) {
                                            case 'CPU':
                                                return Math.round(value) + '%';
                                            default:
                                                return value.toLocaleString({minimumFractionDigits: 1}) + ' KB';
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            },
            drawComponentsChart(graphColor, resourceType, title, componentsData) {
                const key = 'chart_' + resourceType;
                if (this[key]) {
                    this[key].destroy();
                    this[key] = undefined;
                }
                Chart.defaults.borderColor = ide.isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                Chart.defaults.color = ide.isDarkMode() ? '#eee' : '#666';

                const ctx = document.getElementById(key).getContext('2d');

                this[key] = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: componentsData.map(data => data.cid),
                        datasets: [{
                            label: resourceType,
                            data: componentsData.map(data => data.value),
                            borderWidth: 1,
                            backgroundColor: componentsData.map(data =>
                                $tools.colorGradientHex('#FF0000', '#00FF00', componentsData[0].value === 0 ? 1 : data.value / componentsData[0].value) + '80'),
                            borderColor: `rgba(${graphColor[0]}, ${graphColor[1]}, ${graphColor[2]})`,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: title
                            },
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    title: function (context) {
                                        return context[0].label;
                                    },
                                    label: function (context) {
                                        return context.parsed.y.toLocaleString({minimumFractionDigits: 1}) + ' KB';
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                min: 0,
                                max: undefined,
                                ticks: {
                                    callback: function (value, index, ticks) {
                                        return value.toLocaleString({minimumFractionDigits: 1}) + ' KB';
                                    }
                                }
                            }
                        }
                    }
                });
                document.getElementById(key).onclick = evt => {
                    const points = this[key].getElementsAtEventForMode(evt, 'nearest', {intersect: true}, true);

                    if (points.length) {
                        const firstPoint = points[0];
                        const label = this[key].data.labels[firstPoint.index];
                        //const value = this[key].data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                        ide.selectComponent(label);
                        this.$bvModal.hide('resource-monitoring-dialog');
                    }
                }
            }
        }
    });

    Vue.component('page-view', {
        template: `
            <main-layout v-slot="slotProps">
                <data-editor-panel v-if="slotProps.jsonEditor && slotProps.edit" 
                    ref="editor"
                    :searchMode="slotProps.searchMode"
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
                    @fold-item-clicked="onFoldItemClicked"
                />
                <component-view v-else :cid="viewModel ? viewModel.cid : undefined" :inSelection="false" />
            </main-layout>
        `,
        data: () => {
            return {
                viewModel: undefined,
                componentStates: ide.componentStates
            }
        },
        created: function () {
            this.$eventHub.$on('application-loaded', () => {
                return this.fetchModel();
            });
            this.$eventHub.$on('component-selected', (cid, options) => {
                if (this.$refs['editor']) {
                    this.createMarkers();
                    if (!options?.ignoreSelection) {
                        const dataEditor = this.$refs['editor'];
                        const rows = dataEditor.findRowsForJsonEntry(['cid', cid]);
                        if (rows.length > 0) {
                            console.error('component selected, going to row', cid, rows[0]);
                            dataEditor.goToRow(rows[0]);
                        }
                    }
                }
            });
        },
        mounted: function () {
            if (!applicationModel.bootstrapStylesheetUrl) {
                ide.setStyle("dlite", true);
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
            },
            componentStates: {
                handler: function () {
                    this.expandAndFoldComponent(this.$refs['editor'], this.viewModel);
                },
                deep: true
            }
        },
        methods: {
            expandAndFoldComponent(dataEditor, viewModel) {
                if (!dataEditor) {
                    return;
                }
                const expanded = this.componentStates[viewModel.cid] === undefined || this.componentStates[viewModel.cid];
                const cidRows = dataEditor.findRowsForJsonEntry(['cid', viewModel.cid]);
                if (cidRows.length > 0) {
                    const boundaries = dataEditor.findObjectBoundariesAt(cidRows[0]);
                    if (boundaries) {
                        dataEditor.setExpandedAt(boundaries.start, expanded, viewModel.cid + " (...)");
                        if (expanded) {
                            const children = components.getDirectChildren(viewModel);
                            children.forEach(child => this.expandAndFoldComponent(dataEditor, child));
                        }
                    }
                }
            },
            onInitEditor() {
                this.createMarkers();
                this.expandAndFoldComponent(this.$refs['editor'], this.viewModel);
                // TODO: for debugging (remove)
                window.jsonEditor = this.$refs['editor'].getEditor();
            },
            onFoldItemClicked(row, placeholder) {
                let cid = this.findCid(row + 1);
                if (!cid && placeholder) {
                    cid = placeholder.split(' ')[0];
                }
                if (cid) {
                    const expanded = !(this.componentStates[cid] === undefined || this.componentStates[cid])
                    this.$set(this.componentStates, cid, expanded);
                    if (expanded) {
                        const boundaries = this.$refs['editor'].findObjectBoundariesAt(row + 1);
                        const currentRow = this.$refs['editor'].getEditor().getCursorPosition().row;
                        // will select the newly expanded component (if not yes selected)
                        if (currentRow <= boundaries.start || currentRow >= boundaries.end) {
                            setTimeout(() => {
                                this.$refs['editor'].goToRow(row + 1);
                            }, 200);
                        }
                    }
                }
            },
            onUpdateJson() {
                this.createMarkers();
                this.expandAndFoldComponent(this.$refs['editor'], this.viewModel);
            },
            getJsonEntryValue(jsonEntry) {
                return jsonEntry.split(':')[1].split('"')[1];
            },
            findCid(row) {
                const dataEditor = this.$refs['editor'];
                const rows = dataEditor.getRows();
                const rowIndent = dataEditor.getRowIndentAt(row);
                let currentRow = row;
                let currentRowIndent;

                // forward search for cid
                while (currentRow < rows.length && (currentRowIndent = dataEditor.getRowIndentAt(currentRow)) >= rowIndent) {
                    if (currentRowIndent === rowIndent) {
                        const entry = dataEditor.getJsonEntryAt(currentRow);
                        if (entry[0] === 'cid') {
                            return entry[1];
                        }
                    }
                    currentRow++;
                }

                // backward search
                currentRow = row - 1;
                while (currentRow > 0) {
                    currentRowIndent = dataEditor.getRowIndentAt(currentRow);
                    if (currentRowIndent <= rowIndent) {
                        const entry = dataEditor.getJsonEntryAt(currentRow);
                        if (entry[0] === 'cid') {
                            return entry[1];
                        }
                    }
                    currentRow--;
                }
            },
            onChangeCursor(cursor) {
                const cid = this.findCid(cursor.row);
                if (cid !== undefined && cid !== ide.selectedComponentId) {
                    ide.selectComponent(cid, {ignoreSelection: true});
                }
            },
            fetchModel: async function () {
                let pageModel = components.getComponentModel(this.$route.name);
                if (pageModel == null) {
                    pageModel = components.createComponentModel('ContainerView');
                    components.registerComponentModel(pageModel, this.$route.name);
                    components.fillComponentModelRepository(pageModel);
                    this.$eventHub.$emit('component-updated', this.$route.name);
                }
                this.viewModel = pageModel;
            },
            createMarkers: function () {
                const dataEditor = this.$refs['editor'];
                dataEditor.removeAllMarkers("primary-marker", "secondary-marker");
                for (let row = 0; row < dataEditor.getRowCount(); row++) {
                    const entry = dataEditor.getJsonEntryAt(row);
                    if (entry[0] === 'cid') {
                        dataEditor.addMarker(
                            row, $tools.indexOf(dataEditor.getRowAt(row), '"', 3) + 1,
                            row, dataEditor.getRowAt(row).lastIndexOf('"'),
                            entry[1] === ide.selectedComponentId ? "primary-marker" : "secondary-marker"
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

    window.vue = new Vue({
        router
    });
    window.vue.$mount("#__dlite_app");
}

ide.start();

