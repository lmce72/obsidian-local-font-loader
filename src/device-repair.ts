/**
 * Device-list self-repair.
 *
 * `data.json` is synced, so a sync conflict unions the two sides' device maps. A device's real
 * identity is a UUID minted into device-local storage — which a vault copy, a cleared cache or a
 * reinstall does not carry over — so the same physical device can end up registered under more
 * than one id. The union then preserves every one of them, and each conflict adds another row to
 * the device list.
 *
 * This module decides which entries describe the same device and which one of them survives. It
 * is deliberately free of Obsidian APIs: the decision is pure data in, pure plan out, so it can
 * be reasoned about — and checked — without a running app, and the plugin class only applies the
 * plan it returns.
 */

import type { DeviceMeta } from './types';

/** One set of entries that describe the same physical device. */
export interface DeviceDuplicateGroup {
    /** The identity the members agree on; see {@link deviceIdentityKey}. */
    key: string;
    /** Every id in the group, ascending — a stable order for the canonical pick. */
    ids: string[];
    /**
     * When the members were alive, for groups that a model alone cannot settle. Populated on the
     * ambiguity list, absent on groups merged on identity alone.
     */
    history?: DeviceGroupHistory;
}

/** What a repair does with one duplicate group. */
export interface DeviceMerge {
    /** The id that survives. */
    canonicalId: string;
    /** The ids that go, with their preset bindings moved onto the survivor. */
    removedIds: string[];
    /** The display name the survivor keeps, when any member had one. */
    name?: string;
    /** The metadata the survivor keeps, when any member had any. */
    meta?: DeviceMeta;
}

/** How long a device may go unseen before it counts as gone. */
export const DEVICE_STALE_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * The smallest gap between one id going quiet and the next appearing for them to count as
 * different lifetimes rather than two devices alive at once.
 */
export const SUCCESSION_MIN_GAP_MS = 24 * 60 * 60 * 1000;

/**
 * The largest such gap that still reads as the same device coming back.
 *
 * Losing device-local storage and relaunching happens within minutes, and restoring a vault onto a
 * new machine within days — so a successor appears almost immediately after its predecessor stops.
 * A second tablet bought months after the first was last used has a gap of months, and that gap is
 * what tells the two situations apart.
 */
export const SUCCESSION_MAX_GAP_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * What a group's recorded history says about whether its entries were ever alive together.
 *
 * - `coexisted` — two of the entries were seen over overlapping periods. That is proof of two
 *   devices, and it is the one conclusion this evidence can reach with certainty.
 * - `succession` — every entry went quiet at least a day before the next appeared, no more than a
 *   month before it, and the newest is still being seen. Consistent with one device that lost its
 *   identity and came back — and equally consistent with a second identical device bought after
 *   the first was shelved. Suggestive, never conclusive.
 * - `unknown` — the entries carry no history yet (an install that has not been opened since this
 *   version began recording), or the timestamps do not fit either shape.
 */
export type DeviceGroupHistory = 'coexisted' | 'succession' | 'unknown';

/** Reads one entry's recorded lifetime, with either end absent when it was never recorded. */
function readLifetime(meta: DeviceMeta | undefined): { first: number | null; last: number | null } {
    const parse = (value: string | undefined): number | null => {
        if (!value) {
            return null;
        }
        const time = Date.parse(value);
        return Number.isNaN(time) ? null : time;
    };

    return {
        first: parse(meta && meta.firstSeen),
        last: parse(meta && meta.lastSeen),
    };
}

/**
 * Classifies when a group's entries were alive, which is the only evidence available that can bear
 * on whether they are one device or several.
 *
 * A model cannot identify a phone or a tablet: two SM-X710 tablets report the same model, the same
 * OS and an empty hostname, and Obsidian exposes no device identifier to fall back on — `Platform`
 * carries platform flags only, and the identifiers that would settle it (Android's ANDROID_ID,
 * iOS's identifierForVendor) are reachable only from native code, not from the WebView a plugin
 * runs in. Every attribute a WebView *can* read is either shared between identical devices or
 * drifts on a single one.
 *
 * So this does not answer "are these the same device". It answers a question the timestamps can
 * actually settle: did these entries ever coexist. Note the blind spot that makes the commonest
 * case unprovable — a device that loses its storage relaunches within minutes, so its successor's
 * first appearance lands almost exactly on its own last launch, which is precisely the observation
 * a second identical device launching would also produce. That is why a group with `succession`
 * history is reported for a human to confirm rather than merged automatically.
 *
 * @param ids - The group's ids
 * @param meta - The device metadata map holding the timestamps
 * @param now - The current time in ms; passed in so this stays a pure function
 * @returns The history verdict for the group
 */
