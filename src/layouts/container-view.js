Vue.component('container-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle()" :class="$eval(viewModel.class, '')">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <div :style="containerStyle()">
                <component-view v-for="(component, index) in viewModel.components" :key="component.cid" :cid="component.cid" keyInParent="components" :indexInKey="index" :inSelection="isEditable()"/>
                <!-- empty container to allow adding of components in edit mode -->
                <component-view v-if="edit" cid="undefined" keyInParent="components" :indexInKey="viewModel.components ? viewModel.components.length : 0" :inSelection="isEditable()"/>
            </div>
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
            if (this.viewModel.style) {
                style += '; ' + this.$eval(this.viewModel.style);
            }
            if (ide.editMode) {
                style += '; flex-wrap: wrap';
            }
            return style;
        },
        propNames() {
            return ["cid", "dataSource", "class", "style", "direction", "wrap", "justify", "alignItems", "alignContent", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                components: {
                    type: 'ref'
                },
                direction: {
                    type: 'select',
                    options: ['column', 'column-reverse', 'row', 'row-reverse'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#flex-direction'
                },
                wrap: {
                    type: 'select',
                    options: ['nowrap', 'wrap', 'wrap-reverse'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#flex-wrap'
                },
                justify: {
                    type: 'select',
                    options: ['start', 'end', 'center', 'space-between', 'space-around', 'space-evenly'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#justify-content'
                },
                alignItems: {
                    type: 'select',
                    options: ['stretch', 'start', 'end', 'center', 'baseline'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#align-items'
                },
                alignContent: {
                    type: 'select',
                    options: ['normal', 'stretch', 'start', 'end', 'center', 'space-between', 'space-around'],
                    docLink: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/#align-content'
                },
                index: 0
            };
        }
    }
});
