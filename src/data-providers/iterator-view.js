Vue.component('iterator-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle() + ';' + $eval(viewModel.style)">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
                <component-view v-for="(item, index) in value" :key="index" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :iteratorIndex="index" :inSelection="isEditable()" />
                <component-view v-if="edit && (!Array.isArray(value) || value.length == 0)" :cid="viewModel.body ? viewModel.body.cid : undefined" keyInParent="body" :inSelection="isEditable()" :iteratorIndex="0" />
            </b-card>
        </div>
    `,
    methods: {
        propNames() {
            return ["cid", "dataSource", "field", "class", "style", "body", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                body: {
                    type: 'ref',
                    editable: true
                }
            }
        }

    }
});


