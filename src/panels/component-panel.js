Vue.component('component-panel', {
    template: `
        <div>
            <p>
            
                <div v-if="!modal" class="pl-3 pr-3 pb-3 shadow mb-3">
                    <b-button class="float-right" v-on:click="detachComponent()" size="sm" variant="danger"><b-icon-trash></b-icon-trash></b-button>
                    <h5>Component properties</h5>
                    <div v-if="viewModel">
                        <component-icon  :type="viewModel.type" class="mr-2"></component-icon>{{ viewModel.cid }}
                    </div>
                    <div v-else>
                        Please select a component to edit its properties
                    </div>
                </div>
                    
                <div v-if="propDescriptors != null" :class="modal ? '' : 'ml-1 mr-1'">

                      <b-tabs content-class="mt-3" small>
                        <b-tab v-for="(category, index) of getCategories(propDescriptors)" :key="index" :title="getCategoryTitle(category)" :active="index===0?true:undefined">
                            <component-properties-panel :category="category" :dataModel="dataModel" :viewModel="viewModel" 
                                :propDescriptors="propDescriptors" 
                                :formulaButtonVariant="formulaButtonVariant"></component-properties-panel>
                        </b-tab>
                      </b-tabs>
                      
                </div>                    
            </p>
        </div>                   
        `,
    props: ['modal'],
    created: function () {
        this.$eventHub.$on('data-model-changed', (cid) => {
            if (this.viewModel && cid && this.viewModel.cid === cid) {
                this.dataModel = $d(this.viewModel.cid);
            }
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.initComponent(cid);
        });
        this.$eventHub.$on('style-changed', () => {
            this.formulaButtonVariant = ide.isDarkMode()?'outline-light':'outline-primary';
        });
    },
    mounted: function() {
        if (ide.selectedComponentId) {
            this.initComponent(ide.selectedComponentId);
        }
    },
    data: () => {
        return {
            viewModel: undefined,
            dataModel: undefined,
            propDescriptors: [],
            formulaButtonVariant: ide.isDarkMode()?'outline-light':'outline-primary'
        }
    },
    methods: {
        getCategories(propDescriptors) {
            let categories = [];
            for (let propDescriptor of propDescriptors) {
                if (categories.indexOf(propDescriptor.category) === -1) {
                    categories.push(propDescriptor.category);
                }
            }
            return categories;
        },
        getCategoryTitle(category) {
            if (category === 'main') {
                return 'Properties';
            } else {
                return Tools.camelToLabelText(category);
            }
        },
        initComponent(cid) {
            if (!cid) {
                this.viewModel = undefined;
                this.dataModel = undefined;
                this.propDescriptors = undefined;
                return;
            }
            if (this.viewModel && cid && this.viewModel.cid === cid) {
                return;
            }
            this.viewModel = components.getComponentModel(cid);
            this.dataModel = $d(this.viewModel.cid);

            this.propDescriptors = components.propDescriptors(this.viewModel);
            console.info("component-selected", this.viewModel, this.propDescriptors);
        },
        detachComponent() {
            ide.detachComponent(this.viewModel.cid);
        },
        deleteComponent() {
            ide.deleteComponent(this.viewModel.cid);
        }
    }
});
