Vue.component('select-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()"
            :draggable="$eval(viewModel.draggable, false) ? true : false"
            v-on="boundEventHandlers({'click': onClick})"
        >
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$eval(viewModel.label, '#error#')" :label-for="'input_' + viewModel.cid" :description="$eval(viewModel.description)" 
                :label-cols="$eval(viewModel.horizontalLayout, false) ? (viewModel.labelCols ? $eval(viewModel.labelCols, 'auto') : 'auto') : undefined"
                :label-class="$eval(viewModel.labelClass, null)"
                :style="$eval(viewModel.style, null)"
                :label-size="$eval(viewModel.size, null)"
                :class="$eval(viewModel.class, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
            >
                <b-form-select v-model="value" 
                    :id="'input_' + viewModel.cid" 
                    :size="$eval(viewModel.size, null)"
                    :select-size="$eval(viewModel.selectSize, null)"
                    :options="$eval(viewModel.options, null)"
                    :multiple="$eval(viewModel.multiple, false)"
                    :disabled="$eval(viewModel.disabled, false)" @change="onChange" @input="onInput"></b-form-select>
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
                "dataSource",
                "field",
                "options",
                "size",
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
                    min: 1,
                    max: 11,
                    step: 1,
                    category: 'style',
                    editable: (viewModel) => viewModel.horizontalLayout,
                    description: 'Number of columns for the label (when horizontal layout)'
                },
                labelClass: {
                    label: 'Label class',
                    type: 'text',
                    category: 'style',
                    description: 'Class(es) (space-separated) applying to the label'
                },
                selectSize: {
                    type: 'select',
                    label: 'Select size (visible rows)',
                    editable: true,
                    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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
                size: {
                    type: 'select',
                    editable: true,
                    options: ['md', 'sm', 'lg']
                }
            }
        }

    }
});


