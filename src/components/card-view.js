Vue.component('card-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-card 
                :title="viewModel.title" 
                :sub-title="viewModel.subTitle" 
                :img-src="viewModel.imgSrc" 
                :img-alt="viewModel.imgAlt" 
                :img-top="viewModel.imgPosition === 'top'" 
                :img-end="viewModel.imgPosition === 'end'" 
                :img-left="viewModel.imgPosition === 'left'" 
                :img-right="viewModel.imgPosition === 'right'" 
                :img-bottom="viewModel.imgPosition === 'bottom'" 
                :img-start="viewModel.imgPosition === 'start'" 
                :img-width="viewModel.imgWidth"
                :class="viewModel.class"
                >
                    
                <b-card-text v-if="viewModel.text">
                  {{ viewModel.text }}
                </b-card-text>     
                
                <component-view v-if="edit || viewModel.body" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body"/>
                               
            </b-card>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "dataSource", "class", "title", "subTitle", "imgSrc", "imgPosition", "imgWidth", "text", "body", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                imgPosition: {
                    type: 'select',
                    editable: true,
                    label: 'Image position',
                    options: [
                        'top', 'bottom', 'left', 'right', 'start', 'end'
                    ]
                },
                imgSrc: {
                    editable: true,
                    type: 'text',
                    label: "Image URL"
                },
                imgWidth: {
                    editable: true,
                    label: "Image width"
                },
                text: {
                    type: 'textarea',
                    editable: true
                },
                body: {
                    type: 'ref',
                    editable: true
                }
            }
        }

    }
});


