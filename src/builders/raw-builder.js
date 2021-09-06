Vue.component('raw-builder', {
    template: `
        <b-modal id="raw-builder" ref="raw-builder" title="Raw component builder" @ok="build" size="xl">
            <b-form-group label="Raw code (dLite JSON)" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-textarea
                    id="textarea"
                    placeholder="Type in the dLite component code or paste in an existing component view model..."
                    v-model="code"
                    rows="40"
                    size="sm">
                </b-form-textarea>
            </b-form-group>
        </b-modal>
    `,
    data: function() {
        return {
            code: ''
        }
    },
    methods: {
        build() {
            let component = components.registerTemplate(JSON.parse(this.code));
            components.setChild(ide.getTargetLocation(), component);
            ide.selectComponent(component.cid);
            this.$refs['raw-builder'].hide();
        }
    }
});


