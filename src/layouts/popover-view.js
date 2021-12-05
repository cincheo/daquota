Vue.component('popover-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle()" :class="edit ? 'inlined-dialog border' : ''">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <h3 v-if="edit" class="border-bottom">
                {{ $eval(viewModel.title, '#error#') }}
            </h3>
            <div v-if="edit">
                <component-view :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content" :inSelection="isEditable()" />
            </div>
            <b-popover v-if="$eval(viewModel.target, undefined)"
                :show.sync="showingState"
                :id="'popover-'+cid" 
                :class="$eval(viewModel.class, '')"
                :style="$eval(viewModel.style)" 
                :target="$eval(viewModel.target, 'undefined')"
                :title="$eval(viewModel.title, 'undefined')"
                :placement="$eval(viewModel.placement)"
                :triggers="$eval(viewModel.triggers, undefined)"
                 @hide="onHide"
                 @show="onShow"
            >
                <component-view :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content" :inSelection="isEditable()"/>
            </b-popover>                
        </b-container>
    `,
    data: function() {
        return {
            showingState: false
        }
    },
    methods: {
        customEventNames() {
            return ["@hide", "@show"];
        },
        onHide(event) {
            this.$emit("@hide", event);
        },
        onShow(event) {
            this.$emit("@show", event);
        },
        show: function () {
            if (ide.editMode) {
                setTimeout(() => {
                    document.getElementById(this.cid).scrollIntoView({block: "center"});
                    ide.selectComponent(this.cid)
                }, 200);
            } else {
                this.showingState = true;
            }
        },
        hide: function () {
            this.showingState = false;
        },
        propNames() {
            return ["cid", "dataSource", "target", "triggers", "title", "content", "placement", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                content: {
                    type: 'ref'
                },
                title: {
                    type: 'text',
                    editable: true
                },
                target: {
                    type: 'select',
                    editable: true,
                    options: () => components.getComponentIds().filter(cid => document.getElementById(cid)).sort()
                },
                placement: {
                    type: 'select',
                    editable: true,
                    options: ['top', 'bottom', 'right', 'left', 'topleft', 'topright', 'bottomleft', 'bottomright', 'lefttop', 'leftbottom', 'righttop', 'rightbottom'],
                    description: "Default is 'right'"
                },
                triggers: {
                    type: 'select',
                    editable: true,
                    options: [click', 'hover', 'focus'],
                    description: "Default is 'click'"
                }
            };
        }
    }
});
