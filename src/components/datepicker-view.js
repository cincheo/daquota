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
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass"
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>
            <b-form-group :label="$eval(viewModel.label, '#error#')" :label-for="'input_' + viewModel.cid" :description="$eval(viewModel.description)" 
                :label-cols="labelCols()"
                :label-class="$eval(viewModel.labelClass, null)"
                :style="$eval(viewModel.style, null)"
                :label-size="$eval(viewModel.size, null)"
                :class="$eval(viewModel.class, null)"
            >
                <b-form-datepicker :ref="'component-'+cid" v-model="value" 
                    :disabled="$eval(viewModel.disabled, true)" 
                    @input="onInput" 
                    @hidden="onHidden" 
                    @shown="onShown" 
                    @context="onContext"
                    boundary="viewport"
                    :style="$eval(viewModel.style, null)"
                    :class="$eval(viewModel.class, null)"
                    :size="$eval(viewModel.size, null)"
                    ></b-form-datepicker>
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
            return ["@input", "@hidden", "@shown", "@context"];
        },
        onInput(value) {
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
                "disabled",
                "eventHandlers"];
        },
        customPropDescriptors() {
            return {
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
                disabled: {
                    type: 'checkbox',
                    editable: true
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['md', 'sm', 'lg']
                },
                state: {
                    type: 'text',
                    editable: true,
                    label: "Validation state"
                }
            }
        }

    }
});


