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
        this.$eventHub.$on('style-changed', () => {
            this.$refs['iframe'].contentWindow.ide.initStyle();
        });
    },
    methods: {
        getEncodedModel() {
            if (this.viewModel.dataSource) {
                if (!this.value) {
                    const content = ide.createBlankApplicationContent(this.viewModel.cid);
                    this.value = content;
                }
                return ide.encodeModel(this.value);
            } else {
                if (!this.viewModel.model) {
                    this.viewModel.model = ide.encodeModel(
                        ide.createBlankApplicationContent(this.viewModel.cid)
                    );
                }
                return this.viewModel.model;
            }
        },
        setModel(model) {
            if (typeof model !== 'string') {
                model = JSON.stringify(model);
            }
            if (this.viewModel.dataSource) {
                this.value = model;
            } else {
                model = ide.encodeModel(model);
                this.viewModel.model = model;
            }
            this.$emit('@model-changed', model);
        },
        update() {
            if (this.viewModel.dataSource) {
                editableComponent.methods.update.apply(this);
            }
            this.$refs['iframe']?.contentWindow?.ide?.updateDataSources();
        },
        forceRender() {
            console.info('force render', this.cid, this.iteratorIndex);
            this.update();
            this.$forceUpdate();
            this.timestamp = Date.now();
            //this.$refs['iframe'].contentWindow.ide?.forceRender();
        },
        src() {
            let src = document.location.protocol + '//' + document.location.host + document.location.pathname
                + '?src=$parent~' + this.viewModel.cid;
            if (this.viewModel.editable) {
                src += '&locked=false';
            }
            return src;
        },
        customEventNames() {
            return [
                "@model-changed"
            ];
        },
        propNames() {
            return [
                "cid",
                "editable",
                "fillHeight",
                "dataSource",
                "field",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                },
                editable: {
                    type: 'checkbox',
                    description: "When checked, the final user can modify the application",
                    literalOnly: true
                }
            }
        }

    }
});


