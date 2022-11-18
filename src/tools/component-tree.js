/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2022 CINCHEO
 *                    https://www.cincheo.com
 *                    renaud.pawlak@cincheo.com
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

Vue.component('component-tree', {
    template: `
         <ul class="tree root-tree">
            <li v-for="item in rootModels" :key="item.cid">
                <component-tree-node :nodeModel="item" :filter="filter" 
                    :routeNode="!['navbar', 'shared', '__trash', $router.currentRoute.name].includes(item.cid)"
                    :componentStates="componentStates"
                >
                </component-tree-node>
            </li>
         </ul>
    `,
    created: function() {
        this.$eventHub.$on('route-changed', () => {
            this.$forceUpdate();
        });
    },
    watch: {
        componentStates: {
            handler: function () {
                console.info('componentStates changed');
                this.$forceUpdate();
            },
            deep: true
        }
    },
    props: ["rootModels", "filter"],
    data: function() {
        return {
            componentStates: ide.componentStates
        }
    }
});
