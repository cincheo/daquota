Vue.component('component-tree-node', {
    template: `
        <span>
            <span class="tree-item">
                <b-icon v-if="hasChildren()" :icon="expanded ? 'caret-down-fill' : 'caret-right-fill'" @click="toggle"></b-icon>
                <b-icon v-else icon=""></b-icon>
                <component-icon v-if="nodeModel.cid === '__trash'" :type="hasChildren() ? 'FullTrash' : 'EmptyTrash'"></component-icon>
                <span v-else draggable @dragstart='startDrag($event, nodeModel.cid)' v-b-hover="hover" style="cursor: pointer">
                    <component-icon :type="nodeModel.type"></component-icon>
                    <b-badge pill :variant="selected ? 'primary' : (hovered ? 'danger' : 'secondary')" @click="componentSelected" class="mt-1 ml-1">
                        <b-badge v-if="targeted" pill variant="warning">
                            root
                        </b-badge>
                        {{ nodeModel.cid }}
                        <span v-if="nodeModel.dataSource"><b-icon icon="link"></b-icon> <span style="font-weight: 100">{{ nodeModel.dataSource }}</span></span>
                    </b-badge>
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
    created: function () {
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = (cid === this.nodeModel.cid);
        });
        this.$eventHub.$on('component-targeted', (cid) => {
            this.targeted = (cid === this.nodeModel.cid);
        });
    },
    methods: {
        hover: function (hovered) {
            this.hovered = hovered;
            ide.hoverComponent(this.nodeModel.cid, hovered);
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
                ide.selectComponent(this.nodeModel.cid);
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
