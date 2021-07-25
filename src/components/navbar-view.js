Vue.component('navbar-view', {
    extends: editableComponent,
    template: `
            <div :id="cid" :style="componentBorderStyle()" :class="$route.query.embed === 'true' ? 'd-none' : ''">
                <div>
                   <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
                </div>
                
                <b-navbar 
                    toggleable="lg" 
                    type="dark" 
                    :variant="viewModel.variant ? viewModel.variant : 'dark'"
                    :style="$eval(viewModel.style)"
                    :class="viewModel.class"
                    >
                    <b-navbar-brand href="#">{{viewModel.brand}}</b-navbar-brand>
                    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
                    <b-collapse id="nav-collapse" is-nav>
                        <b-navbar-nav>
                            <b-nav-item v-for="nav in viewModel.navigationItems" :key="nav.pageId" :to="{ name: nav.pageId }">{{ nav.label }}</b-nav-item>
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
            return ["brand", "class", "style", "variant", "navigationItems"];
        },
        customPropDescriptors() {
            return {
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "primary", "success", "info", "warning", "danger", "dark", "light"
                    ]
                },
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
