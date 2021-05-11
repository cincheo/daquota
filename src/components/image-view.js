Vue.component('image-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-img 
                :class="viewModel.class"
                :src="viewModel.src" 
                :blank="viewModel.blank" 
                :blank-color="viewModel.blankColor" 
                :block="viewModel.display === 'block'" 
                :center="viewModel.display === 'center'"
                :fluid="viewModel.display === 'fluid'"
                :fluid-grow="viewModel.display === 'fluid-grow'"
                :left="viewModel.display === 'left'"
                :right="viewModel.display === 'right'"
                :height="viewModel.height"
                :width="viewModel.width"
                :rounded="viewModel.rounded"
                :thumbnail="viewModel.thumbnail"
                @click="onClick">
            </b-img>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "class", "src", "blank", "blank-color", "display", "width", "height", "rounded", "thumbnail", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                src: {
                    label: 'URL',
                    type: 'text',
                    editable: true
                },
                blank: {
                    type: 'checkbox',
                    editable: true
                },
                blankColor: {
                    inputType: 'color',
                    editable: true
                },
                display: {
                    type: 'select',
                    editable: true,
                    options: [
                        'default', 'block', 'center', 'fluid', 'fluid-grow', 'left', 'right'
                    ]
                },
                rounded: {
                    type: 'checkbox',
                    editable: true
                },
                thumbnail: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


