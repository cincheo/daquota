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

Vue.component('icon-view', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <template v-if="viewModel.allowUserSelection">
                <b-button @click="toggleIconSelector"><b-spinner v-if="loadingIcons" small></b-spinner> Select icon...</b-button>
            </template>
            <b-icon
                :icon="src" 
                :class="$eval(viewModel.class, null)"
                :variant="$eval(viewModel.variant, null)" 
                :flip-h="$eval(viewModel.flipHorizontally, null)" 
                :flip-v="$eval(viewModel.flipVertically, null)" 
                :rotate="$eval(viewModel.rotate, null)" 
                :scale="$eval(viewModel.scale, null)" 
                :style="$eval(viewModel.style, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
            />
            <template v-if="viewModel.allowUserSelection">
                <b-collapse v-model="showSelector">
                    <div style="overflow-y: auto">
                        <b-form-input v-model="iconFilter" size="sm" class="w-25 mb-2 mx-auto" placeholder="Enter an icon name..."/>
                        <div class="d-flex flex-wrap justify-content-center" style="gap: 0.5rem">
                            <b-card v-for="(icon, i) in icons.filter(i=>i.indexOf(iconFilter)>-1)" 
                                :key="i"
                                footer-tag="footer" 
                                style="width: 10rem; cursor: pointer" 
                                :footer-bg-variant="icon === value ? 'info' : ''"
                                :border-variant="icon === value ? 'warning' : ''"
                                :footer-border-variant="icon === value ? 'warning' : ''"
                                @click="value=icon; showSelector=false"
                            >
                                <b-card-text class="text-center"><b-icon :icon="icon"></b-icon></b-card-text>
                                <template #footer>
                                    <div 
                                        :class="'text-center' + (icon === value ? ' font-weight-bolder text-white' : '')"
                                    >
                                        {{ icon }}
                                    </div>
                                </template>
                            </b-card>
                        
                        </div>
                    </div>    
                </b-collapse>            
            </template>
            
        </div>
    `,
    data: function() {
        return {
            iconFilter: "",
            icons: ide.icons,
            showSelector: false,
            loadingIcons: false
        }
    },
    computed: {
        src: function () {
            if (this.viewModel.useData) {
                return this.value;
            } else {
                return this.$eval(this.viewModel.icon, null);
            }
        }
    },
    methods: {
        toggleIconSelector() {
            if (this.viewModel.allowUserSelection) {
                if (this.showSelector) {
                    this.showSelector = false;
                    return;
                }
                if (ide.icons.length < 20) {
                    this.loadingIcons = true;
                    $tools.loadScript(basePath + "assets/lib/bv-icons.js", () => {
                        this.icons = ide.icons;
                        this.loadingIcons = false;
                        this.showSelector = true;
                    });
                } else {
                    this.showSelector = true;
                }
            }
        },
        propNames() {
            return [
                "cid",
                "dataSource",
                "useData",
                "allowUserSelection",
                "icon",
                "variant",
                "flipHorizontally",
                "flipVertically",
                "rotate",
                "scale",
                "field",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                useData: {
                    type: 'checkbox',
                    editable: true,
                    literalOnly: true,
                    description: 'Use the data model of this component to determine the icon dynamically'
                },
                allowUserSelection: {
                    type: 'checkbox',
                    editable: true,
                    hidden: viewModel => !viewModel.useData,
                    description: 'Allow the user to interactively select a new icon and sets the data with it'
                },
                icon: {
                    type: 'icon',
                    editable: true,
                    hidden: viewModel => !!viewModel.useData
                },
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark"
                    ]
                },
                flipHorizontally: {
                    type: 'checkbox',
                    editable: true
                },
                flipVertically: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


