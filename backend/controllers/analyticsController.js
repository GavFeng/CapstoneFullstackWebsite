const Jig = require("../models/Jig");
const Order = require("../models/Order");

exports.getGlobalAnalytics = async (req, res) => {
  try {
    const [jigStats, colorStats, orderStats, weightStats, monthlySalesData] = await Promise.all([
      
      // 0. Global Totals
      Jig.aggregate([
        { $unwind: "$colors" },
        { $group: {
            _id: null,
            totalUnitsSold: { $sum: "$colors.sold" },
            totalInventoryValue: { $sum: { $multiply: ["$price", "$colors.stock"] } },
            potentialRevenue: { $sum: { $multiply: ["$price", "$colors.sold"] } }
        }}
      ]),

      // 1. Best Selling Colors
      Jig.aggregate([
        { $unwind: "$colors" },
        { $group: { _id: "$colors.color", totalSold: { $sum: "$colors.sold" } }},
        { $lookup: { from: "colors", localField: "_id", foreignField: "_id", as: "details" }},
        { $unwind: "$details" },
        { 
          $project: { 
            name: "$details.name", 
            slug: "$details.slug",
            totalSold: 1 
          } 
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]),

      // 2. Location Popularity
      Order.aggregate([
        { $match: { deliveryMethod: "pickup", paymentStatus: "paid" } },
        { $group: { _id: "$pickupDetails.locationNameSnapshot", count: { $sum: 1 } }},
        { $sort: { count: -1 } }
      ]),

      // 3. Sales by Weight
      Jig.aggregate([
        { $unwind: "$colors" },
        { $lookup: { from: "weights", localField: "weight", foreignField: "_id", as: "w" }},
        { $unwind: "$w" },
        { $group: { _id: "$w.label", unitsSold: { $sum: "$colors.sold" } }},
        { $sort: { unitsSold: -1 } }

      ]),

      // 4. Monthly Revenue Trend
      Order.aggregate([
        { $match: { status: "completed" } },
        { 
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
            revenue: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    return res.json({
        global: jigStats[0] || {},
        topColors: colorStats || [],
        locationPopularity: orderStats || [],
        weightStats: weightStats || [],
        monthlySales: monthlySalesData || []
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({ message: err.message });
  }
};