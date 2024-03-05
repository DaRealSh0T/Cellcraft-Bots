const UTF8Decoder = new TextDecoder();
const UTF8Encoder = new TextEncoder();
module.exports = class Buffer {
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
			throw new Error("Tried to grow buffer but buffer isn't growable.");
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
				throw new RangeError('Buffer not large enough to write/read!');
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
		this.view.setUint16((this.offset += 2) - 2, value, this.littleEndian);
		return this.offset;
	}
	readUint16() {
		this.validateSize(2);
		return this.view.getUint16((this.offset += 2) - 2, this.littleEndian);
	}
	writeInt16(value) {
		this.validateSize(2);
		this.view.setInt16((this.offset += 2) - 2, value, this.littleEndian);
		return this.offset;
	}
	readInt16() {
		this.validateSize(2);
		return this.view.getInt16((this.offset += 2) - 2, this.littleEndian);
	}
	writeUint32(value) {
		this.validateSize(4);
		this.view.setUint32((this.offset += 4) - 4, value, this.littleEndian);
		return this.offset;
	}
	readUint32() {
		this.validateSize(4);
		return this.view.getUint32((this.offset += 4) - 4, this.littleEndian);
	}
	writeInt32(value) {
		this.validateSize(4);
		this.view.setInt32((this.offset += 4) - 4, value, this.littleEndian);
		return this.offset;
	}
	readInt32() {
		this.validateSize(4);
		return this.view.getInt32((this.offset += 4) - 4, this.littleEndian);
	}
	writeFloat32(value) {
		this.validateSize(4);
		this.view.setFloat32((this.offset += 4) - 4, value, this.littleEndian);
		return this.offset;
	}
	readFloat32() {
		this.validateSize(4);
		return this.view.getFloat32((this.offset += 4) - 4, this.littleEndian);
	}
	writeFloat64(value) {
		this.validateSize(8);
		this.view.setFloat64((this.offset += 8) - 8, value, this.littleEndian);
		return this.offset;
	}
	readFloat64() {
		this.validateSize(8);
		return this.view.getFloat64((this.offset += 8) - 8, this.littleEndian);
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
};
//# sourceMappingURL=Buffer.js.map
