/*
 * Copyright 2019 Atos Spain S.A
 *
 * This file is part of iotagent-lora
 *
 * iotagent-lora is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-lora is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-lora.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 */

/* eslint-disable consistent-return */

const config = require('../configService');
const context = {
	op: 'IoTAgentLoRaWAN.CBOR'
};
const CBOR = require('cbor-sync');

/**
 * Decodes a CBOR payload
 *
 * @param      {String}    payload  Cayenne LPP payload
 */
function decodePayload(payload) {
	let decodedObject;
	config.getLogger().info(context, 'Decoding CBOR message:' + payload);
	try {
		const buffer = Buffer.from(payload, 'base64');
		decodedObject = CBOR.decode(buffer);
	} catch (e) {
		config.getLogger().error(context, 'Error decoding CBOR message:' + e);
		return;
	}

	return decodedObject;
}

exports.decodePayload = decodePayload;
