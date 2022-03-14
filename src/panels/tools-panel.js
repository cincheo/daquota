    Vue.component('tools-panel', {
        template: `
            <div>
            
                  <b-card body-class="p-0 pt-2 pb-4 ">
                    <template #header>
                        <b-button-toolbar class="mt-2">
                            <b-form-input v-model="userInterfaceName" style="display:inline-block" size="sm" @change="changeName"></b-form-input>                
                        </b-button-toolbar>
                        <div>
                            <center><b-button size="sm" pill variant="secondary" class="mt-2 mb-2 shadow" v-on:click="run"><b-icon icon="play"></b-icon></b-button></center>
                        </div>
                    </template>                        

                    <create-component-panel></create-component-panel>

                     <b-form-group
                      label="Filter"
                      label-for="filter-input"
                      label-cols-sm="3"
                      label-align-sm="right"
                      label-size="sm"
                      class="m-1"
                    >
                      <b-input-group size="sm">
                        <b-form-input
                          id="filter-input"
                          v-model="filter"
                          type="search"
                          placeholder="Search component"
                        ></b-form-input>
            
                        <b-input-group-append>
                          <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
    
                    <component-tree :rootModels="componentRoots(componentItems)" :filter="filter">
                    </component-tree>
                       
                </b-card>
            </div>

        `,
        data: function() {
            return {
                componentItems: [],
                filter: null,
                targetMode: false,
                userInterfaceName: userInterfaceName,
            }
        },
        created: function () {
            this.$eventHub.$on('component-created', () => {
                this.fillComponents();
            });
            this.$eventHub.$on('repository-loaded', () => {
                this.fillComponents();
            });
            this.$eventHub.$on('component-deleted', () => {
                this.fillComponents();
            });
            this.$eventHub.$on('application-loaded', () => {
                this.userInterfaceName = userInterfaceName;
                this.uis = ide.uis;
            });
        },
        mounted: function () {
            this.fillComponents();
        },
        methods: {
            changeName() {
                userInterfaceName = this.userInterfaceName;
                applicationModel.name = this.userInterfaceName;
            },
            componentRoots() {
                let roots = components.getRoots().slice(0);
                let trash = { type: 'Trash', cid: '__trash', components: [] }
                roots.push(trash);

                // move orphan roots to trash
                for (let root of roots) {
                    if (root.cid === '__trash' || root.cid === 'navbar') {
                        continue;
                    }
                    if (!applicationModel.navbar.navigationItems.find(navItem => navItem.pageId === root.cid)) {
                        trash.components.push(root);
                    }
                }
                for (let trashed of trash.components) {
                    let index = roots.indexOf(trashed);
                    if (index > -1) {
                        roots.splice(index, 1);
                    }
                }

                return roots;
            },
            fillComponents() {
                this.componentItems = Object.values(components.getComponentModels());
            },
            run() {
                ide.setEditMode(false);
            },
            setStyle(value, darkMode) {
                ide.setStyle(value, darkMode);
            }
        }
    });