export function describeDeviceGroupHistory(
    ids: string[],
    meta: Record<string, DeviceMeta>,
    now: number
): DeviceGroupHistory {
    const spans = ids.map(id => readLifetime(meta[id]));

    // Overlap is checked first and settles the question on its own: two entries seen over the same
    // period cannot be one device, whatever the rest of the timestamps look like.
    for (let i = 0; i < spans.length; i++) {
        for (let j = i + 1; j < spans.length; j++) {
            const a = spans[i];
            const b = spans[j];
            if (a.first === null || a.last === null || b.first === null || b.last === null) {
                continue;
            }
            if (a.first <= b.last && b.first <= a.last) {
                return 'coexisted';
            }
        }
    }

    // An entry with no recorded history belongs to an install not opened since this version began
    // recording, so nothing is known about when it was last alive. That is the state of every
    // entry immediately after an upgrade.
    if (spans.some(span => span.first === null || span.last === null)) {
        return 'unknown';
    }

    const ordered = spans.slice().sort((a, b) => (a.first as number) - (b.first as number));

    const newest = ordered[ordered.length - 1];
    if (!Number.isFinite(now) || now - (newest.last as number) > DEVICE_STALE_MS) {
        return 'unknown';
    }

    for (let i = 0; i < ordered.length - 1; i++) {
        const gap = (ordered[i + 1].first as number) - (ordered[i].last as number);
        if (gap < SUCCESSION_MIN_GAP_MS || gap > SUCCESSION_MAX_GAP_MS) {
            return 'unknown';
        }
    }

    return 'succession';
}

/** The outcome of inspecting the device maps: what to merge, and the resulting alias map. */
export interface DeviceRepairPlan {
    merges: DeviceMerge[];
    /**
     * Same-model groups, each with the history that could not settle them. Never merged here — a
     * model identifies no one device — so they are surfaced for a decision instead of being either
     * merged blind or dropped silently.
     */
    ambiguous: DeviceDuplicateGroup[];
    /** Replaced id → surviving id, chains already flattened. The complete map, not a delta. */
    aliases: Record<string, string>;
    changed: boolean;
}

/** The device maps a plan is built from. */
export interface DeviceRepairInput {
    nameMap: Record<string, string>;
    meta: Record<string, DeviceMeta>;
    aliases: Record<string, string>;
    /** The current time in ms, so the decision stays a pure function of its inputs. */
    now: number;
}

/**
 * Follows an id through the alias map to the id that currently represents it.
 *
 * Chains are normalised when a plan is built, so one hop is normally enough; the loop exists
 * because an alias written by an older version of this plugin is not guaranteed to be flat, and a
 * cycle — however improbable — must terminate rather than hang the plugin on load.
 *
 * @param deviceId - The id to resolve
 * @param aliases - The alias map
 * @returns The surviving id, or the input unchanged when it was never collapsed
 */
export function resolveDeviceAlias(deviceId: string, aliases: Record<string, string> | undefined): string {
    if (!aliases) {
        return deviceId;
    }

    let current = deviceId;
    const seen = new Set<string>([deviceId]);

    while (aliases[current] && !seen.has(aliases[current])) {
        current = aliases[current];
        seen.add(current);
    }

    return current;
}

/**
 * Tells whether a name is one this plugin generated rather than one the user typed.
 *
 * Only generated names are ever refreshed on upgrade — a user-chosen name is never overwritten —
 * and only a user-chosen name is worth keeping when two entries for one device are collapsed.
 *
 * @param name - The stored device name
 * @param meta - The device's recorded metadata, when available
 * @returns True when the name matches a generated default
 */
export function isGeneratedDeviceName(name: string | undefined, meta: DeviceMeta | undefined): boolean {
    if (!name) {
        return false;
    }

    // Legacy "Desktop-Linux" / "Mobile-Android" forms
    if (/^(Desktop|Mobile)-(Linux|Windows|Mac|macOS|iOS|iPadOS|Android|Unknown)$/.test(name)) {
        return true;
    }

    // A name that merely echoes the device's own hostname or model was also produced by the
    // default-naming rule, so it must keep following that rule if the rule changes.
    if (meta && (name === meta.hostname || name === meta.model)) {
        return true;
    }

    return false;
}

