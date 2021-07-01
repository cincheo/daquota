Vue.component('icon-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-icon
                :icon="$eval(viewModel.icon)" 
                :class="$eval(viewModel.class)"
                :variant="$eval(viewModel.variant)" 
                :flip-h="$eval(viewModel.flipHorizontally)" 
                :flip-v="$eval(viewModel.flipVertically)" 
                :rotate="$eval(viewModel.rotate)" 
                :scale="$eval(viewModel.scale)" 
                @click="onClick">
            </b-icon>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "layoutClass", "class", "dataSource", "icon", "variant", "flipHorizontally", "flipVertically", "rotate", "scale", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                icon: {
                    type: 'text',
                    editable: true,
                    docLink: 'https://bootstrap-vue.org/docs/icons/'
                },
                variant: {
                    type: 'select',
                    editable: true,
                    options: [
                        "primary", "secondary", "success", "danger", "warning", "info", "light", "dark"
                    ]
                },
                flipHorizontally: {
                    type: 'checkbox',
                    editable: true
                },
                flipVertically: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


