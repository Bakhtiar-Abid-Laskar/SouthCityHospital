import React from "react";

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Reusable JsonLd component for server-rendered schema.org metadata.
 * Safely sanitizes '<' characters to prevent XSS injection.
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
