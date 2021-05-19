Vue.component('checkbox-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="edit && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="viewModel.label" :label-for="'input_' + viewModel.cid" :description="viewModel.description" :class="viewModel.class">
                <b-form-checkbox v-if="viewModel.field && dataModel" v-model="dataModel[viewModel.field]" 
                    :size="viewModel.size"
                    :switch="viewModel.switch"
                    :disabled="viewModel.disabled" @change="onChange" @input="onInput"></b-form-checkbox>
                <b-form-checkbox v-if="!viewModel.field" v-model="dataModel" 
                    :size="viewModel.size"
                    :switch="viewModel.switch"
                    :disabled="viewModel.disabled" @change="onChange" @input="onInput"></b-form-checkbox>
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
            return ["cid", "dataSource", "field", "class", "label", "description", "switch", "size", "disabled", "eventHandlers"];
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


