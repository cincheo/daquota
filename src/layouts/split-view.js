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

Vue.component('split-view', {
    extends: editableComponent,
    template: `
         <div :id="cid" :style="$eval(viewModel.style)" :class="componentClass()"
            :draggable="$eval(viewModel.draggable, false) ? true : false" 
            v-on="boundEventHandlers({'click': onClick})"
         >
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            
            <div id="mainRow" :class="'d-flex h-100 w-100' + (viewModel.orientation === 'VERTICAL' ? ' flex-row' : ' flex-column')">
                <div :id="cid+'-split-1'" :style="primaryComponentSize() ? ('overflow: auto; ' + (viewModel.orientation === 'VERTICAL' ? 'width' : 'height') + ': ' + primaryComponentSize() + '%') : ''">
                    <component-view :cid="viewModel.primaryComponent?.cid" keyInParent="primaryComponent" :inSelection="isEditable()" />
                </div>
                <div :id="cid+'-split-2'"  :style="secondaryComponentSize() ? ('overflow: auto; ' + (viewModel.orientation === 'VERTICAL' ? 'width' : 'height') + ': ' + secondaryComponentSize() + '%') : ''">
                    <component-view :cid="viewModel.secondaryComponent?.cid" keyInParent="secondaryComponent" :inSelection="isEditable()" />
                </div>
            </div>
        </div>
    `,
    mounted: function () {
        this.applySplitConfiguration();
    },
    watch: {
        "viewModel.orientation": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.resizableSplit": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.gutterSize": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.primaryComponentSize": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.secondaryComponentSize": {
            handler: function () {
                this.applySplitConfiguration();
            }
        }
    },
    methods: {
        primaryComponentSize() {
            if (this.$eval(this.viewModel.resizableSplit)) {
                let size = this.$eval(this.viewModel.primaryComponentSize, 50);
                if (size) {
                    return parseInt(size);
                } else {
                    return 50;
                }
            } else {
                return this.$eval(this.viewModel.primaryComponentSize, null);
            }
        },
        secondaryComponentSize() {
            if (this.$eval(this.viewModel.resizableSplit)) {
                let size = this.$eval(this.viewModel.secondaryComponentSize, 50);
                if (size) {
                    return parseInt(size);
                } else {
                    return 50;
                }
            } else {
                return this.$eval(this.viewModel.secondaryComponentSize, null);
            }
        },
        applySplitConfiguration() {
            if (this.splitInstance) {
                try {
                    this.splitInstance.destroy();
                } catch (e) {
                    console.warn('error destroying split instance');
                }
                this.splitInstance = undefined;
            }
            if (!this.$eval(this.viewModel.resizableSplit)) {
                return;
            }
            try {
                const options = {
                    direction: (this.$eval(this.viewModel.orientation) === 'VERTICAL' ? 'horizontal' : 'vertical'),
                    minSize: 0,
                    sizes: [
                        this.primaryComponentSize(),
                        this.secondaryComponentSize()
                    ]
                };
                if (this.viewModel.gutterSize) {
                    options.gutterSize = parseInt(this.$eval(this.viewModel.gutterSize, 10));
                }
                console.info('split instance', options);
                this.splitInstance = Split([`#${this.cid}-split-1`, `#${this.cid}-split-2`], options);
            } catch (e) {
                console.info('error in applying split configuration', e);
            }
        },
        propNames() {
            return [
                "cid",
                "dataSource",
                "field",
                "resizableSplit",
                "fillHeight",
                "orientation",
                "gutterSize",
                "primaryComponent",
                "primaryComponentSize",
                "secondaryComponent",
                "secondaryComponentSize"
            ];
        },
        customPropDescriptors() {
            return {
                resizableSplit: {
                    type: 'checkbox'
                },
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                },
                orientation: {
                    type: 'select',
                    label: 'Orientation',
                    editable: true,
                    options: ['HORIZONTAL', 'VERTICAL']
                },
                primaryComponent: {
                    type: 'ref',
                    editable: false
                },
                secondaryComponent: {
                    type: 'ref',
                    editable: false
                },
                primaryComponentSize: {
                    type: 'number',
                    label: 'Primary component (initial) size (in %)',
                    editable: true
                },
                secondaryComponentSize: {
                    type: 'number',
                    label: 'Secondary component (initial) size (in %)',
                    editable: true
                }
            };
        }
    }
});
