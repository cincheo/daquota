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

Vue.component('cookie-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-icon v-if='edit' :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="isEditable()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    mounted: function () {
        this.update();
    },
    watch: {
        viewModel: {
            handler: function () {
                this.update();
            },
            immediate: true,
            deep: true
        },
        dataModel: {
            handler: function () {
                Tools.setCookie(this.viewModel.name, JSON.stringify(this.dataModel), this.viewModel.expirationDate);
            },
            immediate: true,
            recursive: true
        }
    },
    methods: {
        update() {
            try {
                this.dataModel = JSON.parse(Tools.getCookie(this.viewModel.name));
            } catch (e) {}
            if (this.dataModel == null) {
                this.dataModel = this.$eval(this.viewModel.defaultValue, {});
            }
        },
        propNames() {
            return ["cid", "name", "defaultValue", "expirationDate", /*"sameSite", */"eventHandlers"];
        },
        customPropDescriptors() {
            return {
                name: {
                    type: 'text',
                    editable: true,
                    description: 'A string representing the name of the cookie. If omitted, this is empty by default.'
                },
                defaultValue: {
                    type: 'text',
                    editable: true,
                    description: 'The default value of the data model when the cookie does not exist yet or when its value is not valid.'
                },
                expirationDate: {
                    type: 'text',
                    editable: true,
                    description: 'A number that represents the expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted, the cookie becomes a session cookie.'
               },
                sameSite: {
                    editable: true,
                    type: 'select',
                    description: 'A cookies.SameSiteStatus value that indicates the SameSite state of the cookie. If omitted, it defaults to no_restriction.',
                    options: [
                        'no_restriction',
                        'lax',
                        'strict'
                    ]
                }
            }
        }

    }
});


