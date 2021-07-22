Vue.component('split-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle() + ';' + $eval(viewModel.style)" :class="$eval(viewModel.class, '')">
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-row id="mainRow" v-if="viewModel.orientation === 'VERTICAL'">
                <b-col :style="componentBorderStyle()">
                    <component-view :cid="viewModel.primaryComponent.cid" keyInParent="primaryComponent" :inSelection="isEditable()"/>
                </b-col>
                <b-col :style="componentBorderStyle()">
                    <component-view :cid="viewModel.secondaryComponent.cid" keyInParent="secondaryComponent" :inSelection="isEditable()"/>
                </b-col>
            </b-row>
            <b-row id="primaryRow" v-if="viewModel.orientation === 'HORIZONTAL'">
                <b-col :style="componentBorderStyle()">
                    <component-view :cid="viewModel.primaryComponent.cid" keyInParent="primaryComponent" :inSelection="isEditable()"/>
                </b-col>
            </b-row>                
            <b-row id="secondaryRow" v-if="viewModel.orientation === 'HORIZONTAL'">
                <b-col :style="componentBorderStyle()">
                    <component-view :cid="viewModel.secondaryComponent.cid" keyInParent="secondaryComponent" :inSelection="isEditable()"/>
                </b-col>
            </b-row>
        </b-container>
    `,
    methods: {
        propNames() {
            return ["cid", "dataSource", "class", "style", "orientation", "primaryComponent", "secondaryComponent"];
        },
        customPropDescriptors() {
            return {
                orientation: {
                    type: 'select',
                    label: 'Orientation',
                    editable: true,
                    options: ['HORIZONTAL', 'VERTICAL']
                },
                primaryComponent: {
                    type: 'ref'
                },
                secondaryComponent: {
                    type: 'ref'
                }
            };
        }
    }
});
