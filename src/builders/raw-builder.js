/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2022 CINCHEO
 *                    https://www.cincheo.com
 *                    renaud.pawlak@cincheo.com
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


