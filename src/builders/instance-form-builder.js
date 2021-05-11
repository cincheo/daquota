Vue.component('instance-form-builder', {
    template: `
        <b-modal id="instance-form-builder" ref="instance-form-builder" title="Build instance form" @ok="build">

            <b-form-group label="Class kind" label-size="sm" label-class="mb-0" class="mb-1">
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
<!--            <b-form-group label="Name" label-size="sm" label-class="mb-0" class="mb-1">-->
<!--                <b-form-input v-if="selectedEvent.global" v-model="selectedEvent.name" :options="selectableEventNames()" size="sm"></b-form-input>-->
<!--                <b-form-select v-else v-model="selectedEvent.name" :options="selectableEventNames()" size="sm"></b-form-select>-->
<!--            </b-form-group>-->
        </b-modal>
    `,
    data: function() {
        return {
            kind: 'entity',
            className: '',
            dataSource: '$parent',
            fields: []
        }
    },
    methods: {
        fillFields() {
            let instanceType = domainModel.classDescriptors[this.className];
            this.fields = instanceType.fields;
        },
        selectableClasses() {
            return Tools.arrayConcat([''], this.kind === 'entity' ?
                domainModel.entities : domainModel.dtos);
        },
        selectableDataSources() {
            return Tools.arrayConcat(['$parent', '$object'], components.getComponentIds().filter(cid => {
                let viewModel = components.getComponentModel(cid);
                return viewModel.type === 'ApplicationConnector';
            }));
        },
        build() {
            let instanceType = domainModel.classDescriptors[this.className];
            if (!instanceType) {
                return;
            }
            console.info("building instance view", instanceType);

            let container = components.buildInstanceForm(instanceType);
            container.dataSource = this.dataSource;
            components.registerComponentModel(container);
            components.setChild(ide.getTargetLocation(), container);
            ide.selectComponent(container.cid);
            this.$refs['instance-form-builder'].hide();

        }
    }
});


