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

Vue.component('component-tree-node', {
    template: `
        <span>
            <span ref="node" class="tree-item" :style="filtering ? (matchFilter() ? 'font-weight: bold' : 'opacity: 30%') : (visible ? '' : 'opacity: 50%')">
                <b-icon v-if="routeNode" icon="caret-right" slyle="opacity: 30%" @click="componentSelected"></b-icon>
                    <!-- :icon="hasChildren() ? (expanded ? 'caret-down-fill' : 'caret-right-fill') : (expanded ? 'square-fill' : 'square')" -->
<!--                    :font-scale="hasChildren()?'':'0.5'" -->
                <b-icon v-else 
                    :variant="expanded?undefined:'warning'" 
                    :icon="hasChildren() ? (expanded ? 'caret-down-fill' : 'caret-right-fill') : (expanded ? 'dot' : 'x')" 
                    class="opacity-2 mr-1" 
                    @click="toggle"
                />
                <component-icon v-if="nodeModel.cid === '__trash'" :type="hasChildren() ? 'FullTrash' : 'EmptyTrash'" slyle="opacity: 30%"/>
                <span v-else draggable @dragstart='startDrag($event, nodeModel.cid)' v-b-hover="hover" 
                    style="cursor: pointer" 
                    @click="componentSelected"
                >
                    <component-icon :model="nodeModel"/>
                    <span :style="badgeStyle">
                        <b-badge v-if="targeted" pill variant="warning" style="position: relative; top: -0.1rem;">
                            root
                        </b-badge>
                        <span :style="cidStyle">
                            {{ publicId }}
                        </span>
                        <span v-if="nodeModel.publicName">
                            <b-icon icon="geo-alt-fill" variant="danger"></b-icon>&nbsp;#{{nodeModel.publicName}}
                        </span>
                        <span v-if="nodeModel.dataSource && !nodeModel.dataSource.startsWith('$')" class="text-primary">
                            <b-icon-link/><span style="font-weight: 100">{{ dataSource }}</span>
                        </span>
                        <span v-if="nodeModel.field">
                            <b-icon-arrow-right-short/><span style="font-weight: 100" class="border border-secondary px-1">{{ nodeModel.field }}</span>
                        </span>
                        <template v-if="hasData()">
                            <span :id="'data-'+nodeModel.cid" class="text-primary" style="font-weight: 100"><b-icon-chat-square-dots/></span>
                            <b-popover :target="'data-'+nodeModel.cid" triggers="hover" boundary="window">
                                <pre>{{ JSON.stringify($d(nodeModel.cid), null, 2) }}</pre>
                            </b-popover>
                        </template>

                        <template v-if="userActions()">
                            <b-badge variant="primary" :id="'actions-'+nodeModel.cid" style="position: relative; top: -0.1rem;">
                                f(x)
                            </b-badge>
                            <b-popover :target="'actions-'+nodeModel.cid" triggers="hover" boundary="window">
                                <template #title>User-defined actions - {{ publicId }}</template>
                                <li v-for="action of userActions()">
                                    {{ action.text }}
                                </li>
                            </b-popover>
                        </template>
                        
                    </span>
                </span>
            </span> 
             <ul class="tree" v-if="expanded && hasChildren()">
                <li v-for="item in getChildren()" :key="item.cid">
                    <component-tree-node :ref="item.cid" :nodeModel="item" :filter="filter" :componentStates="componentStates">
                    </component-tree-node>
                </li>
             </ul>
         </span>
    `,
    props: ["nodeModel", "filter", "routeNode", "componentStates"],
    nodeModel: undefined,
    nodeModel: undefined,
    routeNode: undefined,
    componentStates: undefined,
    data: function () {
        return {
            children: undefined,
            selected: ide.selectedComponentId == this.nodeModel.cid,
            targeted: ide.targetedComponentId == this.nodeModel.cid,
            hovered: false,
            visible: true
        }
    },
    computed: {
        filtering: function() {
            return this.filter != null && this.filter.length > 0;
        },
        publicId: function() {
            return (this.nodeModel.title ? this.nodeModel.title + ' - ' : '' ) + components.publicId(this.nodeModel);
        },
        dataSource: function() {
            return $tools.truncate(this.nodeModel.dataSource, 20);
        },
        expanded: {
            get: function() {
                return this.componentStates[this.nodeModel.cid] === undefined || this.componentStates[this.nodeModel.cid] === true;
            },
            set: function(expanded) {
                this.$set(this.componentStates, this.nodeModel.cid, expanded);
            }
        },
        badgeStyle: function () {
            let style = 'border-radius: 0.7rem; font-size: 0.8rem; padding-left: 0.5rem; padding-right: 0.5rem;'
            if (this.selected) {
                style += ` border: ${ide.colors.selection} solid 3px;`;
            }
            if (this.hovered) {
                style += ` border: ${ide.isDarkMode()?'lightgray':'black'} solid 2px;`;
                if (ide.isDarkMode()) {
                    style += ' color: black;';
                }
                style += ' background-color: lightgray';
            }
            return style;
        },
        cidStyle: function () {
            if (!this.filtering && components.hasGeneratedId(this.nodeModel)) {
                return 'opacity: 30%';
            } else {
                return '';
            }
        },
        visibleOnPage: function () {
            return document.getElementById(this.nodeModel.cid) != null;
        }
    },
    created: function () {
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = (cid === this.nodeModel.cid);
            if (this.selected && this.$refs['node'] && !this.isElementVisible(this.$refs['node'])) {
                setTimeout(() => {
                    try {
                        ide.hideOverlays();
                        this.$refs['node'].scrollIntoView();
                        ide.showSelectionOverlay();
                    } catch (e) {
                        // cannot scroll... swallow
                    }
                }, 200);
            }

        });
        this.$eventHub.$on('component-targeted', (cid) => {
            this.targeted = (cid === this.nodeModel.cid);
        });
        this.$eventHub.$on('component-hovered', (cid, hovered) => {
            this.hovered = this.nodeModel.cid === ide.hoveredComponentId;
        });
        this.$eventHub.$on('actions-updated', (cid, actionName) => {
            if (cid === this.nodeModel.cid) {
                this.$forceUpdate();
            }
        });
        this.$eventHub.$on('data-model-changed', (cid) => {
            if (cid === this.nodeModel.cid) {
                this.$forceUpdate();
            }
        });
    },
    methods: {
        $d(component) {
            return $d(component);
        },
        hasData() {
            const data = $d(this.nodeModel.cid);
            if (data === undefined) {
                return false;
            } else {
                const s = JSON.stringify(data);
                return s !== '{}' && s !== '[]';
            }
        },
        userActions: function() {
            let actions = undefined;
            if (userStatelessActionNamesMap.get(this.nodeModel.cid)) {
                actions = [];
                actions.push(...userStatelessActionNamesMap.get(this.nodeModel.cid));
            }
            if (userActionNamesMap.get(this.nodeModel.cid)) {
                if (!actions) {
                    actions = [];
                }
                actions.push(...userActionNamesMap.get(this.nodeModel.cid));
            }
            return actions;
        },
        isElementVisible(el) {
            const rect = el.getBoundingClientRect(),
                vWidth = window.innerWidth || document.documentElement.clientWidth,
                vHeight = window.innerHeight || document.documentElement.clientHeight,
                efp = function (x, y) {
                    return document.elementFromPoint(x, y)
                };

            // Return false if it's not in the viewport
            if (rect.right < 0 || rect.bottom < 0
                || rect.left > vWidth || rect.top > vHeight)
                return false;

            // Return true if any of its four corners are visible
            return (
                el.contains(efp(rect.left, rect.top))
                || el.contains(efp(rect.right, rect.top))
                || el.contains(efp(rect.right, rect.bottom))
                || el.contains(efp(rect.left, rect.bottom))
            );
        },
        matchFilter() {
            return this.nodeModel.cid.indexOf(this.filter) > -1
                || new RegExp("\\b" + this.filter + "\\b").test(JSON.stringify(components.getComponentModel(this.nodeModel.cid)));
        },
        hover: function (hovered) {
            this.hovered = hovered;
            ide.hoverComponent(this.nodeModel.cid, hovered);
            //document.getElementById(this.nodeModel.cid).scrollIntoView({block: "nearest"});
            ide.updateHoverOverlay(this.nodeModel.cid);
            ide.updateSelectionOverlay(ide.selectedComponentId);
        },
        toggle: function () {
            this.expanded = !this.expanded;
        },
        isExpanded: function () {
            return this.expanded;
        },
        hasChildren() {
            return !this.routeNode && this.getChildren().length > 0;
        },
        getChildren: function () {
            return components.getDirectChildren(this.nodeModel);
        },
        componentSelected: function () {
            this.selected = true;
            ide.hideOverlays();
            if (this.routeNode) {
                $tools.go(this.nodeModel.cid);
            }
            setTimeout(() => {
                try {
                    document.getElementById(this.nodeModel.cid).scrollIntoView({block: "end"});
                } catch (e) {
                    // cannot scroll... swallow
                }
                ide.selectComponent(this.nodeModel.cid);
            }, 200);
        },
        startDrag: function (evt, cid) {
            evt.dataTransfer.dropEffect = 'move';
            evt.dataTransfer.effectAllowed = 'all';
            evt.dataTransfer.setData('cid', cid);
        }
    }
});
