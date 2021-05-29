Vue.component('container-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle()" :class="viewModel.class">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <div :style="containerStyle()">
                <component-view v-for="(component, index) in viewModel.components" :cid="component.cid" keyInParent="components" :indexInKey="index"/>
            </div>
            <!-- empty container to allow adding of components in edit mode -->
            <component-view v-if="edit" cid="undefined" keyInParent="components" :indexInKey="viewModel.components ? viewModel.components.length : 0"/>
        </b-container>
    `,
    methods: {
        containerStyle() {
            let style = 'display: flex; overflow: auto; flex-direction: ' + (this.viewModel.direction ? this.viewModel.direction : 'column');
            if (this.viewModel.wrap) {
                style += '; flex-wrap: ' + this.viewModel.wrap;
            }
            if (this.viewModel.justify) {
                style += '; justify-content: ' + this.viewModel.justify;
            }
            if (this.viewModel.alignItems) {
                style += '; align-items: ' + this.viewModel.alignItems;
            }
            if (this.viewModel.alignContent) {
                style += '; align-content: ' + this.viewModel.alignContent;
            }
            if (ide.editMode) {
                style += '; flex-wrap: wrap';
            }
            return style;
        },
        propNames() {
            return ["cid", "dataSource", "class", "direction", "wrap", "justify", "alignItems", "alignContent", "components", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                components: {
                    type: 'ref'
                },
                direction: {
                    type: 'select',
                    options: ['column', 'column-reverse', 'row', 'row-reverse']
                },
                wrap: {
                    type: 'select',
                    options: ['nowrap', 'wrap', 'wrap-reverse']
                },
                justify: {
                    type: 'select',
                    options: ['start', 'end', 'center', 'space-between', 'space-around', 'space-evenly']
                },
                alignItems: {
                    type: 'select',
                    options: ['stretch', 'start', 'end', 'center', 'baseline']
                },
                alignContent: {
                    type: 'select',
                    options: ['normal', 'stretch', 'start', 'end', 'center', 'space-between', 'space-around']
                },
                index: 0
            };
        }
    }
});
