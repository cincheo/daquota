Vue.component('checkbox-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="edit && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="viewModel.label" :label-for="'input_' + viewModel.cid" :description="viewModel.description" :class="viewModel.class">
                <b-form-checkbox v-if="viewModel.field && dataModel" v-model="dataModel[viewModel.field]" 
                    :size="viewModel.size"
                    :switch="$eval(viewModel.switch)"
                    :disabled="$eval(viewModel.disabled)" @change="onChange" @input="onInput"></b-form-checkbox>
                <b-form-checkbox v-if="!viewModel.field || !dataModel" v-model="dataModel" 
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
            return ["cid", "layoutClass", "class", "dataSource", "field", "label", "description", "switch", "size", "disabled", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                disabled: {
                    type: 'checkbox',
                    editable: true
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


