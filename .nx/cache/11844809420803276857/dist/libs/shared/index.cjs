"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// libs/shared/src/index.ts
var src_exports = {};
__export(src_exports, {
  PersonSchema: () => PersonSchema
});
module.exports = __toCommonJS(src_exports);

// libs/shared/src/lib/person.dto.ts
var import_zod = require("zod");
var PersonSchema = import_zod.z.object({
  name: import_zod.z.string(),
  birth_year: import_zod.z.string(),
  homeworld: import_zod.z.string(),
  terrain: import_zod.z.string(),
  height: import_zod.z.string()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PersonSchema
});
