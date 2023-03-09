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

Vue.component('camera-view', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-modal id="camera-modal" :size="$eval(viewModel.dialogSize)" 
                body-class="p-0"
                hide-footer
                class="vh-100"
            >
                <div class="d-flex flex-column">
                    <video ref="video" class="flex-grow-1" style="object-fit: cover; width: 100%; height: 100%">Video stream not available.</video>
                    <div class="d-flex justify-content-center" style="gap: 0.5rem">
                        <b-button @click="captureImage"><b-icon-camera/></b-button>
                        <b-button variant="danger" @click="hide"><b-icon-x/></b-button>
                    </div>
                </div>
            </b-modal> 
            <canvas ref="canvas" class="d-none" />
        </div>
    `,
    data: function () {
        return {
            streaming: false
        }
    },
    computed: {
        width: function() {
            return this.$evalWithDefault(this.viewModel.imageWidth, 320);
        }
    },
    mounted: function () {
        if (this.showViewLiveResultButton()) {
            return;
        }
    },
    methods: {
        customEventNames() {
            return [
                "@image-captured"
            ];
        },
        customActionNames() {
            const actionNames = [
                {value: 'captureImage', text: 'captureImage()'}
            ];
            return actionNames;
        },
        show(data) {
            this._showData = data;
            this.$root.$emit('bv::show::modal', 'camera-modal');
            this.$nextTick(() => {
                this.$refs['video'].addEventListener(
                    "canplay",
                    (ev) => {
                        if (!this.streaming) {
                            this.height = this.$refs['video'].videoHeight / (this.$refs['video'].videoWidth / this.width);

                            // default in case the ratio cannot be calculated
                            if (isNaN(this.height)) {
                                this.height = this.width / (4 / 3);
                            }

                            this.$refs['video'].setAttribute("width", this.width);
                            this.$refs['video'].setAttribute("height", this.height);
                            this.$refs['canvas'].setAttribute("width", this.width);
                            this.$refs['canvas'].setAttribute("height", this.height);
                            this.streaming = true;
                        }
                    },
                    false
                );
            });
            navigator.mediaDevices
                .getUserMedia({video: true, audio: false})
                .then((stream) => {
                    this.$refs['video'].srcObject = stream;
                    this.$refs['video'].play();
                })
                .catch((err) => {
                    console.error(`An error occurred: ${err}`);
                });
        },
        hide() {
            if (this.streaming) {
                this.streaming = false;
                this.$refs['video'].srcObject.getTracks()[0].stop();
            }
            this.$root.$emit('bv::hide::modal', 'camera-modal');
        },
        showViewLiveResultButton() {
            if (window.self !== window.top) {
                // Ensure that if our document is in a frame, we get the user
                // to first open it in its own tab or window. Otherwise, it
                // won't be able to request permission for camera access.
                //document.querySelector(".contentarea").remove();
                const button = document.createElement("button");
                button.textContent = "View live result of the example code above";
                document.body.append(button);
                button.addEventListener("click", () => window.open(location.href));
                return true;
            }
            return false;
        },
        captureImage() {
            const context = this.$refs['canvas'].getContext("2d");
            if (this.width && this.height) {
                this.$refs['canvas'].width = this.width;
                this.$refs['canvas'].height = this.height;
                context.drawImage(this.$refs['video'], 0, 0, this.width, this.height);

                const data = this.$refs['canvas'].toDataURL("image/png");
                this.$emit('@image-captured', data);
                this.dataModel = data;
                if (typeof this._showData === 'function') {
                    this._showData(data);
                }
            }
            this.hide();
        },
        propNames() {
            return [
                "cid",
                "dialogSize",
                "imageWidth",
                "eventHandlers"
            ];
        },
        customPropDescriptors() {
            return {
                dialogSize: {
                    type: 'select',
                    options: ['sm', 'md', 'lg', 'xl'],
                    description: 'The size of the dialog showing the camera video'
                },
                imageWidth: {
                    type: 'number',
                    editable: true,
                    description: 'The image width in pixels'
                }
            }
        }

    }
});


