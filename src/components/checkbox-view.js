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

Vue.component('checkbox-view', {
    extends: editableComponent,
    mixins: [formGroupMixin],
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass"
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$label" :label-for="'input_' + viewModel.cid" :description="$eval(viewModel.description, '#error#')" 
                :label-cols="$labelCols"
                :state="$state"
                :invalid-feedback="$invalidFeedback"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :label-class="$eval(viewModel.labelClass, null)"
                :label-size="$eval(viewModel.size, null)"
                :style="$eval(viewModel.style, null)"
                :class="$eval(viewModel.class, null)"
            >
                <b-form-checkbox v-model="value" 
                    :size="$eval(viewModel.size, null)"
                    :switch="$eval(viewModel.switch, false)"
                    :required="$eval(viewModel.required, false)"
                    :state="$state"
                    :disabled="$eval(viewModel.disabled, false)" @change="onChange" @input="onInput"></b-form-checkbox>
            </b-form-group>
        </div>
    `,
    methods: {
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
        clear() {
            if (this.viewModel.field && this.dataModel) {
                this.dataModel[this.viewModel.field] = undefined;
            } else {
                this.dataModel = undefined;
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
                "required",
                "state",
                "invalidFeedback",
                "validFeedback",
                "switch",
                "size",
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
                required: {
                    type: 'checkbox',
                    description: 'When placed in a form container, the value must be defined when submitting the form',
                    editable: true
                },
                state: {
                    type: 'text',
                    actualType: 'boolean',
                    editable: true,
                    label: "Validation state"
                },
                labelClass: {
                    label: 'Label class',
                    type: 'text',
                    category: 'style',
                    description: 'Class(es) (space-separated) applying to the label'
                },
                switch: {
                    type: 'checkbox',
                    editable: true
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['default', 'sm', 'lg']
                }
            }
        }

    }
});


