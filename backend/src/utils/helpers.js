export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
  const skip = (page - 1) * limit;
  const sort = query.sort || "createdAt";
  const order = query.order === "asc" ? "asc" : "desc";
  return { skip, take: limit, orderBy: { [sort]: order }, page, limit };
}

export function calculateBookingCost(pricePerDay, startDate, endDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = endDate.getTime() - startDate.getTime();
  const days = Math.max(1, Math.ceil(diffMs / msPerDay));
  return days * pricePerDay;
}
