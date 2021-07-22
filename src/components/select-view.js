Vue.component('select-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$eval(viewModel.label)" :label-for="'input_' + viewModel.cid" :description="$eval(viewModel.description)" 
                :style="$eval(viewModel.style)"
                :class="viewModel.class">
                <b-form-select v-if="viewModel.field && dataModel" v-model="dataModel[viewModel.field]" 
                    :id="'input_' + viewModel.cid" 
                    :size="$eval(viewModel.size)"
                    :select-size="$eval(viewModel.selectSize)"
                    :options="$eval(viewModel.options)"
                    :disabled="$eval(viewModel.disabled)" @change="onChange" @input="onInput"></b-form-select>
                <b-form-select v-if="!viewModel.field || !dataModel" v-model="dataModel"  
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
            return ["cid", "dataSource", "field", "class", "style", "label", "description", "options", "size", "disabled", "eventHandlers"];
        },
        clear() {
            if (this.viewModel.field && this.dataModel) {
                this.dataModel[this.viewModel.field] = undefined;
            } else {
                this.dataModel = undefined;
            }
        },
        customPropDescriptors() {
            return {
                options: {
                    type: 'text',
                    editable: true
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
                    options: ['default', 'sm', 'lg']
                }
            }
        }

    }
});


