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

Vue.component('progress-view', {
    extends: editableComponent,
    mixins: [formGroupMixin],
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-form-group 
                :label="$label" 
                :label-for="'progress_' + viewModel.cid" 
                :description="$eval(viewModel.description)" 
                :label-cols="$labelCols"
                :label-class="$eval(viewModel.labelClass, null)"
                :style="$eval(viewModel.style, null)"
                :label-size="$eval(viewModel.size, null)"
                :state="$eval(viewModel.state ? viewModel.state : undefined, null)"
                :invalid-feedback="$eval(viewModel.invalidFeedback, null)"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :class="$eval(viewModel.class, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
            >
                <b-progress 
                    :id="'progress_' + viewModel.cid" 
                    :animated="$eval(viewModel.animated, null)"
                    :height="$eval(viewModel.height, null)"
                    :max="$eval(viewModel.max, null)" 
                    :variant="$eval(viewModel.variant, null)" 
                    :precision="$eval(viewModel.precision, null)" 
                    :showProgress="$eval(viewModel.displayText, null) === 'display-progress'" 
                    :showValue="$eval(viewModel.displayText, null) === 'display-value'" 
                    :disabled="$eval(viewModel.disabled, false)" 
                    :striped="$eval(viewModel.striped, false)"
                    :value="value"
                    :class="$eval(viewModel.class, null)"
                    :style="$eval(viewModel.style, null)"
                    :draggable="$eval(viewModel.draggable, false) ? true : false" 
                    v-on="boundEventHandlers({'click': onClick})"
                />
            </b-form-group>
        </div>
    `,
    methods: {
        propNames() {
            return [
                "cid",
                "dataSource",
                "field",
                "horizontalLayout",
                "labelCols",
                "labelClass",
                "label",
                "description",
                "state",
                "invalidFeedback",
                "validFeedback",
                "max",
                "height",
                "displayText",
                "precision",
                "variant",
                "striped",
                "animated",
                "disabled",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark"
                    ],
                    category: "style",
                    description: "Applies one of the Bootstrap theme color variants to the component"
                },
                max: {
                    type: 'number',
                    defaultValue: 100,
                    description: "Set the maximum value"
                },
                precision: {
                    type: 'number',
                    description: 'The number of digits after the decimal to round the value to'
                },
                height: {
                    type: 'text',
                    description: "Override the default height by specifying a CSS height value (including units)",
                    category: 'style'
                },
                animated: {
                    type: 'checkbox',
                    category: "style",
                    description: "Enable the animated background. Also automatically set 'striped'"
                },
                striped: {
                    type: 'checkbox',
                    category: "style",
                    description: "Enable the striped background"
                },
                displayText: {
                    type: 'select',
                    editable: true,
                    options: [
                        {value: "no-text", text: "no text"},
                        {value: "display-progress", text: "display progress (as a percentage)"},
                        {value: "display-value", text: "show value"}
                    ],
                    category: "style",
                    description: "Tune the text to be displayed on the progress bar"
                },
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
                labelClass: {
                    label: 'Label class',
                    type: 'text',
                    category: 'style',
                    description: 'Class(es) (space-separated) applying to the label'
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


