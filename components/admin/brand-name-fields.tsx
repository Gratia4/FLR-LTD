"use client";

import { useState } from "react";

/** Turns any text into a URL slug: "Château Rouge!" → "chateau-rouge". */
export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/**
 * Brand name + URL slug. The slug follows the name until someone edits it, and
 * anything typed into it is cleaned to the lowercase-and-hyphens form the
 * backend accepts, so a pasted address can't produce an invalid slug.
 */
export function BrandNameFields() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [edited, setEdited] = useState(false);
  const value = edited ? slug : slugify(name);
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <>
      <label className="field">
        <span>Brand name</span>
        <input className="input" name="name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>URL slug</span>
        <input
          className="input"
          name="slug"
          required
          minLength={2}
          maxLength={80}
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers and hyphens only"
          placeholder="brand-name"
          value={value}
          onChange={(event) => {
            setEdited(true);
            setSlug(slugify(event.target.value.split("/").filter(Boolean).pop() ?? ""));
          }}
        />
        <small className="field-hint">Brand page: {origin}/brands/{value || "brand-name"}</small>
      </label>
    </>
  );
}
