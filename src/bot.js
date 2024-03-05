const { isMainThread, workerData, parentPort } = require('node:worker_threads');
const WebSocket = require('ws');
const Buffer = require('./Buffer.js');
const config = require('../files/config.json');
const ProxyAgent = require('proxy-agent');
const fs = require('node:fs');
const performance = require('perf_hooks').performance;
const crypto = require('crypto');
const md5 = text => crypto.createHash('md5').update(text).digest('hex');

let proxies = fs
	.readFileSync('files/proxies.txt', 'utf-8')
	.trim()
	.replace(/\r\n/g, '\n')
	.split('\n');

proxies = proxies.map(a => `${config.proxyType}://${a.trim()}`);

let bannedProxies = fs
	.readFileSync('files/bannedProxies.txt', 'utf-8')
	.trim()
	.replace(/\r\n/g, '\n')
	.split('\n');

let accounts = fs
	.readFileSync('files/accounts.txt', 'utf-8')
	.replace(/\r\n/g, '\n')
	.split('\n');

let removed = 0;
for (let i = 0; i < proxies.length; ) {
	if (bannedProxies.includes(proxies[i])) {
		proxies.splice(i, 1);
		removed++;
	} else {
		i++;
	}
}

console.log(`Removed ${removed} banned proxies!`);
if (isMainThread) {
	console.error('You started the wrong file. Please start with index.js.');
	process.exit();
}

const mouse = {
	x: 0,
	y: 0,
};

const dropsAtMouse = true;

const POWERUPS = {
	NULL: 0,
	REC: 1,
	SPEED: 2,
	GROWTH: 3,
	SPAWNVIRUS: 4,
	MOTHERCELL: 5,
	PORTAL: 6,
	SHOT360: 7,
	FREEZE: 8,
	GOLDORE: 9,
	WALL: 10,
	ANTIFREEZE: 11,
	ANTIREC: 12,
	FROZENVIRUS: 13,
};

const _0x9713x2 = '~9B\\x$';
const v2za0 = [
	_0x9713x2.charCodeAt(0),
	_0x9713x2.charCodeAt(1),
	_0x9713x2.charCodeAt(2) + 73,
	_0x9713x2.charCodeAt(3),
	_0x9713x2.charCodeAt(4) + 227,
	_0x9713x2.charCodeAt(5),
];

class Bot {
	/** @type { WebSocket } */
	ws = null;

	lastSpawn = performance.now();
	CLIENTPHP_ccv = ~~(5535 + 60000 * Math.random()) + 1;
	CLIENTPHP_ch = 50;
	clientPHPDecodedReturn = 0;
	pkt64Response = -1;
	emgaaEncoded = 5;
	emgaa = 'bbhnf';

	gameversion = 118;
	protocolversion = 22;
	finishedHandshake = false;
	spawned = false;
	accountUser = '';
	accountPass = '';

	skinID = 9;
	selectedWearables = [];

	myCellIds = new Set();

	draggingPowerup = false;
	draggingPowerupType = 0x01;

	map = {
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	};

	destructed = false;
	infDone = false;
	canSpawn = false;
	ip = '';
	sessionVerifyCookie = '';

	mArray = [];

	/**
	 * @param { number } id
	 * @param { string } server
	 */
	constructor(id, server) {
		this.id = id;
		this.server = server;
		this.connect();

		this.spawnInterval = setInterval(this.spawn.bind(this), 2500);
		this.pingInterval = setInterval(this.ping.bind(this), 18000);
		if (dropsAtMouse)
			this.mouseInterval = setInterval(this.sendMouse.bind(this), 50);
	}

	dtor() {
		this.destructed = true;
		clearInterval(this.mouseInterval);
		clearInterval(this.spawnInterval);
		clearInterval(this.pingInterval);
		if (this.ws) this.ws.terminate();
	}

	reset() {
		this.CLIENTPHP_ccv = ~~(5535 + 60000 * Math.random()) + 1;
		this.CLIENTPHP_ch = 50;
		this.clientPHPDecodedReturn = 0;
		this.pkt64Response = -1;
		this.emgaaEncoded = 5;
		this.finishedHandshake = false;
		this.myCellIds = new Set();
		this.spawned = false;
		this.canSpawn = false;
		this.infDone = false;
		this.mArray = [];
	}

