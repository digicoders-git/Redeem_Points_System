import Bill from "../models/Bill.js";
import User from "../models/User.js";
import PointSetting from "../models/PointSetting.js";

// User: Upload Bill
export const uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Bill file is required" });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const billImage = `${req.protocol}://${req.get("host")}/uploads/bills/${req.file.filename}`;

    const bill = await Bill.create({
      userId: req.user.sub,
      billImage,
      amount,
    });

    res.status(201).json({
      message: "Bill uploaded successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get My Bills
export const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user.sub }).sort({
      createdAt: -1,
    });
    res.json({ bills, count: bills.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get Single Bill
export const getSingleBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: req.user.sub,
    });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({ bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Bills
export const getAllBills = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const bills = await Bill.find(filter)
      .populate("userId", "name email mobile")
      .sort({ createdAt: -1 });

    res.json({ bills, count: bills.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Single Bill Detail
export const getBillDetail = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate(
      "userId",
      "name email mobile walletPoints"
    );

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({ bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Edit Bill Amount
export const editBillAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status !== "pending") {
      return res.status(400).json({ message: `Cannot edit amount of a ${bill.status} bill` });
    }

    bill.amount = amount;
    await bill.save();

    res.json({
      message: "Bill amount updated successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve Bill
export const approveBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Bill is already ${bill.status}` });
    }

    // Get point setting
    const pointSetting = await PointSetting.findOne({ isActive: true });
    if (!pointSetting) {
      return res.status(400).json({ message: "Point setting not configured" });
    }

    // Calculate points
    const pointsEarned = Math.floor(
      bill.amount / pointSetting.amountPerPoint
    );

    // Update bill
    bill.status = "approved";
    bill.pointsEarned = pointsEarned;
    bill.approvedBy = req.admin.id;
    bill.approvedAt = new Date();
    await bill.save();

    // Update user wallet
    await User.findByIdAndUpdate(bill.userId, {
      $inc: { walletPoints: pointsEarned },
    });

    res.json({
      message: "Bill approved successfully",
      bill,
      pointsEarned,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Reject Bill
export const rejectBill = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Bill is already ${bill.status}` });
    }

    bill.status = "rejected";
    bill.rejectionReason = rejectionReason || "Not specified";
    bill.approvedBy = req.admin.id;
    bill.approvedAt = new Date();
    await bill.save();

    res.json({
      message: "Bill rejected successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Set Point Configuration
export const setPointConfiguration = async (req, res) => {
  try {
    const { amountPerPoint } = req.body;

    if (!amountPerPoint || amountPerPoint <= 0) {
      return res.status(400).json({ message: "amountPerPoint must be greater than 0" });
    }

    await PointSetting.updateMany({}, { isActive: false });

    const pointSetting = await PointSetting.create({
      amountPerPoint,
      isActive: true,
    });

    res.json({
      message: "Point configuration updated successfully",
      pointSetting,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get Point Configuration
export const getPointConfiguration = async (req, res) => {
  try {
    const pointSetting = await PointSetting.findOne({ isActive: true });

    if (!pointSetting) {
      return res.status(404).json({ message: "Point setting not found" });
    }

    res.json({ pointSetting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
