Vue.component('button-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-button 
                :href="$eval(viewModel.href, null)"
                :to="$eval(viewModel.to, null)"
                :type="$eval(viewModel.buttonType, null)" 
                :variant="$eval(viewModel.variant, null)" 
                :pill="$eval(viewModel.pill, false)" 
                :squared="$eval(viewModel.squared, false)" 
                :disabled="$eval(viewModel.disabled, false)" 
                :block="$eval(viewModel.block, null)"
                :size="$eval(viewModel.size, null)"
                :class="$eval(viewModel.class, null)"
                :style="$eval(viewModel.style, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                :target="$eval(viewModel.openLinkInNewWindow, null) ? '_blank' : undefined"
                v-on="boundEventHandlers({'click': onClick})"
            >
                <div v-if="$eval(viewModel.icon, null)"
                    :style="{ display: 'flex', flexDirection: iconPositionMapper[$eval(viewModel.iconPosition, 'left')], justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }">
                    <b-icon :icon="$eval(viewModel.icon)"></b-icon>
                    <div v-if="$eval(viewModel.label, null)">{{ $eval(viewModel.label, '#error#') }}</div>
                </div>
                <div v-else>
                    {{ $eval(viewModel.label, '#error#') }}
                </div>
            </b-button>
        </div>
    `,
    data: function() {
        return {
            iconPositionMapper: {
                'left': 'row',
                'right': 'row-reverse',
                'top': 'column',
                'bottom': 'column-reverse'
            }
        }
    },
    methods: {
        propNames() {
            return ["cid", "dataSource", "field", "label", "icon", "iconPosition", "href", "openLinkInNewWindow", "to", "buttonType", "variant", "size", "pill", "squared", "block", "disabled", "eventHandlers"];
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
                icon: {
                    type: 'icon',
                    editable: true
                },
                iconPosition: {
                    type: 'select',
                    editable: true,
                    options: ['left', 'right', 'top', 'bottom']
                },
                openLinkInNewWindow: {
                    type: 'checkbox',
                    editable: (viewModel) => !!viewModel.href
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


