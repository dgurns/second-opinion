import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/medical-details", "routes/medical-details.tsx"),
  route("/second-opinion", "routes/second-opinion.tsx"),
  route("/clear-details", "routes/clear-details.tsx"),
] satisfies RouteConfig;
