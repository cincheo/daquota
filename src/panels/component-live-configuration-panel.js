Vue.component('component-live-configuration-panel', {
    template: `
        <div>
            <p>
            
                <div v-if="propDescriptors != null">

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
    props: ['viewModel'],
    created: function () {
        this.$eventHub.$on('style-changed', () => {
            this.formulaButtonVariant = ide.isDarkMode()?'outline-light':'outline-primary';
        });
    },
    mounted: function() {
        console.info("XXX", this.viewModel);
        this.initComponent(this.viewModel.cid);
    },
    data: () => {
        return {
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
                this.dataModel = undefined;
                this.propDescriptors = undefined;
                return;
            }
            this.dataModel = $d(this.viewModel.cid);

            this.propDescriptors = components.propDescriptors(this.viewModel);
        }
    }
});
