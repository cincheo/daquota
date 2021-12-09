Vue.component('input-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass" 
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers()"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$eval(viewModel.label, null)" :label-for="'input_' + viewModel.cid" 
                :label-cols="labelCols()"
                :label-class="$eval(viewModel.labelClass, null)"
                :label-size="$eval(viewModel.size, null)"
                :description="$eval(viewModel.description, null)" 
                :state="$eval(viewModel.state ? viewModel.state : undefined, null)"
                :invalid-feedback="$eval(viewModel.invalidFeedback, null)"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :style="$eval(viewModel.style, null)"
                :class="$eval(viewModel.class, null)"
            >
                <b-form-input v-model="value" 
                    :type="$eval(viewModel.inputType, null)" 
                    :number="$eval(viewModel.inputType, null) === 'number' ? true : false"
                    :min="$eval(viewModel.min, null)"
                    :max="$eval(viewModel.max, null)"
                    :step="$eval(viewModel.step, null)"
                    :size="$eval(viewModel.size, null)"
                    :state="$eval(viewModel.state ? viewModel.state : undefined, null)"
                    :placeholder="$eval(viewModel.placeholder, null)"
                    :disabled="$eval(viewModel.disabled, false)" 
                    :required="$eval(viewModel.required, false)"
                    @blur="onBlur" @change="onChange" @input="onInput" @update="onUpdate"
                ></b-form-input>
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
            return ["@blur", "@change", "@input", "@update"];
        },
        onBlur(value) {
            this.$emit("@blur", value);
        },
        onChange(value) {
            this.$emit("@change", value);
        },
        onInput(value) {
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
        propNames() {
            return [
                "cid",
                "horizontalLayout",
                "labelCols",
                "labelClass",
                "dataSource",
                "field",
                "inputType",
                "label",
                "description",
                "size",
                "disabled",
                "min",
                "max",
                "step",
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
                inputType: {
                    type: 'select',
                    label: 'Type',
                    editable: true,
                    options: [
                        "text", "password", "email", "number", "url", "tel", "search", "date", "datetime-local", "month", "week", "time", "range", "color"
                    ]
                },
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
                    hidden: viewModel => (['range', 'date', 'datetime-local', 'color'].indexOf(viewModel.inputType) !== -1)
                },
                min: {
                    type: 'number',
                    hidden: viewModel => (['range', 'number'].indexOf(viewModel.inputType) === -1)
                },
                max: {
                    type: 'number',
                    hidden: viewModel => (['range', 'number'].indexOf(viewModel.inputType) === -1)
                },
                step: {
                    type: 'number',
                    hidden: viewModel => (['range', 'number'].indexOf(viewModel.inputType) === -1)
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
                    hidden: (viewModel) => !viewModel.horizontalLayout,
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
                    options: ['md', 'sm', 'lg']
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


