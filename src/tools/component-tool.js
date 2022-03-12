Vue.component('component-tool', {
    template: `
        <b-button variant="link" size="sm" class="text-decoration-none drag-el"
            v-on:click="createComponent"
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
            evt.dataTransfer.setData('category', this.category);
            evt.dataTransfer.setData('type', this.type);
        },
        createComponent() {
            if (this.category === 'builders') {
                if (ide.getTargetLocation()) {
                    this.$bvModal.show(this.type);

//                    this.showBuilder(this.type);
                } else {
                    this.$emit("componentNotCreated", this.type);
                }
                return;
            }
            let targetLocation = ide.getTargetLocation();
            if (targetLocation) {
                console.info("createComponent", this.type);
                const viewModel = components.createComponentModel(this.type);
                components.registerComponentModel(viewModel);
                console.info("viewModel", viewModel);
                components.setChild(targetLocation, viewModel);
                ide.selectComponent(viewModel.cid);
                if (ide.targetLocation && typeof ide.targetLocation.index === 'number') {
                    let newTargetLocation = ide.targetLocation;
                    newTargetLocation.index++;
                    ide.setTargetLocation(newTargetLocation);
                }
                this.$emit("componentCreated", this.type);
            } else {
                this.$emit("componentNotCreated", this.type);
            }
        }
    }
});