	// get spawned() {
	// 	return this.finishedHandshake;
	// }

	/**
	 * @param {number} d
	 * @returns {number}
	 */
	decodeClientPHPReturn(d) {
		var b = 0;
		if (d && !isNaN(d)) {
			if (((d = '' + d), d.length > 5)) {
				var x = d.substr(0, 5),
					_ = d.substr(5);
				if (!isNaN(x) && !isNaN(_)) {
					for (var e = 0, t = 0; t < x.length; t++) {
						e += (parseInt(x.substr(t, 1)) + 30) * (t + 1);
					}
					e == parseInt(_) && (b = Math.max(parseInt(x) - 10000, 0));
				}
			} else {
				b = parseInt(d);
			}
		}
		return b;
	}

	async clientphprequest() {
		let code = '36873532';
		this.CLIENTPHP_ccv = 52577;
		this.clientPHPDecodedReturn = this.decodeClientPHPReturn(code);

		for (var b = 0; b < this.emgaa.length; b++) {
			this.emgaaEncoded +=
				this.emgaa.charCodeAt(b) * (1 - (!b || b % 2 ? 0 : 2)) -
				1 * (b ? 0 : 1);
		}
		this.emgaaEncoded--;

		this.CLIENTPHP_ch = 60;
	}

	send(buffer) {
		if (this.ws && this.ws.readyState == WebSocket.OPEN) {
			this.ws.send(buffer);
		}
	}

	async connect() {
		this.reset();
		await this.clientphprequest();
		// console.log('sessionVerifyCookie = ', this.sessionVerifyCookie);
		this.ip = proxies[Math.floor(Math.random() * proxies.length)];
		this.ws = new WebSocket(this.server, {
			headers: {
				'accept-language': 'en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
				'cache-control': 'no-cache',
				pragma: 'no-cache',
				'sec-websocket-extensions':
					'permessage-deflate; client_max_window_bits',
				'sec-websocket-version': '13',
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
			},
			rejectUnauthorized: false,
			agent: config.useProxies ? new ProxyAgent(this.ip) : undefined,
		});
		this.ws.on('open', this.open.bind(this));
		this.ws.on('message', this.message.bind(this));
		this.ws.on('error', this.error.bind(this));
		this.ws.on('close', this.close.bind(this));
		this.ws.binaryType = 'arraybuffer';
	}

	open() {
		const buffer = new Buffer(13);
		buffer.writeUint8(245);
		buffer.writeUint16(this.protocolversion);
		buffer.writeUint16(this.gameversion);
		buffer.writeUint32(this.CLIENTPHP_ccv);
		buffer.writeUint32(this.checksum(buffer.finish(false), 0, 9, 245));
		this.send(buffer.finish());
	}

	dropv2(powerupId) {
		if (!this.finishedHandshake) return;
		let dropX, dropY;
		if (
			!dropsAtMouse &&
			(powerupId == POWERUPS.MOTHERCELL ||
				powerupId == POWERUPS.SPAWNVIRUS ||
				powerupId == POWERUPS.PORTAL)
		) {
			switch (~~(Math.random() * 3)) {
				case 2:
					let total = Math.random() * 100;
					if (~~(Math.random() * 2) == 1) {
						dropX = total * this.map.right;
						dropY = total * this.map.bottom;
					} else {
						dropX = this.map.right - total * this.map.right;
						dropY = total * this.map.bottom;
					}
					break;
				case 1:
					let centerX = this.map.right / 2;
					let centerY = this.map.bottom / 2;
					const angle = Math.random() * 2 * Math.PI;
					dropX = centerX + (centerX - 50) * Math.cos(angle);
					dropY = centerY + (centerY - 50) * Math.sin(angle);
					break;
				case 0:
					if (~~(Math.random() * 2) == 1) {
						dropX = ~~(Math.random() * this.map.right);
						dropY = this.map.bottom / 2;
					} else {
						dropX = this.map.right / 2;
						dropY = ~~(Math.random() * this.map.bottom);
					}
					break;
			}
		} else if (
			!dropsAtMouse &&
			(powerupId == POWERUPS.FREEZE ||
				powerupId == POWERUPS.REC ||
				powerupId == POWERUPS.SPEED ||
				powerupId == POWERUPS.GROWTH)
		) {
			dropX = ~~(Math.random() * this.map.right);
			dropY = ~~(Math.random() * this.map.bottom);
		} else {
			dropX = mouse.x;
			dropY = mouse.y;
		}
		// console.log(dropX, dropY);

		const buffer = new Buffer(2);

		buffer.writeUint8(70);
		buffer.writeUint8(powerupId);
		this.send(buffer.finish());
		// await sleep(10);

		const buffer2 = new Buffer(10);

		buffer2.writeUint8(73);
		buffer2.writeUint8(0x01);
		buffer2.writeInt32(dropX);
		buffer2.writeInt32(dropY);
		this.send(buffer2.finish());
		this.send(buffer2.finish());
		this.send(buffer2.finish());

		const buffer3 = new Buffer(10);

		buffer3.writeUint8(72);
		buffer3.writeInt32(dropX);
		buffer3.writeInt32(dropY);
		buffer3.writeUint8(powerupId);
		this.send(buffer3.finish());

		this.sendSingleByte(71);

		// setTimeout(() => this.ws.close(), 200);
	}

