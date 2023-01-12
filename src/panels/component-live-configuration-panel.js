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
