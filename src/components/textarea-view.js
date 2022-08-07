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

Vue.component('textarea-view', {
    extends: editableComponent,
    mixins: [formGroupMixin],
    template: `
        <div :id="cid" :class="viewModel.layoutClass" 
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers()"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$label" :label-for="'input_' + viewModel.cid" 
                :label-cols="$labelCols"
                :label-class="$eval(viewModel.labelClass, null)"
                :label-size="$eval(viewModel.size, null)"
                :description="$eval(viewModel.description, null)" 
                :state="$state"
                :invalid-feedback="$invalidFeedback"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :class="$eval(viewModel.class, null)"
                :style="$eval(viewModel.style, null)"
            >
                <div v-if="this.viewModel.codeEditor" ref="input" :id="'target-textarea-'+cid"></div>
                <b-form-textarea v-else ref="input" v-model="value" 
                    :number="$eval(viewModel.inputType, null) === 'number' ? true : false"
                    :rows="$eval(viewModel.rows, null)"
                    :maxRows="$eval(viewModel.maxRows, null)"
                    :size="$eval(viewModel.size, null)"
                    :state="$state"
                    :placeholder="$eval(viewModel.placeholder, null)"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :required="$eval(viewModel.required, false)"
                    @blur="onBlur" @change="onChange" @input="onInput" @update="onUpdate"
                ></b-form-textarea>
            </b-form-group>
        </div>
    `,
    watch: {
        'viewModel': {
            handler: function() {
                this.initEditor();
            },
            deep: true
        },
        'value': function() {
            if (this.viewModel.codeEditor && this._editor) {
                if (!this._input) {
                    this.updateEditorValue();
                }
                this._input = false;
            }
        }
    },
    mounted: function() {
        this.initEditor();
    },
    methods: {
        customEventNames() {
            return ["@blur", "@change", "@input", "@update"];
        },
        onBlur(value) {
            this.$emit("@blur", value);
        },
        onChange(value) {
            this.$emit("@change", value);
        },
        getEditor() {
            return this._editor;
        },
        onInput(value) {
            if (this.showStateOnInputData && !this.showStateData) {
                this.showStateData = true;
            }
            this.$emit("@input", value);
        },
        onUpdate(value) {
            this.$emit("@update", value);
        },
        clear() {
            if (this.viewModel.field && this.dataModel) {
                this.dataModel[this.viewModel.field] = undefined;
            } else {
                this.dataModel = undefined;
            }
        },
        updateEditorValue() {
            if (this.viewModel.codeEditor && this._editor) {
                this._disableTypingHandler = true;
                this._editor.session.setValue(this.value === undefined ? '' : this.value);
                this._disableTypingHandler = false;
            }
        },
        setDisabled(disabled) {
            if (this._editor) {
                if (disabled) {
                    this._editor.setOptions({
                        readOnly: true,
                        highlightActiveLine: false,
                        highlightGutterLine: false
                    });
                    this._editor.container.style.opacity = 0.6;
                } else {
                    this._editor.setOptions({
                        readOnly: false,
                        highlightActiveLine: true,
                        highlightGutterLine: true
                    });
                    this._editor.container.style.opacity = 1;
                }
            }
        },
        initEditor() {
            try {
                if (this._editor) {
                    try {
                        this._editor.destroy();
                        this._editor = undefined;
                    } catch (e) {
                        console.error('editor', e);
                    }
                }
                if (!this.viewModel.codeEditor) {
                    return;
                }
                Vue.nextTick(() => {
                    let target = document.getElementById('target-textarea-'+this.viewModel.cid);
                    console.info('target', target);
                    this._editor = ace.edit(target, {
                        mode: this.$eval(this.viewModel.mode) ? "ace/mode/" + this.$eval(this.viewModel.mode) : "ace/mode/text",
                        selectionStyle: "text"
                    });
                    const minLines = this.$eval(this.viewModel.rows, undefined) ? this.$eval(this.viewModel.rows) : 10;
                    let maxLines = this.$eval(this.viewModel.maxRows, undefined) ? this.$eval(this.viewModel.maxRows) : minLines;
                    if (maxLines < minLines) {
                        maxLines = minLines;
                    }
                    this._editor.setOptions({
                        autoScrollEditorIntoView: true,
                        copyWithEmptySelection: true,
                        enableBasicAutocompletion: true,
                        enableSnippets: false,
                        enableLiveAutocompletion: true,
                        showLineNumbers: this.$eval(this.viewModel.showLineNumbers),
                        minLines: minLines,
                        maxLines: maxLines
                    });
                    this._editor.renderer.setScrollMargin(10, 10);

                    this.setDisabled(this.$eval(this.viewModel.disabled, false));
                    this.updateEditorValue();
                    this._editor.on('change', () => {
                        if (!this._disableTypingHandler) {
                            this.onTypeIn();
                        }
                    });
                    if (this.focus) {
                        this._editor.focus();
                    }
                });
            } catch (e) {
                console.error('error building code editor', e);
            }

        },
        onTypeIn() {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                console.info("TRUE");
                this._input = true;
                this.timeout = undefined;
                this.value = this._editor.getValue();
            }, 200);
        },
        propNames() {
            return [
                "cid",
                "horizontalLayout",
                "labelCols",
                "labelClass",
                "dataSource",
                "field",
                "label",
                "description",
                "size",
                "disabled",
                "rows",
                "maxRows",
                "codeEditor",
                "mode",
                "showLineNumbers",
                "placeholder",
                "required",
                "state",
                "invalidFeedback",
                "validFeedback",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                disabled: {
                    type: 'checkbox',
                    editable: true
                },
                required: {
                    type: 'checkbox',
                    editable: true
                },
                placeholder: {
                    type: 'text',
                    hidden: viewModel => viewModel.codeEditor
                },
                rows: {
                    type: 'number'
                },
                maxRows: {
                    type: 'number'
                },
                horizontalLayout: {
                    type: 'checkbox',
                    label: 'Horizontal layout',
                    editable: true,
                    category: 'style'
                },
                labelCols: {
                    label: 'Label width',
                    type: 'range',
                    min: 0,
                    max: 11,
                    step: 1,
                    category: 'style',
                    hidden: viewModel => !viewModel.horizontalLayout,
                    description: 'Number of columns for the label when horizontal layout'
                },
                labelClass: {
                    label: 'Label class',
                    type: 'text',
                    category: 'style',
                    description: 'Class(es) (space-separated) applying to the label'
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['default', 'sm', 'lg']
                },
                state: {
                    type: 'text',
                    actualType: 'boolean',
                    editable: true,
                    label: "Validation state"
                },
                codeEditor: {
                    type: 'checkbox'
                },
                showLineNumbers: {
                    type: 'checkbox',
                    hidden: viewModel => !viewModel.codeEditor
                },
                mode: {
                    type: 'select',
                    hidden: viewModel => !viewModel.codeEditor,
                    editable: true,
                    options: ['', 'css', 'java', 'javascript', 'json', 'php']
                }
            }
        }

    }
});