	startDraggingPowerup(powerupId) {
		if (!this.finishedHandshake) return;
		if (this.draggingPowerup) return this.dropPowerup();
		// console.log('dragging powerup');
		const buffer = new Buffer(2);

		buffer.writeUint8(70);
		buffer.writeUint8(powerupId);
		this.send(buffer.finish());
		this.draggingPowerupType = powerupId;
		this.draggingPowerup = true;
	}

	/**
	 *
	 * @param { ArrayBuffer } buffer
	 * @param { number } start
	 * @param { number } end
	 * @param { number } adder
	 * @returns { number }
	 */
	checksum(buffer, start, end, adder) {
		let d = globalThis.Buffer.from(buffer);
		start + end > d.byteLength && (end = 0);
		for (var e = 12345678 + adder, t = 0; end > t; t++) {
			e += d[start + t] * (t + 1);
		}
		return e;
	}

	do64response(res) {
		this.pkt64Response = res;
		var buffer = new Buffer(13);

		// nx(buffer);
		buffer.writeUint8(
			2 * (this.CLIENTPHP_ch + 30) - ((this.pkt64Response - 5) % 10) - 5
		);

		// kx(buffer, 0, clientPHPDecodedReturn);
		buffer.writeUint32(
			~~(
				this.pkt64Response / 1.84 +
				this.CLIENTPHP_ch / 2 -
				2 * (0 ? 0.5 : 1)
			) +
				~~(
					~~(
						21.2 *
						((~~(
							this.pkt64Response +
							4.42 * this.CLIENTPHP_ccv +
							555
						) %
							(this.clientPHPDecodedReturn - 1)) +
							36360)
					) / 4.2
				)
		);

		// ix(buffer);
		let gx = 0;
		for (var b = 0; b < v2za0.length; b++) {
			gx += ~~(
				this.pkt64Response / v2za0[b] -
				(v2za0[b] % this.emgaaEncoded)
			);
		}
		buffer.writeUint32(gx + this.emgaaEncoded);

		// yx(buffer);
		buffer.writeUint32(this.checksum(buffer.finish(false), 0, 9, 255));

		// sendWSMessage(buffer, true);
		this.send(buffer.finish());
	}

	sendSetting(settingID, value) {
		const buffer = new Buffer(3);
		buffer.writeUint8(4);
		buffer.writeUint8(settingID);
		buffer.writeUint8(value ? 1 : 0);
		this.send(buffer.finish());
	}

	sendLogin(user, pass) {
		if (!this.finishedHandshake) return;
		// console.log('login');
		const buffer = new Buffer(5);

		buffer.writeUint8(2);
		buffer.writeUTF16(user);
		buffer.writeUTF16(pass);
		this.send(buffer.finish());
	}

	crasher() {
		// redacted
	}

	infPower() {
		// redacted
	}

	dropBlocks(x, y, numBlocks) {
		// redacted
	}

