Vue.component('instance-form-builder', {
    template: `
        <b-modal id="instance-form-builder" ref="instance-form-builder" title="Build instance form" @ok="build">

            <b-form-group label="Model" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="model" :options="getModels()" size="sm"></b-form-select>
            </b-form-group>
            <b-form-group v-if='!model' label="Class kind" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="kind" :options="['entity', 'dto']" size="sm"></b-form-select>
            </b-form-group>
            <b-form-group label="Class name" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="className" :options="selectableClasses()" size="sm" @change="fillFields"></b-form-select>
            </b-form-group>
            <b-form-textarea
                disabled
                id="textarea"
                v-model="fields"
                rows="3"
                size="sm" 
                max-rows="6"></b-form-textarea>
            <b-form-group label="Data source" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="dataSource" :options="selectableDataSources()" size="sm"></b-form-select>
            </b-form-group>
            <b-form-group label="Inline" label-size="sm" label-cols="8" label-class="mb-0 mt-0" class="mb-1">
                <b-form-checkbox v-model="inline" size="sm" switch class="float-right"></b-form-checkbox>
            </b-form-group>
<!--            <b-form-group label="Name" label-size="sm" label-class="mb-0" class="mb-1">-->
<!--                <b-form-input v-if="selectedEvent.global" v-model="selectedEvent.name" :options="selectableEventNames()" size="sm"></b-form-input>-->
<!--                <b-form-select v-else v-model="selectedEvent.name" :options="selectableEventNames()" size="sm"></b-form-select>-->
<!--            </b-form-group>-->
        </b-modal>
    `,
    data: function() {
        return {
            model: undefined,
            kind: 'entity',
            className: '',
            dataSource: '$parent',
            fields: [],
            inline: false
        }
    },
    methods: {
        getModels() {
            return Tools.arrayConcat([''], JSON.parse(localStorage.getItem('dlite.models')).map(m => m.name));
        },
        fillFields() {
            if (this.model) {
                this.fields = this.loadedClasses.find(c => c.name === this.className).fields;
            } else {
                let instanceType = ide.getDomainModel().classDescriptors[this.className];
                this.fields = instanceType.fields;
            }
        },
        selectableClasses() {
            if (this.model) {
                this.loadedClasses = JSON.parse(localStorage.getItem('dlite.models.' + this.model));
                return this.loadedClasses.map(c => c.name);
            } else {
                return Tools.arrayConcat([''], this.kind === 'entity' ?
                    ide.getDomainModel().entities : ide.getDomainModel().dtos);
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
            if (this.model) {
                instanceType = this.loadedClasses.find(c => c.name === this.className);
            } else {
                instanceType = ide.getDomainModel().classDescriptors[this.className];
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


