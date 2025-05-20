const { baseCreate } = require("./base-create");
const { baseDestroy } = require("./base-destroy");
const { basePatch } = require("./base-patch");
const { baseSelect } = require("./base-select");
const { baseUpdate } = require("./base-update");

module.exports = { baseSelect, baseCreate, baseUpdate, basePatch, baseDestroy };