	createAccount(user, pass, email) {
		const buffer = new Buffer(5);

		buffer.writeUint8(3);
		buffer.writeUTF16(user);
		buffer.writeUTF16(pass);
		buffer.writeUTF16(email);
		buffer.writeUint32(0);
		buffer.writeUint32(0);
		this.send(buffer.finish());
	}

	finishHandshake() {
		this.finishedHandshake = true;

		this.sendSetting(7, true);
		this.sendSetting(8, false);
		this.sendSetting(3, true);

		if (config.useAccounts) {
			if (this.id < accounts.length) {
				let acc = accounts[this.id].split(':');
				this.accountUser = acc[0];
				this.accountPass = acc[1];
				this.sendLogin(this.accountUser, md5(this.accountPass));
			} else {
				this.accountUser = `fdghdfghfg${this.id}_${~~(
					Math.random() * 10
				)}`;
				this.accountPass = 'grgergergr';
				this.createAccount(
					this.accountUser,
					md5(this.accountPass),
					`${Math.random()
						.toString(36)
						.replace(/./, '')}@goooooooooooogle.cooom`
				);
			}
		}

		let buffer = new Buffer(2);
		buffer.writeUint8(0xa0);
		buffer.writeUint8(0x00);
		this.send(buffer.finish());
		this.sendMouse();

		setTimeout(this.spawn.bind(this), 200);
	}

	/**
	 * @param {WebSocket.RawData} data
	 * @param {boolean} isBinary
	 */
	message(data, isBinary) {
		if (!isBinary) return;
		let buffer = new Buffer(data, true, false);
		// console.log(new Uint8Array(data));
		switch (buffer.readUint8()) {
			case 16:
				break;
				let cellRecords = buffer.readUint16();
				for (let i = 0; i < cellRecords; i++) {
					let flags = buffer.readUint8();
					if (flags & 2) buffer.seek(1);
					if (flags & 32) buffer.seek(1);
					buffer.seek(4); // cellId
					if (flags & 1) buffer.seek(4); // ownerId
					buffer.readUTF16(); // name
					buffer.seek(2);
					buffer.seek(buffer.readUint8() * 3); // wearables
				}

				while (buffer.readUint32()) {
					buffer.seek(10);
					let flags = buffer.readUint8();
					if (flags & 1) {
						let unk = buffer.readUint8();
						buffer.seek(3);
						if (flags & 8) buffer.seek(1);
						if (!unk) {
							buffer.seek(2);
						}
					}
				}

				let eatRecords = buffer.readUint16();
				for (let i = 0; i < eatRecords; i++) {
					let eater = buffer.readUint32();
					let victim = buffer.readUint32();
					this.myCellIds.delete(victim);
				}

				let deleteRecords = buffer.readUint32();
				for (let i = 0; i < deleteRecords; i++) {
					let toDelete = buffer.readUint32();
					this.myCellIds.delete(toDelete);
				}

				if (this.myCellIds.size == 0) {
					// this.sendSingleByte(14);
					// this.spawned = false;
					// this.spawn();
				}
				break;
			case 17:
				break;
			case 20:
				this.myCellIds = new Set();
				break;
			case 32:
				// this.sendSingleByte(0x07);
				// this.myCellIds.add(buffer.readUint32());
				this.spawned = true;
				if (!dropsAtMouse) {
					// this.dropv2(POWERUPS.MOTHERCELL);
					// this.dropv2(POWERUPS.MOTHERCELL);

					// this.dropv2(POWERUPS.PORTAL);
					// this.dropv2(POWERUPS.PORTAL);
					// this.dropv2(POWERUPS.SPAWNVIRUS);
					// this.dropv2(POWERUPS.SPAWNVIRUS);
					// this.dropv2(POWERUPS.FREEZE);
					// this.dropv2(POWERUPS.FREEZE);
					// this.dropv2(POWERUPS.FREEZE);
					// this.dropv2(POWERUPS.FREEZE);
					this.dropv2(POWERUPS.REC);
					this.dropv2(POWERUPS.REC);
					this.dropv2(POWERUPS.SPEED);
					this.dropv2(POWERUPS.SPEED);
					this.dropv2(POWERUPS.GROWTH);
					this.dropv2(POWERUPS.GROWTH);
					this.dropv2(POWERUPS.GROWTH);
					this.dropv2(POWERUPS.GROWTH);
					setTimeout(
						() =>
							this.ws &&
							this.ws.readyState == WebSocket.OPEN &&
							this.ws.close(),
						200
					);
				}
				break;
			case 56:
				//play preroll ad
				break;
			case 64:
				let left = buffer.readFloat64();
				let top = buffer.readFloat64();
				let right = buffer.readFloat64();
				let bottom = buffer.readFloat64();
				this.map.left = left;
				this.map.top = top;
				this.map.right = right;
				this.map.bottom = bottom;
				// console.log(left, top, right, bottom);

				let Un = buffer.readInt16();

				let a = buffer.readUint32();
				let E = buffer.readUint32();

				if (a === E) {
					if (70 > this.CLIENTPHP_ch) {
						// console.log('doing 64');
						this.CLIENTPHP_ch += 40;
						this.do64response(a);
					}
				} else {
					console.log('Failed bot protection!!!!!');
				}
				break;
			case 244:
				// console.log('success we in bois');

				this.finishHandshake();

				// setTimeout(() => this.sendChat('test123'), 5000);
				break;
			case 95:
				let response = buffer.readUint8();
				// console.log(`${this.accountUser}:${this.accountPass}`);
				if (response == 9) {
					fs.appendFileSync(
						'./files/newAccounts.txt',
						`${this.accountUser}:${this.accountPass}\n`
					);
				} else if (response == 1) {
					// login success
				} else {
					if (this.id >= accounts.length)
						console.log('register failed', response);
					else {
						console.log(
							'login failed username:',
							this.accountUser,
							response
						);
					}
				}
				break;
			case 96: // account data
				break;
			case 80:
				buffer.seek(2 + 4 + 1 + 2);

				const recs = buffer.readUint16();
				if (recs == 0xffff) {
					this.infDone = true;
				}
				break;
			case 50:
				// redacted
				break;
			case 108:
				var r = buffer.readUint8();
				var fef = 1 & r ? buffer.readUint8() : 1;
				var ub = [];
				for (var h = 0; fef > h; ++h) {
					var Bb = buffer.readUint32();
					var $b = buffer.readUint32();
					if (Bb !== $b) {
						ub = null;
						break;
					}
					ub.push(Bb);
				}
				if (fef > 1 || ub[0]) {
					//BANNED
					let idx = proxies.indexOf(this.ip);
					if (idx) {
						fs.appendFileSync(
							'files/bannedProxies.txt',
							this.ip + '\n'
						);
						proxies.splice(idx, 1);
					}
				}
				break;
		}
	}

