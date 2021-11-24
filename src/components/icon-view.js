Vue.component('icon-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-icon
                :icon="$eval(viewModel.icon, null)" 
                :class="$eval(viewModel.class, null)"
                :variant="$eval(viewModel.variant, null)" 
                :flip-h="$eval(viewModel.flipHorizontally, null)" 
                :flip-v="$eval(viewModel.flipVertically, null)" 
                :rotate="$eval(viewModel.rotate, null)" 
                :scale="$eval(viewModel.scale, null)" 
                :style="$eval(viewModel.style, null)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
            >
            </b-icon>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "layoutClass", "class", "style", "dataSource", "icon", "variant", "flipHorizontally", "flipVertically", "rotate", "scale", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                icon: {
                    type: 'icon',
                    editable: true
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


