import * as carTrackingService from "../services/carTrackingService.js";

export async function getTrackingDashboard(req, res, next) {
  try {
    const data = await carTrackingService.getCarTrackingDashboard();
    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

export async function getCarTrackingDetails(req, res, next) {
  try {
    const { carId } = req.params;
    const data = await carTrackingService.getCarDetails(carId);
    
    if (!data) {
      return res.status(404).json({ status: "error", message: "Car not found" });
    }
    
    res.json({ status: "success", data });
  } catch (err) {
    next(err);
  }
}

export async function updateFuelLevel(req, res, next) {
  try {
    const { carId } = req.params;
    const { fuelLevel } = req.body;
    
    if (fuelLevel === undefined || fuelLevel < 0 || fuelLevel > 100) {
      return res.status(400).json({ status: "error", message: "Fuel level must be between 0 and 100" });
    }
    
    const car = await carTrackingService.updateCarFuelLevel(carId, fuelLevel);
    res.json({ status: "success", data: car });
  } catch (err) {
    next(err);
  }
}
