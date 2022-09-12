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

Vue.component('datepicker-view', {
    extends: editableComponent,
    mixins: [formGroupMixin],
    template: `
        <div :id="cid"
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <b-form-group :label="$label" :label-for="'input_' + viewModel.cid" 
                :description="$eval(viewModel.description)" 
                :label-cols="$labelCols"
                :label-class="$eval(viewModel.labelClass, null)"
                :style="$eval(viewModel.style, null)"
                :label-size="$eval(viewModel.size, null)"
                :state="$state"
                :invalid-feedback="$invalidFeedback"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :class="$eval(viewModel.class, null)"
            >
                <b-calendar v-if="viewModel.noDropdown" ref="input" v-model="adaptedValue" 
                    :disabled="$eval(viewModel.disabled, true)" 
                    :reset-button="$eval(viewModel.resetButton, false)"
                    :reset-button-variant="$eval(viewModel.resetButtonVariant, false)"
                    :reset-value="$eval(viewModel.resetValue, null)"
                    :today-button="$eval(viewModel.todayButton, false)"
                    :today-button-variant="$eval(viewModel.todayButtonVariant, false)"
                    :show-decade-nav="$eval(viewModel.showDecadeNav, false)"
                    @input="onInput" 
                    @context="onContext"
                    :required="$eval(viewModel.required, false)"
                    :state="$state"
                    :style="$eval(viewModel.style, null)"
                    :class="$eval(viewModel.class, null)"
                    :size="$eval(viewModel.size, null)"
                    :block="$eval(viewModel.block, null)"
                >
                    <div class="d-flex" style="gap:0.5rem" dir="ltr">
                      <b-button
                        v-if="$eval(viewModel.resetButton, false)"
                        :size="$eval(viewModel.size, null)"
                        :variant="$eval(viewModel.resetButtonVariant, null)"
                        @click="value = $eval(viewModel.resetValue, null)"
                      >
                        Reset
                      </b-button>
                      <b-button
                        v-if="$eval(viewModel.todayButton, false)"
                        :size="$eval(viewModel.size, null)"
                        :variant="$eval(viewModel.todayButtonVariant, null)"
                        @click="value = moment().toDate()"
                      >
                        Select today
                      </b-button>
                    </div>
                </b-calendar>
                <b-form-datepicker v-else ref="input" v-model="adaptedValue" 
                    :disabled="$eval(viewModel.disabled, true)" 
                    :reset-button="$eval(viewModel.resetButton, false)"
                    :reset-button-variant="$eval(viewModel.resetButtonVariant, false)"
                    :reset-value="$eval(viewModel.resetValue, null)"
                    :today-button="$eval(viewModel.todayButton, false)"
                    :today-button-variant="$eval(viewModel.todayButtonVariant, false)"
                    :show-decade-nav="$eval(viewModel.showDecadeNav, false)"
                    @input="onInput" 
                    @hidden="onHidden" 
                    @shown="onShown" 
                    @context="onContext"
                    boundary="viewport"
                    :required="$eval(viewModel.required, false)"
                    :state="$state"
                    :style="$eval(viewModel.style, null)"
                    :class="$eval(viewModel.class, null)"
                    :size="$eval(viewModel.size, null)"
                />
            </b-form-group>
        </div>
    `,
    computed: {
        adaptedValue: {
            get: function() {
                if (this.value != null) {
                    return moment(this.value).toDate();
                } else {
                    return undefined;
                }
            },
            set: function (value) {
                this.value = value;
            }
        }
    },
    methods: {
        customEventNames() {
            return ["@input", "@hidden", "@shown", "@context"];
        },
        onInput(value) {
            if (this.showStateOnInputData && !this.showStateData) {
                this.showStateData = true;
            }
            this.$emit("@input", value);
        },
        onHidden(value) {
            this.$emit("@hidden", value);
        },
        onShown(value) {
            this.$emit("@shown", value);
        },
        onContext(value) {
            this.$emit("@context", value);
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
                "size", "dataSource",
                "field",
                "label",
                "description",
                "noDropdown",
                "block",
                "todayButton",
                "todayButtonVariant",
                "resetButton",
                "resetButtonVariant",
                "resetValue",
                "showDecadeNav",
                "required",
                "state",
                "invalidFeedback",
                "validFeedback",
                "disabled",
                "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                showDecadeNav: {
                    type: 'checkbox',
                    editable: true
                },
                horizontalLayout: {
                    type: 'checkbox',
                    label: 'Horizontal layout',
                    editable: true,
                    category: 'style'
                },
                noDropdown: {
                    type: 'checkbox',
                    editable: true,
                    literalOnly: true,
                    description: "Embeds a calendar control directly, without the dropdown picker"
                },
                block: {
                    type: 'checkbox',
                    editable: true,
                    hidden: viewModel => !viewModel.noDropdown,
                    description: "If set, stretches the calendar to take the entire available width in the parent"
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
                required: {
                    type: 'checkbox',
                    description: 'When placed in a form container, the value must be defined when submitting the form',
                    editable: true
                },
                disabled: {
                    type: 'checkbox',
                    editable: true
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
                resetButton: {
                    type: 'checkbox',
                    editable: true,
                    description: "When set, shows the optional 'reset' button"
                },
                resetButtonVariant: {
                    type: 'select',
                    hidden: viewModel => !viewModel.resetButton,
                    category: 'style',
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark",
                        "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark"
                    ]
                },
                resetValue: {
                    type: 'text',
                    hidden: viewModel => !viewModel.resetButton,
                    description: "When the optional 'reset' button is clicked, the selected date will be set to this value. Default is to clear the selected value"
                },
                todayButton: {
                    type: 'checkbox',
                    editable: true,
                    description: "When set, shows the optional 'select today' button"
                },
                todayButtonVariant: {
                    type: 'select',
                    hidden: viewModel => !viewModel.todayButton,
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark",
                        "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark"
                    ]
                }
            }
        }

    }
});


