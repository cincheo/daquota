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

class Sync {

    static DESCRIPTOR_KEY = "dlite.sync.descriptor";

    userId = undefined;
    baseUrl = 'http://localhost';
    authorizationErrorHandler = undefined;
    resultHandler = undefined;

    /**
     * Create a new sync instance, to access the DLite's sync backend.
     * @param {function} authorizationErrorHandler a callback when the API returns a 401 (unauthorized) code
     * @param {function} resultHandler a callback that is called with the result object returned by each invocation to the sync server
     * @param baseUrl the DLite's sync server base URL
     */
    constructor(authorizationErrorHandler, resultHandler, baseUrl) {
        this.authorizationErrorHandler = authorizationErrorHandler;
        this.resultHandler = resultHandler;
        this.baseUrl = baseUrl;
    }

    /**
     * @private
     */
    async sha1(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hash = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hash));                     // convert buffer to byte array
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
        return hashHex;
    }

    /**
     * @private
     */
    buildKeyString(key) {
        if (Array.isArray(key)) {
            return key
                .map(k => {
                    if (k === "*") {
                        return "[^::]*";
                    } else {
                        return k;
                    }
                })
                .join('::');
        } else {
            return key;
        }
    }

    /**
     * @private
     */
    async getObjectsToPush() {
        let objects = {};
        let descriptor = this.getSyncDescriptor();
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key === Sync.DESCRIPTOR_KEY) {
                continue;
            }
            // TODO: support for ignored keys
            let item = localStorage.getItem(key);
            let version = 0;
            const newSha1 = await this.sha1(item);
            if (descriptor.keys && descriptor.keys[key]) {
                console.debug(key + ': checking for local modification...');
                console.debug('old sha1: ' + descriptor.keys[key].sha1);
                console.debug('new sha1: ' + newSha1);
                version = descriptor.keys[key].version;
                if (descriptor.keys[key].sha1 === newSha1) {
                    // item has not been modified since last sync
                    console.debug(key + ': skipping clean data');
                    continue;
                }
            }
            let object = undefined;
            try {
                object = JSON.parse(item);
            } catch (error) {
                // swallow
            }
            if (object/* && !(Array.isArray(object) && object.length === 0)*/) {
                objects[key] = {
                    data: item,
                    version: version,
                    sha1: newSha1
                };
            }
        }
        return objects;
    }

    /**
     * Apply some actions on the data server-side (not reflecting on the local data).
     * @param key the data key
     * @param actions the actions to be applied
     * @returns {Promise<any>} an object containing a description of what was executed on the server
     */
    async applyActions(key, actions) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.error("applying actions...", actions);

        const response = await fetch(`${this.baseUrl}/sync_apply_actions.php?user=${userId}&key=${key}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(actions)
        });
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        const result = await response.json();
        console.info("result", result);
        return result;
    }

    /**
     * Pushes all the changed data on the server.
     * @param {boolean} dryRun if true, the modified data descriptor is prepared but not sent to the server
     * @returns {Promise<void>} an object containing a description of what was executed on the server
     */
    async push(dryRun) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.info("pushing local storage...");
        let descriptor = { keys: {} };
        console.info("sync descriptor", descriptor);
        let objects = await this.getObjectsToPush(descriptor);
        console.info("objects to push", objects);

        for (const [key, value] of Object.entries(objects)) {
            descriptor.keys[key] = { data: value.data };
            descriptor.keys[key].version = value.version;
            descriptor.keys[key].sha1 = value.sha1;
        }

        console.info("push descriptor", descriptor);

        if (Object.keys(descriptor.keys).length === 0) {
            console.info("nothing to push");
            return;
        } else {
            console.info(Object.keys(descriptor.keys).length + " object(s) to push");
        }

        if (dryRun) {
            return;
        }

        const body = JSON.stringify(descriptor);
        const response = await fetch(`${this.baseUrl}/sync_upload.php?user=${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        });
        ide.monitor('UPLOAD', 'SYNC', body?.length);
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        const pushResult = await response.json();
        console.info("push result", pushResult);

        let newDescriptor = this.getSyncDescriptor();
        for (const [key, value] of Object.entries(pushResult.keys)) {
            if (!newDescriptor.keys[key]) {
                newDescriptor.keys[key] = {};
            }
            if (value.version) {
                newDescriptor.keys[key].version = value.version;
                newDescriptor.keys[key].sha1 = descriptor.keys[key].sha1;
            }
        }

        this.setSyncDescriptor(newDescriptor);

    }

    /**
     * @private
     */
    getSyncDescriptor() {
        if (!this.userId) {
            console.error("set user id first");
            return;
        }
        let descriptor = { 'keys': {} };
        try {
            let d = JSON.parse(localStorage.getItem(Sync.DESCRIPTOR_KEY));
            if (d != null && d[this.userId] != null) {
                descriptor = d[this.userId];
            }
        } catch (err) {
            // swallow
        }
        return descriptor;
    }

    /**
     * @private
     */
    setSyncDescriptor(descriptor) {
        console.info("set descriptor", descriptor);
        if (!this.userId) {
            console.error("set user id first");
            return;
        }
        let d = {};
        try {
            d = JSON.parse(localStorage.getItem(Sync.DESCRIPTOR_KEY));
        } catch (err) {
            // swallow
        }
        if (d == null) {
            d = {};
        }
        d[this.userId] = descriptor;
        localStorage.setItem(Sync.DESCRIPTOR_KEY, JSON.stringify(d));
    }

    /**
     * @private
     */
    clearSyncDescriptor(key) {
        if (key) {
            console.info("clear sync descriptor", key);
            let d = {};
            try {
                d = JSON.parse(localStorage.getItem(Sync.DESCRIPTOR_KEY));
                delete d[this.userId].keys[key];
            } catch (err) {
                console.error(err);
            }
            localStorage.setItem(Sync.DESCRIPTOR_KEY, JSON.stringify(d));
        } else {
            console.info("clear all sync descriptor");
            localStorage.removeItem(Sync.DESCRIPTOR_KEY);
        }
    }

    /**
     * Download the modified data from the server and merges it into the local data.
     * @param {boolean} dryRun if true, the modified data descriptor is fetched from the server but not merged locally
     * @returns {Promise<void>} an object containing a description of what was executed on the server
     */
    async pull(dryRun) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.info("pulling...");
        let localDescriptor = this.getSyncDescriptor();
        const body = JSON.stringify(localDescriptor);

        ide.monitor('UPLOAD', 'SYNC', body?.length);
        const response = await fetch(`${this.baseUrl}/sync_download.php?user=${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        });
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        let result = await response.text();
        ide.monitor('DOWNLOAD', 'SYNC', result?.length);
        result = JSON.parse(result);

        console.info("pull result", result);
        if (!dryRun) {
            for (const [key, value] of Object.entries(result.keys)) {
                let item = JSON.stringify(value.data);
                localStorage.setItem(key, item);
                localDescriptor['keys'][key] = {version: value.version};
                localDescriptor['keys'][key].sha1 = await this.sha1(item);
            }
            this.setSyncDescriptor(localDescriptor);
        }
        return result;
    }

    /**
     * Share the given data with the given user.
     * @param {string} key the data to be shared
     * @param {string} targetUserId the target user id (usually the email)
     * @returns {Promise<void>} an object containing a description of what was executed on the server
     */
    async share(key, targetUserId) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.info("sharing...");
        let localDescriptor = this.getSyncDescriptor();
        const response = await fetch(`${this.baseUrl}/sync_share.php?user=${userId}&key=${key}&target_user=${targetUserId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        const result = await response.json();
        console.info("share result", result);
        if (this.resultHandler) {
            this.resultHandler(result);
        }
        // TODO: flag key as shared
        return result;
    }

    /**
     * Un-share a previously shared data with the given user.
     * @param {string} key the data to be unshared
     * @param {string} targetUserId the target user id (usually the email)
     * @returns {Promise<void>} an object containing a description of what was executed on the server
     */
    async unshare(key, targetUserId) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.info("unsharing...");
        let localDescriptor = this.getSyncDescriptor();
        const response = await fetch(`${this.baseUrl}/sync_unshare.php?user=${userId}&key=${key}&target_user=${targetUserId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(localDescriptor)
        });
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        const result = await response.json();
        console.info("share result", result);
        if (this.resultHandler) {
            this.resultHandler(result);
        }
        // TODO: flag key as shared
        return result;
    }

    /**
     * Deletes a data on the server.
     * @param key the key holding the data
     * @returns {Promise<any>} an object containing a description of what was executed on the server
     */
    async delete(key) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.info("deleting '" + key + "'...");
        const response = await fetch(`${this.baseUrl}/sync_delete.php?user=${userId}&key=${key}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        const result = await response.json();
        console.info("delete result", result);
        if (this.resultHandler) {
            this.resultHandler(result);
        }
        return result;
    }

    /**
     * Send an email to the given user.
     * @param targetUserId the email
     * @param subject the subject of the email
     * @param message the body of the email
     * @returns {Promise<any>} an object containing a description of what was executed on the server
     */
    async sendMail(targetUserId, subject, message) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.info("emailing...");
        const response = await fetch(`${this.baseUrl}/send_mail.php?user=${userId}&target_user=${targetUserId}&subject=${subject}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: message
        });
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        const result = await response.json();
        console.info("email result", result);
        if (this.resultHandler) {
            this.resultHandler(result);
        }
        return result;
    }

    // ================================================
    // For administration purpose
    // ================================================

    /**
     * @private
     */
    restoreSnapshot = function (snapshotFileObject, successCallback, errorCallback) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        let formData = new FormData()
        formData.append('file', snapshotFileObject, snapshotFileObject.name)

        let req = new XMLHttpRequest()
        req.open("POST", `${this.baseUrl}/admin/restore_snapshot.php?user=${userId}&app=${window.bundledApplicationModel?.applicationModel.name}`);
        req.onload = function(event) {
            console.log('response', req.responseText);
            let response = JSON.parse(req.responseText);
            if (successCallback) {
                successCallback(response);
            }
        };
        req.onerror = function(e) {
            if (errorCallback) {
                errorCallback(e);
            }
        }
        req.send(formData)
    }

    /**
     * @private
     */
    restoreSite = function (siteFileObject, successCallback, errorCallback) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        let formData = new FormData()
        formData.append('file', siteFileObject, siteFileObject.name)

        let req = new XMLHttpRequest()
        req.open("POST", `${this.baseUrl}/admin/restore_site.php?user=${userId}&app=${window.bundledApplicationModel?.applicationModel.name}`);
        req.onload = function(event) {
            console.log('response', req.responseText);
            let response = JSON.parse(req.responseText);
            if (response.error) {
                if (errorCallback) {
                    errorCallback(response);
                }
            } else {
                if (successCallback) {
                    successCallback(response);
                }
            }
        };
        req.onerror = function(e) {
            if (errorCallback) {
                errorCallback(e);
            }
        }
        req.send(formData);
    }

    /**
     * @private
     */
    bundle = async function (content, bundleName, bundleParameters) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        let response = null;
        console.info("bundle...", bundleParameters);
        if (bundleParameters.upgrade) {
            response = await fetch(`${this.baseUrl}/admin/generate_bundle.php?user=${encodeURIComponent(userId)}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: content
            });
        } else {
            let extraConfig = '';
            if (bundleParameters.ldap) {
               extraConfig += `\\$LDAP_SERVER='${bundleParameters.ldapServer}';\\$LDAP_SERVER_PORT=${bundleParameters.ldapServerPort};\\$LDAP_PROTOCOL_VERSION=${bundleParameters.ldapProtocolVersion};\\$LDAP_REFERRALS=${bundleParameters.ldapReferrals};\\$LDAP_BASE_DN=${bundleParameters.ldapBaseDN};`;
            }
            response = await fetch(`${this.baseUrl}/admin/generate_bundle.php?user=${encodeURIComponent(userId)}&adminPassword=${encodeURIComponent(bundleParameters.adminPassword)}&dataDirectory=${encodeURIComponent(bundleParameters.dataDirectory)}&extraConfig=${encodeURIComponent(extraConfig)}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: content
            });
        }
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }

        const bundle = await response.blob();
        $tools.download(bundle, bundleName, 'application/zip');

    }

    /**
     * @private
     */
    async updateAdminAccount(account, callback) {
        let userId = this.userId;
        if (!userId) {
            console.error("set user id first");
            return;
        }
        console.info("update admin account...", account);
        const response = await fetch(`${this.baseUrl}/admin/update_admin_account.php?user=${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(account)
        });
        if (response.status === 401) {
            if (this.authorizationErrorHandler) {
                this.authorizationErrorHandler();
                return;
            }
        }
        const result = await response.json();
        console.info("update admin result", result);
        if (callback) {
            callback(result);
        }
    }


}
