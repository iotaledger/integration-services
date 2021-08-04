let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(String.raw`util`);

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_30(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h9b0c310cd07688f8(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
*/
module.exports.set_panic_hook = function() {
    wasm.set_panic_hook();
};

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);
function __wbg_adapter_196(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h670ccab802e5ed7a(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
module.exports.ChannelType = Object.freeze({ SingleBranch:0,"0":"SingleBranch",MultiBranch:1,"1":"MultiBranch",SingleDepth:2,"2":"SingleDepth", });
/**
*/
module.exports.LedgerInclusionState = Object.freeze({ Conflicting:0,"0":"Conflicting",Included:1,"1":"Included",NoTransaction:2,"2":"NoTransaction", });
/**
*/
class Address {

    static __wrap(ptr) {
        const obj = Object.create(Address.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_address_free(ptr);
    }
    /**
    * @returns {string}
    */
    get addr_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_addr_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} addr_id
    */
    set addr_id(addr_id) {
        var ptr0 = passStringToWasm0(addr_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.address_set_addr_id(this.ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get msg_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_msg_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} msg_id
    */
    set msg_id(msg_id) {
        var ptr0 = passStringToWasm0(msg_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.address_set_msg_id(this.ptr, ptr0, len0);
    }
    /**
    * @param {string} link
    * @returns {Address}
    */
    static from_string(link) {
        var ptr0 = passStringToWasm0(link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_string(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_string() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_to_string(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Address}
    */
    copy() {
        var ret = wasm.address_copy(this.ptr);
        return Address.__wrap(ret);
    }
}
module.exports.Address = Address;
/**
*/
class Author {

    static __wrap(ptr) {
        const obj = Object.create(Author.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_author_free(ptr);
    }
    /**
    * @param {string} seed
    * @param {SendOptions} options
    * @param {number} implementation
    */
    constructor(seed, options, implementation) {
        var ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        var ret = wasm.author_new(ptr0, len0, ptr1, implementation);
        return Author.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {string} seed
    * @param {number} implementation
    * @returns {Author}
    */
    static from_client(client, seed, implementation) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.author_from_client(ptr0, ptr1, len1, implementation);
        return Author.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {Uint8Array} bytes
    * @param {string} password
    * @returns {Author}
    */
    static import(client, bytes, password) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.author_import(ptr0, ptr1, len1, ptr2, len2);
        return Author.__wrap(ret);
    }
    /**
    * @param {string} password
    * @returns {Uint8Array}
    */
    export(password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.author_export(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Author}
    */
    clone() {
        var ret = wasm.author_clone(this.ptr);
        return Author.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    channel_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_channel_address(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {boolean}
    */
    is_multi_branching() {
        var ret = wasm.author_is_multi_branching(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {Client}
    */
    get_client() {
        var ret = wasm.author_get_client(this.ptr);
        return Client.__wrap(ret);
    }
    /**
    * @param {string} psk_seed_str
    * @returns {string}
    */
    store_psk(psk_seed_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(psk_seed_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.author_store_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    get_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_get_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    send_announce() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_send_announce(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    send_keyload_for_everyone(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_send_keyload_for_everyone(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {PskIds} psk_ids
    * @param {PublicKeys} sig_pks
    * @returns {any}
    */
    send_keyload(link, psk_ids, sig_pks) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        _assertClass(psk_ids, PskIds);
        var ptr1 = psk_ids.ptr;
        psk_ids.ptr = 0;
        _assertClass(sig_pks, PublicKeys);
        var ptr2 = sig_pks.ptr;
        sig_pks.ptr = 0;
        var ret = wasm.author_send_keyload(ptr, ptr0, ptr1, ptr2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_tagged_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.author_send_tagged_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_signed_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.author_send_signed_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link_to
    * @returns {any}
    */
    receive_subscribe(link_to) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link_to, Address);
        var ptr0 = link_to.ptr;
        link_to.ptr = 0;
        var ret = wasm.author_receive_subscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_tagged_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_tagged_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_signed_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_signed_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_sequence(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_sequence(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_receive_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    sync_state() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_sync_state(ptr);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    fetch_next_msgs() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_fetch_next_msgs(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    fetch_prev_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_fetch_prev_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {number} num_msgs
    * @returns {any}
    */
    fetch_prev_msgs(link, num_msgs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.author_fetch_prev_msgs(ptr, ptr0, num_msgs);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    gen_next_msg_ids() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.author_gen_next_msg_ids(ptr);
        return takeObject(ret);
    }
}
module.exports.Author = Author;
/**
*/
class Client {

    static __wrap(ptr) {
        const obj = Object.create(Client.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_client_free(ptr);
    }
    /**
    * @param {string} node
    * @param {SendOptions} options
    */
    constructor(node, options) {
        var ptr0 = passStringToWasm0(node, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        var ret = wasm.client_new(ptr0, len0, ptr1);
        return Client.__wrap(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    get_link_details(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.client_get_link_details(ptr, ptr0);
        return takeObject(ret);
    }
}
module.exports.Client = Client;
/**
*/
class Details {

    static __wrap(ptr) {
        const obj = Object.create(Details.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_details_free(ptr);
    }
    /**
    * @returns {MessageMetadata}
    */
    get_metadata() {
        var ret = wasm.details_get_metadata(this.ptr);
        return MessageMetadata.__wrap(ret);
    }
    /**
    * @returns {MilestoneResponse | undefined}
    */
    get_milestone() {
        var ret = wasm.details_get_milestone(this.ptr);
        return ret === 0 ? undefined : MilestoneResponse.__wrap(ret);
    }
}
module.exports.Details = Details;
/**
*/
class Message {

    static __wrap(ptr) {
        const obj = Object.create(Message.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_message_free(ptr);
    }
    /**
    * @returns {Message}
    */
    static default() {
        var ret = wasm.message_default();
        return Message.__wrap(ret);
    }
    /**
    * @param {string | undefined} pk
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {Message}
    */
    static new(pk, public_payload, masked_payload) {
        var ptr0 = isLikeNone(pk) ? 0 : passStringToWasm0(pk, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.message_new(ptr0, len0, ptr1, len1, ptr2, len2);
        return Message.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get_pk() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_get_pk(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get_public_payload() {
        var ret = wasm.message_get_public_payload(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    get_masked_payload() {
        var ret = wasm.message_get_masked_payload(this.ptr);
        return takeObject(ret);
    }
}
module.exports.Message = Message;
/**
*/
class MessageMetadata {

    static __wrap(ptr) {
        const obj = Object.create(MessageMetadata.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messagemetadata_free(ptr);
    }
    /**
    * @returns {boolean}
    */
    get is_solid() {
        var ret = wasm.__wbg_get_messagemetadata_is_solid(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set is_solid(arg0) {
        wasm.__wbg_set_messagemetadata_is_solid(this.ptr, arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get referenced_by_milestone_index() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messagemetadata_referenced_by_milestone_index(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} arg0
    */
    set referenced_by_milestone_index(arg0) {
        wasm.__wbg_set_messagemetadata_referenced_by_milestone_index(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get milestone_index() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messagemetadata_milestone_index(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} arg0
    */
    set milestone_index(arg0) {
        wasm.__wbg_set_messagemetadata_milestone_index(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get ledger_inclusion_state() {
        var ret = wasm.__wbg_get_messagemetadata_ledger_inclusion_state(this.ptr);
        return ret === 3 ? undefined : ret;
    }
    /**
    * @param {number | undefined} arg0
    */
    set ledger_inclusion_state(arg0) {
        wasm.__wbg_set_messagemetadata_ledger_inclusion_state(this.ptr, isLikeNone(arg0) ? 3 : arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get conflict_reason() {
        var ret = wasm.__wbg_get_messagemetadata_conflict_reason(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
    /**
    * @param {number | undefined} arg0
    */
    set conflict_reason(arg0) {
        wasm.__wbg_set_messagemetadata_conflict_reason(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0);
    }
    /**
    * @returns {boolean | undefined}
    */
    get should_promote() {
        var ret = wasm.__wbg_get_messagemetadata_should_promote(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    * @param {boolean | undefined} arg0
    */
    set should_promote(arg0) {
        wasm.__wbg_set_messagemetadata_should_promote(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
    /**
    * @returns {boolean | undefined}
    */
    get should_reattach() {
        var ret = wasm.__wbg_get_messagemetadata_should_reattach(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    * @param {boolean | undefined} arg0
    */
    set should_reattach(arg0) {
        wasm.__wbg_set_messagemetadata_should_reattach(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
    /**
    * @returns {string}
    */
    get message_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagemetadata_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get get_parent_message_ids() {
        var ret = wasm.messagemetadata_get_parent_message_ids(this.ptr);
        return takeObject(ret);
    }
}
module.exports.MessageMetadata = MessageMetadata;
/**
*/
class MilestoneResponse {

    static __wrap(ptr) {
        const obj = Object.create(MilestoneResponse.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_milestoneresponse_free(ptr);
    }
    /**
    * Milestone index.
    * @returns {number}
    */
    get index() {
        var ret = wasm.__wbg_get_milestoneresponse_index(this.ptr);
        return ret >>> 0;
    }
    /**
    * Milestone index.
    * @param {number} arg0
    */
    set index(arg0) {
        wasm.__wbg_set_milestoneresponse_index(this.ptr, arg0);
    }
    /**
    * Milestone timestamp.
    * @returns {BigInt}
    */
    get timestamp() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_milestoneresponse_timestamp(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Milestone timestamp.
    * @param {BigInt} arg0
    */
    set timestamp(arg0) {
        uint64CvtShim[0] = arg0;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.__wbg_set_milestoneresponse_timestamp(this.ptr, low0, high0);
    }
    /**
    * @returns {string}
    */
    get message_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.milestoneresponse_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.MilestoneResponse = MilestoneResponse;
/**
*/
class NextMsgId {

    static __wrap(ptr) {
        const obj = Object.create(NextMsgId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nextmsgid_free(ptr);
    }
    /**
    * @param {string} pk
    * @param {Address} msgid
    * @returns {NextMsgId}
    */
    static new(pk, msgid) {
        var ptr0 = passStringToWasm0(pk, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(msgid, Address);
        var ptr1 = msgid.ptr;
        msgid.ptr = 0;
        var ret = wasm.nextmsgid_new(ptr0, len0, ptr1);
        return NextMsgId.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get_pk() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nextmsgid_get_pk(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Address}
    */
    get_link() {
        var ret = wasm.nextmsgid_get_link(this.ptr);
        return Address.__wrap(ret);
    }
}
module.exports.NextMsgId = NextMsgId;
/**
*/
class PskIds {

    static __wrap(ptr) {
        const obj = Object.create(PskIds.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pskids_free(ptr);
    }
    /**
    * @returns {PskIds}
    */
    static new() {
        var ret = wasm.pskids_new();
        return PskIds.__wrap(ret);
    }
    /**
    * @param {string} id
    */
    add(id) {
        var ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.pskids_add(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Array<any>}
    */
    get_ids() {
        var ret = wasm.pskids_get_ids(this.ptr);
        return takeObject(ret);
    }
}
module.exports.PskIds = PskIds;
/**
*/
class PublicKeys {

    static __wrap(ptr) {
        const obj = Object.create(PublicKeys.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publickeys_free(ptr);
    }
    /**
    * @returns {PublicKeys}
    */
    static new() {
        var ret = wasm.publickeys_new();
        return PublicKeys.__wrap(ret);
    }
    /**
    * @param {string} id
    */
    add(id) {
        var ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.publickeys_add(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Array<any>}
    */
    get_pks() {
        var ret = wasm.publickeys_get_pks(this.ptr);
        return takeObject(ret);
    }
}
module.exports.PublicKeys = PublicKeys;
/**
*/
class SendOptions {

    static __wrap(ptr) {
        const obj = Object.create(SendOptions.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sendoptions_free(ptr);
    }
    /**
    * @returns {boolean}
    */
    get local_pow() {
        var ret = wasm.__wbg_get_sendoptions_local_pow(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set local_pow(arg0) {
        wasm.__wbg_set_sendoptions_local_pow(this.ptr, arg0);
    }
    /**
    * @param {string} url
    * @param {boolean} local_pow
    */
    constructor(url, local_pow) {
        var ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.sendoptions_new(ptr0, len0, local_pow);
        return SendOptions.__wrap(ret);
    }
    /**
    * @param {string} url
    */
    set url(url) {
        var ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.sendoptions_set_url(this.ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get url() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.sendoptions_url(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {SendOptions}
    */
    clone() {
        var ret = wasm.sendoptions_clone(this.ptr);
        return SendOptions.__wrap(ret);
    }
}
module.exports.SendOptions = SendOptions;
/**
*/
class Subscriber {

    static __wrap(ptr) {
        const obj = Object.create(Subscriber.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_subscriber_free(ptr);
    }
    /**
    * @param {string} seed
    * @param {SendOptions} options
    */
    constructor(seed, options) {
        var ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        var ret = wasm.subscriber_new(ptr0, len0, ptr1);
        return Subscriber.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {string} seed
    * @returns {Subscriber}
    */
    static from_client(client, seed) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_from_client(ptr0, ptr1, len1);
        return Subscriber.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @param {Uint8Array} bytes
    * @param {string} password
    * @returns {Subscriber}
    */
    static import(client, bytes, password) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        var ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_import(ptr0, ptr1, len1, ptr2, len2);
        return Subscriber.__wrap(ret);
    }
    /**
    * @returns {Subscriber}
    */
    clone() {
        var ret = wasm.subscriber_clone(this.ptr);
        return Subscriber.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    channel_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_channel_address(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Client}
    */
    get_client() {
        var ret = wasm.subscriber_get_client(this.ptr);
        return Client.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    is_multi_branching() {
        var ret = wasm.subscriber_is_multi_branching(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {string} psk_seed_str
    * @returns {string}
    */
    store_psk(psk_seed_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(psk_seed_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.subscriber_store_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    get_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_get_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {boolean}
    */
    is_registered() {
        var ret = wasm.subscriber_is_registered(this.ptr);
        return ret !== 0;
    }
    /**
    */
    unregister() {
        wasm.subscriber_unregister(this.ptr);
    }
    /**
    * @param {string} password
    * @returns {Uint8Array}
    */
    export(password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.subscriber_export(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_announcement(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_announcement(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_keyload(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_keyload(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_tagged_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_tagged_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_signed_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_signed_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_sequence(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_sequence(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    receive_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_receive_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    send_subscribe(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_send_subscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_tagged_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_send_tagged_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {any}
    */
    send_signed_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ret = wasm.subscriber_send_signed_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    sync_state() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.subscriber_sync_state(ptr);
        return takeObject(ret);
    }
    /**
    * @returns {any}
    */
    fetch_next_msgs() {
        const ptr = this.__destroy_into_raw();
        var ret = wasm.subscriber_fetch_next_msgs(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {any}
    */
    fetch_prev_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_fetch_prev_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {number} num_msgs
    * @returns {any}
    */
    fetch_prev_msgs(link, num_msgs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        var ret = wasm.subscriber_fetch_prev_msgs(ptr, ptr0, num_msgs);
        return takeObject(ret);
    }
}
module.exports.Subscriber = Subscriber;
/**
*/
class UserResponse {

    static __wrap(ptr) {
        const obj = Object.create(UserResponse.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userresponse_free(ptr);
    }
    /**
    * @param {Address} link
    * @param {Address | undefined} seq_link
    * @param {Message | undefined} message
    * @returns {UserResponse}
    */
    static new(link, seq_link, message) {
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        let ptr1 = 0;
        if (!isLikeNone(seq_link)) {
            _assertClass(seq_link, Address);
            ptr1 = seq_link.ptr;
            seq_link.ptr = 0;
        }
        let ptr2 = 0;
        if (!isLikeNone(message)) {
            _assertClass(message, Message);
            ptr2 = message.ptr;
            message.ptr = 0;
        }
        var ret = wasm.userresponse_new(ptr0, ptr1, ptr2);
        return UserResponse.__wrap(ret);
    }
    /**
    * @param {string} link
    * @param {string | undefined} seq_link
    * @param {Message | undefined} message
    * @returns {UserResponse}
    */
    static from_strings(link, seq_link, message) {
        var ptr0 = passStringToWasm0(link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(seq_link) ? 0 : passStringToWasm0(seq_link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ptr2 = 0;
        if (!isLikeNone(message)) {
            _assertClass(message, Message);
            ptr2 = message.ptr;
            message.ptr = 0;
        }
        var ret = wasm.userresponse_from_strings(ptr0, len0, ptr1, len1, ptr2);
        return UserResponse.__wrap(ret);
    }
    /**
    * @returns {UserResponse}
    */
    copy() {
        var ret = wasm.userresponse_copy(this.ptr);
        return UserResponse.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    get_link() {
        var ret = wasm.userresponse_get_link(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    get_seq_link() {
        var ret = wasm.userresponse_get_seq_link(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {Message}
    */
    get_message() {
        var ret = wasm.userresponse_get_message(this.ptr);
        return Message.__wrap(ret);
    }
}
module.exports.UserResponse = UserResponse;

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbg_details_new = function(arg0) {
    var ret = Details.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_new_515b65a8e7699d00 = function() {
    var ret = new Array();
    return addHeapObject(ret);
};

module.exports.__wbg_nextmsgid_new = function(arg0) {
    var ret = NextMsgId.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_push_b7f68478f81d358b = function(arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

module.exports.__wbg_new_59cb74e423758ede = function() {
    var ret = new Error();
    return addHeapObject(ret);
};

module.exports.__wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
};

module.exports.__wbg_static_accessor_MODULE_452b4680e8614c81 = function() {
    var ret = module;
    return addHeapObject(ret);
};

module.exports.__wbg_text_7c3304aebfcffa1a = function() { return handleError(function (arg0) {
    var ret = getObject(arg0).text();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_new_edbe38a4e21329dd = function() {
    var ret = new Object();
    return addHeapObject(ret);
};

module.exports.__wbg_new_80e79fe6852cbe9c = function() { return handleError(function () {
    var ret = new Headers();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_append_441dc2c4b2281095 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

module.exports.__wbindgen_object_clone_ref = function(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

module.exports.__wbg_buffer_9e184d6f785de5ed = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

module.exports.__wbg_newwithbyteoffsetandlength_e57ad1f2ce812c03 = function(arg0, arg1, arg2) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_new_e8101319e4cf95fc = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_newwithstrandinit_155cb1478824b198 = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_has_9fa0c068863afd36 = function() { return handleError(function (arg0, arg1) {
    var ret = Reflect.has(getObject(arg0), getObject(arg1));
    return ret;
}, arguments) };

module.exports.__wbg_fetch_9dbf87b840590e85 = function(arg0, arg1) {
    var ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_fetch_01d048dd000bcda1 = function(arg0) {
    var ret = fetch(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_instanceof_Response_d61ff4c524b8dbc4 = function(arg0) {
    var ret = getObject(arg0) instanceof Response;
    return ret;
};

module.exports.__wbg_status_1a7d875f6e1318cd = function(arg0) {
    var ret = getObject(arg0).status;
    return ret;
};

module.exports.__wbg_url_0ffe73d78f393423 = function(arg0, arg1) {
    var ret = getObject(arg1).url;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_headers_f49eca784c8ebeba = function(arg0) {
    var ret = getObject(arg0).headers;
    return addHeapObject(ret);
};

module.exports.__wbg_iterator_30586bd3e46ee10e = function() {
    var ret = Symbol.iterator;
    return addHeapObject(ret);
};

module.exports.__wbg_get_800098c980b31ea2 = function() { return handleError(function (arg0, arg1) {
    var ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_function = function(arg0) {
    var ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

module.exports.__wbg_call_ba36642bd901572b = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    var ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbg_next_e38a92137a5693de = function(arg0) {
    var ret = getObject(arg0).next;
    return addHeapObject(ret);
};

module.exports.__wbindgen_json_serialize = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = JSON.stringify(obj === undefined ? null : obj);
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_arrayBuffer_b7c95af83e1e2705 = function() { return handleError(function (arg0) {
    var ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_length_2d56cb37075fcfb1 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_new0_85024d5e91a046e9 = function() {
    var ret = new Date();
    return addHeapObject(ret);
};

module.exports.__wbg_getTime_55dfad3366aec58a = function(arg0) {
    var ret = getObject(arg0).getTime();
    return ret;
};

module.exports.__wbg_new_c143a4f563f78c4e = function(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_196(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        var ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

module.exports.__wbindgen_number_new = function(arg0) {
    var ret = arg0;
    return addHeapObject(ret);
};

module.exports.__wbg_userresponse_new = function(arg0) {
    var ret = UserResponse.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_address_new = function(arg0) {
    var ret = Address.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_next_8b73f854755d8e5e = function() { return handleError(function (arg0) {
    var ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_done_86efa5ac73f5b194 = function(arg0) {
    var ret = getObject(arg0).done;
    return ret;
};

module.exports.__wbg_value_708ce1aa93862729 = function(arg0) {
    var ret = getObject(arg0).value;
    return addHeapObject(ret);
};

module.exports.__wbg_self_bb69a836a72ec6e9 = function() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_window_3304fc4b414c9693 = function() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_globalThis_e0d21cabc6630763 = function() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_global_8463719227271676 = function() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_newnoargs_9fdd8f3961dd1bee = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_call_3fc07b7d5fc9022d = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_set_e8ae7b27314e8b98 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_set_73349fc4814e0fc6 = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

module.exports.__wbg_self_86b4b13392c7af56 = function() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_require_f5521a5b85ad2542 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
};

module.exports.__wbg_crypto_b8c92eaac23d0d80 = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_9ad6677321a08dd8 = function(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_dd27e6b0652b3236 = function(arg0) {
    var ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

module.exports.__wbg_newwithlength_a8d1dbcbe703a5c6 = function(arg0) {
    var ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_randomFillSync_d2ba53160aec6aba = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
};

module.exports.__wbg_subarray_901ede8318da52a6 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_e57c9b75ddead065 = function(arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
};

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

module.exports.__wbg_then_c2361a9d5c9a4fcb = function(arg0, arg1) {
    var ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_then_6c9a4bf55755f9b8 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

module.exports.__wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    var ret = false;
    return ret;
};

module.exports.__wbg_resolve_cae3d8f752f5db88 = function(arg0) {
    var ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper4068 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 150, __wbg_adapter_30);
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'iota_streams_wasm_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

