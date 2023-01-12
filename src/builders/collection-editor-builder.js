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


Vue.component('collection-editor-builder', {
    template: `
        <b-modal id="collection-editor-builder" ref="collection-editor-builder" title="Build collection editor" @ok="build" @show="onShow" @hide="onHide" lazy>

            <template v-if="!modelParser">
                 <b-form-group label="Model" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="modelName" :options="models" size="sm"></b-form-select>
                </b-form-group>
               
                <b-form-group label="Component class" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-select v-model="className" :options="selectableClassesForModel()" size="sm"></b-form-select>
                </b-form-group>
    
                <b-form-group label="Storage key" label-size="sm" label-class="mb-0" class="mb-1">
                    <b-form-input v-model="key" size="sm"></b-form-input>
                </b-form-group>
            </template>

            <b-form-group label="Container component type" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="collectionContainerType" :options="['Table', 'Iterator', 'IteratorTable']" size="sm"></b-form-select>
            </b-form-group>
            
            <b-form-group label="Allow create instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                <b-form-checkbox v-model="createInstance" size="sm" switch class="float-right"></b-form-checkbox>
            </b-form-group>
            
            <b-form-group label="Allow update instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                <b-form-checkbox v-model="updateInstance" size="sm" switch class="float-right"></b-form-checkbox>
            </b-form-group>
            
            <b-form-group label="Allow delete instance" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                <b-form-checkbox v-model="deleteInstance" size="sm" switch class="float-right"></b-form-checkbox>
            </b-form-group>

            <template v-if="!modelParser">

                <b-form-group label="Use class name in buttons" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                    <b-form-checkbox v-model="useClassNameInButtons" size="sm" switch class="float-right"></b-form-checkbox>
                </b-form-group>
            
            </template>
           
            <b-form-group v-if="collectionContainerType === 'Table'" label="Split views for large screens" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                <b-form-checkbox v-model="split" size="sm" switch class="float-right"></b-form-checkbox>
            </b-form-group>
                
        </b-modal>
    `,
    data: function () {
        return {
            key: undefined,
            modelName: 'default',
            className: undefined,
            methodName: undefined,
            instanceType: undefined,
            createInstance: false,
            updateInstance: false,
            deleteInstance: false,
            useClassNameInButtons: false,
            split: false,
            collectionContainerType: 'Table',
            models: this.getModels(),
            modelParser: undefined,
            dataSource: undefined,
            dataModel: undefined
        }
    },
    methods: {
        onShow() {
            if (ide.magicContext) {
                this.modelParser = ide.magicContext.modelParser;
                this.dataSource = ide.magicContext.dataSource;
                this.dataModel = ide.magicContext.dataModel;
            } else {
                this.models = this.getModels();
            }
        },
        onHide() {
            if (ide.magicContext) {
                this.modelParser = undefined;
                this.dataSource = undefined;
                this.dataModel = undefined;
                ide.magicContext = undefined;
            }
        },
        getModels() {
            return components.getModels()?.map(m => m.name);
        },
        selectableClassesForModel() {
            if (this.modelName) {
                return components.getModelClasses(this.modelName).map(c => c.name);
            } else {
                return [];
            }
        },
        build() {
            let container;
            ide.commandManager.beginGroup();
            if (this.modelParser) {
                container = ide.commandManager.execute(new BuildCollectionEditor(
                    this.modelParser,
                    this.modelParser.parsedClasses[0],
                    undefined,
                    this.split,
                    this.collectionContainerType,
                    this.createInstance,
                    this.updateInstance,
                    this.deleteInstance,
                    false,
                    this.dataSource
                ));
            } else {
                this.instanceType = components.getModelClasses(this.modelName).find(c => c.name === this.className);
                container = ide.commandManager.execute(new BuildCollectionEditor(
                    components.defaultModelProvider(),
                    this.instanceType,
                    this.key,
                    this.split,
                    this.collectionContainerType,
                    this.createInstance,
                    this.updateInstance,
                    this.deleteInstance,
                    this.useClassNameInButtons
                ));
            }
            ide.commandManager.execute(new SetChild(ide.getTargetLocation(), container.cid));
            ide.commandManager.endGroup();
            ide.setComponentDataModel(container.cid, this.dataModel);
            ide.setNextTargetLocation();

            this.$refs['collection-editor-builder'].hide();

        }
    }
});


