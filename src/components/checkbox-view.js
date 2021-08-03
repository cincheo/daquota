Vue.component('checkbox-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="viewModel.label" :label-for="'input_' + viewModel.cid" :description="viewModel.description" 
                :label-cols="$eval(viewModel.horizontalLayout) ? 'auto' : undefined"
                :label-size="$eval(viewModel.size)"
                :style="$eval(viewModel.style)"
                :class="viewModel.class">
                <b-form-checkbox v-model="value" 
                    :size="viewModel.size"
                    :switch="$eval(viewModel.switch)"
                    :disabled="$eval(viewModel.disabled)" @change="onChange" @input="onInput"></b-form-checkbox>
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
        clear() {
            if (this.viewModel.field && this.dataModel) {
                this.dataModel[this.viewModel.field] = undefined;
            } else {
                this.dataModel = undefined;
            }
        },
        propNames() {
            return ["cid", "horizontalLayout", "layoutClass", "class", "style", "dataSource", "field", "label", "description", "switch", "size", "disabled", "eventHandlers"];
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


