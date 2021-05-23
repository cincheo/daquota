Vue.component('component-tool', {
    template: `
        <b-button variant="link" class="text-decoration-none drag-el"
            v-on:click="createComponent(type)"
            draggable
            @dragstart='startDrag($event)'
        >
            <component-icon :type="type"></component-icon> {{ label }}
        </b-button>
    `,
    props: ["type", "label", "category"],
    methods: {
        startDrag(evt) {
            evt.dataTransfer.dropEffect = 'copy';
            evt.dataTransfer.effectAllowed = 'all';
            evt.dataTransfer.setData(this.category ? this.category : 'type', this.type);
        },
        createComponent(type) {
            if (ide.getTargetLocation()) {
                console.info("createComponent", type);
                const viewModel = components.createComponentModel(type);
                components.registerComponentModel(viewModel);
                console.info("viewModel", viewModel);
                components.setChild(ide.getTargetLocation(), viewModel);
                ide.selectComponent(viewModel.cid);
                if (typeof ide.getTargetLocation().index === 'number') {
                    let newTargetLocation = ide.getTargetLocation();
                    newTargetLocation.index++;
                    ide.setTargetLocation(newTargetLocation);
                }
                this.$emit("componentCreated", type);
            } else {
                this.$emit("componentNotCreated", type);
            }
        }
    }
});