	split() {
		if (!this.finishedHandshake) return;

		this.sendSingleByte(17);
	}

	eject(finish) {
		if (!this.finishedHandshake) return;

		if (!finish) this.sendSingleByte(21);
		else this.sendSingleByte(36);
	}

	sendChat(msg) {
		if (!this.finishedHandshake) return;

		let buffer = new Buffer(2);
		buffer.writeUint8(98);
		buffer.writeUint8(1);
		buffer.writeUTF16(
			msg.startsWith('//')
				? msg.substring(2)
				: msg.startsWith('/')
				? msg
				: msg.replace(/([^:\w]|^)(\w)(\w+)/g, '$1$2\u206a$3')
		);
		buffer.seek(-2);

		this.send(buffer.finish());
	}

	ping() {
		if (!this.finishedHandshake) return;

		this.sendSingleByte(95);
	}

	spawn() {
		if (!this.finishedHandshake /* || !this.canSpawn*/) return;
		this.lastSpawn = performance.now();

		const buffer = new Buffer(4);
		buffer.writeUint8(1);
		if (config.skinChanger)
			buffer.writeUint16(Math.ceil(Math.random() * 16));
		else buffer.writeUint16(config.skinToUse);
		buffer.writeUint8(this.selectedWearables.length);
		for (let wearable of this.selectedWearables)
			buffer.writeUint16(wearable);
		buffer.writeUTF16(
			config.name // + ' | ' + Math.random().toString(32).slice(3)
		);
		buffer.seek(-2); // remove null byte
		this.send(buffer.finish());

		this.sendSingleByte(34);
	}

	sendSingleByte(byte) {
		const buffer = new Buffer(1);
		buffer.writeUint8(byte);
		this.send(buffer.finish());
	}

