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

const cayenneLpp = require('./dataModels/cayenneLpp');
const cbor = require('./dataModels/cbor');
const config = require('./configService');
const context = {
	op: 'IoTAgentLoRaWAN.dataTranslation'
};

/**
 * It converts a message received from a LoRaWAN application server to NGSI
 *
 * @param      {Object}  payload  The payload
 * @param      {Object}  device   The device
 * @return     {Object}  {NGSI message}
 */
function toNgsi(payload, device) {
	const ngsiAtts = [];
	let decodedPayload = {};
	if (payload && device) {
		if (device.internalAttributes) {
			let lorawanConf = {};
			if (device.internalAttributes instanceof Array) {
				for (let i = 0; i < device.internalAttributes.length; i++) {
					if (device.internalAttributes[i].lorawan) {
						lorawanConf = device.internalAttributes[i].lorawan;
						break;
					}
				}
			} else if (device.internalAttributes.lorawan) {
				lorawanConf = device.internalAttributes.lorawan;
			}

			if (lorawanConf) {
				if (lorawanConf.data_model === 'application_server') {
					decodedPayload = payload;
				} else if (lorawanConf.data_model === 'cbor') {
					decodedPayload = cbor.decodePayload(payload);
				} else {
					decodedPayload = cayenneLpp.decodePayload(payload);
				}
			}
		} else {
			decodedPayload = cayenneLpp.decodePayload(payload);
		}

		if (decodedPayload) {
			if (device.active && device.active.length > 0) {
				if (decodedPayload) {
					for (const field in decodedPayload) {
						let value = decodedPayload[field];
						for (let i = 0; i < device.active.length; i++) {
							if (device.active[i].type === 'geo:point' && value.latitude && value.longitude) {
								value = value.latitude + ',' + value.longitude;
							}

							if (field === device.active[i].name) {
								ngsiAtts.push({
									name: field,
									type: device.active[i].type,
									value
								});
							} else if (device.active[i].object_id && device.active[i].object_id === field) {
								ngsiAtts.push({
									name: field,
									type: device.active[i].type,
									value
								});
							}
						}
					}
				}
			} else {
				config.getLogger().debug(context, 'Device provisioned without active attributes');
			}
		}
	}

	return ngsiAtts;
}

exports.toNgsi = toNgsi;
