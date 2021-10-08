Vue.component('application-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-alert v-if="edit" variant="warning" show>Unavailable - please activate the <b>backend4dLite plugin</b> in order to load this connector</b-alert>
        </div>
    `,
    methods: {
        propNames() {
            return [];
        }
    }
});


