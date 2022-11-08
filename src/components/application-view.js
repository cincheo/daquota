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

Vue.component('application-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :class="componentClass()" :style="$eval(viewModel.style, null)">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <iframe v-if="viewModel.cid"
                ref="iframe"
                :src="src()"
                class="w-100 h-100 border-0"
            />
        </div>
    `,
    mounted() {
        if (!this.viewModel.model) {
            const applicationModel = ide.createBlankApplicationModel(this.viewModel.cid);
            applicationModel.versionIndex = versionIndex;
            applicationModel.version = '0.0.0';

            this.viewModel.model = ide.encodeModel(
                JSON.stringify({
                    applicationModel: applicationModel,
                    roots: [applicationModel.navbar]
                }));
        }
        this.$eventHub.$on('style-changed', () => {
            this.$refs['iframe'].contentWindow.ide.initStyle();
        });
    },
    methods: {
        src() {
            const src = document.location.protocol + '//' + document.location.host + document.location.pathname
                + '?src=$parent~' + this.viewModel.cid;
            return src;
        },
        propNames() {
            return [
                "cid",
                "fillHeight"
            ];
        },
        customPropDescriptors() {
            return {
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                }
            }
        }

    }
});


