Vue.component('button-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button 
                :type="viewModel._type" 
                :variant="viewModel.variant" 
                :pill="viewModel.pill" 
                :squared="viewModel.squared" 
                :disabled="viewModel.disabled" 
                :block="viewModel.block"
                :size="viewModel.size"
                :class="viewModel.class"
                @click="onClick">
                    {{ $eval(viewModel.label, '#error#') }}
            </b-button>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "layoutClass", "class", "dataSource", "field", "label", "_type", "variant", "size", "pill", "squared", "block", "disabled", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                _type: {
                    type: 'select',
                    label: 'Type',
                    editable: true,
                    options: [
                        'button', 'submit', 'reset'
                    ]
                },
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark",
                        "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark",
                        "link"
                    ]
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: [
                        "default", "sm", "lg"
                    ]
                },
                pill: {
                    type: 'checkbox',
                    editable: true
                },
                squared: {
                    type: 'checkbox',
                    editable: true
                },
                block: {
                    type: 'checkbox',
                    editable: true
                },
                disabled: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


