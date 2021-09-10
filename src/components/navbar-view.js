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
                    :style="$eval(viewModel.style, null)"
                    :class="viewModel.class"
                    >
                    <b-navbar-brand href="#">
                        <b-img v-if="viewModel.brandImageUrl" :src="$eval(viewModel.brandImageUrl, '#error#')" 
                            :alt="$eval(viewModel.brand, '#error#')" 
                            :class="'align-top' + (viewModel.brand ? ' mr-1' : '')" 
                            style="height: 1.5rem;"></b-img>
                        <span v-if="viewModel.brand">
                            {{ $eval(viewModel.brand, '#error#') }}
                        </span>
                    </b-navbar-brand>

                    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
                    
                    <b-navbar-nav class="ml-auto show-mobile">
                    
                        <b-nav-form v-if="$eval(viewModel.showUser, false)">
                            <b-button v-if="!loggedIn" @click="signIn">Sign in</b-button>  
                            <div v-else>
                                <b-avatar v-if="user().imageUrl" :variant="(viewModel.variant === 'primary' ? 'secondary' : 'primary')" :src="user().imageUrl" class="mr-3"></b-avatar>
                                <b-avatar v-else :variant="(viewModel.variant === 'primary' ? 'secondary' : 'primary')" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-3"></b-avatar>
                            </div>          
                        </b-nav-form>                
                    
                    </b-navbar-nav>
                    
                    <b-collapse id="nav-collapse" is-nav>
                        <b-navbar-nav>
                            <b-nav-item v-for="nav in viewModel.navigationItems" :key="navigationItemKey(nav)" :to="navigationItemTarget(nav)">{{ nav.label }}</b-nav-item>
                        </b-navbar-nav>
                    </b-collapse>
                    
                    <b-navbar-nav class="ml-auto show-desktop">
                    
                        <b-nav-form v-if="$eval(viewModel.showUser, false)">
                            <b-button v-if="!loggedIn" @click="signIn">Sign in</b-button>  
                            <div v-else>
                                <b-avatar v-if="user().imageUrl" :variant="(viewModel.variant === 'primary' ? 'secondary' : 'primary')" :src="user().imageUrl" class="mr-3"></b-avatar>
                                <b-avatar v-else :variant="(viewModel.variant === 'primary' ? 'secondary' : 'primary')" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-3"></b-avatar>
                                <span class="text-light">{{ user().email }}</span>
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
            return ["brand", "brandImageUrl", "showUser", "class", "style", "variant", "defaultPage", "navigationItems"];
        },
        navigationItemTarget(navigationItem) {
            if (navigationItem.kind == null) {
                navigationItem.kind = 'Page';
            }
            switch(navigationItem.kind) {
                case 'Anchor':
                    return '#' + navigationItem.anchorName;
                case 'Page':
                    return { name: navigationItem.pageId };
            }
        },
        navigationItemKey(navigationItem) {
            if (navigationItem.kind == null) {
                navigationItem.kind = 'Page';
            }
            switch(navigationItem.kind) {
                case 'Anchor':
                    return navigationItem.anchorName;
                case 'Page':
                    return navigationItem.pageId;
            }
        },
        customPropDescriptors() {
            return {
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "", "primary", "success", "info", "warning", "danger", "dark", "light"
                    ]
                },
                showUser: {
                    type: 'checkbox',
                    editable: true
                },
                defaultPage: {
                    type: 'select',
                    editable: true,
                    options: (navbar) => navbar.navigationItems.map(nav => nav.pageId),
                    description: "Select the page id to fallback to when the given route is undefined or not found (if not set, the default page is 'index')"
                },
                navigationItems: {
                    type: 'custom',
                    editor: 'nav-items-panel',
                    label: 'Navigation items',
                },
                defaultValue: {
                    type: 'textarea',
                    rows: 10,
                    label: 'Default value',
                    description: 'Application global initialization can be defined here and will be accessible with the "config" variable'
                }
            };
        }
    }
});
