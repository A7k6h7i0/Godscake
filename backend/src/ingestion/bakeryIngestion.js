import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import axios from "axios";
import { geocodeAddress } from "../utils/geocoding.js";

const value = (...options) => options.find((v) => v != null && String(v).trim() !== "");

const normalizeRecord = async (record) => {
  const name = value(record.name, record.bakery_name, record.title, "Unknown Bakery");
  const address = value(record.address, record.location, record.full_address, "");

  let lat = value(record.latitude, record.lat, record.y);
  let lng = value(record.longitude, record.lng, record.lon, record.x);
  lat = lat != null ? Number(lat) : null;
  lng = lng != null ? Number(lng) : null;

  if ((lat == null || lng == null) && address) {
    const geocoded = await geocodeAddress(address);
    if (geocoded) {
      lat = geocoded.lat;
      lng = geocoded.lng;
    }
  }

  if (!name || !address || lat == null || lng == null) return null;

  return {
    name: String(name).trim(),
    address: String(address).trim(),
    location: { type: "Point", coordinates: [lng, lat] },
    rating: Number(record.rating) || 4,
    sourceRef: value(record.id, record.source_id, ""),
  };
};

const parseJson = async (content) => {
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : [parsed];
};

const parseCsv = async (content) =>
  parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

const parseSqlDump = async (content) => {
  const rows = [];
  const tupleRegex = /\(([^)]+)\)/g;
  let match;
  while ((match = tupleRegex.exec(content)) !== null) {
    const tuple = match[1]
      .split(",")
      .map((part) => part.trim().replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1"));
    if (tuple.length >= 4) {
      rows.push({
        name: tuple[0],
        address: tuple[1],
        latitude: tuple[2],
        longitude: tuple[3],
        rating: tuple[4],
      });
    }
  }
  return rows;
};

export const ingestBakerySource = async (sourcePathOrUrl) => {
  const isUrl = /^https?:\/\//i.test(sourcePathOrUrl);
  const extension = isUrl ? "" : path.extname(sourcePathOrUrl).toLowerCase();

  let content = "";
  let rows = [];

  if (isUrl) {
    const response = await axios.get(sourcePathOrUrl, { timeout: 15000 });
    const payload = response.data;
    rows = Array.isArray(payload) ? payload : payload?.data || [];
  } else {
    content = await fs.readFile(sourcePathOrUrl, "utf-8");
  }

  if (!isUrl) {
    if (extension === ".csv") rows = await parseCsv(content);
    else if (extension === ".json") rows = await parseJson(content);
    else if (extension === ".sql") rows = await parseSqlDump(content);
    else throw new Error(`Unsupported file format: ${extension}`);
  }

  const normalized = [];
  for (const row of rows) {
    // eslint-disable-next-line no-await-in-loop
    const mapped = await normalizeRecord(row);
    if (mapped) normalized.push(mapped);
  }

  return normalized;
};

export const ingestBakeryFile = ingestBakerySource;
