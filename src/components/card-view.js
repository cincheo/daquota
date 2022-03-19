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

Vue.component('card-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="$eval(viewModel.layoutClass)">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-card 
                :title="$eval(viewModel.title, '')" 
                :sub-title="$eval(viewModel.subTitle, '')" 
                :img-src="$eval(viewModel.imgSrc, '')" 
                :img-alt="$eval(viewModel.imgAlt, '')" 
                :img-top="$eval(viewModel.imgPosition, undefined) === 'top'" 
                :img-end="$eval(viewModel.imgPosition, undefined) === 'end'" 
                :img-left="$eval(viewModel.imgPosition, undefined) === 'left'" 
                :img-right="$eval(viewModel.imgPosition, undefined) === 'right'" 
                :img-bottom="$eval(viewModel.imgPosition, undefined) === 'bottom'" 
                :img-start="$eval(viewModel.imgPosition, undefined) === 'start'" 
                :img-width="$eval(viewModel.imgWidth, undefined)"
                :class="$eval(viewModel.class)"
                :style="$eval(viewModel.style)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
            >
                    
                <b-card-text v-if="viewModel.text">
                  {{ viewModel.text }}
                </b-card-text>     
                
                <component-view v-if="isEditable() || viewModel.body" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()"/>
                               
            </b-card>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "dataSource", "title", "subTitle", "imgSrc", "imgPosition", "imgWidth", "text", "body", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                imgPosition: {
                    type: 'select',
                    editable: true,
                    label: 'Image position',
                    options: [
                        'top', 'bottom', 'left', 'right', 'start', 'end'
                    ]
                },
                imgSrc: {
                    editable: true,
                    type: 'text',
                    label: "Image URL"
                },
                imgWidth: {
                    editable: true,
                    label: "Image width"
                },
                text: {
                    type: 'textarea',
                    editable: true
                },
                body: {
                    type: 'ref',
                    editable: true
                }
            }
        }

    }
});


