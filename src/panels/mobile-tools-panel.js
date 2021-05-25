    Vue.component('mobile-tools-panel', {
        template: `
            <div>
                    <b-img width="80" src="assets/images/dlite_logo_200x200.png" class="float-left"></b-img>
                    <h3 class="mt-2">DLite IDE</h3>
                    <p class="mb-4">Low-code platform</p>
                    <b-alert v-if="offlineMode()" show variant="warning" size="sm" dismissible>Serverless mode.</b-alert>
                    <div class="p-2">
                        <b-form-input v-model="backend" size="sm" :state="!offlineMode()" v-b-tooltip.hover title="Server address"></b-form-input>
                        <b-button size="sm" block class="mt-2" v-on:click="connect" :disabled="!canConnect()"><b-icon icon="cloud-plus"></b-icon> Connect to server</b-button>
                        <b-form-input v-model="userInterfaceName" size="sm" class="mt-2" v-b-tooltip.hover title="User interface name"></b-form-input>                
                        <b-button v-if="!offlineMode()" size="sm" block class="mt-2" v-on:click="save"><b-icon icon="cloud-upload"></b-icon> Save UI to the server</b-button>
                        <b-button v-if="!offlineMode()" size="sm" block class="mt-2" v-on:click="load"><b-icon icon="cloud-download"></b-icon> Load UI from the server</b-button>
                        <b-button v-if="offlineMode()" size="sm" block class="mt-2" v-on:click="saveFile"><b-icon icon="download"></b-icon> Save UI file</b-button>
                        <b-button v-if="offlineMode()" size="sm" block class="mt-2" v-on:click="loadFile"><b-icon icon="upload"></b-icon> Load UI file</b-button>
                        <b-form-select v-if="!offlineMode()" class="mt-2" v-model="userInterfaceName" :options="uis()" :select-size="6"></b-form-select>                
                        <b-dropdown size="sm" v-b-tooltip.hover text="Choose theme" block class="mt-2">
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
                    </div>
            </div>

        `,
        data: function() {
            return {
                componentItems: [],
                filter: null,
                targetMode: false,
                userInterfaceName: userInterfaceName,
                backend: backend
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
            connect() {
                if (confirm("Current changes will be lost when connecting. Are you sure?")) {
                    backend = this.backend;
                    this.load();
                }
            },
            canConnect() {
                return backend !== this.backend;
            },
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
