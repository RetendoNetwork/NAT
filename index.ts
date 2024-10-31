/*
Thanks pretendo for original NAT
Retendo converted to typescript, udpated the code and added some code.
*/

import * as dgram from 'dgram';
import * as ip from 'ip';

const LOCAL_IP: string = ip.address();
const LOCAL_IP_NUM: number = convertIpToNumber(LOCAL_IP);

const UDP_PORT_A: number = 10025;
const UDP_PORT_B: number = 10125;

const socketA = dgram.createSocket('udp4');
const socketB = dgram.createSocket('udp4');

socketA.bind(UDP_PORT_A);
socketB.bind(UDP_PORT_B);

socketA.on('message', handleIncomingData);

interface Payload {
    msgType: number;
    port: number;
    extAddr: number;
    locAddr: number;
}

const messageProcessors: Record<number, (payload: Payload, rinfo: dgram.RemoteInfo) => void> = {
    10: processTypeTen,
    20: processTypeTwenty,
    30: processTypeThirty,
    40: processTypeForty,
    50: processTypeFifty,
    100: processTypeHundred,
    200: processTypeTwoHundred,
    300: processTypeThreeHundred,
};

function handleIncomingData(data: Buffer, rinfo: dgram.RemoteInfo): void {
    const payload: Payload = {
        msgType: data.readUInt32BE(0),
        port: data.readUInt32BE(4),
        extAddr: data.readUInt32BE(8),
        locAddr: data.readUInt32BE(12)
    };

    const processor = messageProcessors[payload.msgType];

    if (!processor) {
        console.warn(`Received unsupported message type: ${payload.msgType}`);
        return;
    }

    processor(payload, rinfo);
}

function processTypeTen(payload: Payload, rinfo: dgram.RemoteInfo): void {
    console.log(`Processing Type 10 from ${rinfo.address}:${rinfo.port}`);
}

function processTypeTwenty(payload: Payload, rinfo: dgram.RemoteInfo): void {
    console.log(`Processing Type 20 from ${rinfo.address}:${rinfo.port}`);
}

function processTypeThirty(payload: Payload, rinfo: dgram.RemoteInfo): void {
    console.log(`Processing Type 30 from ${rinfo.address}:${rinfo.port}`);
}

function processTypeForty(payload: Payload, rinfo: dgram.RemoteInfo): void {
    console.log(`Processing Type 40 from ${rinfo.address}:${rinfo.port}`);
}

function processTypeFifty(payload: Payload, rinfo: dgram.RemoteInfo): void {
    console.log(`Processing Type 50 from ${rinfo.address}:${rinfo.port}`);
}

function processTypeHundred(payload: Payload, rinfo: dgram.RemoteInfo): void {
    respondToRequest(payload, rinfo, socketA);
}

function processTypeTwoHundred(payload: Payload, rinfo: dgram.RemoteInfo): void {
    respondToRequest(payload, rinfo, socketB);
}

function processTypeThreeHundred(payload: Payload, rinfo: dgram.RemoteInfo): void {
    respondToRequest(payload, rinfo, socketA);
}

function respondToRequest(payload: Payload, rinfo: dgram.RemoteInfo, socket: dgram.Socket): void {
    const { address, port } = rinfo;

    const responseBuffer = Buffer.alloc(16);
    responseBuffer.writeUInt32BE(payload.msgType, 0);
    responseBuffer.writeUInt32BE(port, 4);
    responseBuffer.writeUInt32BE(convertIpToNumber(address), 8);
    responseBuffer.writeUInt32BE(LOCAL_IP_NUM, 12);

    socket.send(responseBuffer, port, address, (err) => {
        if (err) {
            console.error(`Failed to send response: ${err.message}`);
        } else {
            console.log(`Response sent to ${address}:${port}`);
        }
    });
}

function convertIpToNumber(ipAddress: string): number {
    return ipAddress.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0);
}

function convertNumberToIp(num: number): string {
    return [(num >> 24) & 255, (num >> 16) & 255, (num >> 8) & 255, num & 255].join('.');
}
