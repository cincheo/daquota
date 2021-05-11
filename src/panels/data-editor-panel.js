Vue.component('data-editor-panel', {
    template: `
        <b-form-group :state="state" :label="label" :invalid-feedback="invalidFeedback" :label-size="size" :label-class="labelClass" :class="panelClass" :style="panelStyle">
            <b-form-textarea 
                ref="textarea"
                :eval="checkState()"
                v-model="jsonDataModel" 
                :size="size" :rows="rows" 
                :state="state" 
                @input="updateDataModel"></b-form-textarea>
        </b-form-group>
        `,
    props: ['dataModel', 'label', 'size', 'panelClass', 'labelClass', 'rows', 'panelStyle'],
    mounted: function() {
        this.jsonDataModel = this.dataModel ? JSON.stringify(this.dataModel, null, 2) : '';
    },
    data: () => {
        return {
            jsonDataModel: undefined,
            state: undefined,
            invalidFeedback: undefined
        }
    },
    watch: {
        'dataModel': {
            handler: function (dataModel) {
                this.jsonDataModel = dataModel ? JSON.stringify(dataModel, null, 2) : '';
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        checkState() {
            if (this.jsonDataModel === undefined || this.jsonDataModel === '') {
                this.state = undefined;
                return;
            }
            try {
                JSON.parse(this.jsonDataModel);
                if (this.state === undefined || this.state === false) {
                    this.invalidFeedback = undefined;
                    this.state = true;
                }
            } catch (e) {
                if (this.state === undefined || this.state === true) {
                    this.state = false;
                    this.invalidFeedback = e.message;
                }
            }
        },
        updateDataModel() {
            if (this.jsonDataModel === undefined || this.jsonDataModel === '') {
                this.state = undefined;
                return;
            }
            try {
                this.invalidFeedback = undefined;
                let data = JSON.parse(this.jsonDataModel);
                this.state = true;
                this.$emit('update-data', data);
            } catch (e) {
                this.state = false;
                this.invalidFeedback = e.message;
            }
        }
    }
});
