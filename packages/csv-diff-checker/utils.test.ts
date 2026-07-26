import { compareCsv, parseCsv, serializeDiff } from "./utils";

describe("csv diff utilities", () => {
  test("parses quoted commas", () =>
    expect(parseCsv('id,title\n1,"A, B"').rows[0].title).toBe("A, B"));
  test("detects added removed and changed rows", () => {
    const result = compareCsv(
      parseCsv("id,value\na,1\nb,2"),
      parseCsv("id,value\na,3\nc,4"),
      "id",
    );
    expect(result.find((row) => row.key === "a")?.status).toBe("changed");
    expect(result.find((row) => row.key === "b")?.status).toBe("removed");
    expect(result.find((row) => row.key === "c")?.status).toBe("added");
  });
  test("rejects duplicate keys", () =>
    expect(() =>
      compareCsv(parseCsv("id,v\na,1\na,2"), parseCsv("id,v\na,1"), "id"),
    ).toThrow("重複"));
  test("serializes changes only", () =>
    expect(
      serializeDiff(
        compareCsv(parseCsv("id,v\na,1"), parseCsv("id,v\na,2"), "id"),
      ),
    ).toContain("changed"));
});
