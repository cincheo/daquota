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

Vue.component('icon-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-icon
                :icon="$eval(viewModel.icon, null)" 
                :class="$eval(viewModel.class, null)"
                :variant="$eval(viewModel.variant, null)" 
                :flip-h="$eval(viewModel.flipHorizontally, null)" 
                :flip-v="$eval(viewModel.flipVertically, null)" 
                :rotate="$eval(viewModel.rotate, null)" 
                :scale="$eval(viewModel.scale, null)" 
                :style="$eval(viewModel.style, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
            ></b-icon>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "dataSource", "icon", "variant", "flipHorizontally", "flipVertically", "rotate", "scale", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                icon: {
                    type: 'icon',
                    editable: true
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


