import {
  acceptOrderForPartner,
  createOrder,
  getBakeryByOwnerId,
  getOrderByIdForRequester,
  listAvailableOrdersForPartner,
  listOrdersForBakeryOwner,
  listOrdersForRequester,
  updateDeliveryStatusForPartner,
  updateOrderStatusForAdmin,
  updateOrderStatusForBakeryOwner,
} from "../services/orderService.js";
import { sendSuccess } from "../utils/response.js";

export const createOrderController = async (req, res, next) => {
  try {
    const order = await createOrder({ ...req.body, userId: req.user._id });
    return sendSuccess(res, order, "Order placed", 201);
  } catch (error) {
    return next(error);
  }
};

export const getOrderController = async (req, res, next) => {
  try {
    const order = await getOrderByIdForRequester({
      orderId: req.params.id,
      requesterId: req.user._id,
      requesterRole: req.user.role,
    });
    return sendSuccess(res, order, "Order fetched");
  } catch (error) {
    return next(error);
  }
};

export const listOrdersController = async (req, res, next) => {
  try {
    const result = await listOrdersForRequester({
      requesterId: req.user._id,
      requesterRole: req.user.role,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    return res.status(200).json({
      message: "Orders fetched",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatusController = async (req, res, next) => {
  try {
    const order = await updateOrderStatusForAdmin({
      orderId: req.params.id,
      status: req.body.status,
      note: req.body.note,
    });
    return sendSuccess(res, order, "Order status updated");
  } catch (error) {
    return next(error);
  }
};

export const listAvailableOrdersForPartnerController = async (req, res, next) => {
  try {
    const result = await listAvailableOrdersForPartner({
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({
      message: "Available delivery orders fetched",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const acceptOrderForPartnerController = async (req, res, next) => {
  try {
    const order = await acceptOrderForPartner({
      orderId: req.params.id,
      partnerId: req.user._id,
    });
    return sendSuccess(res, order, "Order accepted for delivery");
  } catch (error) {
    return next(error);
  }
};

export const updateDeliveryStatusForPartnerController = async (req, res, next) => {
  try {
    const order = await updateDeliveryStatusForPartner({
      orderId: req.params.id,
      partnerId: req.user._id,
      status: req.body.status,
      note: req.body.note,
    });
    return sendSuccess(res, order, "Delivery status updated");
  } catch (error) {
    return next(error);
  }
};

// ===== Bakery Owner Controllers =====

export const listOrdersForBakeryOwnerController = async (req, res, next) => {
  try {
    // First get the bakery for this owner
    const bakery = await getBakeryByOwnerId(req.user._id);
    
    const result = await listOrdersForBakeryOwner({
      bakeryId: bakery._id,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });
    return res.status(200).json({
      message: "Bakery orders fetched",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatusForBakeryOwnerController = async (req, res, next) => {
  try {
    const order = await updateOrderStatusForBakeryOwner({
      orderId: req.params.id,
      bakeryOwnerId: req.user._id,
      status: req.body.status,
      note: req.body.note,
    });
    return sendSuccess(res, order, "Order status updated by bakery");
  } catch (error) {
    return next(error);
  }
};
