Vue.component('nav-items-panel', {
    template: `
        <div v-if="viewModel">
        
            <b-form-select class="mb-2" v-model="selectedNavItem" :options="navItemOptions" :select-size="4" size="sm"></b-form-select>
            
            <div v-if="selectedNavItem">
                <div class="mb-3">
                    <b-button size="sm" @click="moveNavItemUp()" class="mr-1" :enabled="selectedNavItem && viewModel.indexOf(selectedNavItem) > 0">
                        <b-icon-arrow-up></b-icon-arrow-up>
                    </b-button>    

                     <b-button size="sm" @click="moveNavItemDown()" class="mr-1" :enabled="selectedNavItem && viewModel.indexOf(selectedNavItem) < viewModel.length">
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

                <b-form-group label="Kind" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="selectedNavItem.kind" size="sm" :options="['Page', 'Anchor']"></b-form-select>
                </b-form-group>

                <b-form-group v-if="selectedNavItem.kind === 'Page'" label="Page ID" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedNavItem.pageId" size="sm" disabled></b-form-input><b-button @click="renamePageId" class="mt-1" size="sm">Rename page ID</b-button>
                </b-form-group>

                <b-form-group v-if="selectedNavItem.kind === 'Anchor'" label="Anchor name" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="selectedNavItem.anchorName" size="sm"></b-form-input>
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
            navItemOptions: [],
            selectedNavItem: undefined
        }
    },
    mounted: function() {
        this.fillNavItemOptions();
        if (this.viewModel.length > 0) {
            $set(this, 'selectedNavItem', this.viewModel[0]);
        }
    },
    watch: {
        viewModel: {
            handler: function () {
                if (this.viewModel) {
                    this.fillNavItemOptions();
                }
                //$set(this, 'selectedNavItem', undefined);
            },
            immediate: true,
            deep: true
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
            this.viewModel.push(navItem);
            this.fillNavItemOptions();
            $set(this, 'selectedNavItem', navItem);
            if (this.selectedNavItem.kind === 'Page') {
                this.addRoute(this.selectedNavItem);
            }
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
            const index = this.viewModel.indexOf(this.selectedNavItem);
            if (index > -1) {
                this.viewModel.splice(index, 1);
                this.selectedNavItem = undefined;
            }
        },
        moveNavItemUp() {
            const index = this.viewModel.indexOf(this.selectedNavItem);
            if (index > 0) {
                Tools.arrayMove(this.viewModel, index, index - 1);
                Tools.arrayMove(this.navItemOptions, index, index - 1);
            }
        },
        moveNavItemDown() {
            const index = this.viewModel.indexOf(this.selectedNavItem);
            if (index > -1) {
                Tools.arrayMove(this.viewModel, index, index + 1);
                Tools.arrayMove(this.navItemOptions, index, index + 1);
            }
        },
        fillNavItemOptions() {
            let selected = this.selectedNavItem;
            this.selectedNavItem = undefined;
            if (!this.viewModel) {
                this.navItemOptions = undefined;
            } else {
                this.navItemOptions = this.viewModel.map(navItem => {
                    return {
                        value: navItem,
                        text: navItem.label
                    }
                });
            }
            if (selected && selected.kind == null) {
                selected.kind = 'Page';
            }
            $set(this, 'selectedNavItem', selected);
        }
    }
});
