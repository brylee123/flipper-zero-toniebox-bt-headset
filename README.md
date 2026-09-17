# Flipper Toniebox Bluetooth NFC Generator

Generate Flipper Zero `.nfc` files for the Toniebox 2 Bluetooth NFC pairing shortcut.

This script runs directly on a Flipper Zero. Enter the Bluetooth MAC address of a compatible headset, and the script creates a ready-to-emulate SLIX NFC file in the Flipper's NFC folder.

## What It Does

The official Tonies Bluetooth headphones use an NFC tag to provide Bluetooth pairing information to the Toniebox 2.

The NFC data contains a standard Bluetooth OOB pairing record:

```text
application/vnd.bluetooth.ep.oob
```

The Bluetooth device address is stored in reverse byte order inside the NFC payload.

For example:

```text
Bluetooth MAC:
C2:DC:2A:E6:70:B7

Stored in the NFC payload as:
B7 70 E6 2A DC C2
```

This script handles that conversion automatically and generates the complete Flipper Zero NFC file.

## Repository Contents

```text
tonies_bt_nfc_generator.js
```

Flipper Zero JavaScript application that:

- prompts for a six-byte Bluetooth MAC address
- reverses the byte order for the Bluetooth OOB record
- inserts it into the Tonies-compatible NFC payload
- creates a Flipper Zero `.nfc` file
- saves the file directly to `/ext/nfc/`

## Requirements

- Flipper Zero
- microSD card
- firmware with JavaScript support
- Toniebox 2 with Bluetooth support
- Bluetooth headphones or another compatible Bluetooth audio device
- the device's Bluetooth Classic / BR-EDR MAC address

## Installation

Download:

```text
tonies_bt_nfc_generator.js
```

Copy it to:

```text
/ext/apps/Scripts/
```

On the Flipper Zero, open:

```text
Apps
└── Scripts
    └── tonies_bt_nfc_generator
```

## Usage

Run the script.

The Flipper will display a six-byte hexadecimal input screen.

Enter the Bluetooth MAC address of your headset.

For example:

```text
C2 DC 2A E6 70 B7
```

Press **Save**.

The script automatically converts the address to:

```text
B7 70 E6 2A DC C2
```

and writes a new NFC file such as:

```text
/ext/nfc/Tonies_BT_C2DC2AE670B7.nfc
```

Then open:

```text
NFC
└── Saved
    └── Tonies_BT_C2DC2AE670B7
```

Choose **Emulate** and place the Flipper near the NFC reader area of the Toniebox 2.

The Bluetooth headset should already be powered on and ready to accept a connection.

## Generated NFC Format

The generated file emulates an ICODE SLIX / ISO15693 tag using the same basic structure observed from the official Tonies Bluetooth headphone NFC tag.

Relevant fields include:

```text
Device type: SLIX
Block Count: 28
Block Size: 04
```

The NDEF payload contains:

```text
application/vnd.bluetooth.ep.oob
```

followed by the Bluetooth device address and Bluetooth device information.

The script modifies only the Bluetooth address portion of the known working payload.

## Finding the Correct Bluetooth Address

The required address is normally the device's Bluetooth Classic / BR-EDR address.

This may be different from:

- a Bluetooth Low Energy address
- a randomized BLE address
- an address reported by some phone Bluetooth scanners

If the generated NFC tag does not work, verify that you are using the headset's Classic Bluetooth address.

## Example

Input:

```text
C2 DC 2A E6 70 B7
```

Converted payload bytes:

```text
B7 70 E6 2A DC C2
```

Generated file:

```text
Tonies_BT_C2DC2AE670B7.nfc
```

## Background

This project is based on community research into the NFC tag used by the official Tonies Bluetooth headphones.

A Flipper Zero dump of the official tag showed that it contains a standard Bluetooth Out-of-Band pairing NDEF record rather than a completely proprietary pairing format.

Community testing found that replacing the Bluetooth address in that NFC payload with the address of another Bluetooth headset could allow the Toniebox 2 to connect using the same NFC-assisted workflow.

Related discussion:

- `nortakales/flipper-zero-tonies`
- GitHub issue `#197` — Bluetooth headset NFC pairing discussion

## Limitations

This project is experimental.

Compatibility can depend on:

- Toniebox firmware
- Flipper Zero firmware
- headset Bluetooth implementation
- whether the correct Bluetooth Classic address is used
- future changes made by Tonies

The NFC payload currently retains several values from the original community dump, including the SLIX UID and secondary NDEF data.

It has not been established that every field is required by the Toniebox.

## Possible Future Improvements

Potential additions include:

- custom Bluetooth device names
- automatic filename editing
- support for multiple saved headset profiles
- direct emulation after generation
- configurable NFC UID
- support for writing compatible physical SLIX tags
- validation of generated NDEF records

## Disclaimer

This project is unofficial and is not affiliated with, endorsed by, or sponsored by Tonies, Boxine, or Flipper Devices.

Use it only with hardware and Bluetooth devices you own or are authorized to use.

Product names and trademarks belong to their respective owners.

## License

Consider using the MIT License if you want others to be able to freely use, modify, and redistribute the script while retaining attribution.
