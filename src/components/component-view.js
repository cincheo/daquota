Vue.component('component-view', {
    template: `
        <div v-if="viewModel" :id="'cc-'+viewModel.cid" :ref="viewModel.cid" :style="isEditable() ? style : ''" 
            :class="'component-container' + (viewModel.layoutClass ? ' ' + viewModel.layoutClass : '')"
            >
            <b-popover :ref="'popover-'+viewModel.cid" :target="viewModel.cid" custom-class="p-0"
                placement="top" 
                triggers="manual" 
                :fallback-placement="[]"
                :noninteractive="true"
                boundary="window"
                boundary-padding="0"
                >
                <b-icon :icon="selected ? 'unlock' : 'lock'" class="mr-2" :variant="selected ? 'success' : 'danger'" size="lg"></b-icon>
                <component-icon :type="viewModel.type" class="mr-2" size="sm"></component-icon>{{ viewModel.cid }}
            </b-popover>           
            <div v-if="edit && locked === undefined && !isRoot()"
                @click="onDropZoneClicked"
                ref="drop-zone"
                :class="dropZoneClass()"
                @drop="onDrop($event)"
                @mouseover="onDragEnter"
                @mouseleave="onDragLeave"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover.prevent
                @dragenter.prevent
            >
                <b-button v-if="highLighted" size="sm" variant="link" @click="createComponentModal"><b-icon icon="plus-circle"></b-icon></b-button>
            </div>
            <collection-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CollectionView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
            </collection-view>
            
            <instance-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InstanceView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
            </instance-view>

            <table-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TableView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
            </table-view>

             <split-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'SplitView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </split-view>
             
             <navbar-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'NavbarView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </navbar-view>

             <dialog-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'DialogView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </dialog-view>
             
             <container-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ContainerView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </container-view>

             <collection-provider ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CollectionProvider'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </collection-provider>

             <instance-provider ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InstanceProvider'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </instance-provider>

             <input-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InputView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </input-view>

             <button-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ButtonView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </button-view>

             <checkbox-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CheckboxView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </checkbox-view>

             <select-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'SelectView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </select-view>

             <card-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CardView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </card-view>

             <image-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ImageView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </image-view>

             <chart-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ChartView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </chart-view>

             <time-series-chart-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TimeSeriesChartView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </time-series-chart-view>

             <application-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ApplicationConnector'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </application-connector>
             
             <cookie-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CookieConnector'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </cookie-connector>

             <local-storage-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'LocalStorageConnector'" :iteratorIndex="iteratorIndex">
             </local-storage-connector>
            
             <data-mapper ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'DataMapper'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </data-mapper>

             <iterator-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'IteratorView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </iterator-view>

             <text-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TextView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </text-view>

             <datepicker-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'DatepickerView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </datepicker-view>

             <icon-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'IconView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </icon-view>

             <pagination-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'PaginationView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </pagination-view>

             <span v-if="viewModel.type === 'Undefined'" :id="viewModel.id"></span>
         
             <b-alert v-if="viewModel.type == null" show variant="danger">Undefined component type.</b-alert>
             
        </div>
        <div v-else>
            <div :class="dropZoneClass()" v-if="edit && locked === undefined" 
                @drop="onDrop($event)"
                @click="onDropZoneClicked"
                @mouseover="onDragEnter"
                @mouseleave="onDragLeave"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover.prevent
                @dragenter.prevent
                >
                <b-button v-if="highLighted" size="sm" variant="link" @click="createComponentModal"><b-icon icon="plus-circle"></b-icon></b-button>
            </div>
            <b-alert v-else show variant="warning">{{ locked ? locked : 'Requested component does not exist.' }}</b-alert>
        </div>       
    `,
    props: ['cid', 'keyInParent', 'indexInKey', 'locked', 'iteratorIndex', "inSelection"],
    data: function() {
        return {
            viewModel: undefined,
            edit: ide.editMode,
            hOver: false,
            highLighted: false,
            hovered: false,
            selected: false,
            style: 'border: dotted lightgrey 1px; max-width: 100%',
            location: ''
        }
    },
    watch: {
        cid: function(cid) { this.updateViewModel(); },
        hovered: {
            handler: function (value) {
                if (!this.viewModel) {
                    return;
                }
                let popover = 'popover-' + this.cid;
                if (this.hovered) {
                    ide.updateHoverOverlay(this.cid);
                    ide.showHoverOverlay();
                    if (!this.isEditable()) {
                        this.$refs[popover].$emit('open');
                    }
                } else {
                    if (!this.selected) {
                        if (!this.isEditable()) {
                            this.$refs[popover].$emit('close');
                        }
                    }
                }
            },
            immediate: true
        },
        selected: {
            handler: function () {
                console.info("SELECTED", this.cid);
                if (!this.viewModel) {
                    return;
                }
                let popover = 'popover-' + this.cid;
                if (this.selected) {
                    if (!this.isEditable()) {
                        //this.$refs[popover].$emit('close');
                    }
                    ide.updateSelectionOverlay(this.cid);
                    ide.showSelectionOverlay();
                } else {
                    this.$refs[popover].$emit('close');
                }
            },
            immediate: true
        },

    },
    created: function () {
        this.$eventHub.$on('edit', (edit) => {
            this.edit = edit;
        });
        this.$eventHub.$on('target-location-selected', (location) => {
            this.hOver = false;
            if (!location) {
                this.highLighted = false;
            } else {
                this.highLighted = (location.cid === this.$parent.cid && location.key === this.keyInParent && location.index === this.indexInKey);
            }
        });
        this.$eventHub.$on('component-updated', (cid) => {
            if (this.viewModel && cid === this.viewModel.cid) {
                this.viewModel = components.getComponentModel(cid);
            }
        });
        this.$eventHub.$on('component-hovered', (cid, hovered) => {
            this.hovered = (cid && (cid === this.cid)) && hovered;
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = cid && (cid === this.cid);
        });
    },
    mounted: function () {
        this.updateViewModel();
    },
    updated: function () {
        console.info("UPDATED", this.viewModel);
        if (this.viewModel && this.viewModel.cid) {
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);
        }
    },
    methods: {
        isRoot() {
            if(this.viewModel && this.viewModel.cid) {
                return components.getRoots().map(c => c.cid).indexOf(this.viewModel.cid) > -1;
            } else {
                return true;
            }
        },
        // isEditable() {
        //     return this.edit && this.inSelection;
        // },
        isEditable() {
            return this.edit && (this.targeted || this.inSelection);
        },
        createComponentModal: function(e) {
            e.stopPropagation();
            // ide.setTargetLocation({
            //     cid: this.$parent.cid,
            //     key: this.keyInParent,
            //     index: this.indexInKey
            // });
            // this.highLighted = true;
            this.$root.$emit('bv::show::modal', 'create-component-modal');
            //this.$eventHub.$emit('component-selected', this.component.cid);
        },
        dropZoneClass() {
            return this.hOver || this.highLighted ? 'active-drop-zone' : 'drop-zone';
        },
        showBuilder(id) {
            ide.setTargetLocation({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            });
            this.$bvModal.show(id);
        },
        createComponent(type) {
            console.info("createComponent", type, this.keyInParent, this.$parent.cid);
            const viewModel = components.createComponentModel(type);
            components.registerComponentModel(viewModel);
            components.setChild({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            }, viewModel);
            ide.selectComponent(viewModel.cid);
        },
        setComponent(cid) {
            const containerView = components.getContainerView(cid);
            if(containerView) {
                let keyInParent = containerView.keyInParent;
                components.unsetChild({
                    cid: containerView.$parent.cid,
                    key: keyInParent,
                    index: containerView.indexInKey
                });
            }
            const viewModel = components.getComponentModel(cid);
            components.setChild({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            }, viewModel);
            ide.selectComponent(viewModel.cid);
        },
        updateViewModel() {
            // if (this.viewModel && this.viewModel.cid === this.cid) {
            //     return;
            // }
            if (this.cid === 'undefined') {
                this.viewModel = { type: 'Undefined', cid: 'undefined-' + components.nextId('Undefined') }
            } else {
                this.viewModel = components.getComponentModel(this.cid);
            }
        },
        onDrop(evt) {
            console.info("ON DROP", evt);
            this.onDragLeave();
            const type = evt.dataTransfer.getData('type');
            if (type) {
                console.info("drop type", type);
                this.createComponent(type);
            } else {
                const cid = evt.dataTransfer.getData('cid');
                if (cid) {
                    console.info("drop component", cid);
                    this.setComponent(cid);
                }
                const builder = evt.dataTransfer.getData('builder');
                if (builder) {
                    console.info("drop builder", builder);
                    this.showBuilder(builder);
                }
            }
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);

        },
        onDragEnter() {
            this.location = this.$parent.cid + '.' + this.keyInParent + (typeof this.indexInKey === 'number' ? '[' + this.indexInKey + ']' : '');
            this.hOver = true;
            if (this.$parent && this.$parent.$parent) {
                try {
                    this.$parent.$parent.highLight(true);
                } catch (e) {}
            }
        },
        onDragLeave() {
            this.location = '';
            this.hOver = false;
            if (this.$parent && this.$parent.$parent) {
                try {
                    this.$parent.$parent.highLight(false);
                } catch (e) {}
            }
        },
        highLight(highLight) {
            this.style = highLight ? 'border: solid HighLight 1px' : 'border: solid transparent 1px';
        },
        onDropZoneClicked() {
            if (this.highLighted) {
                ide.setTargetLocation(undefined);
            } else {
                ide.setTargetLocation({
                    cid: this.$parent.cid,
                    key: this.keyInParent,
                    index: this.indexInKey
                });
            }
        }
        // componentBorderStyle: function () {
        //     let style = this.hightLighted ? 'border: solid HighLight 10px !important' : '';
        //     console.info("style " + this.cid, style);
        //     return style;
        //     // return this.edit ? (this.selected ? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); ' : '')
        //     //     + 'border: ' + (this.targeted ? 'solid orange 1px !important' : this.selected ? 'solid blue 1px !important' : 'dotted lightgray 1px') + ';' : '';
        // }

    }
})
