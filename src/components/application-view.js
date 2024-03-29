/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2021-2023 CINCHEO
 *                         https://www.cincheo.com
 *                         renaud.pawlak@cincheo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

Vue.component('application-view', {
    extends: editableComponent,
    template: `
        <div :id="cid" :class="componentClass()" :style="$eval(viewModel.style, null)">
            <component-badge :component="getThis()" :edit="isEditable()" :targeted="targeted" :selected="selected"></component-badge>
            <b-overlay :show="loading" opacity="0" class="w-100 h-100">
                <iframe v-if="viewModel.cid"
                    v-show="!loading" class="w-100 h-100 border-0 animate__animated animate__fadeIn" style="--animate-duration: 2000ms"
                    ref="iframe"
                    :src="src"
                />
            </b-overlay>
            
        </div>
    `,
    data: function () {
        return {
            loading: true,
            prodLink: undefined,
            application: undefined
        }
    },
    created() {
        this.$eventHub.$on('style-changed', () => {
            this.$refs['iframe'].contentWindow.ide.initStyle();
        });
        this._childReadyHandler = $tools.onChildApplicationMessage('*', 'application-ready', (application) => {
            this.loading = false;
        });
    },
    mounted() {
        this.setLoadTimeout();
        return this.resolveProdLink();
    },
    watch: {
        'viewModel.application': function () {
            return this.resolveProdLink();
        },
        application: function () {
            this.prodLink = undefined;
            return this.resolveProdLink();
        },
        prodLink: function () {
            return this.forceRender();
        },
        src: function () {
            this.loading = true;
            this.setLoadTimeout();
        }
    },
    computed: {
        src: function () {
            this.application = this.$eval(this.viewModel.application, null);
            if (this.prodLink) {
                return this.prodLink;
            }
            let appSrc = this.application && this.viewModel.version ?
                `$app~${this.application}~${this.viewModel.version}` :
                '$parent~' + this.viewModel.cid;
            let src = ide.isBundled() ?
                "https://platform.dlite.io" :
                document.location.protocol + '//' + document.location.host + document.location.pathname;
            src += '?src=' + appSrc;
            src += ('&locked=' + !this.$eval(this.viewModel.editable, false));
            //src += this.keycloakQuery(true);
            return src;
        }
    },
    methods: {
        setLoadTimeout() {
            if (this._loadTimeout) {
                clearTimeout(this._loadTimeout);
                this._loadTimeout = undefined;
            }
            this._loadTimeout = setTimeout(() => this.loading = false, 10000);
        },
        keycloakQuery(append) {
            if (ide.auth === 'keycloak') {
                return (append ? '&' : '?') +
                    `KC_URL=${encodeURIComponent(ide.getKeycloakConfiguration()['KC_URL'])}` +
                    `&KC_REALM=${encodeURIComponent(ide.getKeycloakConfiguration()['KC_REALM'])}` +
                    `&KC_CLIENT_ID=${encodeURIComponent(ide.getKeycloakConfiguration()['KC_CLIENT_ID'])}`;
            } else {
                return '';
            }
        },
        async resolveProdLink() {
            const application = this.$eval(this.viewModel.application, null);
            if (ide.isBundled() && application && this.viewModel.version) {
                // default prod link (TODO: support other tenants or direct links to deployed apps)
                let src = document.location.protocol + '//' + document.location.host + '/cincheo.com/' + application.split('-')[0];
                src += this.keycloakQuery();
                let response = await fetch(src);
                if (response.ok) {
                    // application is prod-deployed
                    this.prodLink = src;
                } else {
                    this.prodLink = undefined;
                }
            }
        },
        getEncodedModel() {
            if (this.viewModel.dataSource) {
                if (!this.value) {
                    const content = ide.createBlankApplicationContent(this.viewModel.cid);
                    this.value = content;
                }
                return ide.encodeModel(this.value);
            } else {
                if (!this.viewModel.model) {
                    this.viewModel.model = ide.encodeModel(
                        ide.createBlankApplicationContent(this.viewModel.cid)
                    );
                }
                return this.viewModel.model;
            }
        },
        setModel(model) {
            if (typeof model !== 'string') {
                model = JSON.stringify(model);
            }
            if (this.viewModel.dataSource) {
                this.value = model;
            } else {
                model = ide.encodeModel(model);
                this.viewModel.model = model;
            }
            this.$emit('@model-changed', model);
        },
        update() {
            if (this.viewModel.dataSource) {
                editableComponent.methods.update.apply(this);
            }
            this.$refs['iframe']?.contentWindow?.ide?.updateDataSources();
        },
        async forceRender() {
            this.loading = true;
            this.update();
            this.$forceUpdate();
            this.timestamp = Date.now();
            if (this.$refs['iframe']) {
                this.$refs['iframe'].src = await this.src;
                this.$refs['iframe'].contentWindow.location.href = await this.src;
            }
            this.setLoadTimeout();
        },
        customEventNames() {
            return [
                "@model-changed"
            ];
        },
        propNames() {
            return [
                "cid",
                "editable",
                "fillHeight",
                "application",
                "version",
                "reload",
                "dataSource",
                "field",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                fillHeight: {
                    type: 'checkbox',
                    description: "Stretch vertically to fill the parent component height",
                    literalOnly: true
                },
                editable: {
                    type: 'checkbox',
                    description: "When checked, the final user can modify the application"
                },
                application: {
                    type: 'select',
                    options: viewModel => ide.findAllApps().map(app => ({
                        text: app.name,
                        value: app.id
                    })),
                    description: "The application to be embedded (if not set, the view will self-embed the app, or use the data model if any)",
                    manualApply: true
                },
                version: {
                    type: 'select',
                    defaultValue: 'latest',
                    options: viewModel => $tools.arrayConcat(['latest'], ide.findAllVersions($c(viewModel.cid).$eval(viewModel.application)).map(version => ({
                        text: version.version,
                        value: version.version
                    }))),
                    hidden: viewModel => !$c(viewModel.cid).$eval(viewModel.application, null),
                    literalOnly: true,
                    description: "The version of the application to be embedded"
                },
                reload: {
                    type: 'action',
                    variant: 'secondary',
                    label: 'Reload',
                    icon: 'arrow-clockwise',
                    action: viewModel => {
                        $c(viewModel.cid).forceRender();
                    },
                    hidden: viewModel => !viewModel.application || !viewModel.version
                },

            }
        }

    }
});


