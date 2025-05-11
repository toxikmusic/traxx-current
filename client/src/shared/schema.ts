// Temporary file to fix import issues

export const PostType = {
  TEXT: "text",
  IMAGE: "image"
} as const;

export type PostTypeValues = typeof PostType[keyof typeof PostType];