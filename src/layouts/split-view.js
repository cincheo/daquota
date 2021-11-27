Vue.component('split-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle() + ';' + $eval(viewModel.style)" :class="componentClass()"
            :draggable="$eval(viewModel.draggable, false) ? true : false" 
            v-on="boundEventHandlers({'click': onClick})"
         >
            <component-icon v-if="isEditable()" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            
            <div id="mainRow" :style="viewModel.orientation === 'VERTICAL' ? 'display: flex; height: 100%' : 'height: 100%'">
                <div :id="cid+'-split-1'" :style="componentBorderStyle() + '; overflow: auto; flex-grow: ' + primaryComponentSize()">
                    <component-view :cid="viewModel.primaryComponent?.cid" keyInParent="primaryComponent" :inSelection="isEditable()" />
                </div>
                <div :id="cid+'-split-2'"  :style="componentBorderStyle() + '; overflow: auto; flex-grow: ' + secondaryComponentSize()">
                    <component-view :cid="viewModel.secondaryComponent?.cid" keyInParent="secondaryComponent" :inSelection="isEditable()" />
                </div>
            </div>
        </b-container>
    `,
    mounted: function () {
        this.applySplitConfiguration();
    },
    watch: {
        "viewModel.orientation": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.resizableSplit": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.gutterSize": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.primaryComponentSize": {
            handler: function () {
                this.applySplitConfiguration();
            }
        },
        "viewModel.secondaryComponentSize": {
            handler: function () {
                this.applySplitConfiguration();
            }
        }
    },
    methods: {
        primaryComponentSize() {
            let size = this.$eval(this.viewModel.primaryComponentSize, 50);
            if (size) {
                return parseInt(size);
            } else {
                return 50;
            }
        },
        secondaryComponentSize() {
            let size = this.$eval(this.viewModel.secondaryComponentSize, 50);
            if (size) {
                return parseInt(size);
            } else {
                return 50;
            }
        },
        applySplitConfiguration() {
            if (this.splitInstance) {
                try {
                    this.splitInstance.destroy();
                } catch (e) {
                    console.warn('error destroying split instance');
                }
                this.splitInstance = undefined;
            }
            if (!this.$eval(this.viewModel.resizableSplit)) {
                return;
            }
            try {
                const options = {
                    direction: (this.$eval(this.viewModel.orientation) === 'VERTICAL' ? 'horizontal' : 'vertical'),
                    minSize: 0,
                    sizes: [
                        this.primaryComponentSize(),
                        this.secondaryComponentSize()
                    ]
                };
                if (this.viewModel.gutterSize) {
                    options.gutterSize = parseInt(this.$eval(this.viewModel.gutterSize, 10));
                }
                console.info('split instance', options);
                this.splitInstance = Split([`#${this.cid}-split-1`, `#${this.cid}-split-2`], options);
            } catch (e) {
                console.info('error in applying split configuration', e);
            }
        },
        propNames() {
            return [
                "cid",
                "dataSource",
                "field",
                "resizableSplit",
                "fillHeight",
                "orientation",
                "gutterSize",
                "primaryComponent",
                "primaryComponentSize",
                "secondaryComponent",
                "secondaryComponentSize"
            ];
        },
        customPropDescriptors() {
            return {
                resizableSplit: {
                    type: 'checkbox'
                },
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                },
                orientation: {
                    type: 'select',
                    label: 'Orientation',
                    editable: true,
                    options: ['HORIZONTAL', 'VERTICAL']
                },
                primaryComponent: {
                    type: 'ref',
                    editable: false
                },
                secondaryComponent: {
                    type: 'ref',
                    editable: false
                },
                primaryComponentSize: {
                    type: 'number',
                    label: 'Primary component (initial) size (in %)',
                    editable: true
                },
                secondaryComponentSize: {
                    type: 'number',
                    label: 'Secondary component (initial) size (in %)',
                    editable: true
                }
            };
        }
    }
});
