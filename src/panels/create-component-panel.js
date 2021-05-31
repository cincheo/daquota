    Vue.component('create-component-panel', {
        template: `
            <div>
<!--                <b-alert :show="alertMessage !== undefined" :variant="alertVariant">{{ alertMessage }}</b-alert>-->
            
                  <div class="accordion" role="tablist">
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button @click="collapse('data-sources')" block variant="none" size="sm">Data sources</b-button>
                      </b-card-header>
                      <b-collapse v-model="isCollapsed('data-sources')" role="tabpanel">
                        <b-card-body>
                            <component-tool type="ApplicationConnector" label="Connector" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="CookieConnector" label="Cookie" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="LocalStorageConnector" label="Storage" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="DataMapper" label="Data mapper" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="IteratorView" label="Iterator" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                    
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button @click="collapse('basic-components')" block variant="none" size="sm">Basic components</b-button>
                      </b-card-header>
                      <b-collapse v-model="isCollapsed('basic-components')" role="tabpanel">
                        <b-card-body>
                            <component-tool type="TextView" label="Text" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="CheckboxView" label="Checkbox" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="SelectView" label="Select" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="InputView" label="Input" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="ButtonView" label="Button" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="ImageView" label="Image" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button @click="collapse('advanced-components')" block variant="none" size="sm">Advanced components</b-button>
                      </b-card-header>
                      <b-collapse v-model="isCollapsed('advanced-components')"  role="tabpanel">
                        <b-card-body>
                            <component-tool type="TableView" label="Table" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="CardView" label="Card" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="ChartView" label="Chart" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="TimeSeriesChartView" label="Time series" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="DialogView" label="Dialog" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button @click="collapse('layout')" block variant="none" size="sm">Layout</b-button>
                      </b-card-header>
                      <b-collapse v-model="isCollapsed('layout')" role="tabpanel">
                        <b-card-body>
                            <component-tool type="ContainerView" label="Container" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="SplitView" label="Split" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                    
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button @click="collapse('builders')" block variant="none" size="sm">Builders</b-button>
                      </b-card-header>
                      <b-collapse v-model="isCollapsed('builders')"  role="tabpanel">
                        <b-card-body>
                            <component-tool type="instance-form-builder" label="Instance form" category="builder" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="collection-editor-builder" label="Collection editor" category="builder" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="login-form-builder" label="Login form" category="builder" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>

                  </div>
            </div>

        `,
        data: function() {
            return {
                alertMessage: undefined,
                alertVariant: "success",
                collapsed: 'basic-components'
            }
        },
        methods: {
            isCollapsed(id) {
                return this.collapsed === id;
            },
            collapse(id) {
                if (this.collapsed === id) {
                    this.collapsed = '';
                } else {
                    this.collapsed = id;
                }
            },
            componentCreated: function (event) {
                console.info("on component created", event);
                this.alertVariant = "success";
                this.alertMessage = "Successfully added " + Tools.camelToLabelText(event, true);
                setTimeout(() => this.alertMessage = undefined, 2000);
                this.$emit("componentCreated", event);
            },
            componentNotCreated: function (event) {
                console.info("on component not created", event);
                // this.alertVariant = "info";
                // this.alertMessage = "Drag and drop the selected component to a drop zone.";
                // setTimeout(() => this.alertMessage = undefined, 2000);
            }
        }
    });
