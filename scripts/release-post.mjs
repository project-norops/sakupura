export function buildReleasePost(tool) {
  if (!tool?.releasePost || !tool?.href)
    throw new Error("告知文または公開URLがありません。");

  const post = `${tool.releasePost.trim()}\n\nhttps://www.norops.jp${tool.href}\n#サクプラ`;
  if (Array.from(post).length > 280) {
    throw new Error(
      `X告知文が280文字を超えています (${Array.from(post).length}文字)。`,
    );
  }
  return post;
}

export function findTool(manifest, slug) {
  const tool = manifest.find((entry) => entry.slug === slug);
  if (!tool) throw new Error(`サービス台帳にslugがありません: ${slug}`);
  return tool;
}
