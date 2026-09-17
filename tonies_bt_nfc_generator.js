// Toniebox 2 Bluetooth NFC Generator for Flipper Zero
// Enter the Bluetooth Classic MAC as six hexadecimal bytes.
// Creates /ext/nfc/Tonies_BT_<MAC>.nfc

let eventLoop = require("event_loop");
let gui = require("gui");
let byteInput = require("gui/byte_input");
let dialog = require("gui/dialog");
let storage = require("storage");

function hexByte(value) {
    let s = value.toString(16).toUpperCase();

    if(s.slice(0, 2) === "0X") {
        s = s.slice(2);
    }

    if(s.length < 2) {
        s = "0" + s;
    }

    return s;
}

function makeMacStrings(buffer) {
    let b = Uint8Array(buffer);

    let normal =
        hexByte(b[0]) + " " +
        hexByte(b[1]) + " " +
        hexByte(b[2]) + " " +
        hexByte(b[3]) + " " +
        hexByte(b[4]) + " " +
        hexByte(b[5]);

    let compact =
        hexByte(b[0]) +
        hexByte(b[1]) +
        hexByte(b[2]) +
        hexByte(b[3]) +
        hexByte(b[4]) +
        hexByte(b[5]);

    let reversed =
        hexByte(b[5]) + " " +
        hexByte(b[4]) + " " +
        hexByte(b[3]) + " " +
        hexByte(b[2]) + " " +
        hexByte(b[1]) + " " +
        hexByte(b[0]);

    return {
        normal: normal,
        compact: compact,
        reversed: reversed
    };
}

function buildNfc(macReversed) {
    let prefix =
        "E1 40 0E 01 03 50 92 20 1E " +
        "61 70 70 6C 69 63 61 74 69 6F 6E 2F " +
        "76 6E 64 2E 62 6C 75 65 74 6F 6F 74 " +
        "68 2E 65 70 2E 6F 6F 62 1E 00 ";

    let suffix =
        " 15 09 " +
        "74 6F 6E 69 65 73 20 68 65 61 64 70 68 6F 6E 65 73 20 42 54 " +
        "51 01 0B 54 02 65 6E " +
        "31 32 33 34 35 30 30 33 " +
        "FE " +
        "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";

    let data = prefix + macReversed + suffix;

    return (
        "Filetype: Flipper NFC device\n" +
        "Version: 4\n" +
        "# Device type can be ISO14443-3A, ISO14443-3B, ISO14443-4A, ISO14443-4B, ISO15693-3, FeliCa, NTAG/Ultralight, Mifare Classic, Mifare Plus, Mifare DESFire, SLIX, ST25TB, NTAG4xx, Type 4 Tag, EMV\n" +
        "Device type: SLIX\n" +
        "# UID is common for all formats\n" +
        "UID: E0 04 01 53 29 7A 2B FF\n" +
        "# ISO15693-3 specific data\n" +
        "# Data Storage Format Identifier\n" +
        "DSFID: 00\n" +
        "# Application Family Identifier\n" +
        "AFI: 00\n" +
        "# IC Reference - Vendor specific meaning\n" +
        "IC Reference: 01\n" +
        "# Lock Bits\n" +
        "Lock DSFID: false\n" +
        "Lock AFI: false\n" +
        "# Number of memory blocks, valid range = 1..256\n" +
        "Block Count: 28\n" +
        "# Size of a single memory block, valid range = 01...20 (hex)\n" +
        "Block Size: 04\n" +
        "Data Content: " + data + "\n" +
        "# Block Security Status: 01 = locked, 00 = not locked\n" +
        "Security Status: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00\n" +
        "# SLIX specific data\n" +
        "# SLIX capabilities field affects emulation modes. Possible options: Default, AcceptAllPasswords\n" +
        "Capabilities: Default\n" +
        "# Passwords are optional. If a password is omitted, a default value will be used\n" +
        "Password EAS: 00 00 00 00\n" +
        "# SLIX Lock Bits\n" +
        "Lock EAS: false\n"
    );
}

let views = {
    mac: byteInput.makeWith({
        length: 6,
        header: "Headset Bluetooth MAC"
    }),

    result: dialog.makeWith({
        header: "Tonie BT NFC",
        text: "Waiting...",
        center: "OK"
    })
};

eventLoop.subscribe(
    views.mac.input,
    function(_sub, buffer, gui, eventLoop, views, storage) {
        let mac = makeMacStrings(buffer);
        let path = "/ext/nfc/Tonies_BT_" + mac.compact + ".nfc";

        if(!storage.directoryExists("/ext/nfc")) {
            storage.makeDirectory("/ext/nfc");
        }

        let file = storage.openFile(path, "w", "create_always");

        if(file === undefined) {
            views.result.set("text", "Could not create\n/ext/nfc file");
            gui.viewDispatcher.switchTo(views.result);
            return;
        }

        let content = buildNfc(mac.reversed);
        let written = file.write(content);
        file.close();

        if(written !== content.length) {
            views.result.set("text", "Write incomplete.\nCheck SD card.");
        } else {
            views.result.set(
                "text",
                "Saved:\nTonies_BT_" + mac.compact + ".nfc\n\nOpen NFC > Saved"
            );
        }

        gui.viewDispatcher.switchTo(views.result);
    },
    gui,
    eventLoop,
    views,
    storage
);

eventLoop.subscribe(
    views.result.input,
    function(_sub, _button, eventLoop) {
        eventLoop.stop();
    },
    eventLoop
);

eventLoop.subscribe(
    gui.viewDispatcher.navigation,
    function(_sub, _item, eventLoop) {
        eventLoop.stop();
    },
    eventLoop
);

gui.viewDispatcher.switchTo(views.mac);
eventLoop.run();
