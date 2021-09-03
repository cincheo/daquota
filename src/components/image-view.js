Vue.component('image-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()" :class="viewModel.layoutClass">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-img 
                :class="$eval(viewModel.class, null)"
                :src="src()" 
                :blank="$eval(viewModel.blank, null)" 
                :blank-color="$eval(viewModel.blankColor, null)" 
                :block="$eval(viewModel.display, null) === 'block'" 
                :center="$eval(viewModel.display, null) === 'center'"
                :fluid="$eval(viewModel.display, null) === 'fluid'"
                :fluid-grow="$eval(viewModel.display, null) === 'fluid-grow'"
                :left="$eval(viewModel.display, null) === 'left'"
                :right="$eval(viewModel.display, null) === 'right'"
                :height="$eval(viewModel.height, null)"
                :width="$eval(viewModel.width, null)"
                :rounded="$eval(viewModel.rounded, null)"
                :thumbnail="$eval(viewModel.thumbnail, null)"
                :style="$eval(viewModel.style, '') + ';' + ($eval(viewModel.invertColors, false) ? 'filter: invert(1)' : '')"
                :draggable="$eval(viewModel.draggable, false) ? true : false" 
                v-on="boundEventHandlers({'click': onClick})"
            >
            </b-img>
        </div>
    `,
    methods: {
        src() {
            let url = undefined;
            if (this.viewModel.src) {
                url = this.$eval(this.viewModel.src, '#error#');
                if (typeof url !== 'string') {
                    url = this.value;
                }
            } else {
                url = this.value;
            }
            if (typeof url !== 'string') {
                url = '#error#';
            }
            console.info('RETURNING URL', url);
            return url;
        },
        propNames() {
            return ["cid", "layoutClass", "class", "style", "dataSource", "field", "src", "blank", "blankColor", "display", "width", "height", "rounded", "thumbnail", "invertColors", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                src: {
                    label: 'URL (overrides the data model)',
                    type: 'text',
                    editable: true,
                    description: 'A URL or formula evaluating to a URL that will override the data model (if not defined, the data model is expected to contain an image URL)'
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
                },
                invertColors: {
                    type: 'checkbox',
                    editable: true
                }
            }
        }

    }
});


