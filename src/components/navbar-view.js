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

Vue.component('navbar-view', {
    extends: editableComponent,
    template: `
            <div :id="cid" :style="componentBorderStyle()" :class="$route.query.embed === 'true' ? 'd-none' : ''">
                <div>
                   <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
                </div>
                
                <b-navbar 
                    v-if="edit || !(!loggedIn && viewModel.loginPage)"
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
                                v-show="edit || !(viewModel.loginPage && nav.pageId === 'login')"
                            >{{ nav.label }}</b-nav-item>
                        </b-navbar-nav>
                    </b-collapse>
                    
                    <b-navbar-nav class="ml-auto show-desktop">
                    
                        <b-nav-form>
                            <b-button v-if="$eval(viewModel.showResourceMonitoring, false)" 
                                v-b-modal.resource-monitoring-dialog class="d-inline ml-2" size="sm" pill><b-icon-lightning></b-icon-lightning>
                            </b-button>  
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
                
                <b-modal id="resource-monitoring-dialog" @shown="drawResourceMonitoring" variant="light" size="xl" hide-footer scrollable title="Application-level Resource Monitoring">
                    Show last <b-select v-model="chartWindow" :options="[5, 10, 20, 30, 40, 50, 60]" size="sm" style="width:10rem" class="d-inline mx-1"></b-select> minutes
                    <canvas id="chart_UPLOAD"></canvas>                    
                    <canvas id="chart_DOWNLOAD"></canvas>                    
                    <canvas id="chart_DATA"></canvas>                    
                </b-modal>                
              
            </div>
    `,
    data: function () {
        return {
            userInterfaceName: userInterfaceName,
            loggedIn: !!ide.user,
            variantOverride: undefined,
            chartWindow: 5
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
    watch: {
        chartWindow: function() {
            this.drawResourceMonitoring();
        }
    },
    created: function () {
        this.$eventHub.$on('set-user', (user) => {
            this.loggedIn = !!user;
            console.info('navbar set user', user);
            this.checkUserAndRedirect(this.$router.currentRoute.name);
        });
        this.$eventHub.$on('route-changed', (to, from) => {
            console.info('navbar route changed', from, to);
            this.$emit('@route-changed', to, from);
            this.checkUserAndRedirect(to);
        });
    },
    mounted: function() {
        this.checkUserAndRedirect(this.$router.currentRoute.name);
    },
    methods: {
        checkUserAndRedirect(currentPage) {
            if (this.viewModel.loginPage
                && !ide.editMode
                && this.viewModel.navigationItems.some(navItem => navItem.pageId === 'login')
            ) {
                if (ide.user && currentPage === 'login') {
                    Vue.nextTick(() => {
                        console.info('navbar back to last page', currentPage);
                        $tools.go(this.lastPage ? this.lastPage : 'index');
                    });
                }
                if (!ide.user && currentPage !== 'login') {
                    Vue.nextTick(() => {
                        this.lastPage = currentPage;
                        console.info('navbar force to login', currentPage);
                        $tools.go('login');
                    });
                }
            }
        },
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
            return [
                "brand",
                "brandImageUrl",
                "showUser",
                "showSync",
                "showResourceMonitoring",
                "loginPage",
                "fixed",
                "infiniteScroll",
                'bgType',
                "variant",
                "defaultPage",
                "navigationItems",
                "eventHandlers"
            ];
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
                    scales:     {
                        xAxes: [{
                            gridLines: {
                                color: Chart.defaults.borderColor
                            },
                            ticks: {
                                fontColor: Chart.defaults.color
                            },
                            time:       {
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
        },
        customPropDescriptors() {
            return {
                fixed: {
                    type: 'select',
                    editable: true,
                    options: [
                        "top", "bottom"
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
                        "primary", "success", "info", "warning", "danger", "dark", "light", "custom"
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
                showResourceMonitoring: {
                    type: 'checkbox',
                    editable: true,
                    description: "Shows a button to open the resource monitoring popup"
                },
                loginPage: {
                    type: 'checkbox',
                    editable: true,
                    description: "When checked and user is not signed in, automatically redirects to the page with the 'login' id and hides this navbar"
                },
                showSync: {
                    type: 'checkbox',
                    label: 'Show synchronization button',
                    editable: true,
                    description: "Shows the sync button in the navbar (only when logged in)"
                },
                infiniteScroll: {
                    type: 'checkbox',
                    editable: true,
                    description: "When checked, the application content will switch to 'infinite scroll mode'",
                    literalOnly: true
                },
                defaultPage: {
                    type: 'select',
                    editable: true,
                    options: (navbar) => navbar.navigationItems.map(nav => nav.pageId),
                    mandatory: true,
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
