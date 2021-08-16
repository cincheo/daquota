Vue.component('nav-items-panel', {
    template: `
        <div v-if="viewModel">
        
            <b-form-select class="mb-2" v-model="selectedNavItem" :options="navItemOptions" :select-size="4" size="sm"></b-form-select>
            
            <div v-if="selectedNavItem">
                <div class="mb-3">
                    <b-button size="sm" @click="moveNavItemUp()" class="mr-1" :enabled="selectedNavItem && data_model.indexOf(selectedNavItem) > 0">
                        <b-icon-arrow-up></b-icon-arrow-up>
                    </b-button>    

                     <b-button size="sm" @click="moveNavItemDown()" class="mr-1" :enabled="selectedNavItem && data_model.indexOf(selectedNavItem) < data_model.length">
                        <b-icon-arrow-down></b-icon-arrow-down>
                    </b-button>    
                     <b-button size="sm" @click="deleteNavItem()" class="mr-1" :enabled="selectedNavItem">
                        <b-icon-trash></b-icon-trash>
                    </b-button>    
                    
                    <b-button size="sm" @click="addNavItem" class="text-right">
                        <b-icon-plus-circle></b-icon-plus-circle>
                    </b-button>
                   
                </div>

                 <b-form-group label="Label" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedNavItem.label" size="sm"></b-form-input>
                </b-form-group>
           
                <b-form-group label="Page ID" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedNavItem.pageId" size="sm" disabled></b-form-input><b-button @click="renamePageId" class="mt-1" size="sm">Rename page ID</b-button>
                </b-form-group>

            </div>                              
            <div v-else>
                <b-button size="sm" @click="addNavItem" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle> new navigation item
                </b-button>                      
            </div>            
    
        </div>                   
        `,
    props: ['viewModel', 'prop', 'selectedComponentModel'],
    data: () => {
        return {
            data_model: undefined,
            navItemOptions: [],
            selectedNavItem: undefined
        }
    },
    mounted: function() {
        this.data_model = this.viewModel;
        this.fillNavItemOptions();
        if (this.data_model.length > 0) {
            this.selectedNavItem = this.data_model[0];
        }
    },
    watch: {
        data_model: {
            handler: function () {
                if (this.data_model) {
                    this.fillNavItemOptions();
                }
            },
            immediate: true,
            deep: true
        },
        // selectedNavItem: {
        //     handler: function() {
        //         this.fillNavItemOptions();
        //     },
        //     deep: true,
        //     immediate: true
        // },
        viewModel: function() {
            this.data_model = this.viewModel;
            this.selectedNavItem = undefined;
        }
    },
    methods: {
        addNavItem() {
            let pageId = prompt('Enter a page ID for the navigation item (also the page root component name)');
            if (!pageId || pageId === '') {
                return;
            }
            if (components.getComponentIds().indexOf(pageId) !== -1) {
                alert('The provided page ID corresponds to an already defined component. Please choose another ID.');
                return;
            }
            let navItem = {
                label: 'New navigation item',
                pageId: pageId
            };
            let rootContainer = components.createComponentModel('ContainerView');
            components.registerComponentModel(rootContainer, pageId);
            this.data_model.push(navItem);
            this.fillNavItemOptions();
            this.selectedNavItem = navItem;
            this.addRoute(this.selectedNavItem);
        },
        renamePageId() {
            let pageId = prompt('Enter a page ID for the navigation item (also the page root component name)', this.selectedNavItem.pageId);
            if (!pageId || pageId === '') {
                return;
            }
            if (components.getComponentIds().indexOf(pageId) !== -1) {
                alert('The provided page ID corresponds to an already defined component. Please choose another ID.');
                return;
            }
            let rootContainer = components.getComponentModel(this.selectedNavItem.pageId);
            if (rootContainer) {
                components.unregisterComponentModel(this.selectedNavItem.pageId);
            }
            components.registerComponentModel(rootContainer, pageId);
            this.selectedNavItem.pageId = pageId;
            this.fillNavItemOptions();
            this.addRoute(this.selectedNavItem);
        },
        addRoute(navItem) {
            console.info("add route to page '" + navItem.pageId + "'");
            ide.router.addRoute({
                name: navItem.pageId,
                path: "/" + navItem.pageId,
                component: Vue.component('page-view')
            });
        },
        deleteNavItem() {
            const index = this.data_model.indexOf(this.selectedNavItem);
            if (index > -1) {
                this.data_model.splice(index, 1);
                this.selectedNavItem = undefined;
            }
        },
        moveNavItemUp() {
            const index = this.data_model.indexOf(this.selectedNavItem);
            if (index > 0) {
                Tools.arrayMove(this.data_model, index, index - 1);
                Tools.arrayMove(this.navItemOptions, index, index - 1);
            }
        },
        moveNavItemDown() {
            const index = this.data_model.indexOf(this.selectedNavItem);
            if (index > -1) {
                Tools.arrayMove(this.data_model, index, index + 1);
                Tools.arrayMove(this.navItemOptions, index, index + 1);
            }
        },
        fillNavItemOptions() {
            let selected = this.selectedNavItem;
            this.selectedNavItem = undefined;
            if (!this.data_model) {
                this.navItemOptions = undefined;
            } else {
                this.navItemOptions = this.data_model.map(navItem => {
                    return {
                        value: navItem,
                        text: navItem.label
                    }
                });
            }
            this.selectedNavItem = selected;
        }
    }
});