/**
 * Derives the identity two entries must share to count as the same device.
 *
 * The key is built only from what a device reports about itself, never from its display name: the
 * name is user-editable, and the entry the user renamed is exactly the one that has to be matched
 * against its unrenamed twin.
 *
 * Platform and OS are part of every key so that a dual-boot machine — one hostname, two
 * installations, two device-local ids — stays two devices instead of being collapsed into one.
 *
 * @param meta - The device's recorded metadata
 * @returns The identity key, or null when this device cannot be identified from its metadata
 */
export function deviceIdentityKey(meta: DeviceMeta | undefined): string | null {
    if (!meta || (meta.platform !== 'mobile' && meta.platform !== 'desktop')) {
        return null;
    }

    const hostname = String(meta.hostname || '').trim().toLowerCase();
    if (hostname) {
        return `${meta.platform}|${meta.os}|host:${hostname}`;
    }

    // Apple's user agent exposes the device *family* — every iPhone model reports "iPhone", every
    // iPad "iPad" — so on those platforms the model identifies nothing and two distinct devices
    // would be merged. Android's user agent carries a real build code ("SM-X710", "PJZ110"),
    // which is specific enough to match on. A device whose metadata yields no usable key is left
    // alone: a missed repair costs a stale row, a wrong one costs a device its presets.
    const model = String(meta.model || '').trim().toLowerCase();
    if (!model || meta.os === 'ios' || meta.os === 'ipados') {
        return null;
    }

    return `${meta.platform}|${meta.os}|model:${model}`;
}

/**
 * Collects the ids that share an identity, keeping only the keys with more than one.
 *
 * Ids already collapsed into a survivor are skipped — the survivor represents them, and counting
 * both would report the same duplication again on every load.
 *
 * @param meta - The device metadata map
 * @param aliases - The alias map
 * @returns The duplicate groups, each with its ids in ascending order
 */
export function findDuplicateDeviceGroups(
    meta: Record<string, DeviceMeta>,
    aliases: Record<string, string> = {}
): DeviceDuplicateGroup[] {
    const groups = new Map<string, string[]>();

    Object.keys(meta || {}).forEach(id => {
        if (aliases[id]) {
            return;
        }

        const key = deviceIdentityKey(meta[id]);
        if (!key) {
            return;
        }

        const ids = groups.get(key);
        if (ids) {
            ids.push(id);
        } else {
            groups.set(key, [id]);
        }
    });

    const duplicates: DeviceDuplicateGroup[] = [];
    groups.forEach((ids, key) => {
        if (ids.length > 1) {
            duplicates.push({ key, ids: ids.slice().sort() });
        }
    });

    return duplicates;
}

/**
 * Chooses which id in a group survives.
 *
 * Order of preference, each step of which every device can compute from the same synced data — so
 * they all reach the same answer and the repair converges instead of ping-ponging between devices:
 *
 * 1. the id that was most recently seen, because that is the entry the device actually running
 *    holds. Merging onto a quiet id instead would make the live device adopt an identity nothing
 *    has seen lately, for no gain.
 * 2. the id the user renamed, since that is the row they recognise.
 * 3. the lowest id, so ties are still deterministic.
 *
 * @param ids - The group's ids, ascending
 * @param nameMap - The device display-name map
 * @param meta - The device metadata map
 * @returns The surviving id
 */
function pickCanonicalId(
    ids: string[],
    nameMap: Record<string, string>,
    meta: Record<string, DeviceMeta>
): string {
    const seenAt = (id: string): number => {
        const stamp = meta[id] && meta[id].lastSeen;
        const time = stamp ? Date.parse(stamp) : Number.NaN;
        return Number.isNaN(time) ? -1 : time;
    };

    const live = ids.filter(id => seenAt(id) >= 0);
    if (live.length > 0) {
        const mostRecent = live.reduce((best, id) => (seenAt(id) > seenAt(best) ? id : best));
        // Only decisive when one entry is strictly newer; equal timestamps fall through.
        if (live.length === 1 || live.some(id => seenAt(id) !== seenAt(mostRecent))) {
            return mostRecent;
        }
    }

    const userNamed = ids.find(id => nameMap[id] && !isGeneratedDeviceName(nameMap[id], meta[id]));
    return userNamed || ids[0];
}

/**
 * Picks the display name the survivor keeps, preferring one the user typed over a generated one.
 *
 * @param canonicalId - The surviving id
 * @param ids - The group's ids
 * @param nameMap - The device display-name map
 * @returns The name to keep, or undefined when no member had one
 */
