import * as reviewService from "../services/reviewService.js";

export async function createReview(req, res, next) {
  try {
    const review = await reviewService.createReview({
      ...req.body,
      userId: req.user.userId,
    });
    res.status(201).json({ status: "success", data: review });
  } catch (err) {
    next(err);
  }
}

export async function getCarReviews(req, res, next) {
  try {
    const result = await reviewService.getCarReviews(req.params.carId, req.query);
    res.json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
}

export async function getUserReviews(req, res, next) {
  try {
    const result = await reviewService.getUserReviews(req.user.userId, req.query);
    res.json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    await reviewService.deleteReview(req.params.id, req.user.userId);
    res.json({ status: "success", message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}
