
let versionIndex = 1;

Vue.prototype.$eventHub = new Vue();

let parameters = new URLSearchParams(window.location.search);

let userInterfaceName = parameters.get('ui');
if (!userInterfaceName) {
    userInterfaceName = 'default';
}

let backend = parameters.get('backend');
if (!backend) {
    backend = 'localhost:8085';
}
let baseUrl = window.location.protocol + '//' + backend + '/web-api';

let mapKeys = function(object, mapFn) {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(key, object[key]);
        return result;
    }, {})
}

class IDE {

    uis = [];
    attributes = {};
    editMode = false;
    offlineMode = false;
    domainModels = {};

    constructor() {
        this.attributes = {};
        this.setAttribute('leftSidebarState', 'open');
        this.setAttribute('rightSidebarState', 'open');
        Vue.prototype.$eventHub.$on('edit', (event) => {
            this.editMode = event;
            this.selectedComponentId = undefined;
            this.targetedComponentId = undefined;
            document.querySelectorAll(".targeted").forEach(element => element.classList.remove("targeted"));
            if (this.editMode) {
                document.querySelector(".root-container").classList.add("targeted");
            }
        });
        // Vue.prototype.$eventHub.$on('component-selected', (cid) => {
        //     this.selectedComponentId = cid;
        // });
    }

