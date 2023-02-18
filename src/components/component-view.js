/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

Vue.component('component-view', {
    template: `
        <div v-if="viewModel" :id="'cc-'+viewModel.cid" :ref="viewModel.cid" 
            :class="layoutClass()"
            :style="layoutStyle()"
            @mouseup="onResizeCandidate"
            v-b-hover="onHover"
        >
            <div v-if="edit && error" 
                class="text-danger bg-warning position-absolute p-1 m-0 border border-danger rounded shadow" 
                style="opacity: 0.8; top:0; right:0; z-index: 1002; cursor: pointer" 
                :title="error"><b-icon-exclamation-triangle-fill/>
            </div>
            <div v-if="collapsed && cid !== 'shared'">
                <div v-if="edit && locked === undefined && !isRoot() && isVisible()"
                    @click="onDropZoneClicked"
                    ref="drop-zone"
                    :class="dropZoneClass()"
                    @drop="onDrop"
                    @mouseover="onDragEnter"
                    @mouseleave="onDragLeave"
                    @dragenter="onDragEnter"
                    @dragleave="onDragLeave"
                    @dragover.prevent
                    @dragenter.prevent
                />
                <b-badge :id="'ccc-'+viewModel.cid" variant="warning" href="#" @click.native.prevent="expanded = true"><b-icon-plus-square/> {{ viewModel.cid }}</b-badge>
            </div>
            <div class="h-100" v-show="!collapsed">
                <a v-if="generateAnchor()" :id="viewModel.publicName" :ref="viewModel.publicName" :style="anchorStyle()"></a>
                <b-popover v-if="edit" :ref="'popover-'+viewModel.cid" :target="viewModel.cid" custom-class="p-0"
                    placement="top" 
                    triggers="manual" 
                    :fallback-placement="[]"
                    :noninteractive="true"
                    boundary="window"
                    boundary-padding="0"
                    >
                    <b-icon :icon="selected ? 'unlock' : 'lock'" class="mr-2" :variant="selected ? 'success' : 'danger'" size="lg"></b-icon>
                    <component-icon :type="viewModel.type" class="mr-2" size="sm"></component-icon>{{ publicId }}
                    <span v-if="generateAnchor()">
                        <b-icon icon="geo-alt-fill" variant="danger"></b-icon>&nbsp;#{{viewModel.publicName}}
                    </span>
                </b-popover>           
                <div v-if="edit && locked === undefined && !isRoot() && isVisible()"
                    @click="onDropZoneClicked"
                    ref="drop-zone"
                    :class="dropZoneClass()"
                    @drop="onDrop"
                    @mouseover="onDragEnter"
                    @mouseleave="onDragLeave"
                    @dragenter="onDragEnter"
                    @dragleave="onDragLeave"
                    @dragover.prevent
                    @dragenter.prevent
                />
                
                <component :is="componentName" 
                    ref="component" 
                    :cid="viewModel.cid" 
                    :iteratorIndex="iteratorIndex" 
                    :inSelection="inSelection" 
                    @error="onError"
                />
    
                <b-alert v-if="viewModel.type === null" show variant="danger">Undefined component type</b-alert>
                 
            </div>
                 
        </div>
        <div v-else>
            <div v-if="edit && locked === undefined">
                <div :class="dropZoneClass()" 
                    @drop="onDrop($event)"
                    @click="onDropZoneClicked"
                    @mouseover="onDragEnter"
                    @mouseleave="onDragLeave"
                    @dragenter="onDragEnter"
                    @dragleave="onDragLeave"
                    @dragover.prevent
                    @dragenter.prevent
                >
                    <span style="font-size: small; cursor: pointer" class="text-primary">[+]</span>
                </div>
            </div>
            <b-alert v-else show variant="warning">{{ locked ? locked : 'Requested component does not exist.' }}</b-alert>
        </div>
    `,
    props: ['cid', 'keyInParent', 'indexInKey', 'locked', 'iteratorIndex', "inSelection"],
    data: function () {
        return {
            viewModel: undefined,
            edit: ide.editMode,
            hOver: false,
            highLighted: false,
            hovered: false,
            selected: false,
            style: 'border: dotted lightgrey 1px; max-width: 100%',
            location: '',
            animation: undefined,
            animateDuration: undefined,
            hiddenBeforeAnimate: false,
            componentStates: ide.componentStates,
            error: undefined,
            hidden: undefined
        }
    },
    computed: {
        publicId: function() {
            return components.publicId(this.viewModel);
        },
        collapsed: function() {
            return this.edit && !this.expanded;
        },
        expanded: {
            get: function() {
                if (this.viewModel) {
                    return this.componentStates[this.viewModel.cid] === undefined || this.componentStates[this.viewModel.cid] === true;
                } else {
                    return true;
                }
            },
            set: function(expanded) {
                if (this.viewModel) {
                    this.$set(this.componentStates, this.viewModel.cid, expanded);
                }
            }
        },
        componentName: function() {
            return $tools.camelToKebabCase(this.viewModel.type);
        }
    },
    watch: {
        cid: function () {
            this.hidden = undefined;
            this.updateViewModel();
        },
        hovered: {
            handler: function (value) {
                if (!this.viewModel) {
                    return;
                }
                if (!this.edit) {
                    return;
                }
                let popover = 'popover-' + this.cid;
                if (this.hovered) {
                    ide.updateHoverOverlay(this.cid);
                    if (!this.selected) {
                        ide.showHoverOverlay();
                    }
                    if (this.$refs[popover] && !this.isEditable()) {
                        this.$refs[popover].$emit('open');
                    }
                } else {
                    if (this.$refs[popover] && !this.selected) {
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
                    if (this.$refs[popover]) {
                        this.$refs[popover].$emit('close');
                    }
                }
            },
            immediate: true
        }
    },
    created: function () {
        this.$eventHub.$on('edit', (edit) => {
            this.edit = edit;
            if (!this.edit) {
                let popover = 'popover-' + this.cid;
                if (this.$refs[popover]) {
                    this.$refs[popover].$emit('close');
                }
            } else {
                if (this.selected) {
                    ide.updateSelectionOverlay(this.cid);
                    ide.showSelectionOverlay();
                    let popover = 'popover-' + this.cid;
                    if (this.$refs[popover]) {
                        this.$refs[popover].$emit('open');
                    }
                }
            }
        });
        this.$eventHub.$on('target-location-selected', (location) => {
            this.hOver = false;
            if (!location) {
                this.highLighted = false;
            } else {
                this.highLighted = (location.cid === this.getFirstParent()?.cid && location.key === this.keyInParent && location.index === this.indexInKey);
            }
        });
        this.$eventHub.$on('component-updated', (cid) => {
            if (this.viewModel && cid === this.viewModel.cid) {
                this.viewModel = components.getComponentModel(cid);
            }
        });
        // this.$eventHub.$on('application-loaded', () => {
        //     this.viewModel = components.getComponentModel(this.cid);
        // });
        this.$eventHub.$on('component-hovered', (cid, hovered) => {
            this.hovered = (cid && (cid === this.cid)) && hovered;
            if (hovered && cid && this.cid && cid !== this.cid) {
                if (this.getComponent()) {
                    // make sure that all other components are not hovered
                    this.getComponent().hovered = false;
                }
            }
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = cid && (cid === this.cid);
        });
    },
    mounted: function () {
        this.updateViewModel();
        this.rect = this.$el.getBoundingClientRect();
    },
    updated: function () {
        if (this.viewModel && this.viewModel.cid) {
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);
        }
    },
    methods: {
        onError(message, prop) {
            if (!message) {
                this.error = undefined;
            } else {
                if (this.error) {
                    // cannot stack errors (infinite loop)
                    return;
                }
                this.error = "Error";
                if (this.viewModel) {
                    this.error += " in [" + this.viewModel.cid;
                    if (prop) {
                        const propDescriptor = components.propDescriptors(this.viewModel).find(propDescriptor => propDescriptor.name === prop);
                        if (propDescriptor) {
                            this.error += `${(propDescriptor.category ? '>>' + this.getCategoryTitle(propDescriptor.category) + '>>' : '') + propDescriptor.label}`;
                        } else {
                            this.error += `>>${prop}`;
                        }
                    }
                }
                if (message.message) {
                    this.error += ']: ' + message.message;
                } else {
                    this.error += ']: ' + message;
                }
            }
        },
        getCategoryTitle(category) {
            if (category === 'main') {
                return 'Properties';
            } else {
                return Tools.camelToLabelText(category);
            }
        },
        isHiddenContainer() {
            if (this.hidden !== undefined) {
                return this.hidden;
            } else {
                return this.$eval(this.viewModel.hidden, false);
            }
        },
        hasHiddenParent() {
            let parent = this.$parent;
            while(parent) {
                if (parent.isHiddenContainer && parent.isHiddenContainer()) {
                    return true;
                }
                parent = parent.$parent;
            }
            return false;
        },
        onHover(hover) {
            if (this.viewModel) {
                this.getComponent()?.onHover(hover);
            }
        },
        generateAnchor() {
            return this.viewModel.publicName && components.isVisibleComponent(this.viewModel);
        },
        anchorStyle() {
            if (applicationModel.navbar.fixed === 'top') {
                return `position: relative; top: -3rem`;
            } else {
                return '';
            }
        },
        onResizeCandidate(event) {
            let resizeDirections = undefined;
            if (this.viewModel.resizeDirections && (resizeDirections = this.$eval(this.viewModel.resizeDirections, 'none')) !== 'none') {
                let rect = this.$el.getBoundingClientRect();
                if (!(this.rect.width === rect.width && this.rect.height === rect.height)) {
                    this.rect = rect;
                    if (this.$refs['component']) {
                        this.$refs['component'].$emit('@resize', rect);
                    }
                }
            }
        },
        layoutStyle() {
            let style = this.isEditable() ? this.style : '';
            style += ';';
            style += this.$eval(this.viewModel.layoutStyle, '');
            let directions = this.$eval(this.viewModel.resizeDirections, 'none');
            if (directions && directions !== 'none') {
                style += "; resize: " + directions + '; overflow: auto';
            }
            if (this.animation) {
                if (this.animateDuration) {
                    style += `; --animate-duration: ${this.animateDuration}ms`;
                }
            }
            return style;
        },
        layoutClass() {
            let layoutClass = 'component-container position-relative'
                + (this.viewModel.layoutClass ? ' ' + this.$eval(this.viewModel.layoutClass, '') : '')
                + (this.isHiddenContainer() ? (this.edit ? (this.hasHiddenParent() ? '' : ' opacity-2') : ' d-none') : '');
            if (this.animation) {
                layoutClass += ' animate__animated animate__' + this.animation;
            }
            if (this.hiddenBeforeAnimate) {
                layoutClass += ' opacity-001';
            }
            if (this.viewModel.fillHeight) {
                layoutClass += ' h-100';
            }
            return layoutClass;
        },
        isVisible() {
            if (this.viewModel && this.viewModel.cid) {
                switch (this.viewModel.type) {
                    case 'ApplicationConnector':
                    case 'CookieConnector':
                    case 'DataMapper':
                    case 'LocalStorageConnector':
                        return false;
                    default:
                        return true;
                }
            } else {
                return false;
            }
        },
        isRoot() {
            if (this.viewModel && this.viewModel.cid) {
                return components.getRoots().map(c => c.cid).indexOf(this.viewModel.cid) > -1;
            } else {
                return true;
            }
        },
        isEditable() {
            return this.edit && (this.targeted || this.inSelection);
        },
        createComponentModal: function (e) {
            e.stopPropagation();
            this.$root.$emit('bv::show::modal', 'create-component-modal');
        },
        dropZoneClass() {
            if (this.highLighted) {
                return 'active-drop-zone target-drop-zone';
            } else {
                return this.hOver ? 'active-drop-zone' : 'drop-zone';
            }
        },
        showBuilder(id) {
            if (!ide.getTargetLocation()) {
                ide.setTargetLocation({
                    cid: this.getFirstParent()?.cid,
                    key: this.keyInParent,
                    index: this.indexInKey
                });
            }
            this.$bvModal.show(id);
        },
        createComponent(type) {
            ide.commandManager.beginGroup();
            const targetLocation = {
                cid: this.getFirstParent()?.cid,
                key: this.keyInParent,
                index: this.indexInKey
            };
            const viewModel = ide.commandManager.execute(new CreateComponent(type, targetLocation.cid))
            ide.commandManager.execute(new SetChild(targetLocation, viewModel.cid));
            ide.commandManager.endGroup();
        },
        getFirstParent() {
            let parent = this.$parent;
            while (parent && !parent.cid) {
                parent = parent.$parent;
            }
            return parent;
        },
        setComponent(cid) {
            ide.commandManager.execute(new MoveComponent(cid, {
                cid: this.getFirstParent()?.cid,
                key: this.keyInParent,
                index: this.indexInKey
            }));
        },
        updateViewModel() {
            this.viewModel = components.getComponentModel(this.cid);
        },
        onDrop(evt) {
            this.onDragLeave();
            const type = evt.dataTransfer.getData('type');
            if (type) {
                const category = evt.dataTransfer.getData('category');
                if (category === 'builders') {
                    this.showBuilder(type);
                } else {
                    this.createComponent(type);
                }
            } else {
                const cid = evt.dataTransfer.getData('cid');
                if (cid) {
                    if (cid === 'navbar' || cid === 'shared') {
                        this.$bvToast.toast(`Cannot move '${cid}'`, {
                            title: `Error`,
                            variant: 'danger',
                            autoHideDelay: 3000,
                            solid: true
                        });
                        return;
                    }
                    this.setComponent(cid);
                }
            }
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);

        },
        onDragEnter() {
            this.location = this.getFirstParent()?.cid + '.' + this.keyInParent + (typeof this.indexInKey === 'number' ? '[' + this.indexInKey + ']' : '');
            this.hOver = true;
            if (this.getFirstParent()) {
                try {
                    this.getFirstParent().highLight(true);
                } catch (e) {
                }
            }
        },
        onDragLeave() {
            this.location = '';
            this.hOver = false;
            if (this.getFirstParent()) {
                try {
                    this.getFirstParent().highLight(false);
                } catch (e) {
                }
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
                    cid: this.getFirstParent()?.cid,
                    key: this.keyInParent,
                    index: this.indexInKey
                });
            }
        },
        $eval(expression, defaultValue) {
            if (!this.$refs['component']) {
                return defaultValue;
            }
            try {
                return this.$refs['component'].$eval(expression, defaultValue);
            } catch (e) {
                console.error('error evaluating', expression, this);
                return defaultValue;
            }
        },
        getComponent() {
            return this.$refs['component'];
        },
        animate(animation, duration, delay, hideAfterAnimation) {
            if (typeof duration === 'string') {
                duration = parseInt(duration);
                if (isNaN(duration)) {
                    duration = 1000;
                }
            }
            if (typeof delay === 'string') {
                delay = parseInt(delay);
                if (isNaN(delay)) {
                    delay = 0;
                }
            }
            duration = duration !== undefined ? duration : 1000;
            delay = delay !== undefined ? delay : 0;

            setTimeout(() => {
                this.hiddenBeforeAnimate = hideAfterAnimation ? true : false;
                this.animation = animation;
                this.animateDuration = duration;
                setTimeout(() => {
                    this.animation = undefined;
                    this.animateDuration = undefined;
                    this.animateDelay = undefined;
                }, duration + 10);
            }, delay)

        },

    }
})
