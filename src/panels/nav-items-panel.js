/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

Vue.component('nav-items-panel', {
    template: `
        <div v-if="viewModel">
        
            <b-form-select class="mb-2" v-model="selectedNavItem" :options="navItemOptions" :select-size="4" size="sm"></b-form-select>

            <div class="mb-3">
            
                <template v-if="selectedNavItem">
                    <b-button size="sm" @click="moveNavItemUp()" class="mr-1" :enabled="selectedNavItem && viewModel.indexOf(selectedNavItem) > 0">
                        <b-icon-arrow-up/>
                    </b-button>    
    
                     <b-button size="sm" @click="moveNavItemDown()" class="mr-1" :enabled="selectedNavItem && viewModel.indexOf(selectedNavItem) < viewModel.length">
                        <b-icon-arrow-down/>
                    </b-button>    
       
                    <b-button size="sm" @click="deleteNavItem()" class="mr-1" :enabled="selectedNavItem">
                        <b-icon-trash/>
                    </b-button>
                </template>
                
                <b-button size="sm" @click="addPageNavItem" class="text-right">
                    <b-icon-plus-circle/> Page
                </b-button>

                <b-button size="sm" @click="addNavItem" class="text-right">
                    <b-icon-plus-circle/> Item
                </b-button>
               
            </div>
            
            <div v-if="selectedNavItem">

<                <formula-editor v-if="selectedNavItem.kind !== 'Separator'" 
                    label="Label" 
                    :initValue="selectedNavItem.label" 
                    @edited="selectedNavItem.label = arguments[0]" 
                    size="sm"
                />
<
                 <b-form-group v-if="selectedNavItem.kind !== 'Separator'" label="Icon" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-input-group>
                        <b-form-input v-model="selectedNavItem.icon" size="sm"></b-form-input>
                        <b-input-group-append>                                
                            <b-button variant="info" size="sm" @click="openIconChooser(selectedNavItem, 'icon')"><b-icon-pencil></b-icon-pencil></b-button>
                        </b-input-group-append>                                    
                    </b-input-group>
                </b-form-group>

                <b-form-group label="Sub item" label-size="sm" label-class="mb-0" class="mb-1" description="If checked, the item will be part of the previous dropdown if any">
                    <b-form-checkbox v-model="selectedNavItem.subItem" size="sm" switch></b-form-checkbox>
                </b-form-group>

                <formula-editor 
                    v-if="selectedNavItem.kind !== 'Separator'" 
                    type="checkbox"
                    label="Hide item" 
                    description="If checked, this item will not show in the navbar"
                    :initValue="selectedNavItem.hidden" 
                    @edited="$set(selectedNavItem, 'hidden', arguments[0])" size="sm"
                />

                <b-form-group v-if="!(selectedNavItem.kind === undefined || selectedNavItem.kind === 'Page')"  label="Kind" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="selectedNavItem.kind" size="sm" :options="['Action', 'Anchor', 'Dropdown', 'Separator']"></b-form-select>
                </b-form-group>

                <b-form-group v-if="selectedNavItem.kind === undefined || selectedNavItem.kind === 'Page'" 
                    label="Page ID" 
                    label-size="sm" 
                    label-class="mb-0" 
                    class="mb-1"
                    description="The page ID defines a new route, which must be unique in this navigation view"
                >
                    <b-form-input v-model="selectedNavItem.pageId" size="sm" disabled></b-form-input><b-button @click="renamePageId" class="mt-1" size="sm">Rename page ID</b-button>
                </b-form-group>

                <b-form-group v-if="selectedNavItem.kind === 'Anchor'"
                    label="Anchor name" 
                    label-size="sm" 
                    label-class="mb-0" 
                    class="mb-1"
                    description="The anchor name (for a multiple-page navigation view, use 'pageId#anchorName' to avoid ambiguous locations)"
                >
                    <b-form-input v-model="selectedNavItem.anchorName" size="sm"></b-form-input>
                </b-form-group>

                <b-form-group v-if="selectedNavItem.kind === 'Action'" 
                    label="Action" 
                    label-size="sm" 
                    label-class="mb-0" 
                    class="mb-1"
                    description="A formula to evaluate when the user clicks on this item"
                >
                    <code-editor v-model="selectedNavItem.action" size="sm"
                        :contextObject="selectedNavItem"                    
                    />
                </b-form-group>


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
        openIconChooser(targetObject, propName) {
            Vue.prototype.$eventHub.$emit('icon-chooser', targetObject, propName);
        },
        addNavItem() {
            let navItem = {
                label: 'New item',
                kind: 'Action'
            };
            this.viewModel.push(navItem);
            this.fillNavItemOptions();
            console.info('navbar - selecting new navItem', navItem);
            $set(this, 'selectedNavItem', navItem);
        },
        addPageNavItem() {
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
                kind: 'Page',
                pageId: pageId
            };
            let rootContainer = components.createComponentModel('ContainerView');
            components.registerComponentModel(rootContainer, pageId);
            this.viewModel.push(navItem);
            this.fillNavItemOptions();
            console.info('navbar - selecting new navItem', navItem);
            $set(this, 'selectedNavItem', navItem);
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
            if (navItem.kind === 'Page') {
                console.info("navbar - add route to page '" + navItem + "'");
                ide.router.addRoute({
                    name: navItem.pageId,
                    path: "/" + navItem.pageId,
                    component: Vue.component('page-view')
                });
            }
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
                        text: this.navigationItemOptionText(navItem)
                    }
                });
            }
            if (selected && selected.kind == null) {
                selected.kind = 'Page';
            }
            $set(this, 'selectedNavItem', selected);
        },
        navigationItemOptionText(navigationItem) {
            if (navigationItem.kind === 'Separator') {
                return navigationItem.subItem ? ' - ' + "-----" : "-----";
            }
            let text = navigationItem.subItem ? ' - ' + navigationItem.label : navigationItem.label;
            switch (navigationItem.kind) {
                case 'Anchor':
                    text += ' (-> ' + navigationItem.anchorName + ')';
                    break;
                case 'Action':
                    text += ' (action)';
                    break;
                case 'Dropdown':
                    break;
                case 'Page':
                default:
                    text += ' (-> ' + navigationItem.pageId + ')';
            }
            return text;
        },

    }
});