	sendMouse() {
		if (!this.finishedHandshake) return;
		const buffer = new Buffer(9);
		buffer.writeUint8(this.draggingPowerup ? 73 : 0);
		if (this.draggingPowerup) buffer.writeUint8(0x01);
		buffer.writeInt32(mouse.x);
		buffer.writeInt32(mouse.y);
		this.send(buffer.finish());
	}

	dropPowerup() {
		if (!this.finishedHandshake) return;
		// console.log('dropping power');
		const buffer = new Buffer(10);
		buffer.writeUint8(72);
		buffer.writeInt32(mouse.x);
		buffer.writeInt32(mouse.y);
		buffer.writeUint8(this.draggingPowerupType);
		this.send(buffer.finish());
		this.draggingPowerup = false;
		this.sendSingleByte(71);
	}

	error(err) {
		// console.log('error', err);
	}

	close() {
		if (this.destructed) return;
		this.reset();
		// console.log('close');
		setTimeout(this.connect.bind(this), 2500);
	}
}

/** @type {Bot[]} */
const bots = [];

for (let i = 0; i < config.maxBots; i++) {
	setTimeout(() => {
		bots.push(new Bot(i, workerData));
	}, 0 * i);
}

setInterval(() => {
	let spawned = 0;
	let connected = 0;
	for (let bot of bots) {
		if (bot.spawned) spawned++;
		if (bot.ws && bot.ws.readyState == WebSocket.OPEN) connected++;
	}
	parentPort.postMessage({
		type: 'count',
		spawned,
		connected,
		max: config.maxBots,
	});
}, 50).unref();
let freezeidCur = 0;
parentPort.on('message', msg => {
	if (typeof msg == 'object') {
		switch (msg.type ?? '') {
			case 'close':
				let bot;
				while ((bot = bots.shift())) {
					bot.dtor();
				}
				break;
			case 'mouse':
				// mouse.x = ~~(Math.random() * 0xffffffff) - 0xffffffff / 2;
				// mouse.y = ~~(Math.random() * 0xffffffff) - 0xffffffff / 2;
				mouse.x = msg.x;
				mouse.y = msg.y;
				break;
			case 'split':
				for (let bot of bots) bot.split();
				break;
			case 'eject':
				for (let bot of bots) bot.eject(msg.finish);
				break;
			case 'chat':
				for (let bot of bots) bot.sendChat(msg.msg);
				break;
			case 'spawnBots':
				for (let bot of bots) {
					bot.sendSingleByte(0x07);
					bot.canSpawn = true;
				}
				break;
			case 'reconnect':
				freezeidCur = 0;
				for (let bot of bots) {
					bot.ws.close();
				}
				break;
			case 'dropPortals':
				for (let bot of bots) {
					// bot.dropv2(POWERUPS.MOTHERCELL);
					// bot.dropv2(POWERUPS.PORTAL);
					bot.dropv2(POWERUPS.FREEZE);
					bot.dropv2(POWERUPS.FREEZE);
					// if (bot.id == freezeidCur) bot.dropv2(POWERUPS.FREEZE);
				}

				setTimeout(() => {
					for (let bot of bots) {
						bot.ws.close();
					}
				}, 200);
				freezeidCur++;
				break;
			case 'dropPowerup':
				// async () => {
				// for (let i = 0; i < 256; i++) {
				// let promises = [];
				for (let bot of bots) {
					bot.dropv2(POWERUPS.GROWTH);
					bot.dropv2(POWERUPS.GROWTH);
					bot.dropv2(POWERUPS.GROWTH);
					bot.dropv2(POWERUPS.GROWTH);
					bot.dropv2(POWERUPS.GROWTH);
					// bot.dropv2(POWERUPS.MOTHERCELL);
					// bot.dropv2(POWERUPS.PORTAL);
					bot.dropv2(POWERUPS.SPEED);
					bot.dropv2(POWERUPS.REC);
					bot.dropv2(POWERUPS.SPAWNVIRUS);
				}

				setTimeout(() => {
					for (let bot of bots) {
						bot.ws.close();
					}
				}, 500);
				break;
		}
	}
});

parentPort.on('close', () => {
	process.exit();
});
