Vue.component('navbar-view', {
    extends: editableComponent,
    template: `
            <div :id="cid" :style="componentBorderStyle()">
                <div>
                   <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
                </div>
                <b-button v-if="!edit" pill size="sm" class="shadow" style="position:fixed; z-index: 100; right: 1em; top: 1em" v-on:click="$eventHub.$emit('edit', !edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
                <b-button v-if="edit" pill size="sm" class="shadow show-mobile" style="position:fixed; z-index: 100; right: 1em; top: 1em" v-on:click="$eventHub.$emit('edit', !edit)"><b-icon :icon="edit ? 'play' : 'pencil'"></b-icon></b-button>
                
                <b-navbar 
                    toggleable="lg" 
                    type="dark" 
                    variant="info"
                    :class="viewModel.class"
                    >
                    <b-navbar-brand href="#">{{viewModel.brand}}</b-navbar-brand>
                    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
                    <b-collapse id="nav-collapse" is-nav>
                        <b-navbar-nav>
                            <b-nav-item v-for="nav in viewModel.navigationItems" :to="{ name: nav.pageId }">{{ nav.label }}</b-nav-item>
                        </b-navbar-nav>
                    </b-collapse>
                    <b-navbar-nav class="ml-auto">
                    </b-navbar-nav>
                </b-navbar>
            </div>
    `,
    data: function() {
        return {
            userInterfaceName: userInterfaceName
        }
    },
    methods: {
        propNames() {
            return ["brand", "class", "navigationItems"];
        },
        async save() {
            ide.save(this.userInterfaceName);
        },
        async load() {
            ide.load(this.userInterfaceName);
        },
        setStyle(value, darkMode) {
            ide.setStyle(`https://bootswatch.com/4/${value}/bootstrap.css`, darkMode);
        },
        customPropDescriptors() {
            return {
                navigationItems: {
                    type: 'table',
                    label: 'Navigation items',
                    stacked: true,
                    editable: true,
                    notRemovable: true,
                    fields: [
                        {
                            key: 'label'
                        },
                        {
                            key: 'pageId',
                        },
                        {
                            key: 'actions',
                            label: '',
                            class: 'text-right'
                        }
                    ],
                    onModified: (navigationItems) => {
                        if (navigationItems) {
                            console.log("MODIFIED", navigationItems);
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
            };
        }
    }
});
