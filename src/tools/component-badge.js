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

Vue.component('component-badge', {
    template: `
        <span v-if="edit">
                <b-badge ref="badge" pill :variant="selected?'primary':(hover?'secondary':'light')" v-on:click="component.componentSelected()" style="cursor:pointer"
                    @mouseover="hover = true"
                    @mouseleave="hover = false"
                    draggable
                    @dragstart="startDrag($event, component.getComponentName())">
                    <b-badge v-if="targeted" pill variant="warning">
                        root
                    </b-badge>
                    {{ component.getComponentName() }}
        <!--            <b-badge v-if="component.viewModel.dataSource" square variant="dark">-->
                        <span v-if="component.viewModel && component.viewModel.dataSource"><b-icon icon="link"></b-icon> <span style="font-weight: 100">{{ truncate(component.viewModel.dataSource, 15) }}</span></span>
                        <span v-if="link"><b-icon icon="link"></b-icon> <span style="font-weight: 200">{{ link }}</span></span>
        <!--            </b-badge>-->
                </b-badge>
            <b-button size="sm" variant="link" @click="editComponent" class="show-mobile"><b-icon icon="pencil"></b-icon></b-button>
        </span>
    `,
    props: ["component", "selected", "targeted", "edit", "link"],
    data: function() {
        return {
            hover: false
        }
    },
    methods: {
        truncate: function(str, size) {
            return Tools.truncate(str, size);
        },
        editComponent: function() {
            this.$root.$emit('bv::show::modal', 'component-modal');
            this.$eventHub.$emit('component-selected', this.component.cid);
        },
        startDrag: function(evt, cid) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'all'
            evt.dataTransfer.setData('cid', cid)
        }
    }
});
