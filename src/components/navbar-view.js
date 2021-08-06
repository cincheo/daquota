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
                    <b-navbar-brand href="#">
                        <b-img v-if="viewModel.brandImageUrl" :src="$eval(viewModel.brandImageUrl)" 
                            :alt="$eval(viewModel.brand)" 
                            :class="'align-top' + (viewModel.brand ? ' mr-1' : '')" 
                            style="height: 1.5rem;"></b-img>
                        <span v-if="viewModel.brand">
                            {{ $eval(viewModel.brand) }}
                        </span>
                    </b-navbar-brand>
                    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
                    <b-collapse id="nav-collapse" is-nav>
                        <b-navbar-nav>
                            <b-nav-item v-for="nav in viewModel.navigationItems" :key="nav.pageId" :to="{ name: nav.pageId }">{{ nav.label }}</b-nav-item>
                        </b-navbar-nav>
                    </b-collapse>
                    <b-navbar-nav class="ml-auto">
                    
                        <b-nav-form v-if="$eval(viewModel.showUser)">
                            <b-button v-if="!loggedIn" class="float-right" @click="signIn">Sign in</b-button>  
                            <div v-else class="float-right">
                                <b-avatar v-if="user().imageUrl" variant="primary" :src="user().imageUrl" class="mr-3"></b-avatar>
                                <b-avatar v-else variant="primary" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-3"></b-avatar>
                                {{ user().email }}
                            </div>          
                        </b-nav-form>                
                    
                    </b-navbar-nav>
                </b-navbar>
            </div>
    `,
    data: function() {
        return {
            userInterfaceName: userInterfaceName,
            loggedIn: ide.user !== undefined
        }
    },
    created: function() {
        this.$eventHub.$on('set-user', (user) => {
            this.loggedIn = user !== undefined;
        });
    },
    methods: {
        user() {
            return ide.user;
        },
        signIn() {
            signInGoogle();
        },
        propNames() {
            return ["brand", "brandImageUrl", "showUser", "class", "style", "variant", "navigationItems"];
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
                showUser: {
                    type: 'checkbox',
                    editable: true
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
