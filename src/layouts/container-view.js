Vue.component('container-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle()" :class="viewModel.class">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <div v-for="(component, index) in viewModel.components" :style="'display:' + viewModel.layout">
                <component-view :cid="component.cid" keyInParent="components" :indexInKey="index"/>
            </div>
            <!-- empty container to allow adding of components in edit mode -->
            <component-view v-if="edit" cid="undefined" keyInParent="components" :indexInKey="viewModel.components ? viewModel.components.length : 0"/>
        </b-container>
    `,
    methods: {
        propNames() {
            return ["cid", "dataSource", "class", "layout", "components", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                components: {
                    type: 'ref'
                },
                layout: {
                    type: 'select',
                    options: ['block', 'inline-block']
                },
                index: 0
            };
        }
    }
});
