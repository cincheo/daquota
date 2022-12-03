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
                <template v-if="viewModel.displayAsChoices">
                    <b-form-checkbox-group v-if="$eval(viewModel.multiple, false)" ref="input" v-model="value" 
                        :id="'input_' + viewModel.cid + '_' + _uid" 
                        :size="$eval(viewModel.size, null)"
                        :style="getChoicesStyle()"
                        :options="htmlFormattedOptions()"
                        :disabled="$eval(viewModel.disabled, false)" 
                        :required="$eval(viewModel.required, false)"
                        :state="$state"
                        :stacked="$eval(viewModel.stacked, false)"
                        :buttons="$eval(viewModel.buttons, false)"
                        :button-variant="$eval(viewModel.buttonVariant, false)"
                        @change="onChange" @input="onInput"
                    />
                    <b-form-radio-group v-else ref="input" v-model="value" 
                        :id="'input_' + viewModel.cid + '_' + _uid" 
                        :size="$eval(viewModel.size, null)"
                        :style="getChoicesStyle()"
                        :options="htmlFormattedOptions()"
                        :disabled="$eval(viewModel.disabled, false)" 
                        :required="$eval(viewModel.required, false)"
                        :state="$state"
                        :stacked="$eval(viewModel.stacked, false)"
                        :buttons="$eval(viewModel.buttons, false)"
                        :button-variant="$eval(viewModel.buttonVariant, false)"
                        @change="onChange" @input="onInput"
                    />
                </template>
                <b-form-select v-else ref="input" v-model="$value" 
                    @mousedown="onMouseDown"
                    :id="'input_' + viewModel.cid + '_' + _uid" 
                    :size="$eval(viewModel.size, null)"
                    :select-size="$eval(viewModel.selectSize, null)"
                    :options="getOptions()"
                    :multiple="$eval(viewModel.multiple, false)"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :required="$eval(viewModel.required, false)"
                    :state="$state"
                    @change="onChange" @input="onInput"
                />
            </b-form-group>
        </div>
    `,
    computed: {
        $value: {
            set: function(value) {
                this.value = value;
            },
            get: function() {
                return this.value ? this.value: null;
            }
        }
    },
    methods: {
        getOptions() {
            let options = this.$evalCode(this.viewModel.options, null);
            if (options == null) {
                options = [];
            }
            options = options.slice(0);
            let placeholder = this.$eval(this.viewModel.placeholder, null);
            if (placeholder) {
                options.unshift({value: null, text: placeholder, disabled: true});
            }
            const value = this.$value;
            if (typeof value === 'string' && !options?.includes(value)) {
                options.push({value: value, text: value, disabled: true});
            }
            return options;
        },
        getChoicesStyle() {
            const style = {};
            if (this.viewModel.selectSize) {
                style.height = (this.viewModel.selectSize * 1.2) + 'rem';
                style.overflow = 'auto';
            }
            return style;
        },
        onMouseDown(event) {
            console.info('onMouseDown', event);
        },
        htmlFormattedOptions() {
            const options = this.$evalCode(this.viewModel.options, null);
            if (this.viewModel.displayAsChoices && Array.isArray(options)) {
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
                "placeholder",
                "description",
                "selectSize",
                "multiple",
                "displayAsChoices",
                "buttons",
                "buttonVariant",
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
                    type: 'code/javascript',
                    editable: true,
                    description: 'A list of strings or objects containing "value" and "text" properties',
                    literalOnly: true
                },
                horizontalLayout: {
                    type: 'checkbox',
                    label: 'Horizontal layout',
                    editable: true,
                    category: 'style'
                },
                displayAsChoices: {
                    type: 'checkbox',
                    label: 'Display as choices',
                    editable: true,
                    literalOnly: true
                },
                buttons: {
                    type: 'checkbox',
                    label: 'Style choices as buttons',
                    category: 'style',
                    editable: true,
                    literalOnly: true,
                    hidden: viewModel => !viewModel.displayAsChoices
                },
                buttonVariant: {
                    type: 'select',
                    label: 'Buttons variant',
                    category: 'style',
                    editable: true,
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark",
                        "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark",
                        "link"
                    ],
                    hidden: viewModel => !viewModel.buttons
                },
                stacked: {
                    type: 'checkbox',
                    label: 'Display choices in column (stacked)',
                    hidden: viewModel => !viewModel.displayAsChoices,
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
                placeholder: {
                    type: 'text',
                    description: 'A text to display in the select when no value is selected',
                    hidden: viewModel => viewModel.displayAsChoices,
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
                    max: 30,
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


