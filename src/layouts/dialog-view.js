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

Vue.component('dialog-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle()" :class="edit ? 'inlined-dialog border' : ''">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <h3 v-if="edit" class="border-bottom">
                {{ $eval(viewModel.title, '#error#') }}
            </h3>
            <div v-if="edit">
                <component-view :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content" :inSelection="isEditable()" />
            </div>
            <b-modal
                :id="'modal-'+cid" 
                hide-footer
                :class="$eval(viewModel.class, '')"
                :style="$eval(viewModel.style)" 
                :size="$eval(viewModel.size)"
                :centered="$eval(viewModel.centered)"
                :scrollable="$eval(viewModel.scrollable)"
                :body-class="$eval(viewModel.bodyClass)"
                :header-class="$eval(viewModel.headerClass)"
                 @cancel="onCancel"
                 @close="onClose"
                 @change="onChange"
                 @hidden="onHidden"
                 @hide="onHide"
                 @ok="onOk"
                 @show="onShow"
                 @shown="onShown"
            >
                <template #modal-title>
                    {{ $eval(viewModel.title, '#error#') }}
                </template>
                <component-view ref="content" :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content" :inSelection="isEditable()"/>
            </b-modal>                
        </b-container>
    `,
    watch: {
        'value': {
            handler: function() {
                if (!this.edit && this.$refs.content && this.$refs.content.viewModel.dataSource === '$parent') {
                    this.$refs.content.$refs.component.dataModel = this.dataModel;
                }
            },
            immediate: true
        }
    },
    methods: {
        customEventNames() {
            return ["@cancel", "@close", "@change", "@hidden", "@hide", "@ok", "@show", "@shown"];
        },
        onCancel(event) {
            this.$emit("@cancel", event);
        },
        onClose(event) {
            this.$emit("@close", event);
        },
        onChange(event) {
            this.$emit("@change", event);
        },
        onHidden(event) {
            this.$emit("@hidden", event);
        },
        onHide(event) {
            this.$emit("@hide", event);
        },
        onOk(event) {
            this.$emit("@ok", event);
        },
        onShow(event) {
            this.$emit("@show", event);
        },
        onShown(event) {
            console.info('shown', this.viewModel.content, $d(this.viewModel.content.cid));
            console.info('shown2', this.dataModel);
            console.info('shown3', $c(this.viewModel.content.cid));

            this.$emit("@shown", event);
        },
        show: function () {
            if (ide.editMode) {
                setTimeout(() => {
                    document.getElementById(this.cid).scrollIntoView({block: "center"});
                    ide.selectComponent(this.cid)
                }, 200);
            } else {
                this.$bvModal.show('modal-' + this.cid);
            }
        },
        hide: function () {
            this.$bvModal.hide('modal-' + this.cid);
        },
        propNames() {
            return ["cid", "bodyClass", "headerClass", "dataSource", "title", "content", "scrollable", "centered", "size", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                content: {
                    type: 'ref'
                },
                bodyClass: {
                    type: 'text',
                    editable: true,
                    category: 'style'
                },
                headerClass: {
                    type: 'text',
                    editable: true,
                    category: 'style'
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['sm', 'lg', 'xl']
                },
                scrollable: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Enables scrolling of the modal body'
                },
                centered: {
                    type: 'checkbox',
                    editable: true,
                    description: 'Vertically centers the modal in the viewport'
                }
            };
        }
    }
});
