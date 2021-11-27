Vue.component('navbar-view', {
    extends: editableComponent,
    template: `
            <div :id="cid" :style="componentBorderStyle()" :class="$route.query.embed === 'true' ? 'd-none' : ''">
                <div>
                   <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
                </div>
                
                <b-navbar 
                    toggleable="lg" 
                    :type="$eval(viewModel.bgType, 'dark') ? $eval(viewModel.bgType, 'dark') : 'dark'" 
                    :fixed="edit ? '' : $eval(viewModel.fixed, '')"
                    :variant="(edit && computedVariant === 'custom') ? 'dark' : (computedVariant ? computedVariant : 'dark')"
                    :style="(edit && computedVariant === 'custom') ? '' : $eval(viewModel.style, null)"
                    :class="(edit && computedVariant === 'custom') ? '' : $eval(viewModel.class, null)"
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
                    
                        <b-nav-form>
                            <div v-if="$eval(viewModel.showUser, false)" class="d-inline">
                                <b-button v-if="!loggedIn" @click="signIn">Sign in</b-button>  
                                <div v-else>
                                    <div @click="signOut" style="cursor: pointer">
                                        <b-avatar v-if="user().imageUrl" :variant="(computedVariant === 'primary' ? 'secondary' : 'primary')" :src="user().imageUrl" class="mr-2"></b-avatar>
                                        <b-avatar v-else :variant="(computedVariant === 'primary' ? 'secondary' : 'primary')" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-2"></b-avatar>
                                    </div>
                                </div>
                            </div>
                            <b-button v-if="loggedIn && $eval(viewModel.showSync, false)" 
                                class="d-inline ml-2" size="sm" pill @click="sync"><b-icon-arrow-repeat></b-icon-arrow-repeat>
                            </b-button> 
                            <b-button v-if="editButtonOverlay()" disabled
                                style="visibility: hidden" class="d-inline ml-2" size="sm" pill><b-icon-pencil></b-icon-pencil>
                            </b-button> 
                        </b-nav-form>                
                    
                    </b-navbar-nav>
                    
                    <b-collapse id="nav-collapse" is-nav>
                        <b-navbar-nav>
                            <b-nav-item v-for="nav in viewModel.navigationItems" 
                                :key="navigationItemKey(nav)" 
                                :to="navigationItemTarget(nav)" 
                                :exact="true"
                                >{{ nav.label }}</b-nav-item>
                        </b-navbar-nav>
                    </b-collapse>
                    
                    <b-navbar-nav class="ml-auto show-desktop">
                    
                        <b-nav-form>
                            <div v-if="$eval(viewModel.showUser, false)" class="d-inline">
                                <b-button v-if="!loggedIn" @click="signIn">Sign in</b-button>  
                                <div v-else>
                                    <div @click="signOut" style="cursor: pointer">
                                        <b-avatar v-if="user().imageUrl" :variant="(computedVariant === 'primary' ? 'secondary' : 'primary')" :src="user().imageUrl" class="mr-2"></b-avatar>
                                        <b-avatar v-else :variant="(computedVariant === 'primary' ? 'secondary' : 'primary')" :text="(user().firstName && user().lastName) ? (user().firstName[0] + '' + user().lastName[0]) : '?'" class="mr-2"></b-avatar>
                                        <span class="text-light">{{ user().email }}</span>
                                    </div>
                                </div>          
                            </div>
                            <b-button v-if="loggedIn && $eval(viewModel.showSync, false)" 
                                class="d-inline ml-2" size="sm" pill @click="sync"><b-icon-arrow-repeat></b-icon-arrow-repeat>
                            </b-button>  
                            <b-button v-if="editButtonOverlay()" disabled
                                style="visibility: hidden" class="d-inline ml-2" size="sm" pill><b-icon-pencil></b-icon-pencil>
                            </b-button> 
                        </b-nav-form>
                    
                    </b-navbar-nav>
                    
                </b-navbar>
            </div>
    `,
    data: function () {
        return {
            userInterfaceName: userInterfaceName,
            loggedIn: ide.user !== undefined,
            variantOverride: undefined,
            route: undefined
        }
    },
    computed: {
        computedVariant: function () {
            if (this.variantOverride) {
                return this.variantOverride;
            } else {
                return this.$eval(this.viewModel.variant, null);
            }
        }
    },
    created: function () {
        this.$eventHub.$on('set-user', (user) => {
            this.loggedIn = user !== undefined;
        });
        this.$eventHub.$on('route-changed', (from, to) => {
            this.route = to;
            this.$emit('@route-changed', from, to);
        });
    },
    methods: {
        editButtonOverlay() {
            if (this.screenWidth >= MD) {
                return !ide.editMode && !ide.locked;
            } else {
                return !ide.locked;
            }
        },
        additionalStyle() {
            if (this.edit) {
                let fixed = this.$eval(this.viewModel.fixed, '');
                switch (fixed) {
                    case 'top':
                        return ';position:absolute;top:' + ide.navbarHeight + 'px';
                    case 'bottom':
                        return ';position:absolute;bottom:' + ide.statusbarHeight + 'px';
                }
            }
            return '';
        },
        user() {
            return ide.user;
        },
        sync() {
            $collab.synchronize();
        },
        signIn() {
            ide.signInRequest();
        },
        signOut() {
            if (confirm("Are you sure you want to sign out?")) {
                ide.signOut();
            }
        },
        customEventNames() {
            return [
                "@route-changed"
            ];
        },
        propNames() {
            return ["brand", "brandImageUrl", "showUser", "showSync", "fixed", "contentFillHeight", 'bgType', "variant", "defaultPage", "navigationItems", "eventHandlers"];
        },
        navigationItemTarget(navigationItem) {
            switch (navigationItem.kind) {
                case 'Anchor':
                    return navigationItem.anchorName.indexOf('#') > -1 ? navigationItem.anchorName : '#' + navigationItem.anchorName;
                case 'Page':
                default:
                    return {name: navigationItem.pageId};
            }
        },
        navigationItemKey(navigationItem) {
            switch (navigationItem.kind) {
                case 'Anchor':
                    return navigationItem.anchorName;
                case 'Page':
                default:
                    return navigationItem.pageId;
            }
        },
        overrideVariant(variant) {
            this.variantOverride = variant;
        },
        customActionNames() {
            return [
                {value: "overrideVariant", text: "overrideVariant(variant)"}
            ];
        },
        customPropDescriptors() {
            return {
                fixed: {
                    type: 'select',
                    editable: true,
                    options: [
                        "", "top", "bottom"
                    ],
                    description: "Set to 'top' for fixed to the top of the viewport, or 'bottom' for fixed to the bottom of the viewport"
                },
                sticky: {
                    type: 'checkbox',
                    editable: true,
                    description: "Set to true to make the navbar stick to the top of the viewport (or parent container that has 'position: relative' set) when scrolled"
                },
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "", "primary", "success", "info", "warning", "danger", "dark", "light", "custom"
                    ],
                    description: "When unset, defaults to 'dark'; use 'custom' to allow for custom CSS"
                },
                bgType: {
                    type: 'select',
                    label: 'Type',
                    editable: true,
                    options: [
                        "dark", "light", 'custom'
                    ],
                    category: 'style',
                    description: "Control the text color by setting to 'light' for use with light background color variants, or 'dark' for dark background color variants; use 'custom' to allow custom CSS"
                },
                showUser: {
                    type: 'checkbox',
                    editable: true,
                    description: "Shows the logged user avatar in the navbar"
                },
                showSync: {
                    type: 'checkbox',
                    label: 'Show synchronization button',
                    editable: true,
                    description: "Shows the sync button in the navbar (only when logged in)"
                },
                contentFillHeight: {
                    type: 'checkbox',
                    editable: true,
                    description: "When checked, the application content will fill the height of the screen (use it to avoid 'infinite scroll' web design)",
                    literalOnly: true
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
                    maxRows: 15,
                    label: 'Default value',
                    description: 'Application global initialization can be defined here and will be accessible with the "config" variable'
                }
            };
        }
    }
});
