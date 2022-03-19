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

Vue.component('instance-form-builder', {
    template: `
        <b-modal id="instance-form-builder" ref="instance-form-builder" title="Build instance form" @ok="build">

             <b-form-group label="Model" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="modelName" :options="getModels()" size="sm"></b-form-select>
            </b-form-group>
           
            <b-form-group label="Component class" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="className" :options="selectableClassesForModel()" size="sm"></b-form-select>
            </b-form-group>
            <b-form-group label="Data source" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="dataSource" :options="selectableDataSources()" size="sm"></b-form-select>
            </b-form-group>
            <b-form-group label="Inline" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                <b-form-checkbox v-model="inline" size="sm" switch class="float-right"></b-form-checkbox>
            </b-form-group>
        </b-modal>
    `,
    data: function() {
        return {
            modelName: 'default',
            className: '',
            dataSource: '$parent',
            inline: false
        }
    },
    methods: {
        getModels() {
            return components.getModels()?.map(m => m.name);
        },
        selectableClassesForModel() {
            if (this.modelName) {
                return components.getModelClasses(this.modelName)?.map(c => c.name);
            } else {
                return [];
            }
        },
        selectableDataSources() {
            return Tools.arrayConcat(['$parent', '$object'], components.getComponentIds().filter(cid => {
                let viewModel = components.getComponentModel(cid);
                return viewModel.type === 'ApplicationConnector';
            }));
        },
        build() {
            let instanceType = undefined;
            if (this.modelName) {
                instanceType = components.getModelClasses(this.modelName)?.find(c => c.name === this.className);
            }
            if (!instanceType) {
                return;
            }
            console.info("building instance view", instanceType);
            let container = components.buildInstanceForm(instanceType, this.inline);
            container.dataSource = this.dataSource;
            components.registerComponentModel(container);
            components.setChild(ide.getTargetLocation(), container);
            ide.selectComponent(container.cid);
            this.$refs['instance-form-builder'].hide();
        }
    }
});


