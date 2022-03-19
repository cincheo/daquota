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

Vue.component('component-tool', {
    template: `
        <b-button variant="link" size="sm" class="text-decoration-none drag-el"
            v-on:click="createComponent"
            draggable
            @dragstart='startDrag($event)'
        >
            <component-icon :type="type"></component-icon> {{ label }}
        </b-button>
    `,
    props: ["type", "label", "category"],
    methods: {
        startDrag(evt) {
            evt.dataTransfer.dropEffect = 'copy';
            evt.dataTransfer.effectAllowed = 'all';
            evt.dataTransfer.setData('category', this.category);
            evt.dataTransfer.setData('type', this.type);
        },
        createComponent() {
            if (this.category === 'builders') {
                if (ide.getTargetLocation()) {
                    this.$bvModal.show(this.type);

//                    this.showBuilder(this.type);
                } else {
                    this.$emit("componentNotCreated", this.type);
                }
                return;
            }
            let targetLocation = ide.getTargetLocation();
            if (targetLocation) {
                console.info("createComponent", this.type);
                const viewModel = components.createComponentModel(this.type);
                components.registerComponentModel(viewModel);
                console.info("viewModel", viewModel);
                components.setChild(targetLocation, viewModel);
                ide.selectComponent(viewModel.cid);
                if (ide.targetLocation && typeof ide.targetLocation.index === 'number') {
                    let newTargetLocation = ide.targetLocation;
                    newTargetLocation.index++;
                    ide.setTargetLocation(newTargetLocation);
                }
                this.$emit("componentCreated", this.type);
            } else {
                this.$emit("componentNotCreated", this.type);
            }
        }
    }
});
