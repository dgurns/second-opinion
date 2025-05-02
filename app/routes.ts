import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/medical-details", "routes/medical-details.tsx"),
  route("/second-opinion", "routes/second-opinion.tsx"),
  route("/clear-details", "routes/clear-details.tsx"),
  route("/delete-detail", "routes/delete-detail.tsx"),
  route("/__vite_ping", "routes/noop.tsx")
] satisfies RouteConfig;
