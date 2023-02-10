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

Vue.component('tools-panel', {
    template: `
        <div>
            <div v-if="selectedApplication" class="text-center d-flex align-items-center">
                <span class="mx-1">{{ selectedApplication.name }}</span><b-badge variant="info">{{ selectedVersion.version }}</b-badge>
            </div>
            <template v-else>
                <b-form-input v-model="applicationModel.name" 
                    style="display:inline-block" size="sm" 
                />
                <b-form-input v-model="applicationModel.version" 
                    style="display:inline-block" size="sm"
                />
            </template>
            <div class="text-center">
                <b-button 
                    v-if="canPlay"
                    id="ide-play-button"
                    size="sm" pill 
                    :variant="embedded ? 'warning' : 'secondary'" 
                    title="Play this application" 
                    class="mt-2 mb-2 shadow" v-on:click="run"
                >
                    <b-icon-play/>
                </b-button>
                <b-button 
                    v-if="embedded"
                    size="sm" pill 
                    variant="warning" 
                    title="Quit embedded application edition mode" 
                    class="mt-2 mb-2 shadow" v-on:click="quit"
                >
                    <b-icon-x/>
                </b-button>
            </div>

            <create-component-panel :darkMode="darkMode"></create-component-panel>

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
                />
    
                <b-input-group-append>
                    <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>

            <component-tree :rootModels="componentRoots(componentItems)" :filter="filter" :componentStates="componentStates">
            </component-tree>
               
        </div>

    `,
    props: ['componentStates', 'darkMode', 'applicationModel', 'selectedApplication', 'selectedVersion'],
    data: function() {
        return {
            componentItems: [],
            filter: null,
            targetMode: false
        }
    },
    computed: {
        embedded: function() {
            return ide.isEmbeddedApplication();
        },
        canPlay: function() {
            return true;
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
    },
    mounted: function () {
        this.fillComponents();
    },
    methods: {
        componentRoots() {
            let roots = components.getRoots().slice(0);
            let trash = { type: 'Trash', cid: '__trash', components: [] }
            roots.push(trash);
            $tools.arrayMove(roots, roots.findIndex(model => model.cid === 'shared'), 1);

            // move orphan roots to trash
            for (let root of roots) {
                if (root.cid === '__trash' || root.cid === 'navbar' || root.cid === 'shared') {
                    continue;
                }
                if ($c('navbar') && !$c('navbar').navigationItems().find(navItem => navItem.pageId === root.cid)) {
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
            this.componentItems = components.getComponentModels();
        },
        run() {
            ide.setEditMode(false);
        },
        quit() {
            ide.setEditMode(false);
            ide.setFocusedEmbedded(false);
        },
        setStyle(value, darkMode) {
            ide.setStyle(value, darkMode);
        }
    }
});
