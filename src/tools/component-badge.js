Vue.component('component-badge', {
    template: `
        <span v-if="edit">
                <b-badge ref="badge" pill :variant="selected?'primary':(hover?'secondary':'light')" v-on:click="component.componentSelected()" style="cursor:pointer"
                    @mouseover="hover = true"
                    @mouseleave="hover = false"
                    draggable
                    @dragstart="startDrag($event, component.getComponentName())">
                    <b-badge v-if="targeted" pill variant="warning">
                        root
                    </b-badge>
                    {{ component.getComponentName() }}
        <!--            <b-badge v-if="component.viewModel.dataSource" square variant="dark">-->
                        <span v-if="component.viewModel.dataSource"><b-icon icon="link"></b-icon> <span style="font-weight: 100">{{ component.viewModel.dataSource }}</span></span>
                        <span v-if="link"><b-icon icon="link"></b-icon> <span style="font-weight: 200">{{ link }}</span></span>
        <!--            </b-badge>-->
                </b-badge>
            <b-button size="sm" variant="link" @click="editComponent" class="show-mobile"><b-icon icon="pencil"></b-icon></b-button>
        </span>
    `,
    props: ["component", "selected", "targeted", "edit", "link"],
    data: function() {
        return {
            hover: false
        }
    },
    methods: {
        editComponent: function() {
            this.$root.$emit('bv::show::modal', 'component-modal');
            this.$eventHub.$emit('component-selected', this.component.cid);
        },
        startDrag: function(evt, cid) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'all'
            evt.dataTransfer.setData('cid', cid)
        }
    }
});
