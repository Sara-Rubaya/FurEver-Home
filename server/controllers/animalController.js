
export const getAnimals = async (req, res) => {
  try {
    const {
      species,
      status,
      size,
      gender,
      search,
      shelter,
      minAge,
      maxAge,
      sort,
    } = req.query;

    // Build query filters
    const filter = {};

    if (species) filter.species = species;
    if (status) filter.status = status;
    if (size) filter.size = size;
    if (gender) filter.gender = gender;
    if (shelter) filter.shelter = shelter;

    // Filter animals by age range
    const ageFilter = {};

    if (minAge !== undefined && minAge !== "") {
      ageFilter.$gte = Number(minAge);
    }

    if (maxAge !== undefined && maxAge !== "") {
      ageFilter.$lte = Number(maxAge);
    }

    if (Object.keys(ageFilter).length > 0) {
      filter.age = ageFilter;
    }

    // Search by animal name or breed
    if (search?.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { breed: searchRegex },
      ];
    }

    // Configure sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "age-asc": { age: 1 },
      "age-desc": { age: -1 },
      "name-asc": { name: 1 },
    };

    const sortOption = sortOptions[sort] || sortOptions.newest;

    // Fetch animals from database
    const animals = await Animal.find(filter)
      .populate("shelter", "name email")
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: animals.length,
      data: animals,
    });

  } catch (error) {
    console.error("Get Animals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve animals",
      error: error.message,
    });
  }
};