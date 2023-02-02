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

Vue.component('tags-view', {
    extends: editableComponent,
    mixins: [formGroupMixin],
    template: `
        <div :id="cid" 
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers()"
        >
            <b-form-group 
                :label="$label" :label-for="'input_' + viewModel.cid" 
                :label-cols="$labelCols"
                :label-class="$eval(viewModel.labelClass, null)"
                :label-size="$eval(viewModel.size, null)"
                :description="$eval(viewModel.description, null)" 
                :state="$state"
                :invalid-feedback="$invalidFeedback"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :style="$eval(viewModel.style, null)"
                :class="componentClass()"             
            >
                <b-form-tags ref="input" v-model="value" 
                    :state="$state"
                    :placeholder="$eval(viewModel.placeholder, null)"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :required="$eval(viewModel.required, false)"
                    @blur="onBlur" @change="onChange" @input="onInput" @update="onUpdate"
                    @focus="onFocus"
                />
            </b-form-group>
        </div>
    `,
    data: function () {
        return {
            inputActive: false
        }
    },
    methods: {
        customEventNames() {
            return ["@blur", "@change", "@input", "@update"];
        },
        onBlur(value) {
            this.inputActive = false;
            this.$emit("@blur", value);
        },
        onFocus(value) {
            this.inputActive = true;
            this.$emit("@focus", value);
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
        onUpdate(value) {
            this.$emit("@update", value);
        },
        clear() {
            if (this.viewModel.field && this.dataModel) {
                this.dataModel[this.viewModel.field] = [];
            } else {
                this.dataModel = [];
            }
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
                "placeholder",
                "required",
                "state",
                "invalidFeedback",
                "validFeedback",
                "disabled",
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
                    description: 'A value evaluating to true is required for this control to have a valid state',
                    editable: true
                },
                placeholder: {
                    type: 'text',
                    hidden: viewModel => (['range', 'date', 'datetime-local', 'color'].indexOf(viewModel.inputType) !== -1)
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
                }
            }
        }

    }
});


