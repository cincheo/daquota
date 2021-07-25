Vue.component('dialog-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle()" :class="edit ? 'inlined-dialog border' : ''">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <h3 v-if="edit" class="border-bottom">
                {{ viewModel.title }}
            </h3>
            <div v-if="edit">
                <component-view :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content" :inSelection="isEditable()" />
            </div>
            <b-modal 
                :id="'modal-'+cid" 
                hide-footer
                :class="$eval(viewModel.class, '')"
                :style="$eval(viewModel.style)" 
                :size="viewModel.size"
                 @cancel="onCancel"
                 @close="onClose"
                 @change="onChange"
                 @hidden="onHidden"
                 @hide="onHide"
                 @ok="onOk"
                 @show="onShow"
                 @shown="onShown"
            >
                <template #modal-title>
                    {{ viewModel.title }}
                </template>
                <component-view :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content" :inSelection="isEditable()"/>
            </b-modal>                
        </b-container>
    `,
    methods: {
        customEventNames() {
            return ["@cancel", "@close", "@change", "@hidden", "@hide", "@ok", "@show", "@shown"];
        },
        onCancel(event) {
            this.$emit("@cancel", event);
        },
        onClose(event) {
            this.$emit("@close", event);
        },
        onChange(event) {
            this.$emit("@change", event);
        },
        onHidden(event) {
            this.$emit("@hidden", event);
        },
        onHide(event) {
            this.$emit("@hide", event);
        },
        onOk(event) {
            this.$emit("@ok", event);
        },
        onShow(event) {
            this.$emit("@show", event);
        },
        onShown(event) {
            this.$emit("@shown", event);
        },
        show: function () {
            if (ide.editMode) {
                setTimeout(() => {
                    document.getElementById(this.cid).scrollIntoView({block: "center"});
                    ide.selectComponent(this.cid)
                }, 200);
            } else {
                this.$bvModal.show('modal-' + this.cid);
            }
        },
        hide: function () {
            this.$bvModal.hide('modal-' + this.cid);
        },
        propNames() {
            return ["cid", "dataSource", "class", "style", "title", "content", "size", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                content: {
                    type: 'ref'
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['sm', 'lg', 'xl']
                }
            };
        }
    }
});
