import type { APIRoute } from "astro";
import { deleteAudit } from "../audit.delete";

export const prerender = false;

export const DELETE: APIRoute = async (context) => {
  return deleteAudit(context);
};
