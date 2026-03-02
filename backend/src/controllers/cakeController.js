import { sendSuccess } from "../utils/response.js";
import { getCakesByBakeryId } from "../services/cakeService.js";

export const getBakeryCakes = async (req, res, next) => {
  try {
    const cakes = await getCakesByBakeryId(req.params.id);
    return sendSuccess(res, cakes, "Bakery cakes fetched");
  } catch (error) {
    return next(error);
  }
};
