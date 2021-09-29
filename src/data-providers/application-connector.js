Vue.component('application-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-alert variant="warning" show>Unavailable component</b-alert>
        </div>
    `,
    methods: {
        propNames() {
            return [];
        }
    }
});


