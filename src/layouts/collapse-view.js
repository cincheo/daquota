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

Vue.component('collapse-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :class="$eval(viewModel.layoutClass)">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-collapse :id="'target-'+cid" 
                :accordion="$eval(viewModel.accordion, undefined)" 
                :appear="$eval(viewModel.appear, undefined)" 
                :visible="(collapsed === undefined ? viewModel.visible : collapsed)"
                :class="$eval(viewModel.class)"
                :style="$eval(viewModel.style)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                @hide="onHide"
                @show="onShow"
                @hidden="onHidden"
                @shown="onShown"
                v-on="boundEventHandlers({'click': onClick})"
            >
                  
                <component-view :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()"/>
                               
            </b-collapse>
            <b-alert v-if="edit && !(collapsed === undefined ? viewModel.visible : collapsed)" variant="warning" show>Component is not visible/collapsed</b-alert>
        </div>
    `,
    data: function() {
        return {
            collapsed : undefined,
        }
    },
    methods: {
        propNames() {
            return ["cid", "accordion", "appear", "visible", "eventHandlers"];
        },
        customActionNames() {
            return [{value:'toggleCollapsed',text:'toggleCollapsed()'}];
        },
        toggleCollapsed() {
            if (this.collapsed === undefined) {
                this.collapsed = !this.viewModel.visible;
            } else {
                this.collapsed = !this.collapsed;
            }
        },
        onHide(...args) {
            this.collapsed = false;
            this.$emit('@hide', ...args);
        },
        onShow(...args) {
            this.collapsed = true;
            this.$emit('@show', ...args);
        },
        onHidden(...args) {
            this.$emit('@hide', ...args);
        },
        onShown(...args) {
            this.$emit('@show', ...args);
        },
        customEventNames() {
            return [
                "@hide",
                "@show",
                "@hidden",
                "@shown"
            ];
        },
        customPropDescriptors() {
            return {
                body: {
                    type: 'ref',
                    editable: true
                },
                accordion: {
                    type: 'text',
                    description: 'The name of the accordion group that this collapse belongs to, if any'
                },
                appear: {
                    type: 'checkbox',
                    editable: true,
                    description: "When set, and visible is true, will animate on initial display"
                },
                visible: {
                    type: 'checkbox',
                    editable: true,
                    description: "Sets the initial visibility of the collapse"
                }

            }
        }

    }
});


