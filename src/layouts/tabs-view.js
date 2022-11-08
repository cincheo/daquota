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
        <div :id="cid" fluid :class="componentClass()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-card v-if="!$eval(viewModel.disableCardLayout, false)" no-body class="h-100 w-100">
                <b-tabs 
                    v-model="$tabIndex"
                    card
                    class="h-100 w-100"
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
                    :contentClass="$eval(viewModel.contentClass, undefined) + ' h-100'"
                    :navWrapperClass="viewModel.wizard ? 'wizard bg-light pt-3 border-top border-bottom border-secondary' : undefined"
                    :noNavStyle="viewModel.wizard"
                    activeNavItemClass="active-tab"
                    @input="onInput" 
                    @activate-tab="onActivateTab" 
                    @changed="onChanged" 
                >
                    <b-tab v-for="(tab, index) in viewModel.tabs" :title="tab.title?tab.title:'?'" :title-link-class="$validatedTabIndexes.includes(index) ? 'checked-tab' : ''">
                        <container-view :key="tab.cid" :cid="tab.cid" keyInParent="tabs" :indexInKey="index" :inSelection="isEditable()" />
                    </b-tab>
                </b-tabs>
            </b-card>
            <b-tabs v-else
                v-model="$tabIndex"
                class="h-100 w-100"
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
                :contentClass="$eval(viewModel.contentClass, undefined) + (viewModel.fillHeight ? ' h-100' : '')"
                :navWrapperClass="viewModel.wizard ? 'wizard bg-light pt-3 border-top border-bottom border-secondary' : undefined"
                :noNavStyle="viewModel.wizard"
                activeNavItemClass="active-tab"
                @input="onInput" 
                @activate-tab="onActivateTab" 
                @changed="onChanged" 
            >
                <b-tab v-for="(tab, index) in viewModel.tabs" :title="tab.title?tab.title:'?'" :title-link-class="$validatedTabIndexes.includes(index) ? 'checked-tab' : ''">
                    <container-view :key="tab.cid" :cid="tab.cid" keyInParent="tabs" :indexInKey="index" :inSelection="isEditable()" />
                </b-tab>
            </b-tabs>
        </div>    
    `,
    data() {
        return {
            tabIndex: undefined,
            validatedTabIndexes: undefined
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (this.viewModel.tabIndex) {
                this.tabIndex = this.$evalCode(this.viewModel.tabIndex);
            }
        });
    },
    computed: {
        $tabIndex: {
            get: function() {
                if (this.tabIndex !== undefined) {
                    return this.tabIndex;
                } else {
                    if (this.viewModel.tabIndex) {
                        return this.$evalCode(this.viewModel.tabIndex, 0);
                    } else {
                        return 0;
                    }
                }
            },
            set: function(tabIndex) {
                console.info("******** SET ", this.viewModel.cid, this.tabIndex, tabIndex)
                this.tabIndex = tabIndex;
            }
        },
        $validatedTabIndexes: function() {
            if (this.validatedTabIndexes !== undefined) {
                return this.validatedTabIndexes;
            } else {
                if (this.viewModel.validatedTabIndexes) {
                    return this.$evalCode(this.viewModel.validatedTabIndexes, []);
                } else {
                    return [];
                }
            }
        }
    },
    methods: {
        customEventNames() {
            return ["@input", "@activate-tab", "@changed"];
        },
        customActionNames() {
            return [
                {value: 'next', text: 'next(validateCurrent)'},
                {value: 'previous', text: 'previous()'},
                {value: 'setTabIndex', text: 'setTabIndex(tabIndex)'},
                {value: 'validate', text: 'validate(tabIndex)'},
                {value: 'invalidate', text: 'invalidate(tabIndex)'}
            ];
        },
        customStatelessActionNames() {
            return [
                {value: 'getTabIndex', text: 'getTabIndex()'}
            ];
        },
        next(validateCurrent) {
            if (validateCurrent) {
                this.validate(this.tabIndex);
            }
            if (this.tabIndex < this.viewModel.tabs.length - 1) {
                this.tabIndex++;
            }
        },
        previous() {
            if (this.tabIndex > 0) {
                this.tabIndex--;
            }
        },
        validate(tabIndex) {
            if (!this.validatedTabIndexes.includes(tabIndex)) {
                this.validatedTabIndexes.push(tabIndex);
            }
        },
        invalidate(tabIndex) {
            if (this.validatedTabIndexes.includes(tabIndex)) {
                this.validatedTabIndexes.splice(this.validatedTabIndexes.indexOf(tabIndex), 1);
            }
        },
        setTabIndex(tabIndex) {
            if (tabIndex >= 0  && tabIndex <= this.viewModel.tabs.length - 1) {
                this.tabIndex = tabIndex;
            }
        },
        getTabIndex() {
            return this.tabIndex;
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
                "dataSource",
                "field",
                "fillHeight",
                "tabs",
                "tabIndex",
                "validatedTabIndexes",
                "disableCardLayout",
                "end",
                "fill",
                "justified",
                "wizard",
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
                tabIndex: {
                    label: 'Initial tab index',
                    type: 'code/javascript',
                    editable: true,
                    description: 'A formula to set the initially selected tab index',
                    literalOnly: true
                },
                validatedTabIndexes: {
                    type: 'code/javascript',
                    editable: true,
                    description: 'A formula to set the tabs that will appear as validated',
                    literalOnly: true
                },
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                },
                align: {
                    type: 'select',
                    editable: true,
                    options: ['start', 'center', 'end'],
                    category: 'style',
                    description: 'Align the nav items in the nav'
                },
                disableCardLayout: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    literalOnly: true,
                    description: 'Remove the layout of tabs within a card'
                },
                pills: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    literalOnly: true,
                    description: 'Render the nav items with the appearance of pill buttons'
                },
                wizard: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    literalOnly: true,
                    description: 'Render the nav items with the appearance of wizard steps'
                },
                small: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    description: 'Make the nav smaller'
                },
                fill: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    literalOnly: true,
                    description: 'Proportionately fill all horizontal space with nav items. All horizontal space is occupied, but not every nav item has the same width'
                },
                justified: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    literalOnly: true,
                    description: 'Fill all horizontal space with nav items, but unlike \'fill\', every nav item will be the same width'
                },
                vertical: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style',
                    literalOnly: true,
                    description: 'Render the tab controls vertically'
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
                    description: 'When set to `true`, disable the fade animation/transition on the component'
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
