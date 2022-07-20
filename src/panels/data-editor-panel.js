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

Vue.component('data-editor-panel', {
    template: `
        <div v-if="standalone" class="h-100 w-100" style="position: relative">
            <div ref="editor" class="h-100 w-100"/>
            <b-button v-if="!readOnly" style="position: absolute; right:1rem; top:1rem" pill size="sm" @click="updateDataModel">Apply changes</b-button>
        </div>
        <b-form-group 
            v-else
            :state="computedState" 
            :label="label" 
            :invalid-feedback="invalidFeedback" 
            :label-size="size" 
            :label-class="labelClass" 
            :class="panelClass" 
            :style="panelStyle"
        >
            <div ref="editor" style="flex-grow: 1; top: 0; right: 0; bottom: 0; left: 0;"></div>
        </b-form-group>
        `,
    props: ['standalone', 'dataModel', 'viewModel', 'label', 'size', 'panelClass', 'labelClass', 'rows', 'maxRows', 'panelStyle', 'readOnly', 'showLineNumbers'],
    mounted: function() {
        this.jsonDataModel = this.dataModel ? JSON.stringify(this.dataModel, null, 2) : '';
        this.initEditor();
    },
    data: () => {
        return {
            jsonDataModel: '',
            state: undefined,
            invalidFeedback: null
        }
    },
    computed: {
        computedState: function() {
            if (this.state === false) {
                return this.state;
            }
            if (this.viewModel && this.viewModel.dataType) {
                const validDataModel = components.isValidDataModel(this.viewModel.dataType, this.dataModel);
                if (!validDataModel) {
                    this.invalidFeedback = "Expected '" + this.viewModel.dataType + "' but got '"+ components.getDataTypeForValue(this.dataModel) + "'";
                    return false;
                }
            }
            return undefined;
        }
    },
    watch: {
        'dataModel': {
            handler: function (dataModel) {
                this.jsonDataModel = dataModel ? JSON.stringify(dataModel, null, 2) : '';
                this._watchChanges = false;
                const selection = this._editor?.selection?.toJSON();
                this._editor?.session?.setValue(this.jsonDataModel);
                this._editor?.selection?.fromJSON(selection);
                this._watchChanges = true;
            },
            deep: true,
            immediate: true
        },
        readOnly: function () {
            if (this._editor) {
                this._editor.setReadOnly(this.readOnly);
            }
        }
    },
    methods: {
        checkState() {
            if (this.jsonDataModel === undefined || this.jsonDataModel === '') {
                this.state = undefined;
                return;
            }
            try {
                JSON.parse(this.jsonDataModel);
                if (this.state === undefined || this.state === false) {
                    this.invalidFeedback = undefined;
                    this.state = true;
                }
            } catch (e) {
                if (this.state === undefined || this.state === true) {
                    this.state = false;
                    this.invalidFeedback = e.message;
                }
            }
        },
        getDataModel() {
            return JSON.parse(this.jsonDataModel);
        },
        getJson() {
            return this.jsonDataModel;
        },
        getEditor() {
            return this._editor;
        },
        updateDataModel() {
            if (this.jsonDataModel === undefined || this.jsonDataModel === '') {
                this.state = undefined;
                return;
            }
            try {
                this.invalidFeedback = undefined;
                let data = JSON.parse(this.jsonDataModel);
                this.state = undefined;
                this.$emit('update-data', data);
            } catch (e) {
                this.state = false;
                this.invalidFeedback = e.message;
            }
        },
        initEditor() {
            if (this._editor) {
                try {
                    this._editor.destroy();
                } catch (e) {
                    console.error('editor', e);
                }
            }

            Vue.nextTick(() => {
                this._editor = ace.edit(this.$refs['editor'], {
                    mode: "ace/mode/json",
                    selectionStyle: "text"
                });
                this._editor.setOptions({
                    autoScrollEditorIntoView: true,
                    copyWithEmptySelection: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: false,
                    enableLiveAutocompletion: true,
                    showLineNumbers: this.showLineNumbers,
                    minLines: this.rows ? this.rows : undefined,
                    maxLines: this.maxRows ? this.maxRows : undefined
                });
                this._editor.renderer.setScrollMargin(10, 10);
                this._editor.session.setMode("ace/mode/json");

                if (this.readOnly) {
                    this._editor.setReadOnly(true);
                }

                this._editor.session.setValue(this.jsonDataModel);
                this._watchChanges = true;
                this._editor.on('change', () => {
                    if (this._watchChanges) {
                        this.jsonDataModel = this._editor.getValue();
                        this.updateDataModel();
                    }
                });
                this._editor.selection.on('changeCursor', () => {
                    this.$emit('change-cursor', this._editor.getCursorPosition(), this.jsonDataModel);
                });
                this.$emit('init-editor');


            });
        }
    }
});
