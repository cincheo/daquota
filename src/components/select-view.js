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

Vue.component('select-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()"
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group 
                :label="$eval(viewModel.label, '#error#')" 
                :label-for="'input_' + viewModel.cid" 
                :description="$eval(viewModel.description)" 
                :label-cols="labelCols()"
                :label-class="$eval(viewModel.labelClass, null)"
                :style="$eval(viewModel.style, null)"
                :label-size="$eval(viewModel.size, null)"
                :state="$eval(viewModel.state ? viewModel.state : undefined, null)"
                :invalid-feedback="$eval(viewModel.invalidFeedback, null)"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :class="$eval(viewModel.class, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
            >
                <b-form-select v-model="value" 
                    :id="'input_' + viewModel.cid" 
                    :size="$eval(viewModel.size, null)"
                    :select-size="$eval(viewModel.selectSize, null)"
                    :options="$eval(viewModel.options, null)"
                    :multiple="$eval(viewModel.multiple, false)"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :state="$eval(viewModel.state ? viewModel.state : undefined, null)"
                    @change="onChange" @input="onInput"
                />
            </b-form-group>
        </div>
    `,
    methods: {
        labelCols() {
            let cols = undefined;
            if (this.$eval(this.viewModel.horizontalLayout, false)) {
                cols = 'auto';
                if (this.viewModel.labelCols) {
                    cols = this.$eval(this.viewModel.labelCols, 'auto');
                    if (cols == 0) {
                        cols = 'auto';
                    }
                }
            }
            return cols;
        },
        customEventNames() {
            return ["@change", "@input"];
        },
        onChange(value) {
            this.$emit("@change", value);
        },
        onInput(value) {
            this.$emit("@input", value);
        },
        propNames() {
            return [
                "cid",
                "horizontalLayout",
                "labelCols",
                "labelClass",
                "label",
                "description",
                "selectSize",
                "multiple",
                "dataType",
                "dataSource",
                "field",
                "options",
                "size",
                "state",
                "invalidFeedback",
                "validFeedback",
                "disabled",
                "eventHandlers"
            ];
        },
        clear() {
            this.value = undefined;
        },
        customPropDescriptors() {
            return {
                options: {
                    type: 'text',
                    editable: true,
                    description: 'A list of objects containing "value" and "text" properties'
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
                    editable: (viewModel) => viewModel.horizontalLayout,
                    description: 'Number of columns for the label when horizontal layout (0 or undefined is auto)'
                },
                labelClass: {
                    label: 'Label class',
                    type: 'text',
                    category: 'style',
                    description: 'Class(es) (space-separated) applying to the label'
                },
                selectSize: {
                    type: 'range',
                    min: 1,
                    max: 10,
                    step: 1,
                    label: 'Select size (visible rows)',
                    editable: true
                },
                multiple: {
                    type: 'checkbox',
                    description: "If set, allows multiple selection (the data model is an array)",
                    editable: true
                },
                disabled: {
                    type: 'checkbox',
                    editable: true
                },
                state: {
                    type: 'text',
                    actualType: 'boolean',
                    editable: true,
                    label: "Validation state"
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['md', 'sm', 'lg']
                },
                dataType: {
                    type: 'select',
                    options: viewModel => components.allowedDataTypes(viewModel.type),
                    category: 'data',
                    description: 'The data type that can be selected from the options'
                }
            }
        }

    }
});


