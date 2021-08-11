Vue.component('button-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-button 
                :type="$eval(viewModel.buttonType, null)" 
                :variant="$eval(viewModel.variant, null)" 
                :pill="$eval(viewModel.pill, false)" 
                :squared="$eval(viewModel.squared, false)" 
                :disabled="$eval(viewModel.disabled, false)" 
                :block="$eval(viewModel.block, null)"
                :size="$eval(viewModel.size, null)"
                :class="$eval(viewModel.class, null)"
                :style="$eval(viewModel.style, null)"
                @click="onClick">
                <b-icon v-if="$eval(viewModel.icon, null)" :icon="$eval(viewModel.icon)"></b-icon>
                    {{ $eval(viewModel.label, '#error#') }}
            </b-button>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "layoutClass", "class", "style", "dataSource", "field", "label", "icon", "buttonType", "variant", "size", "pill", "squared", "block", "disabled", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                buttonType: {
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
                    options: ['md', 'sm', 'lg']
                },
                pill: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                squared: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                block: {
                    type: 'checkbox',
                    editable: true,
                    category: 'style'
                },
                disabled: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


