Vue.component('input-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="edit && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>                
            <b-form-group :label="$eval(viewModel.label, null)" :label-for="'input_' + viewModel.cid" 
                :description="$eval(viewModel.description, null)" 
                :state="$eval(viewModel.state, null)"
                :invalid-feedback="$eval(viewModel.invalidFeedback, null)"
                :valid-feedback="$eval(viewModel.validFeedback, null)"
                :class="viewModel.class">
                <b-form-input v-if="viewModel.field && dataModel" v-model="dataModel[viewModel.field]" 
                    :type="viewModel._type" 
                    :size="viewModel.size"
                    :state="$eval(viewModel.state, null)"
                    :disabled="viewModel.disabled" @blur="onBlur" @change="onChange" @input="onInput" @update="onUpdate"></b-form-input>
                <b-form-input v-if="!viewModel.field || !dataModel" v-model="dataModel" 
                    :type="viewModel._type" 
                    :size="viewModel.size"
                    :state="$eval(viewModel.state, null)"
                    :disabled="viewModel.disabled" @blur="onBlur" @change="onChange" @input="onInput" @update="onUpdate"></b-form-input>
            </b-form-group>
        </div>
    `,
    methods: {
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
        propNames() {
            return [
                "cid",
                "_type",
                "dataSource",
                "field",
                "label",
                "description",
                "class",
                "size",
                "disabled",
                "placeholder",
                "state",
                "invalidFeedback",
                "validFeedback",
                "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                _type: {
                    type: 'select',
                    label: 'Type',
                    editable: true,
                    options: [
                        "text", "password", "email", "number", "url", "tel", "search", "date", "datetime", "datetime-local", "month", "week", "time", "range", "color"
                    ]
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
                    editable: true,
                    label: "Validation state"
                }
            }
        }

    }
});


