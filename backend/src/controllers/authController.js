import * as authService from "../services/authService.js";

export async function register(req, res, next) {
  try {
    const payload = {
      ...req.body,
      invoiceImage: req.file ? `/uploads/users/${req.file.filename}` : req.body.invoiceImage,
    };
    const result = await authService.registerUser(payload);
    res.status(201).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ status: "error", message: "Refresh token required" });
      return;
    }
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json({ status: "success", data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logoutUser(req.user.userId);
    res.json({ status: "success", message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.userId);
    res.json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.userId, req.body);
    res.json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

export function getSeedCredentials(_req, res) {
  const credentials = authService.getSeedCredentials();
  res.json({ status: "success", data: credentials });
}
