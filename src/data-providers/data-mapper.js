Vue.component('data-mapper', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="edit" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="edit" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    mounted: function () {
        this.setMapper();
        this.update();
    },
    watch: {
        'viewModel.mapper': {
            handler: function () {
                this.setMapper();
                this.update();
            },
            immediate: true
        }
    },
    methods: {
        setMapper() {
            console.info("set mapper", this.viewModel.mapper);
            this.dataMapper = (dataModel) => eval(this.viewModel.mapper);
        },
        propNames() {
            return ["cid", "dataSource", "mapper", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                mapper: {
                    type: 'text',
                    editable: true,
                    description: 'A functional expression that maps (transforms, filters, sorts, reduces, ...) the data from the data source to the data model.'
                }
            }
        }

    }
});


