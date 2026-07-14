import { Link } from "react-router-dom";

export default function CarCard({ car }) {
  const img = car.imageUrl || `https://via.placeholder.com/600x400?text=${encodeURIComponent(car.make + " " + car.model)}`;

  return (
    <Link to={`/cars/${car.id}`} className="card car-card">
      <div className="car-card-image">
        <img src={img} alt={`${car.make} ${car.model}`} loading="lazy" />
        {!car.isAvailable && <div className="car-card-sold">BOOKED</div>}
        <div className="car-card-price">${car.pricePerDay}<span>/day</span></div>
      </div>
      <div className="car-card-body">
        <h3>{car.make} {car.model} <span className="car-card-year">{car.year}</span></h3>
        <div className="meta">{car.category} &middot; {car.transmission} &middot; {car.seats} seats</div>
        <div className="meta">{car.fuelType} &middot; {car.location}</div>
      </div>
    </Link>
  );
}
