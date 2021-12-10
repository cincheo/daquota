Vue.component('component-tree-node', {
    template: `
        <span>
            <span class="tree-item" :style="(filter != null && filter.length > 0) ? (matchFilter() ? 'font-weight: bold' : 'opacity: 50%') : (visible ? '' : 'opacity: 50%')">
                <b-icon v-if="hasChildren()" :icon="expanded ? 'caret-down-fill' : 'caret-right-fill'" @click="toggle"></b-icon>
                <b-icon v-else icon=""></b-icon>
                <component-icon v-if="nodeModel.cid === '__trash'" :type="hasChildren() ? 'FullTrash' : 'EmptyTrash'"></component-icon>
                <span v-else draggable @dragstart='startDrag($event, nodeModel.cid)' v-b-hover="hover" style="cursor: pointer">
                    <component-icon :type="nodeModel.type"></component-icon>
                    <span :style="badgeStyle" @click="componentSelected">
                        <b-badge v-if="targeted" pill variant="warning" style="position: relative; top: -0.1rem;">
                            root
                        </b-badge>
                        {{ nodeModel.cid }}
                        <span v-if="nodeModel.dataSource"><b-icon icon="link"></b-icon> <span style="font-weight: 100">{{ nodeModel.dataSource }}</span></span>
                    </span>
                </span>
            </span> 
             <ul class="tree" v-if="expanded && hasChildren()">
                <li v-for="item in getChildren()" :key="item.cid">
                    <component-tree-node :ref="item.cid" :nodeModel="item" :filter="filter">
                    </component-tree-node>
                </li>
             </ul>
         </span>
    `,
    props: ["nodeModel", "filter"],
    data: function() {
        return {
            expanded: true,
            children: undefined,
            selected: ide.selectedComponentId == this.nodeModel.cid,
            targeted: ide.targetedComponentId == this.nodeModel.cid,
            hovered: false,
            visible: true
        }
    },
    computed: {
        badgeStyle: function() {
            let style = 'border-radius: 0.7rem; font-size: 0.8rem; padding-left: 0.5rem; padding-right: 0.5rem;'
            if (this.selected) {
                style += ` border: ${ide.colors.selection} solid 3px;`;
            }
            if (this.hovered) {
                if (ide.isDarkMode()) {
                    style += ' color: black;';
                }
                style += ' background-color: lightgray';
            }
            return style;
        },
        visibleOnPage: function() {
            return document.getElementById(this.nodeModel.cid) != null;
        }
    },
    created: function () {
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = (cid === this.nodeModel.cid);
            if (this.selected && !this.expanded) {
                this.hovered = true;
            }
            if (this.selected) {
                let current = this;
                while (current && current.expanded !== undefined) {
                    current.expanded = true;
                    current = current.$parent;
                }
            }
        });
        this.$eventHub.$on('component-targeted', (cid) => {
            this.targeted = (cid === this.nodeModel.cid);
        });
        this.$eventHub.$on('component-hovered', (cid, hovered) => {
            this.hovered = this.nodeModel.cid === ide.hoveredComponentId;
        });
        this.$eventHub.$on('main-updated', () => {
            this.visible = document.getElementById(this.nodeModel.cid);
            if (!this.visible) {
                this.expanded = false;
            }
        });
    },
    methods: {
        matchFilter() {
            return this.nodeModel.cid.indexOf(this.filter) > -1
                || new RegExp("\\b" + this.filter + "\\b").test(JSON.stringify(components.getComponentModel(this.nodeModel.cid)));
        },
        hover: function (hovered) {
            this.hovered = hovered;
            ide.hoverComponent(this.nodeModel.cid, hovered);
            //document.getElementById(this.nodeModel.cid).scrollIntoView({block: "nearest"});
            ide.updateHoverOverlay(this.nodeModel.cid);
            ide.updateSelectionOverlay(ide.selectedComponentId);
        },
        toggle: function() {
            this.expanded = !this.expanded;
        },
        isExpanded: function() {
            return this.expanded;
        },
        hasChildren() {
            return this.getChildren().length > 0;
        },
        getChildren: function() {
            return components.getDirectChildren(this.nodeModel);
        },
        componentSelected: function () {
            if (this.selected) {
                ide.setTargetMode();
            } else {
                this.selected = true;
                ide.hideOverlays();
                setTimeout(() => {
                    try {
                        document.getElementById(this.nodeModel.cid).scrollIntoView({block: "end"});
                    } catch (e) {
                        // cannot scroll... swallow
                    }
                    ide.selectComponent(this.nodeModel.cid);
                }, 200);

                //this.$eventHub.$emit('component-selected', this.nodeModel.cid);
            }
        },
        startDrag: function(evt, cid) {
            evt.dataTransfer.dropEffect = 'move';
            evt.dataTransfer.effectAllowed = 'all';
            evt.dataTransfer.setData('cid', cid);
        }
    }
});
