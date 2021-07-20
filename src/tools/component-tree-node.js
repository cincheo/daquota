Vue.component('component-tree-node', {
    template: `
        <span>
            <span class="tree-item">
                <b-icon v-if="hasChildren()" :icon="expanded ? 'caret-down-fill' : 'caret-right-fill'" @click="toggle"></b-icon>
                <b-icon v-else icon=""></b-icon>
                <component-icon v-if="nodeModel.cid === '__trash'" :type="hasChildren() ? 'FullTrash' : 'EmptyTrash'"></component-icon>
                <span v-else draggable @dragstart='startDrag($event, nodeModel.cid)' v-b-hover="hover" style="cursor: pointer">
                    <component-icon :type="nodeModel.type"></component-icon>
                    <span :style="badgeStyle" @click="componentSelected" class="mt-1 ml-1">
                        <b-badge v-if="targeted" pill variant="warning">
                            root
                        </b-badge>
                        {{ nodeModel.cid }}
                        <span v-if="nodeModel.dataSource"><b-icon icon="link"></b-icon> <span style="font-weight: 100">{{ nodeModel.dataSource }}</span></span>
                    </span>
                </span>
            </span> 
             <ul class="tree" v-if="expanded && hasChildren()">
                <li v-for="item in getChildren()" :key="item.cid">
                    <component-tree-node :ref="item.cid" :nodeModel="item">
                    </component-tree-node>
                </li>
             </ul>
         </span>
    `,
    props: ["nodeModel"],
    data: function() {
        return {
            expanded: true,
            children: undefined,
            selected: ide.selectedComponentId == this.nodeModel.cid,
            targeted: ide.targetedComponentId == this.nodeModel.cid,
            hovered: false
        }
    },
    computed: {
        badgeStyle: function() {
            let style = 'border-radius: 0.7rem; font-size: 0.7rem; padding-left: 0.5rem; padding-right: 0.5rem;'
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
        }
    },
    created: function () {
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = (cid === this.nodeModel.cid);
        });
        this.$eventHub.$on('component-targeted', (cid) => {
            this.targeted = (cid === this.nodeModel.cid);
        });
        this.$eventHub.$on('component-hovered', (cid, hovered) => {
            this.hovered = this.nodeModel.cid === ide.hoveredComponentId;
        });
    },
    methods: {
        hover: function (hovered) {
            this.hovered = hovered;
            ide.hoverComponent(this.nodeModel.cid, hovered);
            document.getElementById(this.nodeModel.cid).scrollIntoView({block: "nearest"});
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
                    document.getElementById(this.nodeModel.cid).scrollIntoView({block: "end"});
                    ide.selectComponent(this.nodeModel.cid);
                }, 200);

                //this.$eventHub.$emit('component-selected', this.nodeModel.cid);
            }
        },
        startDrag: function(evt, cid) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'all'
            evt.dataTransfer.setData('cid', cid)
        }
    }
});