function pickName(canonicalId: string, ids: string[], nameMap: Record<string, string>): string | undefined {
    if (nameMap[canonicalId]) {
        return nameMap[canonicalId];
    }

    for (const id of ids) {
        if (nameMap[id]) {
            return nameMap[id];
        }
    }

    return undefined;
}

/**
 * Picks the metadata the survivor keeps.
 *
 * Any member's metadata will do — they matched on identity, so they agree on what the device is —
 * but the canonical entry's is preferred because it is the one the alias map points at.
 *
 * The recorded lifetime is the exception: it is the group's, not any one member's, so it is
 * widened to span every member. The survivor then carries the whole history of the physical
 * device, and a later repair sees its full lifetime rather than only the surviving id's share.
 *
 * @param canonicalId - The surviving id
 * @param ids - The group's ids
 * @param meta - The device metadata map
 * @returns The metadata to keep, or undefined when no member had any
 */
function pickMeta(
    canonicalId: string,
    ids: string[],
    meta: Record<string, DeviceMeta>
): DeviceMeta | undefined {
    const source = meta[canonicalId] || ids.map(id => meta[id]).find(Boolean);
    if (!source) {
        return undefined;
    }

    const earliest = ids.map(id => meta[id] && meta[id].firstSeen).filter(Boolean).sort()[0];
    const latest = ids.map(id => meta[id] && meta[id].lastSeen).filter(Boolean).sort().pop();

    return {
        ...source,
        ...(earliest ? { firstSeen: earliest } : {}),
        ...(latest ? { lastSeen: latest } : {}),
    };
}

/**
 * Builds the repair plan for a set of device maps.
 *
 * @param input - The device maps to inspect
 * @returns The merges to apply, the complete alias map, and whether anything is to be done
 */
export function planDeviceRepair(input: DeviceRepairInput): DeviceRepairPlan {
    const nameMap = input.nameMap || {};
    const meta = input.meta || {};
    const previous = input.aliases || {};

    // Start from the aliases already recorded, flattened: a chain left by two successive repairs
    // would otherwise need two lookups to resolve.
    const aliases: Record<string, string> = {};
    Object.keys(previous).forEach(id => {
        const target = resolveDeviceAlias(id, previous);
        if (target !== id) {
            aliases[id] = target;
        }
    });

    // A hostname-keyed group names a machine, and the platform and OS in the key already keep a
    // dual-boot machine as two devices, so those merge on the identity alone. A model-keyed group
    // identifies no one particular device, and — as `describeDeviceGroupHistory` explains — the
    // timestamps cannot settle it either, so it is never merged here. It is reported instead.
    const allGroups = findDuplicateDeviceGroups(meta, aliases);
    const mergeable = allGroups.filter(group => !group.key.includes('|model:'));
    const ambiguous = allGroups
        .filter(group => group.key.includes('|model:'))
        .map(group => ({ ...group, history: describeDeviceGroupHistory(group.ids, meta, input.now) }));

    const merges = mergeable.map(group => {
        const canonicalId = pickCanonicalId(group.ids, nameMap, meta);
        const removedIds = group.ids.filter(id => id !== canonicalId);

        removedIds.forEach(id => {
            aliases[id] = canonicalId;
        });

        return {
            canonicalId,
            removedIds,
            name: pickName(canonicalId, group.ids, nameMap),
            meta: pickMeta(canonicalId, group.ids, meta),
        };
    });

    // A merge can collapse an id that an earlier repair had already remapped, so the finished map
    // is flattened once more and any self-reference dropped.
    Object.keys(aliases).forEach(id => {
        const target = resolveDeviceAlias(id, aliases);
        if (target === id) {
            delete aliases[id];
        } else {
            aliases[id] = target;
        }
    });

    return { merges, ambiguous, aliases, changed: merges.length > 0 };
}

/**
 * Rewrites a list of device ids through the alias map, dropping duplicates.
 *
 * Used for a preset's `targetDevices`: a binding left on a collapsed id would silently stop
 * applying, and the device would look unassigned. The list can never become empty from a
 * non-empty one — every id maps to something — so the "empty array means global default" reading
 * of the `default-preset` sentinel is preserved.
 *
 * @param deviceIds - The ids to rewrite
 * @param aliases - The alias map
 * @returns The rewritten ids, in their original order, without duplicates
 */
export function remapDeviceIds(
    deviceIds: string[] | undefined,
    aliases: Record<string, string>
): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    (deviceIds || []).forEach(id => {
        const mapped = resolveDeviceAlias(id, aliases);
        if (seen.has(mapped)) {
            return;
        }
        seen.add(mapped);
        result.push(mapped);
    });

    return result;
}
