"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageMap = void 0;
const moment_1 = __importDefault(require("moment"));
/** Handles mapping between message IDs in discord and telegram, for message editing purposes */
class MessageMap {
    constructor() {
        /** The map itself */
        this._map = new Map();
    }
    /**
     * Inserts a mapping into the map
     *
     * @param direction One of the two direction constants of this class
     * @param bridge The bridge this mapping is for
     * @param fromId Message ID to map from, i.e. the ID of the message the bot received
     * @param toId	Message ID to map to, i.e. the ID of the message the bot sent
     */
    insert(direction, bridge, fromId, toId) {
        // Get/create the entry for the bridge
        let keyToIdsMap = this._map.get(bridge);
        if (keyToIdsMap === undefined) {
            keyToIdsMap = new Map();
            this._map.set(bridge, keyToIdsMap);
        }
        // Generate the key and get the corresponding IDs
        const key = `${direction} ${fromId}`;
        let toIds = keyToIdsMap.get(key);
        if (toIds === undefined) {
            toIds = new Set();
            keyToIdsMap.set(key, toIds);
        }
        // Shove the new ID into it
        toIds.add(toId);
        // Start a timeout removing it again after 24 hours
        setTimeout(() => {
            keyToIdsMap.delete(key);
        }, moment_1.default.duration(24, "hours").asMilliseconds());
    }
    /**
     * Gets the ID of a message the bot sent based on the ID of the message the bot received
     *
     * @param direction One of the two direction constants of this class
     * @param bridge The bridge this mapping is for
     * @param fromId Message ID to get corresponding ID for, i.e. the ID of the message the bot received the message
     *
     * @returns Message IDs of the corresponding message, i.e. the IDs of the messages the bot sent
     */
    getCorresponding(direction, bridge, fromId) {
        try {
            // Get the key-to-IDs map
            const keyToIdsMap = this._map.get(bridge);
            // Create the key
            const key = `${direction} ${fromId}`;
            // Extract the IDs
            const toIds = keyToIdsMap.get(key);
            // Return the ID
            return [...toIds];
        }
        catch (err) {
            // Unknown message ID. Don't do anything
            return [];
        }
    }
    getCorrespondingReverse(_direction, bridge, toId) {
        // The ID to return
        let fromId = [];
        // Get the mappings for this bridge
        const keyToIdsMap = this._map.get(bridge);
        if (keyToIdsMap !== undefined) {
            // Find the ID
            const [key] = [...keyToIdsMap].find(([, ids]) => ids.has(toId));
            fromId = key.split(" ");
            fromId.shift();
        }
        return fromId;
    }
    /** Constant indicating direction discord to telegram */
    static get DISCORD_TO_TELEGRAM() {
        return "d2t";
    }
    /** Constant indicating direction telegram to discord */
    static get TELEGRAM_TO_DISCORD() {
        return "t2d";
    }
}
exports.MessageMap = MessageMap;
//# sourceMappingURL=MessageMap.js.map