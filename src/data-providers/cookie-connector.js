Vue.component('cookie-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid" :style="componentBorderStyle()">
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-button v-if="edit" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="edit" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="dataModel"
                    rows="1"
                    size="sm" 
                    max-rows="10"></b-form-textarea>
            </b-collapse>
        </div>
    `,
    mounted: function () {
        this.update();
    },
    watch: {
        'viewModel.name': {
            handler: function () {
                this.update();
            },
            immediate: true
        },
        dataModel: {
            handler: function () {
                Tools.setCookie(this.viewModel.name, JSON.stringify(this.dataModel), this.viewModel.expirationDate);
            },
            immediate: true,
            recursive: true
        }
    },
    methods: {
        update() {
            try {
                this.dataModel = JSON.parse(Tools.getCookie(this.viewModel.name));
            } catch (e) {}
            if (this.dataModel === undefined) {
                this.dataModel = this.$eval(this.viewModel.defaultValue, {});
            }
        },
        propNames() {
            return ["cid", "name", "defaultValue", "expirationDate", /*"sameSite", */"eventHandlers"];
        },
        customPropDescriptors() {
            return {
                name: {
                    type: 'text',
                    editable: true,
                    description: 'A string representing the name of the cookie. If omitted, this is empty by default.'
                },
                defaultValue: {
                    type: 'text',
                    editable: true,
                    description: 'The default value of the data model when the cookie does not exist yet of when its value is not valid.'
                },
                expirationDate: {
                    type: 'text',
                    editable: true,
                    description: 'A number that represents the expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted, the cookie becomes a session cookie.'
               },
                sameSite: {
                    editable: true,
                    type: 'select',
                    description: 'A cookies.SameSiteStatus value that indicates the SameSite state of the cookie. If omitted, it defaults to no_restriction.',
                    options: [
                        'no_restriction',
                        'lax',
                        'strict'
                    ]
                }
            }
        }

    }
});


