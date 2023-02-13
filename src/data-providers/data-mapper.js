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

Vue.component('data-mapper', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-icon v-if='edit' :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="isEditable()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model <b-badge v-if="error" pill variant="danger"> ! </b-badge></b-button>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-if="!error"
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
                <b-alert v-else show variant="danger" size="sm">
                    {{ error }}                    
                </b-alert>
            </b-collapse>
        </div>
    `,
    created: function() {
        this.$eventHub.$on('synchronized', () => this.update());
    },
    mounted: function () {
        this.update();
    },
    data: function () {
        return {
            error: undefined
        }
    },
    methods: {
        propNames() {
            return ["cid", "dataSource", "mapper", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                mapper: {
                    type: 'code/javascript',
                    editable: true,
                    description: 'A functional expression that maps (transforms, filters, sorts, reduces, ...) the data from the data source to the data model. For instance: data => data.filter(d => d.category === "c")',
                    category: 'main'
                }
            }
        }

    }
});


