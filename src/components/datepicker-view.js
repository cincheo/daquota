Vue.component('datepicker-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.field" variant="info">{{ viewModel.field }}</b-badge>
              <div>
                <label v-if="viewModel.label" :for="'component-'+cid">{{ viewModel.label }}</label>
                <b-form-datepicker v-if="viewModel.field && dataModel" :id="'component-'+cid" v-model="dataModel[viewModel.field]" 
                    :disabled="viewModel.disabled" 
                    boundary="window"
                    @input="onInput" 
                    @hidden="onHidden" 
                    @shown="onShown" 
                    @context="onContext"
                    :style="$eval(viewModel.style)"
                    ></b-form-datepicker>
                <b-form-datepicker v-if="!viewModel.field || !dataModel" :id="'component-'+cid" v-model="dataModel" 
                    :disabled="viewModel.disabled" 
                    boundary="window"
                    @input="onInput" 
                    @hidden="onHidden" 
                    @shown="onShown" 
                    @context="onContext"
                    :style="$eval(viewModel.style)"
                    ></b-form-datepicker>
            </div>                
        </div>
    `,
    data() {
        return {
            value: Tools.date(Tools.now())
        }
    },
    methods: {
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
                "layoutClass", "class", "style", "dataSource",
                "field",
                "label",
                "description",
                "disabled",
                "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                disabled: {
                    type: 'checkbox',
                    editable: true
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


