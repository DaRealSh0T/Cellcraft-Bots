// ==UserScript==
// @name         Cellcraft Bots
// @namespace    cellcraft
// @version      1.0.0
// @description  Cellcraft.io Bots
// @author       DaRealSh0T
// @match        https://cellcraft.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cellcraft.io
// @grant        none
// ==/UserScript==

(() => {
	const UTF8Decoder = new TextDecoder();
	const UTF8Encoder = new TextEncoder();
	class Buffer {
		buffer;
		view;
		growable;
		littleEndian = true;
		offset = 0;
		constructor(sizeOrArray, littleEndian = true, growable = true) {
			this.growable = growable;
			if (typeof sizeOrArray == 'number') {
				this.buffer = new Uint8Array(sizeOrArray).buffer;
			} else if (sizeOrArray instanceof ArrayBuffer) {
				this.buffer = sizeOrArray;
			} else {
				this.buffer = new Uint8Array(sizeOrArray).buffer;
			}
			this.view = new DataView(this.buffer);
			this.littleEndian = littleEndian;
		}
		get length() {
			return this.buffer.byteLength;
		}
		get bytesWritten() {
			return this.offset;
		}
		get bytesRead() {
			return this.offset;
		}
		setGrowable(growable) {
			return (this.growable = growable);
		}
		grow(length) {
			if (!this.growable)
				throw new Error(
					"Tried to grow buffer but buffer isn't growable."
				);
			let tmpBuffer = this.buffer;
			this.buffer = new ArrayBuffer(tmpBuffer.byteLength + length);
			new Uint8Array(this.buffer).set(new Uint8Array(tmpBuffer));
			this.view = new DataView(this.buffer);
			tmpBuffer = null;
		}
		validateSize(length) {
			if (this.offset + length > this.length) {
				if (this.growable) {
					this.grow(this.offset + length - this.length + 1);
				} else {
					throw new RangeError(
						'Buffer not large enough to write/read!'
					);
				}
			}
		}
		seek(seek) {
			return (this.offset += seek);
		}
		writeUint8(value) {
			this.validateSize(1);
			this.view.setUint8(this.offset++, value);
			return this.offset;
		}
		readUint8() {
			this.validateSize(1);
			return this.view.getUint8(this.offset++);
		}
		writeInt8(value) {
			this.validateSize(1);
			this.view.setInt8(this.offset++, value);
			return this.offset;
		}
		readInt8() {
			this.validateSize(1);
			return this.view.getInt8(this.offset++);
		}
		writeUint16(value) {
			this.validateSize(2);
			this.view.setUint16(
				(this.offset += 2) - 2,
				value,
				this.littleEndian
			);
			return this.offset;
		}
		readUint16() {
			this.validateSize(2);
			return this.view.getUint16(
				(this.offset += 2) - 2,
				this.littleEndian
			);
		}
		writeInt16(value) {
			this.validateSize(2);
			this.view.setInt16(
				(this.offset += 2) - 2,
				value,
				this.littleEndian
			);
			return this.offset;
		}
		readInt16() {
			this.validateSize(2);
			return this.view.getInt16(
				(this.offset += 2) - 2,
				this.littleEndian
			);
		}
		writeUint32(value) {
			this.validateSize(4);
			this.view.setUint32(
				(this.offset += 4) - 4,
				value,
				this.littleEndian
			);
			return this.offset;
		}
		readUint32() {
			this.validateSize(4);
			return this.view.getUint32(
				(this.offset += 4) - 4,
				this.littleEndian
			);
		}
		writeInt32(value) {
			this.validateSize(4);
			this.view.setInt32(
				(this.offset += 4) - 4,
				value,
				this.littleEndian
			);
			return this.offset;
		}
		readInt32() {
			this.validateSize(4);
			return this.view.getInt32(
				(this.offset += 4) - 4,
				this.littleEndian
			);
		}
		writeFloat32(value) {
			this.validateSize(4);
			this.view.setFloat32(
				(this.offset += 4) - 4,
				value,
				this.littleEndian
			);
			return this.offset;
		}
		readFloat32() {
			this.validateSize(4);
			return this.view.getFloat32(
				(this.offset += 4) - 4,
				this.littleEndian
			);
		}
		writeFloat64(value) {
			this.validateSize(8);
			this.view.setFloat64(
				(this.offset += 8) - 8,
				value,
				this.littleEndian
			);
			return this.offset;
		}
		readFloat64() {
			this.validateSize(8);
			return this.view.getFloat64(
				(this.offset += 8) - 8,
				this.littleEndian
			);
		}
		readUTF8() {
			const bytes = [];
			let pByte = 0;
			while ((pByte = this.readUint8())) {
				bytes.push(pByte);
			}
			return UTF8Decoder.decode(new Uint8Array(bytes));
		}
		writeUTF8(input) {
			const encoded = UTF8Encoder.encode(input);
			this.validateSize(encoded.length + 1);
			for (const byte of encoded) {
				this.writeUint8(byte);
			}
			this.writeUint8(0);
			return this.offset;
		}
		readUTF16() {
			let string = '';
			let pByte = 0;
			while ((pByte = this.readUint16())) {
				string += String.fromCharCode(pByte);
			}
			return string;
		}
		writeUTF16(input) {
			this.validateSize(input.length * 2 + 2);
			for (let i = 0; i < input.length; i++) {
				this.writeUint16(input.charCodeAt(i));
			}
			this.writeUint16(0);
			return this.offset;
		}
		finish(trimmed = true) {
			if (trimmed) return this.buffer.slice(0, this.offset);
			else return this.buffer.slice(0, this.length);
		}
	}

	const mouse = { x: 0, y: 0 };
	let mostRecentServer = '';
	class Client {
		started = false;

		/** @type { WebSocket } */
		ws = null;
		/** @type { HTMLDivElement } */
		botuimain = null;
		/** @type { HTMLSpanElement } */
		botuicount = null;

		ejectStarted = false;

		constructor() {
			setInterval(this.sendMouse.bind(this), 50);

			this.makeGUI();
			this.setupKeys();
			this.connect();
		}

		makeGUI() {
			this.botuimain = document.createElement('div');
			this.botuimain.style['background'] = 'rgba(0,0,0,0.4)';
			this.botuimain.style['top'] = '50px';
			this.botuimain.style['left'] = '9px';
			this.botuimain.style['display'] = 'block';
			this.botuimain.style['position'] = 'absolute';
			this.botuimain.style['text-align'] = 'center';
			this.botuimain.style['font-size'] = '15px';
			this.botuimain.style['color'] = '#FFFFFF';
			this.botuimain.style['padding'] = '7px';
			this.botuimain.style['z-index'] = '1000000';
			this.botuimain.innerHTML += 'Bots: ';

			this.botuicount = document.createElement('span');
			this.botuicount.innerHTML = 'WAITING';

			this.botuimain.appendChild(this.botuicount);
			document.body.appendChild(this.botuimain);

			this.botuimain.onclick = () => {
				if (!this.started) this.startBots();
				else this.stopBots();
			};
		}

		setupKeys() {
			document.addEventListener('keydown', this.keyDown.bind(this));
			document.addEventListener('keyup', this.keyUp.bind(this));
		}

		connect() {
			this.ws = new WebSocket('ws://localhost:1692/');

			this.ws.onopen = this.onopen.bind(this);
			this.ws.onmessage = this.onmessage.bind(this);
			this.ws.onerror = this.onerror.bind(this);
			this.ws.onclose = this.onclose.bind(this);

			this.ws.binaryType = 'arraybuffer';
		}

		send(buffer) {
			if (this.ws && this.ws.readyState == WebSocket.OPEN)
				this.ws.send(buffer);
		}

		get isTyping() {
			return document.querySelectorAll('input:focus').length;
		}

		startBots() {
			if (!this.ws) return;
			const buffer = new Buffer(1);
			buffer.writeUint8(0x01);
			buffer.writeUTF8(mostRecentServer);
			this.send(buffer.finish());
			this.started = true;
		}

		stopBots() {
			if (!this.ws) return;
			const buffer = new Buffer(1);
			buffer.writeUint8(0x02);
			this.send(buffer.finish());
			this.started = false;
		}

		sendSplit() {
			const buffer = new Buffer(1);
			buffer.writeUint8(0x03);
			this.send(buffer.finish());
		}

		sendPowerupDrop() {
			const buffer = new Buffer(1);
			buffer.writeUint8(0x07);
			this.send(buffer.finish());
		}

		sendEject() {
			const buffer = new Buffer(2);
			buffer.writeUint8(0x04);
			buffer.writeUint8(this.ejectStarted ? 0 : 1);
			this.send(buffer.finish());
		}

		sendChat(msg) {
			const buffer = new Buffer(1);
			buffer.writeUint8(0x05);
			buffer.writeUTF8(msg);
			this.send(buffer.finish());
		}

		sendMouse() {
			const buffer = new Buffer(9);
			buffer.writeUint8(0x06);
			buffer.writeInt32(mouse.x);
			buffer.writeInt32(mouse.y);
			this.send(buffer.finish());
		}

		onopen() {
			this.started = false;
			this.ejectStarted = false;
			this.botuicount.innerText = `READY`;
		}

		onmessage({ data }) {
			const buffer = new Buffer(data, true, false);
			switch (buffer.readUint8()) {
				case 0x01:
					const spawned = buffer.readUint16();
					const connected = buffer.readUint16();
					const max = buffer.readUint16();
					this.botuicount.innerText = `${spawned}/${connected}/${max}`;
					break;
			}
		}

		onerror() {}

		onclose() {
			this.ws = null;
			this.started = false;
			setTimeout(this.connect.bind(this), 1000);
			this.botuicount.innerText = `WAITING`;
		}

		keyDown(event) {
			if (this.isTyping || !event.key) return;
			switch (event.key.toLowerCase()) {
				case 'e':
					this.sendSplit();
					break;

				case 'p':
					this.sendPowerupDrop();
					break;

				case 'r':
					if (this.ejectStarted) break;
					this.ejectStarted = true;
					this.sendEject();
					break;

				case 'c':
					let msg = prompt(
						'What do you want the bots to say?',
						'Clone Smasher'
					);
					if (msg) this.sendChat(msg);
					break;
			}
		}

		keyUp(event) {
			if (this.isTyping || !event.key) return;
			switch (event.key.toLowerCase()) {
				case 'r':
					this.ejectStarted = false;
					this.sendEject();
					break;
			}
		}
	}

	let psetserver = window.setserver;
	window.setserver = function (a, b) {
		mostRecentServer = `wss://${a}/`;
		return psetserver(a, b);
	};

	let realSetInt32 = DataView.prototype.setInt32;
	DataView.prototype.setInt32 = function (offset, value, LE) {
		if (
			LE &&
			offset == 5 &&
			this.byteLength == 9 &&
			this.getUint8(0) == 0
		) {
			mouse.y = value;
			mouse.x = this.getInt32(1, true);
		}
		return realSetInt32.apply(this, arguments);
	};

	let client = new Client();
})();
