import Reward from "../models/Reward.js";
import Redemption from "../models/Redemption.js";
import User from "../models/User.js";

// Admin: Add Reward
export const addReward = async (req, res) => {
  try {
    const { rewardName, rewardImage, pointsRequired, description } = req.body;

    const reward = await Reward.create({
      rewardName,
      rewardImage,
      pointsRequired,
      description,
    });

    res.status(201).json({
      message: "Reward added successfully",
      reward,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Rewards
export const getAllRewardsAdmin = async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ pointsRequired: 1 });
    res.json({ rewards, count: rewards.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update Reward
export const updateReward = async (req, res) => {
  try {
    const { rewardName, rewardImage, pointsRequired, description, isActive } =
      req.body;

    const updates = {};
    if (rewardName) updates.rewardName = rewardName;
    if (rewardImage) updates.rewardImage = rewardImage;
    if (pointsRequired) updates.pointsRequired = pointsRequired;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const reward = await Reward.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    res.json({ message: "Reward updated successfully", reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete Reward
export const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }
    res.json({ message: "Reward deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get All Active Rewards
export const getAllRewardsUser = async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({
      pointsRequired: 1,
    });
    res.json({ rewards, count: rewards.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Apply for Reward Redemption
export const applyRedemption = async (req, res) => {
  try {
    const { rewardId } = req.body;

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    if (!reward.isActive) {
      return res.status(400).json({ message: "Reward is not active" });
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.walletPoints < reward.pointsRequired) {
      return res.status(400).json({
        message: "Insufficient points",
        required: reward.pointsRequired,
        available: user.walletPoints,
      });
    }

    const redemption = await Redemption.create({
      userId: req.user.sub,
      rewardId,
      pointsUsed: reward.pointsRequired,
    });

    res.status(201).json({
      message: "Redemption request submitted successfully",
      redemption,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get My Redemptions
export const getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ userId: req.user.sub })
      .populate("rewardId")
      .sort({ createdAt: -1 });

    res.json({ redemptions, count: redemptions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Redemptions
export const getAllRedemptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const redemptions = await Redemption.find(filter)
      .populate("userId", "name email mobile walletPoints")
      .populate("rewardId")
      .sort({ createdAt: -1 });

    res.json({ redemptions, count: redemptions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Single Redemption Detail
export const getRedemptionDetail = async (req, res) => {
  try {
    const redemption = await Redemption.findById(req.params.id)
      .populate("userId", "name email mobile walletPoints")
      .populate("rewardId");

    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }

    res.json({ redemption });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve Redemption
export const approveRedemption = async (req, res) => {
  try {
    const redemption = await Redemption.findById(req.params.id).populate(
      "rewardId"
    );

    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }

    if (redemption.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Redemption is already ${redemption.status}` });
    }

    const user = await User.findById(redemption.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.walletPoints < redemption.pointsUsed) {
      return res.status(400).json({
        message: "User has insufficient points",
        required: redemption.pointsUsed,
        available: user.walletPoints,
      });
    }

    // Deduct points from user wallet
    user.walletPoints -= redemption.pointsUsed;
    await user.save();

    // Update redemption status
    redemption.status = "approved";
    redemption.approvedBy = req.admin.id;
    redemption.approvedAt = new Date();
    await redemption.save();

    res.json({
      message: "Redemption approved successfully",
      redemption,
      remainingPoints: user.walletPoints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Reject Redemption
export const rejectRedemption = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const redemption = await Redemption.findById(req.params.id);

    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }

    if (redemption.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Redemption is already ${redemption.status}` });
    }

    redemption.status = "rejected";
    redemption.rejectionReason = rejectionReason || "Not specified";
    redemption.approvedBy = req.admin.id;
    redemption.approvedAt = new Date();
    await redemption.save();

    res.json({
      message: "Redemption rejected successfully",
      redemption,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
