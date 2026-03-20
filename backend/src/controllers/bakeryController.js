import { sendSuccess } from "../utils/response.js";
import {
  findNearbyBakeries,
  geocodeAddressInput,
  getBakeryById,
  listPlacesFromProvider,
  reverseGeocodeInput,
} from "../services/bakeryService.js";

export const geocodeAddressController = async (req, res, next) => {
  try {
    const data = await geocodeAddressInput(req.query.address);
    return sendSuccess(res, data, "Address geocoded");
  } catch (error) {
    return next(error);
  }
};

export const reverseGeocodeController = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const data = await reverseGeocodeInput(Number(lat), Number(lng));
    return sendSuccess(res, data, "Coordinates reverse geocoded");
  } catch (error) {
    return next(error);
  }
};

export const getNearbyBakeries = async (req, res, next) => {
  try {
    const result = await findNearbyBakeries(req.query);
    return res.status(200).json({
      message: "Nearby bakeries fetched",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBakeries = async (req, res, next) => {
  try {
    const result = await listPlacesFromProvider(req.query);
    return res.status(200).json({
      message: "Bakeries fetched",
      data: result.data,
      pagination: result.pagination,
      searchParams: result.searchParams,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBakery = async (req, res, next) => {
  try {
    const bakery = await getBakeryById(req.params.id);
    return sendSuccess(res, bakery, "Bakery fetched");
  } catch (error) {
    return next(error);
  }
};
