    Vue.component('create-component-panel', {
        template: `
            <div>
                <b-alert :show="alertMessage !== undefined" :variant="alertVariant">{{ alertMessage }}</b-alert>
            
                  <div class="accordion" role="tablist">
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-5 variant="none" size="sm">Data sources</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-5" accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                            <component-tool type="ApplicationConnector" label="Connector" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="CookieConnector" label="Cookie" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="DataMapper" label="Data mapper" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="IteratorView" label="Iterator" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                    
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-1 variant="none" size="sm">Basic components</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
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
                        <b-button block v-b-toggle.accordion-2 variant="none" size="sm">Advanced components</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
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
                        <b-button block v-b-toggle.accordion-3 variant="none" size="sm">Layout</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                            <component-tool type="ContainerView" label="Container" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                            <component-tool type="SplitView" label="Split" @componentCreated="componentCreated" @componentNotCreated="componentNotCreated"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                    
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-4 variant="none" size="sm">Builders</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
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
                alertVariant: "success"
            }
        },
        methods: {
            componentCreated: function (event) {
                console.info("on component created", event);
                this.alertVariant = "success";
                this.alertMessage = "Successfully added " + Tools.camelToLabelText(event, true);
                setTimeout(() => this.alertMessage = undefined, 2000);
            },
            componentNotCreated: function (event) {
                console.info("on component not created", event);
                // this.alertVariant = "info";
                // this.alertMessage = "Drag and drop the selected component to a drop zone.";
                // setTimeout(() => this.alertMessage = undefined, 2000);
            }
        }
    });
