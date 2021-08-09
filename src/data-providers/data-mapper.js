Vue.component('data-mapper', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if='isEditable()' :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="isEditable()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model <b-badge v-if="error" pill variant="danger"> ! </b-badge></b-button>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-if="!error"
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
                <b-alert v-else show variant="danger" size="sm">
                    {{ error }}                    
                </b-alert>
            </b-collapse>
        </div>
    `,
    created: function() {
        this.$eventHub.$on('synchronized', () => this.update());
    },
    mounted: function () {
        this.setMapper();
        this.update();
    },
    data: function () {
        return {
            error: undefined
        }
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
            this.dataMapper = (dataModel) => {
                try {
                    if (dataModel === undefined) {
                        return undefined;
                    }
                    let source = dataModel;
                    let result = eval(this.viewModel.mapper.startsWith('=') ? this.viewModel.mapper.slice(1) : this.viewModel.mapper);
                    this.error = undefined;
                    return result;
                } catch (e) {
                    console.error("error in mapper", e);
                    this.error = e.message;
                    return undefined;
                }
            };
        },
        propNames() {
            return ["cid", "dataSource", "mapper", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                mapper: {
                    type: 'textarea',
                    editable: true,
                    description: 'A functional expression that maps (transforms, filters, sorts, reduces, ...) the data from the data source to the data model.'
                }
            }
        }

    }
});


