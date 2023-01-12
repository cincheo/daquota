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

/**
 * A class that handles a parameterizable cache of values in the local storage.
 */
class LocalStorageCache {

    baseKey;
    expirationMilliseconds;
    maxEntries;
    evictionStrategy;

    /**
     * Creates a new cache.
     * @param baseKey the local-storage base key (to avoid clashes)
     * @param expirationMilliseconds the cache entries expiration duration (TTL - Time To Live)
     * @param maxEntries the maximum cache size (when reached some entries will be evicted)
     * @param evictionStrategy LRU (default) or LFU
     */
    constructor(baseKey, expirationMilliseconds, maxEntries, evictionStrategy) {
        this.baseKey = baseKey;
        this.expirationMilliseconds = expirationMilliseconds || 1000 * 60 * 60 * 24;
        this.maxEntries = maxEntries || 100;
        this.evictionStrategy = evictionStrategy || 'LRU';
    }

    /**
     * Gets the full key in the local storage from a relative key.
     * @private
     * @param key a relative key
     * @returns {string} the full local-storage key
     */
    fullKey(key) {
        return this.baseKey + '::' + key;
    }

    /**
     * Gets the value stored in the cache for the given key if found, undefined otherwise.
     * @param key the value to fetch
     * @returns {undefined|any} a value if found, undefined otherwise
     */
    getValue(key) {
        let cached = localStorage.getItem(this.fullKey(key));
        if (cached) {
            cached = JSON.parse(cached);
            const cacheDescriptor = this.cacheDescriptor(key);
            if (Object.keys(cacheDescriptor).length > this.maxEntries) {
                this.clean(
                    cacheDescriptor,
                    [this.fullKey(key)],
                    Math.max(Math.ceil(this.maxEntries * 0.1), Object.keys(cacheDescriptor).length - this.maxEntries)
                );
            }
            this.saveCacheDescriptor(cacheDescriptor);
            if (Date.now() - cacheDescriptor[this.fullKey(key)].ts < this.expirationMilliseconds) {
                return cached;
            } else {
                localStorage.removeItem(this.fullKey(key));
            }
        }
        return undefined;
    }

    /**
     * Sets a value in the cache for the corresponding key.
     * @param key the key
     * @param value the value to store
     */
    setValue(key, value) {
        const cacheDescriptor = this.cacheDescriptor(key, true);
        if (Object.keys(cacheDescriptor).length > this.maxEntries) {
            this.clean(
                cacheDescriptor,
                [this.fullKey(key)],
                Math.max(Math.ceil(this.maxEntries * 0.1), Object.keys(cacheDescriptor).length - this.maxEntries)
            );
        }
        localStorage.setItem(this.fullKey(key), JSON.stringify(value));
        this.saveCacheDescriptor(cacheDescriptor);
    }

    /**
     * Gets the cache descriptor of this cache (an object containing all the entries with the ts, lu, and cu fields).
     * @private
     * @param {string} [key] a key for the entry to add or to update
     * @param [resetTimestamp] if the entry exists, reset the ts field
     * @returns {any} the (modified if key is defined) cache descriptor (to be saved if modified)
     */
    cacheDescriptor(key, resetTimestamp) {
        let cacheDescriptor = localStorage.getItem(this.fullKey('descriptor'));
        if (!cacheDescriptor) {
            cacheDescriptor = {};
        } else {
            cacheDescriptor = JSON.parse(cacheDescriptor);
        }
        if (key) {
            let entry = cacheDescriptor[this.fullKey(key)];
            if (!entry) {
                entry = {ts: Date.now(), cu: 0};
                cacheDescriptor[this.fullKey(key)] = entry;
            }
            if (resetTimestamp) {
                entry.ts = Date.now();
            }
            entry.lu = Date.now();
            entry.cu = entry.cu + 1;
        }
        return cacheDescriptor;
    }

    /**
     * Saves the cache descriptor.
     * @private
     * @param cacheDescriptor the cache descriptor
     */
    saveCacheDescriptor(cacheDescriptor) {
        localStorage.setItem(this.fullKey('descriptor'), JSON.stringify(cacheDescriptor));
    }

    /**
     * Clears the cache (removes all entries, values, and resets the descriptor).
     */
    clear() {
        ide.clearLocalStorageKeys(this.fullKey('.*'));
    }

    /**
     * Cleans the entries that need to be removed accordingly to the eviction strategy of the cache.
     * @param {object} cacheDescriptor the cache descriptor (to be saved after the function because possibly modified)
     * @param {string[]} excludedKeys a list of keys that cannot be removed from the cache (even if eligible to be evicted)
     * @param {number} numberOfEntriesToRemove
     */
    clean(cacheDescriptor, excludedKeys, numberOfEntriesToRemove) {
        excludedKeys = excludedKeys || [];
        const entries = Object.entries(cacheDescriptor).map(entry => {
            return {
                key: entry[0],
                // last use
                lu: entry[1].lu,
                // count of use
                cu: entry[1].cu,
                // initial timestamp
                ts: entry[1].ts
            }
        });
        switch(this.evictionStrategy) {
            case 'LFU':
                entries.sort((entry1, entry2) => {
                    const now = Date.now();
                    return (entry2.cu / (now - entry2.ts)) - (entry1.cu / (now - entry1.ts));
                });
                break;
            default: // LRU
                entries.sort((entry1, entry2) => entry1.lu - entry2.lu);
        }
        for (let i = 0; i < numberOfEntriesToRemove; i++) {
            if (excludedKeys.includes(entries[i].key)) {
                continue;
            }
            delete cacheDescriptor[entries[i].key];
            localStorage.removeItem(entries[i].key);
        }
    }

    /**
     * Gets the size of the cache (number of stored entries).
     * @returns {number} the number of stored entries
     */
    size() {
        return ide.getMatchingLocalStorageKeys(this.fullKey('.*')).filter(keys => !keys.endsWith('::descriptor')).length;
    }

}