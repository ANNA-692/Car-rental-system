import * as rentalService from "../services/rentalService.js";

export async function listRentals(req, res, next) {
  try {
    const result = await rentalService.listRentals(req.query);
    res.json({ status: "success", ...result });
  } catch (err) { next(err); }
}

export async function getRentalById(req, res, next) {
  try {
    const rental = await rentalService.getRentalById(req.params.id);
    res.json({ status: "success", data: rental });
  } catch (err) { next(err); }
}