    selectComponent(cid) {
        this.selectedComponentId = cid;
        setTimeout(() => {
            Vue.prototype.$eventHub.$emit('component-selected', cid);
        }, 100);
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

    async save() {
        if (!userInterfaceName) {
            userInterfaceName = 'default';
        }
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
        let formData = new FormData();
        formData.append('userInterfaceName', userInterfaceName);
        formData.append('model', JSON.stringify({
            applicationModel: applicationModel,
            roots: components.getRoots()
        }, undefined, 2));

        fetch(baseUrl + '/saveUserInterface', {
            method: "POST",
            body: formData
        });
    }

    saveFile() {
        applicationModel.versionIndex = versionIndex;
        applicationModel.name = userInterfaceName;
        Tools.download(JSON.stringify({
            applicationModel: applicationModel,
            roots: components.getRoots()
        }, undefined, 2), userInterfaceName+".dlite", "application/dlite");
    }

    loadFile(callback) {
        Tools.upload(content => {
            console.info("loaded", content);
            let contentObject = JSON.parse(content);
            this.loadApplicationContent(contentObject, callback);
        });
    }

    async loadUrl(url, callback) {
        return fetch(url)
            .then(res => res.json())
            .then((json) => {
                console.info("loadurl", json);
                this.loadApplicationContent(json, callback);
            })
            .catch(err => { throw err });
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

    setStyle(url, darkMode) {
        console.info("set style", url, darkMode);
        document.getElementById('bootstrap-css').href = url;
        applicationModel.bootstrapStylesheetUrl = url;
        applicationModel.darkMode = darkMode;
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
            document.querySelectorAll(".targeted").forEach(element => element.classList.remove("targeted"));
            if (this.targetedComponentId === this.selectedComponentId) {
                document.querySelector(".root-container").classList.add("targeted");
                this.targetedComponentId = undefined;
                Vue.prototype.$eventHub.$emit('component-targeted', undefined);
            } else {
                this.targetedComponentId = this.selectedComponentId;
                Vue.prototype.$eventHub.$emit('component-targeted', this.targetedComponentId);
                try {
                    components.getHtmlElement(this.targetedComponentId).classList.add("targeted");
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
        Vue.prototype.$eventHub.$emit('application-loaded');
        if (callback) {
            callback();
        }
    }

    loadUI() {
        fetch(baseUrl + '/index?ui=' + userInterfaceName, {
            method: "GET"
        })
            .then(response => response.json())
            .then(contentObject => {

                if (contentObject != null) {
                    this.loadApplicationContent(contentObject);
                }

                try {
                    ide.startWebSocketConnection();
                } catch (e) {
                    console.error(e);
                }

                this.fetchDomainModel();

                fetch(baseUrl + '/uis', {
                    method: "GET"
                })
                    .then(response => response.json())
                    .then(uis => {
                        console.log("uis", JSON.stringify(uis, null, 4));
                        ide.uis = uis;
                        start();
                    });
            })
            .catch((error) => {
                console.error("error connecting to server - serverless mode", error);
                this.offlineMode = true;
                applicationModel = {
                    "defaultPage":"index",
                    "navbar": {
                        "cid":"navbar",
                        "type":"NavbarView",
                        "brand":"App name",
                        "navigationItems": [
                            {
                                "pageId":"index",
                                "label":"Index"
                            }
                        ]
                    },
                    "autoIncrementIds":{},
                    "name": "default"
                };
                components.fillComponentModelRepository(applicationModel);
                this.editMode = true;
                ide.uis = ["default"];
                start();

        });

    }

    getDomainModel(serverBaseUrl) {
        if (!serverBaseUrl) {
            serverBaseUrl = baseUrl;
        }
        if (this.domainModels[serverBaseUrl] === undefined) {
            this.fetchDomainModel(serverBaseUrl);
        }
        return this.domainModels[serverBaseUrl];
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
                this.domainModels[serverBaseUrl] = null;
            });
    }

    initApplicationModel() {

        if (applicationModel.bootstrapStylesheetUrl) {
            ide.setStyle(applicationModel.bootstrapStylesheetUrl, applicationModel.darkMode);
        }

        if (ide.router) {
            let navigationItems = applicationModel.navbar.navigationItems;

            if (applicationModel.defaultPage) {
                ide.router.addRoute({path: "/", redirect: applicationModel.defaultPage});
            }

            navigationItems.forEach(nav => {
                if (nav.pageId && nav.pageId !== "") {
                    console.info("add route to page '" + nav.pageId + "'");
                    ide.router.addRoute({
                        name: nav.pageId,
                        path: "/" + nav.pageId,
                        component: Vue.component('page-view')
                    });
                }
            });
            console.info(ide.router);
        }
    }

}


let ide = new IDE();

function start() {
    Vue.component('main-layout', {
        template: `
        <div>
            
            <b-container v-if="offlineMode() && !loaded" class="border shadow p-2 splash">
                <b-img width="80" src="assets/images/dlite_logo_200x200.png" class="float-left"></b-img>
                <h3 class="mt-2">DLite IDE</h3>
                <p class="mb-5">Low-code platform</p>
                <div class="text-center">
                    <b-button size="md" pill class="mt-2" v-on:click="loadFile" variant="primary"><b-icon icon="upload"></b-icon> Load UI file</b-button>
                    <b-button size="md" pill class="mt-2" v-on:click="loaded=true" variant="outline-secondary"><b-icon icon="arrow-right-square"></b-icon> Start with a blank projet</b-button>
                </div>
                <b-card class="mt-4">
                    <p class="text-center">Or connect to a DLite server:</p>
                    <b-form-input v-model="backend" size="md" :state="!offlineMode()" v-b-tooltip.hover title="Server address"></b-form-input>
                    <b-button size="md" pill class="mt-2 float-right" v-on:click="connect" variant="outline-primary"><b-icon icon="cloud-plus"></b-icon> Connect to server</b-button>
                    </b-card>
            </b-container>            

            <div v-else>            
                <b-sidebar v-if="edit" class="left-sidebar show-desktop" id="left-sidebar" ref="left-sidebar" title="Left sidebar" :visible="isRightSidebarOpened()"
                    no-header no-close-on-route-change shadow width="20em" 
                    :bg-variant="isDarkMode() ? 'dark' : 'light'" :text-variant="isDarkMode() ? 'light' : 'dark'" >
                    <tools-panel></tools-panel>
                </b-sidebar>
                <b-sidebar v-if="edit" class="show-mobile" id="left-sidebar-mobile" ref="left-sidebar-mobile" :visible="false"
                    shadow width="20em" 
                    :bg-variant="isDarkMode() ? 'dark' : 'light'" :text-variant="isDarkMode() ? 'light' : 'dark'" >
                    <mobile-tools-panel></mobile-tools-panel>
                </b-sidebar>
                <b-sidebar v-if="edit" class="right-sidebar show-desktop" id="right-sidebar" ref="right-sidebar" title="Right sidebar" :visible="isRightSidebarOpened()" 
                    no-header no-close-on-route-change shadow width="30em" 
                    :bg-variant="isDarkMode() ? 'dark' : 'light'" :text-variant="isDarkMode() ? 'light' : 'dark'" >
                    <component-panel></component-panel>
                </b-sidebar>
                <b-container fluid class="p-0">

                    <b-button v-if="edit" v-b-toggle.left-sidebar-mobile pill size="sm" class="shadow show-mobile" style="position:fixed; z-index: 300; left: -1em; top: 50%; opacity: 0.5"><b-icon icon="list"></b-icon></b-button>
                
                    <builder-dialogs v-if="edit"></builder-dialogs>

                    <b-modal id="component-modal" title="Component properties" static scrollable>
                        <component-panel></component-panel>
                    </b-modal>

                    <b-modal id="create-component-modal" title="Create component" static scrollable hide-footer>
                        <create-component-panel @componentCreated="hideComponentCreatedModal" initialCollapse="all"></create-component-panel>
                    </b-modal>
                
                    <component-view v-for="dialogId in viewModel.dialogIds" :key="dialogId" :cid="dialogId" keyInParent="dialogIds"></component-view>
                    
<!--                    <b-row no-gutter>-->
<!--                        <b-col class="p-0 root-container">-->
                        <div class="root-container">
                            <component-view :cid="viewModel.navbar.cid" keyInParent="navbar"></component-view>
                            <div id="content">
                                <slot></slot>
                            </div>
                        </div>                            
<!--                        </b-col>-->
<!--                    </b-row>-->
                </b-container>
            </div>                
        </div>
        `,
        created: function () {
            this.$eventHub.$on('edit', (event) => {
                this.edit = event;
            });
            this.$eventHub.$on('application-loaded', () => {
                if (this.viewModel) {
                    this.viewModel = applicationModel;
                }
            });
        },
        data: () => {
            return {
                viewModel: applicationModel,
                edit: ide.editMode,
                userInterfaceName: userInterfaceName,
                backend: backend,
                loaded: false
            }
        },
        computed: {
            isActive(href) {
                return href === this.$root.currentRoute;
            }
        },
        methods: {
            hideComponentCreatedModal() {
                console.info("hide modal");
                this.$root.$emit('bv::hide::modal', 'create-component-modal');
            },
            loadFile() {
                ide.loadFile(() => {
                    this.loaded = true;
                    this.$eventHub.$emit('edit', false);
                });
            },
            connect() {
                backend = this.backend;
                ide.createAndLoad("default");
            },
            offlineMode() {
                return ide.offlineMode;
            },
            isDarkMode() {
                return ide.isDarkMode();
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
                console.info("isLeftSidebarOpened", ide.getAttribute('leftSidebarState') === 'open');
                return this.edit && ide.getAttribute('leftSidebarState') === 'open';
            },
            isRightSidebarOpened() {
                console.info("isRightSidebarOpened", ide.getAttribute('rightSidebarState') === 'open');
                return this.edit && ide.getAttribute('rightSidebarState') === 'open';
            }
        }
    });

    Vue.component('page-view', {
        template: `
            <div>
                <main-layout>
                    <component-view :cid="viewModel ? viewModel.cid : undefined" />
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

    if (applicationModel.defaultPage) {
        routes.push({path: "/", redirect: applicationModel.defaultPage});
    }

    applicationModel.navbar.navigationItems.forEach(nav => {
        console.info("add route to page '" + nav.pageId + "'");
        routes.push({
            name: nav.pageId,
            path: "/" + nav.pageId,
            component: Vue.component('page-view')
        });
    });

    console.log("building router", routes);

    const router = new VueRouter({
        routes: routes,
        linkActiveClass: "active"
    });
    ide.router = router;

    new Vue({
        router
    }).$mount("#app");
}

if (parameters.get('src')) {
    ide.loadUrl(parameters.get('src'), () => start());
} else {
    ide.loadUI();
}