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
    mixins: [formGroupMixin],
    template: `
        <div :id="cid" 
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <b-form-group 
                :label="$label" 
                :label-for="'input_' + viewModel.cid" 
                :description="$eval(viewModel.description)" 
                :label-cols="$labelCols"
                :label-class="$eval(viewModel.labelClass, null)"
                :style="$eval(viewModel.style, null)"
                :label-size="$eval(viewModel.size, null)"
                :state="$state"
                :invalid-feedback="$invalidFeedback"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :class="$eval(viewModel.class, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
            >
                <b-form-radio-group v-if="viewModel.radioGroup" ref="input" v-model="value" 
                    :id="'input_' + viewModel.cid" 
                    :size="$eval(viewModel.size, null)"
                    :options="htmlFormattedOptions()"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :required="$eval(viewModel.required, false)"
                    :state="$state"
                    :stacked="$eval(viewModel.stacked, false)"
                    @change="onChange" @input="onInput"
                >
                </b-form-radio-group>
                <b-form-select v-else ref="input" v-model="value" 
                    :id="'input_' + viewModel.cid" 
                    :size="$eval(viewModel.size, null)"
                    :select-size="$eval(viewModel.selectSize, null)"
                    :options="$eval(viewModel.options, null)"
                    :multiple="$eval(viewModel.multiple, false)"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :required="$eval(viewModel.required, false)"
                    :state="$state"
                    @change="onChange" @input="onInput"
                />
            </b-form-group>
        </div>
    `,
    methods: {
        htmlFormattedOptions() {
            const options = this.$eval(this.viewModel.options, null);
            if (this.viewModel.radioGroup && Array.isArray(options)) {
                if (this.viewModel.dataType === 'color') {
                    return this.colorOptions(options);
                }
            }
            return options;
        },
        customEventNames() {
            return ["@change", "@input"];
        },
        onChange(value) {
            this.$emit("@change", value);
        },
        onInput(value) {
            if (this.showStateOnInputData && !this.showStateData) {
                this.showStateData = true;
            }
            this.$emit("@input", value);
        },
        colorOption(color) {
            if ($tools.isValidColor(color)) {
                return {
                    html: `<div style="background-color: ${color}; width: 1.5rem; height: 1.5rem"/>`,
                    value: color
                };
            } else {
                return color;
            }
        },
        colorOptions(colors) {
            return colors.map(color => this.colorOption(color));
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
                "radioGroup",
                "stacked",
                "dataType",
                "dataSource",
                "field",
                "options",
                "size",
                "required",
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
                radioGroup: {
                    type: 'checkbox',
                    label: 'Display as radio buttons',
                    editable: true,
                    literalOnly: true
                },
                stacked: {
                    type: 'checkbox',
                    label: 'Display radio buttons in column (stacked)',
                    hidden: viewModel => !viewModel.radioGroup,
                    editable: true
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
                required: {
                    type: 'checkbox',
                    description: 'When placed in a form container, the value must be defined when submitting the form',
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
                    options: ['default', 'sm', 'lg']
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


