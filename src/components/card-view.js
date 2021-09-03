Vue.component('card-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
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
                :style="$eval(viewModel.style)"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
                >
                    
                <b-card-text v-if="viewModel.text">
                  {{ viewModel.text }}
                </b-card-text>     
                
                <component-view v-if="isEditable() || viewModel.body" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="inSelection"/>
                               
            </b-card>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "layoutClass", "class", "style", "dataSource", "title", "subTitle", "imgSrc", "imgPosition", "imgWidth", "text", "body", "eventHandlers"];
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


