import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="error-page">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Go Home</Link>
    </div>
  );
}
