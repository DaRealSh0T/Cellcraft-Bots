const { Server } = require('ws');
const { Worker } = require('node:worker_threads');
const Buffer = require('./Buffer.js');
const wss = new Server({
	port: 1692,
});

if (require('fs').readFileSync('files/proxies.txt').toString().length < 3) {
	console.log('Please put proxies in files/proxies.txt!!!');
	process.exit();
}

console.log('Bots loaded.');
wss.on('connection', ws => {
	/** @type { Worker } */
	let worker = null;
	let terminateTimeout = -1;
	console.log('connect');

	function setupWorker() {
		if (!worker) return;
		worker.on('exit', () => {
			worker = null;
		});

		worker.on('message', msg => {
			if (typeof msg == 'object') {
				switch (msg.type ?? '') {
					case 'count':
						const buffer = new Buffer(7);
						buffer.writeUint8(0x01);
						buffer.writeUint16(msg.spawned ?? 0);
						buffer.writeUint16(msg.connected ?? 0);
						buffer.writeUint16(msg.max ?? 0);
						if (ws.readyState == ws.OPEN) {
							ws.send(buffer.finish());
						}
						break;
				}
			}
		});
	}

	ws.on('message', message => {
		const buffer = new Buffer(
			message.buffer.slice(message.byteOffset),
			true,
			false
		);
		switch (buffer.readUint8()) {
			case 0x01: // start
				clearTimeout(terminateTimeout);
				terminateTimeout = -1;
				if (worker) {
					worker.terminate();
				}
				const serverIP = buffer.readUTF8();
				worker = new Worker('./src/bot.js', {
					workerData: serverIP,
				});
				setupWorker();
				break;
			case 0x02: // stop
				if (worker && terminateTimeout == -1) {
					worker.postMessage({
						type: 'close',
					});

					terminateTimeout = setTimeout(() => {
						terminateTimeout = -1;
						if (worker) {
							worker.terminate();
						}
					}, 1000);
				}
				break;
			case 0x03: // split
				if (worker) {
					worker.postMessage({ type: 'split' });
				}
				break;
			case 0x04: // eject
				let finish = buffer.readUint8() ? true : false;
				if (worker) {
					worker.postMessage({ type: 'eject', finish });
				}
				break;
			case 0x05: // chat
				const msg = buffer.readUTF8();
				if (worker) {
					worker.postMessage({ type: 'chat', msg });
				}
				break;
			case 0x06:
				let x = buffer.readInt32();
				let y = buffer.readInt32();
				if (worker) {
					worker.postMessage({ type: 'mouse', x, y });
				}
				break;
			case 0x07:
				if (worker) {
					worker.postMessage({ type: 'dropPowerup' });
				}
				break;
			default:
				console.log('not in');
		}
	});

	ws.on('close', () => {
		if (worker) {
			worker.postMessage({
				type: 'close',
			});
			setTimeout(() => {
				if (worker) {
					worker.terminate();
				}
			}, 1000);
		}
	});
});
