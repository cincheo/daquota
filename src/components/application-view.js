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

Vue.component('application-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :class="componentClass()" :style="$eval(viewModel.style, null)">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-overlay :show="loading" opacity="0" class="w-100 h-100">
                <iframe v-if="viewModel.cid"
                    v-show="!loading" class="w-100 h-100 border-0 animate__animated animate__fadeIn" style="--animate-duration: 2000ms"
                    ref="iframe"
                    :src="src"
                />
            </b-overlay>
            
        </div>
    `,
    data: function() {
        return {
            loading: true
        }
    },
    created() {
        this.$eventHub.$on('style-changed', () => {
            this.$refs['iframe'].contentWindow.ide.initStyle();
        });
        this._childReadyHandler = $tools.onChildApplicationMessage('*', 'application-ready', (application) => {
            this.loading = false;
        });
    },
    computed: {
        src: function() {
            let src = document.location.protocol + '//' + document.location.host + document.location.pathname
                + '?src=$parent~' + this.viewModel.cid;
            src += ('&locked=' + !this.$eval(this.viewModel.editable, false));
            return src;
        }
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
            this.loading = true;
            this.update();
            this.$forceUpdate();
            this.timestamp = Date.now();
            if (this.$refs['iframe']) {
                this.$refs['iframe'].src = this.src;
                this.$refs['iframe'].contentWindow.location.href = this.src;
            }
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
                    description: "When checked, the final user can modify the application"
                }
            }
        }

    }
});


