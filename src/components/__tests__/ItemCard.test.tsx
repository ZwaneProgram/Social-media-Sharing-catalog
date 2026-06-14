import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ItemCard, type CatalogItem } from "@/components/ItemCard";

const item: CatalogItem = {
  id: "1",
  url: "https://youtu.be/abc",
  title: "Cool Anime Edit",
  thumbnailUrl: "https://img/yt.jpg",
  platform: "youtube",
  note: "for my next video",
  categoryId: "cat1",
  category: { id: "cat1", name: "Edits", color: "#ff0000" },
  createdAt: new Date().toISOString(),
};

describe("ItemCard", () => {
  it("shows the title", () => {
    render(<ItemCard item={item} />);
    expect(screen.getByText("Cool Anime Edit")).toBeInTheDocument();
  });
  it("shows the category name", () => {
    render(<ItemCard item={item} />);
    expect(screen.getByText("Edits")).toBeInTheDocument();
  });
  it("links to the item detail page", () => {
    render(<ItemCard item={item} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/item/1");
  });
});
