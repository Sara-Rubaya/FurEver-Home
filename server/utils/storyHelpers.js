
export const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


export const buildStoryFilter = ({ species, storyType, featured, search } = {}) => {
  const filter = {};

  if (species) filter.species = species;
  if (storyType) filter.storyType = storyType;
  if (featured === "true" || featured === true) filter.isFeatured = true;

  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegex(String(search).trim()), "i");
    filter.$or = [
      { title: rx },
      { petName: rx },
      { breed: rx },
      { story: rx },
      { quote: rx },
      { location: rx },
      { shelterName: rx },
    ];
  }

  return filter;
};


export const formatStory = (doc, currentUserId = null) => {
  const raw = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  const likes = Array.isArray(raw.likes) ? raw.likes : [];
  const uid = currentUserId ? String(currentUserId) : null;

  return {
    ...raw,
    likeCount: likes.length,
    likedByMe: uid ? likes.some((id) => String(id) === uid) : false,
    likes: undefined,
  };
};


export const sortStories = (stories, sort = "featured") => {
  const list = [...stories];
  const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  if (sort === "oldest") {
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
  if (sort === "mostLiked") {
    return list.sort((a, b) => (b.likeCount - a.likeCount) || byNewest(a, b));
  }
  if (sort === "newest") {
    return list.sort(byNewest);
  }
  return list.sort(
    (a, b) =>
      Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
      (b.likeCount - a.likeCount) ||
      byNewest(a, b)
  );
};
