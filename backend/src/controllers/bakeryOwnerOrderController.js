import { listOwnerOrders, updateOwnerOrderStatus } from "../services/bakeryOwnerOrderService.js";
import { sendSuccess } from "../utils/response.js";

export const listBakeryOwnerOrders = async (req, res, next) => {
  try {
    const orders = await listOwnerOrders(req.bakeryOwner, { status: req.query.status });
    return sendSuccess(res, orders, "Bakery orders");
  } catch (error) {
    return next(error);
  }
};

export const updateBakeryOwnerOrderStatus = async (req, res, next) => {
  try {
    const order = await updateOwnerOrderStatus(req.bakeryOwner, req.params.id, req.body);
    return sendSuccess(res, order, "Order status updated");
  } catch (error) {
    return next(error);
  }
};
