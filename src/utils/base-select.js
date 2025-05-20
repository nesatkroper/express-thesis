const prisma = require("@/provider/client");
const {
  generateCacheKey,
  getCached,
  setCached,
  invalidate,
} = require("@/utils/base-redis");

const baseSelect = async (
  model,
  id,
  queryParams = {},
  orderField = "createdAt",
  whereField = null
) => {
  if (!prisma[model]) throw new Error(`Prisma model "${model}" not found`);

  const cacheKey = generateCacheKey(model, { id, ...queryParams });

  try {
    const cachedData = await getCached(cacheKey);
    if (cachedData) {
      console.log(`✅ Serving ${model} from cache`);
      return cachedData;
    }

    const tx = prisma;
    const whereCondition = {};
    const {
      order = "desc",
      status = "",
      where,
      page,
      limit,
      include,
      select,
      clear,
      ...relations
    } = queryParams;

    if (id) whereCondition[`${model}Id`] = id;
    if (where && whereField) whereCondition[whereField] = where;
    if (clear) await invalidate(`${model}:*`);

    if (status && status !== "all") {
      try {
        const modelFields = Object.keys(tx[model].fields);
        if (modelFields.includes("status"))
          whereCondition.status = status === "" ? "active" : status;
      } catch {}
    }

    const pageNumber = page ? parseInt(page, 10) : null;
    const pageSize = limit ? parseInt(limit, 10) : null;
    const skip =
      pageNumber && pageSize ? (pageNumber - 1) * pageSize : undefined;
    const take = pageSize || undefined;

    let finalSelect = {};
    let finalInclude = {};

    if (select) {
      try {
        finalSelect = JSON.parse(select);
      } catch (e) {
        console.warn("⚠️ Select parameter is not valid JSON", e);
      }
    }

    if (include) {
      try {
        finalInclude = JSON.parse(include);
      } catch (e) {
        console.warn(
          "⚠️ Include parameter is not valid JSON, using simple includes",
          e
        );
        for (const [key, value] of Object.entries(relations))
          if (value === "true") finalInclude[key] = true;
      }
    }

    if (Object.keys(finalInclude).length === 0) {
      for (const [key, value] of Object.entries(relations)) {
        if (value === "true") finalInclude[key] = true;
      }
    }

    if (id) {
      const selectData = await tx[model].findUnique({
        where: whereCondition,
        select: Object.keys(finalSelect).length ? finalSelect : undefined,
        include: Object.keys(finalInclude).length ? finalInclude : undefined,
      });

      if (!selectData) throw new Error(`❌ ${model} with ID ${id} not found`);

      await setCached(cacheKey, { data: selectData });
      return { data: selectData };
    } else {
      const [items, total] = await Promise.all([
        tx[model].findMany({
          where: whereCondition,
          select: Object.keys(finalSelect).length ? finalSelect : undefined,
          include: Object.keys(finalInclude).length ? finalInclude : undefined,
          orderBy: {
            [orderField]: order,
          },
          skip,
          take,
        }),
        tx[model].count({ where: whereCondition }),
      ]);

      const result =
        pageNumber && pageSize
          ? {
              data: items,
              meta: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasNextPage: pageNumber * pageSize < total,
                hasPreviousPage: pageNumber > 1,
              },
            }
          : { data: items };

      await setCached(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.error(`❌ Error in baseSelect for model ${model}:`, {
      error: err.message,
      id,
      queryParams,
    });

    if (err.code === "P2009") {
      throw new Error(
        `❌ Invalid query syntax for model ${model}. Check your parameters.`
      );
    }

    if (err.message.includes("orderBy")) {
      throw new Error(
        `❌ Cannot order by '${orderField}' in model '${model}'. Valid fields are: ${Object.keys(
          prisma[model].fields
        ).join(", ")}`
      );
    }

    if (err.message.includes("include")) {
      throw new Error(
        `❌ Invalid relation included for model ${model}. Valid relations are: ${Object.keys(
          prisma[model].relations
        ).join(", ")}`
      );
    }

    throw err;
  }
};

module.exports = {
  baseSelect,
};
