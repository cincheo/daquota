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

Vue.component('tabs-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" fluid :style="componentBorderStyle()" :class="componentClass()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-card no-body>
                <b-tabs card
                    :end="$eval(viewModel.end, false)"
                    :fill="$eval(viewModel.fill, false)"
                    :justified="$eval(viewModel.justified, false)"
                    :lazy="$eval(viewModel.lazy, false)"
                    :noFade="$eval(viewModel.noFade, false)"
                    :pills="$eval(viewModel.pills, false)"
                    :small="$eval(viewModel.small, false)"
                    :vertical="$eval(viewModel.vertical, false)"
                    :align="$eval(viewModel.align, undefined)"
                    :activeTabClass="$eval(viewModel.activeTabClass, undefined)"
                    :contentClass="$eval(viewModel.contentClass, undefined)"
                    @input="onInput" 
                    @activate-tab="onActivateTab" 
                    @changed="onChanged" 
                >
                    <template v-for="(tab, index) in viewModel.tabs">
                        <b-tab :title="tab.title?tab.title:'?'">
                            <component-view :key="tab.cid" :cid="tab.cid" keyInParent="tabs" :indexInKey="index" :inSelection="isEditable()" />
                        </b-tab>
                    </template>
                </b-tabs>
            </b-card>
        </div>    
    `,
    methods: {
        customEventNames() {
            return ["@input", "@activate-tab", "@changed"];
        },
        onInput(tabIndex) {
            this.$emit("@input", tabIndex);
        },
        onActivateTab(newTabIndex, prevTabIndex, bvEvent) {
            this.$emit("@activate-tab", newTabIndex, prevTabIndex, bvEvent);
        },
        onChanged(currentTabs, previousTabs) {
            this.$emit("@changed", currentTabs, previousTabs);
        },
        propNames() {
            return [
                "cid",
                "tabs",
                "end",
                "fill",
                "justified",
                "align",
                "pills",
                "small",
                "vertical",
                "activeTabClass",
                "contentClass",
                "lazy",
                "noFade",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                tabs: {
                    type: 'ref',
                    editorMode: 'tabs'
                },
                align: {
                    type: 'select',
                    editable: true,
                    options: ['start', 'center', 'end'],
                    category: 'style',
                    description: 'Align the nav items in the nav'
                },
                pills: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Renders the nav items with the appearance of pill buttons'
                },
                small: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Makes the nav smaller'
                },
                fill: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Proportionately fills all horizontal space with nav items. All horizontal space is occupied, but not every nav item has the same width'
                },
                justified: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Fills all horizontal space with nav items, but unlike \'fill\', every nav item will be the same width'
                },
                vertical: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Renders the tab controls vertically'
                },
                end: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Place the tab controls at the bottom (horizontal tabs), or right (vertical tabs)'
                },
                lazy: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Lazily render the tab contents when shown'
                },
                noFade: {
                    type: 'checkbox',
                    editable: true,
                    description: 'When set to `true`, disables the fade animation/transition on the component'
                },
                activeTabClass: {
                    type: 'text',
                    category: 'style',
                    description: 'CSS class (or classes) to apply to the currently active tab'
                },
                contentClass: {
                    type: 'text',
                    category: 'style',
                    description: 'CSS class (or classes) to apply to the tab-content wrapper'
                },
                index: 0
            };
        }
    }
});
