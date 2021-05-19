Vue.prototype.$eventHub = new Vue();

let userInterfaceName = new URLSearchParams(window.location.search).get('ui');
if (!userInterfaceName) {
    userInterfaceName = 'default';
}

let backend = new URLSearchParams(window.location.search).get('backend')
let baseUrl = backend ? 'http://' + backend + '/web-api' : 'http://localhost:8085/web-api';

let mapKeys = function(object, mapFn) {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(key, object[key])
        return result
    }, {})
}

class IDE {
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

    attributes = {};
    setAttribute(name, value) {
        this.attributes[name] = value;
    }
    getAttribute(name) {
        return this.attributes[name];
    }
    editMode = false;

    getComponentIcon(type) {
        return `assets/component-icons/${Tools.camelToKebabCase(type)}.png`
    }

    async save(userInterfaceName) {
        console.info(JSON.stringify(applicationModel));
        if (!userInterfaceName) {
            userInterfaceName = 'default';
        }
        let formData = new FormData();
        formData.append('userInterfaceName', userInterfaceName);
        formData.append('model', JSON.stringify(applicationModel));

        fetch(baseUrl + '/saveUserInterface', {
            method: "POST",
            body: formData
        });

        for (let page of applicationModel.navbar.navigationItems) {
            if (components.hasComponent(page.pageId)) {
                console.info(JSON.stringify(components.getComponentModel(page.pageId)));

                let formData = new FormData();
                formData.append('userInterfaceName', userInterfaceName);
                formData.append('pageName', page.pageId);
                formData.append('model', JSON.stringify(components.getComponentModel(page.pageId)));

                fetch(baseUrl + '/savePage', {
                    method: "POST",
                    body: formData
                });

            }
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
            let ui = this.uis.find(ui => ui.name === userInterfaceName);
            if (ui) {
                let url = undefined;
                if (pageName) {
                    if (ui.pages.indexOf(pageName) > -1) {
                        url = window.location.origin + window.location.pathname + "?ui=" + userInterfaceName + "#/" + pageName;
                    }
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

}


let ide = new IDE();

function start() {
    Vue.component('main-layout', {
        template: `
            <div>
                <b-sidebar v-if="edit" class="left-sidebar" id="left-sidebar" ref="left-sidebar" title="Left sidebar" :visible="isLeftSidebarOpened()" 
                    no-header shadow no-slide no-close-on-route-change width="20em" style="float: left"
                    :bg-variant="isDarkMode() ? 'dark' : 'light'" :text-variant="isDarkMode() ? 'light' : 'dark'" >
<!--                    <b-button pill v-on:click="toggleLeftSidebar" variant="secondary" class="mr-2 toggleButton" size="sm">-->
<!--                        <b-icon icon="list"></b-icon>-->
<!--                    </b-button>-->
                    <tools-panel></tools-panel>
                </b-sidebar>
                <b-sidebar v-if="edit" class="right-sidebar" id="right-sidebar" ref="right-sidebar" title="Right sidebar" :visible="isRightSidebarOpened()" 
                    no-header shadow no-slide no-close-on-route-change width="30em" style="float: right"
                    :bg-variant="isDarkMode() ? 'dark' : 'light'" :text-variant="isDarkMode() ? 'light' : 'dark'" >
<!--                    <b-button pill v-on:click="toggleRightSidebar" variant="secondary" class="mr-2 toggleButton" size="sm">-->
<!--                        <b-icon icon="list"></b-icon>-->
<!--                    </b-button>-->
                    <component-panel></component-panel>
                </b-sidebar>
                <b-container fluid class="p-0">
                
                    <builder-dialogs v-if="edit"></builder-dialogs>
                
                    <component-view v-for="dialogId in viewModel.dialogIds" :cid="dialogId" keyInParent="dialogIds"></component-view>
                    
                    <b-row no-gutter>
                        <b-col class="p-0 root-container">
                            <component-view :cid="viewModel.navbar.cid" keyInParent="navbar"></component-view>
                            <div id="content">
                                <slot></slot>
                            </div>
                        </b-col>
<!--                        <b-col v-if="edit" cols="3">-->
<!--                            <component-panel></component-panel>-->
<!--                        </b-col>-->
                    </b-row>
                </b-container>
            </div>
        `,
        created: function () {
            this.$eventHub.$on('edit', (event) => {
                this.edit = event;
            });
        },
        data: () => {
            return {
                viewModel: applicationModel,
                edit: ide.editMode
            }
        },
        computed: {
            isActive(href) {
                return href === this.$root.currentRoute
            }
        },
        methods: {
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
                    let url = `${baseUrl}/page?ui=${userInterfaceName}&pageId=${this.$route.name}`;
                    console.log("fetch page", url);
                    pageModel = await fetch(url, {
                        method: "GET"
                    }).then(response => response.json());
                    console.log("component for page '" + this.$route.name + "'", JSON.stringify(pageModel, null, 4));
                    if (pageModel == null || pageModel.type == null) {
                        console.log("auto create container for page '" + this.$route.name + "'");
                        pageModel = components.createComponentModel('ContainerView');
                        components.registerComponentModel(pageModel, this.$route.name);
                        //pageModel = {};
                    }
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

fetch(baseUrl + '/index?ui=' + userInterfaceName, {
    method: "GET"
})
    .then(response => response.json())
    .then(serverApplicationModel => {
        if (serverApplicationModel != null) {
            applicationModel = serverApplicationModel;
        }
        if (applicationModel.bootstrapStylesheetUrl) {
            ide.setStyle(applicationModel.bootstrapStylesheetUrl, applicationModel.darkMode);
        }
        if (applicationModel.enableWebSockets) {
            ide.startWebSocketConnection();
        }

        console.log("application model", JSON.stringify(applicationModel, null, 4));
        components.fillComponentModelRepository(applicationModel);

        fetch(baseUrl + '/model', {
            method: "GET"
        })
            .then(response => response.json())
            .then(model => {
                console.log("model", JSON.stringify(model, null, 4));
                domainModel = model;

                fetch(baseUrl + '/uis', {
                    method: "GET"
                })
                    .then(response => response.json())
                    .then(uis => {
                        console.log("uis", JSON.stringify(uis, null, 4));
                        ide.uis = uis;
                        start();
                    });
            });
    });
