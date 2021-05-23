    Vue.component('tools-panel', {
        template: `
            <div>
            
                  <b-card body-class="p-0 pt-2 pb-4 ">
                    <template #header>
                        <b-img width="80" src="assets/images/dlite_logo_200x200.png" class="float-left"></b-img>
                        <b-dropdown size="sm" class="float-right">
                            <b-dropdown-item v-on:click="setStyle()">default</b-dropdown-item>
                            <b-dropdown-item v-on:click="setStyle('litera')">litera</b-dropdown-item>
                            <b-dropdown-item v-on:click="setStyle('lumen')">lumen</b-dropdown-item>
                            <b-dropdown-item v-on:click="setStyle('lux')">lux</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('materia')">materia</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('minty')">minty</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('pulse')">pulse</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('sandstone')">sandstone</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('simplex')">simplex</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('sketchy')">sketchy</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('slate', true)">slate</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('solar', true)">solar</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('spacelab')">spacelab</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('superhero', true)">superhero</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('united')">united</b-dropdown-item>                        
                            <b-dropdown-item v-on:click="setStyle('yeti')">yeti</b-dropdown-item>                        
                        </b-dropdown> 
                        <h3 class="mt-2">DLite IDE</h3>
                        <p class="mb-4">Low-code platform</p>
                        <b-button-toolbar class="mt-4" style="clear: both">
                            <b-form-input v-model="userInterfaceName" style="width: 10em; display:inline-block" size="sm"></b-form-input>                
                            <b-button v-if="!offlineMode()" size="sm" class="ml-1 my-2 my-sm-0" v-on:click="save" style="display:inline-block"><b-icon icon="cloud-upload"></b-icon></b-button>
                            <b-button v-if="!offlineMode()" size="sm" class="ml-1 my-2 my-sm-0" v-on:click="load" style="display:inline-block"><b-icon icon="cloud-download"></b-icon></b-button>
                            <b-button v-if="offlineMode()" size="sm" class="ml-1 my-2 my-sm-0" v-on:click="saveFile" style="display:inline-block"><b-icon icon="download"></b-icon></b-button>
                            <b-button v-if="offlineMode()" size="sm" class="ml-1 my-2 my-sm-0" v-on:click="loadFile" style="display:inline-block"><b-icon icon="upload"></b-icon></b-button>
                        </b-button-toolbar>
                        <b-form-select v-if="!offlineMode()" class="mt-2" v-model="userInterfaceName" :options="uis()" :select-size="6"></b-form-select>                
                        <div>
                            <center><b-button size="sm" pill variant="secondary" class="mt-2 shadow" v-on:click="$eventHub.$emit('edit', false)"><b-icon icon="play"></b-icon></b-button></center>
                        </div>
                    </template>                        

                  <div class="accordion" role="tablist">

                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-5 variant="none" size="sm">Data sources</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-5" accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                            <component-tool type="ApplicationConnector" label="Connector"></component-tool>
                            <component-tool type="CookieConnector" label="Cookie"></component-tool>
                            <component-tool type="DataMapper" label="Data mapper"></component-tool>
                            <component-tool type="IteratorView" label="Iterator"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                    
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-1 variant="none" size="sm">Basic components</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                            <component-tool type="TextView" label="Text"></component-tool>
                            <component-tool type="CheckboxView" label="Checkbox"></component-tool>
                            <component-tool type="SelectView" label="Select"></component-tool>
                            <component-tool type="InputView" label="Input"></component-tool>
                            <component-tool type="ButtonView" label="Button"></component-tool>
                            <component-tool type="ImageView" label="Image"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-2 variant="none" size="sm">Advanced components</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                            <component-tool type="TableView" label="Table"></component-tool>
                            <component-tool type="CardView" label="Card"></component-tool>
                            <component-tool type="ChartView" label="Chart"></component-tool>
                            <component-tool type="TimeSeriesChartView" label="Time series"></component-tool>
                            <component-tool type="DialogView" label="Dialog"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-3 variant="none" size="sm">Layout</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                            <component-tool type="ContainerView" label="Container"></component-tool>
                            <component-tool type="SplitView" label="Split"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>
                    
                    <b-card no-body class="mb-1">
                      <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button block v-b-toggle.accordion-4 variant="none" size="sm">Builders</b-button>
                      </b-card-header>
                      <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
                        <b-card-body>
                            <component-tool type="instance-form-builder" label="Instance form" category="builder"></component-tool>
                            <component-tool type="collection-editor-builder" label="Collection editor" category="builder"></component-tool>
                            <component-tool type="login-form-builder" label="Login form" category="builder"></component-tool>
                        </b-card-body>
                      </b-collapse>
                    </b-card>

                  </div>

                     <b-form-group
                      label="Filter"
                      label-for="filter-input"
                      label-cols-sm="3"
                      label-align-sm="right"
                      label-size="sm"
                      class="m-1"
                    >
                      <b-input-group size="sm">
                        <b-form-input
                          id="filter-input"
                          v-model="filter"
                          type="search"
                          placeholder="Search component"
                        ></b-form-input>
            
                        <b-input-group-append>
                          <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
    
                    <component-tree :rootModels="componentRoots(componentItems)">
                    </component-tree>
                       
                </b-card>
            </div>

        `,
        data: function() {
            return {
                componentItems: [],
                filter: null,
                targetMode: false,
                userInterfaceName: userInterfaceName
            }
        },
        created: function () {
            this.$eventHub.$on('component-created', () => {
                this.fillComponents();
            });
            this.$eventHub.$on('repository-loaded', () => {
                this.fillComponents();
            });
            this.$eventHub.$on('component-deleted', () => {
                this.fillComponents();
            });
        },
        mounted: function () {
            this.fillComponents();
        },
        methods: {
            offlineMode() {
                return ide.offlineMode;
            },
            uis() {
                return ide.uis.map(ui => ui.name);
            },
            componentRoots() {
                let roots = components.getRoots();
                console.info("ROOTS", roots);
                return roots;
            },
            fillComponents() {
                this.componentItems = Object.values(components.getComponentModels());
            },
            async save() {
                ide.save(this.userInterfaceName);
            },
            async load() {
                ide.createAndLoad(this.userInterfaceName);
            },
            saveFile() {
                ide.saveFile(this.userInterfaceName);
            },
            loadFile() {
                ide.loadFile();
            },
            setStyle(value, darkMode) {
                if (value === undefined) {
                    ide.setStyle("https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css");
                } else {
                    ide.setStyle(`https://bootswatch.com/4/${value}/bootstrap.css`, darkMode);
                }
            },
        }
    });
