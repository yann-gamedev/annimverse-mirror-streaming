const Request = require("../models/Request");
const User = require("../models/User");

// @desc    Create new anime request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { animeTitle, description, malId } = req.body;

    if (!animeTitle || animeTitle.trim() === "") {
      return res.status(400).json({ message: "Anime title is required" });
    }

    const newRequest = await Request.create({
      userId: req.user.id,
      animeTitle: animeTitle.trim(),
      description: description?.trim() || "",
      malId: malId?.trim() || "",
    });

    await newRequest.populate("userId", "username");

    res.status(201).json({
      message: "Request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all requests (sorted by votes)
// @route   GET /api/requests
// @access  Public
exports.getAllRequests = async (req, res) => {
  try {
    const { status, sort = "votes" } = req.query;

    let filter = {};
    if (
      status &&
      ["pending", "approved", "rejected", "completed"].includes(status)
    ) {
      filter.status = status;
    }

    const requests = await Request.find(filter)
      .populate("userId", "username")
      .lean();

    // Add vote count to each request
    requests.forEach((request) => {
      request.voteCount = request.upvotes.length - request.downvotes.length;
    });

    // Sort by votes, newest, or oldest
    if (sort === "votes") {
      requests.sort((a, b) => b.voteCount - a.voteCount);
    } else if (sort === "newest") {
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "oldest") {
      requests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    res.json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Public
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "userId",
      "username",
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ request });
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Vote on request (upvote/downvote)
// @route   PUT /api/requests/:id/vote
// @access  Private
exports.voteRequest = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote', 'downvote', or 'remove'
    const userId = req.user.id;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Remove existing votes
    request.upvotes = request.upvotes.filter((id) => id.toString() !== userId);
    request.downvotes = request.downvotes.filter(
      (id) => id.toString() !== userId,
    );

    // Add new vote if not removing
    if (voteType === "upvote") {
      request.upvotes.push(userId);
    } else if (voteType === "downvote") {
      request.downvotes.push(userId);
    }

    await request.save();

    res.json({
      message: "Vote updated",
      voteCount: request.upvotes.length - request.downvotes.length,
      upvotes: request.upvotes.length,
      downvotes: request.downvotes.length,
    });
  } catch (error) {
    console.error("Vote request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete request (own requests only)
// @route   DELETE /api/requests/:id
// @access  Private
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if user owns this request
    if (request.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this request" });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update request status (admin only)
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!["pending", "approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    if (adminNote !== undefined) {
      request.adminNote = adminNote;
    }

    await request.save();

    res.json({
      message: "Request status updated",
      request,
    });
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
