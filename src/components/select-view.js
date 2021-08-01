Vue.component('select-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$eval(viewModel.label)" :label-for="'input_' + viewModel.cid" :description="$eval(viewModel.description)" 
                :label-cols="$eval(viewModel.horizontalLayout) ? 'auto' : undefined"
                :style="$eval(viewModel.style)"
                :label-size="$eval(viewModel.size)"
                :class="viewModel.class">
                <b-form-select v-model="value" 
                    :id="'input_' + viewModel.cid" 
                    :size="$eval(viewModel.size)"
                    :select-size="$eval(viewModel.selectSize)"
                    :options="$eval(viewModel.options)"
                    :disabled="$eval(viewModel.disabled)" @change="onChange" @input="onInput"></b-form-select>
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
            return ["cid", "horizontalLayout", "layoutClass", "class", "style", "label", "description", "dataSource", "field", "options", "size", "disabled", "eventHandlers"];
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
                selectSize: {
                    type: 'select',
                    editable: true,
                    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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


