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

Vue.component('component-tool', {
    template: `
        <b-button variant="link"
            :class="'text-decoration-none '+(darkMode?'text-white':'text-dark')"
            :style="hover?(darkMode?'background-color: rgba(255, 255, 255, 0.1)':'background-color: rgba(0, 0, 0, 0.1)'):''"
            size="sm"
            pill
            v-on:click="createComponent"
            draggable
            @dragstart='startDrag($event)'
            @mouseover="hover = true"
            @mouseleave="hover = false"
        >
            <component-icon :type="type"></component-icon> {{ label }}
        </b-button>
    `,
    props: ["type", "label", "category", "darkMode"],
    data: function() {
        return {
            hover: false
        }
    },
    methods: {
        startDrag(evt) {
            evt.target.blur();
            evt.dataTransfer.dropEffect = 'copy';
            evt.dataTransfer.effectAllowed = 'all';
            evt.dataTransfer.setData('category', this.category);
            evt.dataTransfer.setData('type', this.type);
        },
        createComponent(evt) {
            evt.target.blur();
            if (this.category === 'builders') {
                if (ide.getTargetLocation()) {
                    this.$bvModal.show(this.type);
                } else {
                    this.$emit("componentNotCreated", this.type);
                }
                return;
            }
            let targetLocation = ide.getTargetLocation();
            if (targetLocation) {
                console.info("createComponent", this.type, JSON.stringify(targetLocation));
                ide.commandManager.beginGroup();
                const viewModel = ide.commandManager.execute(new CreateComponent(this.type, targetLocation.cid));
                console.info("viewModel", viewModel);
                ide.commandManager.execute(new SetChild(targetLocation, viewModel.cid));
                ide.commandManager.endGroup();
                ide.setNextTargetLocation();
                this.$emit("componentCreated", this.type);
            } else {
                this.$emit("componentNotCreated", this.type);
            }
        }
    }
});
