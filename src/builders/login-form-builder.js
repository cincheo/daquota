Vue.component('login-form-builder', {
    template: `
        <b-modal id="login-form-builder" ref="login-form-builder" title="Build login form" @ok="build">
            <b-form-group label="Authentication service class name" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="className" :options="selectableClasses()" size="sm"></b-form-select>
            </b-form-group>
            <b-form-group label="Authentication method" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select v-model="methodName" :options="selectableMethods(className)" size="sm" @change="fillFields"></b-form-select>
            </b-form-group>
            <b-form-textarea
                disabled
                id="textarea"
                v-model="fields"
                rows="3"
                size="sm" 
                max-rows="6"></b-form-textarea>
        </b-modal>
    `,
    data: function() {
        return {
            className: '',
            methodName: '',
            dataSource: '$parent',
            fields: []
        }
    },
    methods: {
        fillFields() {
            let instanceType = ide.getDomainModel().classDescriptors[this.className];
            this.fields = instanceType.fields;
        },
        selectableClasses() {
            return Tools.arrayConcat([''], ide.getDomainModel().services);
        },
        selectableMethods(className) {
            return className ? ide.getDomainModel().classDescriptors[className]['methods'] : [];
        },
        build() {

            if (!(this.className && ide.getDomainModel().services.indexOf(this.className) > -1)) {
                alert('Please select a valid service class');
                return;
            }

            let template = {
                "title": "",
                "subTitle": "",
                "imgSrc": "",
                "imgPosition": "top",
                "imgWidth": "",
                "imgHeight": "",
                "text": "",
                "body": {
                    "layout": "block",
                    "components": [
                        {
                            "layout": "block",
                            "components": [
                                {
                                    "label": "Username",
                                    "_type": "text",
                                    "description": "",
                                    "field": "username",
                                    "size": "default",
                                    "disabled": false,
                                    "placeholder": "",
                                    "type": "InputView",
                                    "eventHandlers": [],
                                    "dataSource": "$parent",
                                    "cid": "input-view-0",
                                    "_parentId": "container-view-1"
                                },
                                {
                                    "label": "Password",
                                    "_type": "text",
                                    "description": "",
                                    "field": "password",
                                    "size": "default",
                                    "disabled": false,
                                    "placeholder": "",
                                    "type": "InputView",
                                    "eventHandlers": [],
                                    "dataSource": "$parent",
                                    "cid": "input-view-1",
                                    "_parentId": "container-view-1"
                                }
                            ],
                            "type": "ContainerView",
                            "eventHandlers": [],
                            "dataSource": "$object",
                            "cid": "container-view-1",
                            "_parentId": "container-view-0"
                        },
                        {
                            "label": "Login",
                            "_type": "button",
                            "variant": "primary",
                            "size": "default",
                            "pill": false,
                            "squared": false,
                            "block": true,
                            "disabled": false,
                            "eventHandlers": [
                                {
                                    "global": false,
                                    "name": "@click",
                                    "actions": [
                                        {
                                            "targetId": "application-connector-0",
                                            "name": "invoke",
                                            "description": "Default action",
                                            "argument": "$d('container-view-1')"
                                        }
                                    ]
                                }
                            ],
                            "type": "ButtonView",
                            "cid": "button-view-0",
                            "_parentId": "container-view-0"
                        },
                        {
                            "kind": "service",
                            "className": this.className,
                            "methodName": this.methodName,
                            "arguments": "",
                            "content": {},
                            "type": "ApplicationConnector",
                            "eventHandlers": [],
                            "cid": "application-connector-0",
                            "_parentId": "container-view-0"
                        }
                    ],
                    "type": "ContainerView",
                    "eventHandlers": [],
                    "cid": "container-view-0",
                    "_parentId": "card-view-0"
                },
                "type": "CardView",
                "eventHandlers": [],
                "cid": "card-view-0",
                "class": "shadow m-5",
                "_parentId": "index"
            };

            let loginForm = components.registerTemplate(template);

            components.setChild(ide.getTargetLocation(), loginForm);
            ide.selectComponent(loginForm.cid);
            this.$refs['instance-form-builder'].hide();

        }
    }
});


