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

Vue.component('component-panel', {
    template: `
        <div id="ide-component-panel">
            <p>
                <div v-if="!modal" class="pl-3 pr-3 pb-3 shadow mb-3">
                    <b-button v-if="canDetachComponent()" class="float-right" v-on:click="detachComponent()" size="sm" variant="danger"><b-icon-trash></b-icon-trash></b-button>
                    <h5>Component properties</h5>
                    <div v-if="viewModel">
                        <component-icon :model="viewModel" class="mr-2"/><span :style="cidStyle">{{ publicId }}</span>
                        <b-button v-if="canDetachComponent()" v-on:click="renameComponent()" size="sm" variant="outline-secondary" pill class="ml-2"><b-icon-pencil/></b-button>
                    </div>
                    <div v-else>
                        Please select a component to edit its properties
                    </div>
                </div>
                    
                <div v-if="propDescriptors != null" :class="modal ? '' : 'ml-1 mr-1'">

                    <b-tabs content-class="mt-3" pills small lazy>
                        <b-tab v-for="(category, index) of getCategories(viewModel, propDescriptors)" :key="category" 
                            :title="getCategoryTitle(category)" :active="index===0?true:undefined"
                        >
                            <component-properties-panel :category="category" :dataModel="dataModel" :viewModel="viewModel" 
                                :propDescriptors="propDescriptors" 
                                :formulaButtonVariant="formulaButtonVariant"
                             />
                        </b-tab>
                    </b-tabs>
                      
                </div>                    
            </p>
        </div>                   
        `,
    props: ['modal'],
    data: () => {
        return {
            viewModel: undefined,
            dataModel: undefined,
            propDescriptors: [],
            formulaButtonVariant: ide.isDarkMode()?'outline-light':'outline-primary'
        }
    },
    computed: {
        cidStyle: function () {
            if (components.hasGeneratedId(this.viewModel)) {
                return 'opacity: 30%';
            } else {
                return '';
            }
        },
        publicId: function () {
            return components.publicId(this.viewModel);
        }
    },
    created: function () {
        this.__watchers = [];
        this.standardCategories = [
            "main",
            "???",
            "style",
            "data",
            "events",
            "..."
        ];
        this.$eventHub.$on('data-model-changed', (cid) => {
            if (this.viewModel && cid && this.viewModel.cid === cid) {
                this.dataModel = $d(this.viewModel.cid);
            }
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.initComponent(cid);
        });
        this.$eventHub.$on('style-changed', () => {
            this.formulaButtonVariant = ide.isDarkMode()?'outline-light':'outline-primary';
        });
    },
    mounted: function() {
        if (ide.selectedComponentId) {
            this.initComponent(ide.selectedComponentId);
        }
    },
    methods: {
        getCategories(viewModel, propDescriptors) {
            let categories = [];
            for (let propDescriptor of propDescriptors) {
                if (categories.indexOf(propDescriptor.category) === -1 &&
                    (!propDescriptor.hidden || !propDescriptor.hidden(viewModel))) {
                    categories.push(propDescriptor.category);
                }
            }
            categories = categories.sort((c1, c2) => {
                let c1Index = this.standardCategories.indexOf(c1);
                let c2Index = this.standardCategories.indexOf(c2);
                if (c1Index === -1) {
                    c1Index = 1;
                }
                if (c2Index === -1) {
                    c2Index = 1;
                }
                return c1Index - c2Index;
            });
            return categories;
        },
        getCategoryTitle(category) {
            if (category === 'main') {
                return 'Properties';
            } else {
                return Tools.camelToLabelText(category);
            }
        },
        initComponent(cid) {
            if (this.viewModel && cid && this.viewModel.cid === cid) {
                return;
            }

            // unwatch if necessary
            for (const watcher of this.__watchers) {
                watcher();
            }

            if (!cid) {
                this.viewModel = undefined;
                this.dataModel = undefined;
                this.propDescriptors = undefined;
                return;
            }

            this.viewModel = components.getComponentModel(cid);
            this.dataModel = $d(this.viewModel.cid);

            this.propDescriptors = components.propDescriptors(this.viewModel);

            for (const prop of this.propDescriptors) {
                this.__watchers.push(this.$watch('viewModel.' + prop.name, (newValue, oldValue) => {
                    if (ide.disablePropPanelInterception || (newValue === oldValue || newValue == null && oldValue == null)) {
                        return;
                    }
                    ide.commandManager.add(new SetProperty(this.viewModel.cid, prop.name, newValue, oldValue))
                }, {deep: false, sync: true}));
            }
        },
        canDetachComponent() {
            if (!this.viewModel) {
                return false;
            }
            const parent = components.findParent(this.viewModel.cid);
            return !!parent && (components.getComponentModel(parent).type !== 'TabsView');
        },
        detachComponent() {
            ide.commandManager.execute(new DetachComponent(this.viewModel.cid))
        },
        renameComponent() {
            ide.renameComponent(this.viewModel.cid);
        }
    }
});
